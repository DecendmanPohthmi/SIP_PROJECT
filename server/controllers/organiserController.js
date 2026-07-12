import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

import otpStore from "../otpStore.js";
import { sendOTP ,notifyAdminNewOrganiser, notifyOrganiserDeleted} from "../utils/sendEmail.js";

import {
  createOrganiser,
  findOrganiserByEmail,
  findOrganiserById,
  pendingOrganiser as getPendingOrganisers,
  ApprovedOrganiser as getApprovedORganisers,
  RejectedOrganiser as getRejectedOrganisers,
  approveOrganiser,
  rejectOrganiser,
  deleteOrganiser,
} from "../models/organiserModel.js";

import { isValidEmail, isStrongPassword } from "../utils/validators.js";

// ================= JWT TOKEN =================

const generateToken = (organiser) => {
  return jwt.sign(
    {
      id: organiser.organiser_id,
      role: "organiser",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ================= REGISTER =================

export const registerOrganiser = async (req, res) => {
  try {
    const {
      full_name,
      organisation_name = null,
      email,
      phone,
      password,
    } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain uppercase, lowercase, number and special character.",
      });
    }

    const existing = await findOrganiserByEmail(email);

    if (existing) {
      switch (existing.status) {
        case "pending":
          return res.status(409).json({
            success: false,
            message: "Application is pending admin approval.",
          });

        case "approved":
          return res.status(409).json({
            success: false,
            message: "Email already registered.",
          });

        case "rejected":
          return res.status(403).json({
            success: false,
            message: "Application has been rejected.",
          });
      }
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    otpStore[email] = {
      full_name,
      organisation_name,
      email,
      phone,
      password,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    await sendOTP(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// ================= VERIFY OTP =================

export const verifyOTP = async (req, res) => {
  try {

    const { email, otp } = req.body;

    const organiserData = otpStore[email];

    if (!organiserData) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found.",
      });
    }

    if (Date.now() > organiserData.expiresAt) {
      delete otpStore[email];

      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    if (organiserData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      organiserData.password,
      10
    );

    const organiser = await createOrganiser(
      organiserData.full_name,
      organiserData.organisation_name,
      organiserData.email,
      organiserData.phone,
      hashedPassword
    );

    delete otpStore[email];

    const token = generateToken(organiser);

    delete organiser.password;

    // Notify admin — don't let this block or fail the registration response
    try {
      await notifyAdminNewOrganiser(organiser);
    } catch (notifyError) {
      console.error("Failed to notify admin:", notifyError);
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Waiting for admin approval.",
      token,
      organiser,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// ================= LOGIN =================

export const loginOrganiser = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const organiser = await findOrganiserByEmail(email);

    if (!organiser) {
      return res.status(404).json({
        success: false,
        message: "Organiser not found.",
      });
    }

    if (organiser.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval.",
      });
    }

    if (organiser.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your application has been rejected.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      organiser.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    const token = generateToken(organiser);

    delete organiser.password;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      organiser,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// ================= GET PENDING ORGANISERS (ADMIN) =================

export const fetchPendingOrganisers = async (req, res) => {
  try {

    const organisers = await getPendingOrganisers();

    return res.status(200).json({
      success: true,
      total: organisers.length,
      organisers,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// ================= GET Approved ORGANISERS (ADMIN) =================

export const fetchApprovedOrganisers = async (req, res) => {
  try {

    const organisers = await getApprovedORganisers();

    return res.status(200).json({
      success: true,
      total: organisers.length,
      organisers,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// ================= GET Rejected ORGANISERS (ADMIN) =================

export const fetchRejectedOrganiser = async (req, res) => {
  try {

    const organisers = await getRejectedOrganisers();

    return res.status(200).json({
      success: true,
      total: organisers.length,
      organisers,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// ================= APPROVE ORGANISER (ADMIN) =================

export const approveOrganiserByAdmin = async (req, res) => {
  try {

    const { id } = req.params;

    const organiser = await approveOrganiser(id);

    if (!organiser) {
      return res.status(404).json({
        success: false,
        message: "Organiser not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organiser approved successfully.",
      organiser,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// ================= REJECT ORGANISER (ADMIN) =================

export const rejectOrganiserByAdmin = async (req, res) => {
  try {

    const { id } = req.params;
    const { reason } = req.body;

    const organiser = await rejectOrganiser(id, reason);

    if (!organiser) {
      return res.status(404).json({
        success: false,
        message: "Organiser not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organiser rejected successfully.",
      organiser,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

export const deleteOrganiserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "A message explaining the removal is required.",
      });
    }

    const organiser = await findOrganiserById(id);

    if (!organiser) {
      return res.status(404).json({ success: false, message: "Organiser not found." });
    }

    // Notify before deleting — so we still have their email at hand
    try {
      await notifyOrganiserDeleted(organiser, message.trim());
    } catch (notifyError) {
      console.error("Failed to notify organiser of deletion:", notifyError);
    }

    await deleteOrganiser(id);

    return res.status(200).json({
      success: true,
      message: "Organiser removed and notified.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};