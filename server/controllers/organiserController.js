import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import pool from "../config/db.js";
import {
  notifyAdminNewOrganiser,
  notifyOrganiserDeleted,
} from "../utils/sendEmail.js";

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
  updateOrganiserProfile,
  updateOrganiserBankDetails,
  getAllOrganisersWithStats,
  getWalletByOwnerId,
  createWallet,
} from "../models/organiserModel.js";

import { createOrganizerWallet } from "../models/paymentModel.js";
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
    },
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const organiser = await createOrganiser(
      full_name,
      organisation_name,
      email,
      phone,
      hashedPassword,
    );

    const token = generateToken(organiser);

    delete organiser.password;

    try {
      await notifyAdminNewOrganiser(organiser);
    } catch (notifyError) {
      console.error("Failed to notify admin:", notifyError);
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. Waiting for admin approval.",
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

    const isMatch = await bcrypt.compare(password, organiser.password);

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

// ================= GET ALL ORGANISERS (ADMIN) =================

export const fetchAllOrganisers = async (req, res) => {
  try {
    const organisers = await getAllOrganisersWithStats();

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

    await createOrganizerWallet(id);

    return res.status(200).json({
      success: true,
      message: "Organiser approved successfully and wallet initialized.",
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

export const rejectOrganiserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required.",
      });
    }

    const existing = await findOrganiserById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Organiser not found.",
      });
    }

    const updatedOrganiser = await rejectOrganiser(id, message.trim());

    return res.status(200).json({
      success: true,
      message: "Organiser rejected successfully.",
      organiser: updatedOrganiser,
    });
  } catch (err) {
    next(err);
  }
};  

export const deleteOrganiserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body || {}; 

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "A message explaining the removal is required.",
      });
    }

    const organiser = await findOrganiserById(id);

    if (!organiser) {
      return res
        .status(404)
        .json({ success: false, message: "Organiser not found." });
    }

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
  } catch (err) {
    next(err);
  }
};

export const editOrganiserProfile = async (req, res) => {
  try {
    const organiser_id = req.user.id;
    const { full_name, phone } = req.body;

    const organiser = await updateOrganiserProfile(
      organiser_id,
      full_name,
      phone,
    );

    res
      .status(200)
      .json({ success: true, message: "Profile updated.", organiser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const editOrganiserBankDetails = async (req, res) => {
  try {
    const organiser_id = req.user.id;
    const { bank_account_number, bank_ifsc_code, upi_id, bank_name } = req.body;

    const organiser = await updateOrganiserBankDetails(
      organiser_id,
      bank_account_number,
      bank_ifsc_code,
      upi_id,
      bank_name,
    );

    res
      .status(200)
      .json({ success: true, message: "Bank details updated.", organiser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const organiserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user.id) !== String(id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const organiser = await findOrganiserById(id);

    if (!organiser) {
      return res.status(404).json({
        success: false,
        message: "Organiser not found",
      });
    }

    res.status(200).json({
      success: true,
      organiser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyWallet = async (req, res) => {
  try {
    const ownerId = req.user?.organiser_id || req.user?.user_id || req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Owner ID missing.",
      });
    }

    let wallet = await getWalletByOwnerId(ownerId);

    if (!wallet) {
      wallet = await createWallet("organizer", ownerId);
    }

    return res.status(200).json({
      success: true,
      wallet: {
        wallet_id: wallet.wallet_id,
        owner_type: wallet.owner_type,
        owner_id: wallet.owner_id,
        total_balance: wallet.total_balance,
        withdrawn_amount: wallet.withdrawn_amount,
        available_balance: wallet.available_balance, // Calculated dynamically as total_balance - withdrawn_amount
        currency: wallet.currency,
        created_at: wallet.created_at,
        updated_at: wallet.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};