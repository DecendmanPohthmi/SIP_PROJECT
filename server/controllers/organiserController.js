import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";

import otpStore from "../otpStore.js";
import { sendOTP } from "../utils/sendEmail.js";

import {
  createOrganiser,
  findOrganiserByEmail,
} from "../models/organiserModel.js";

// REGISTER
export const registerOrganiser = async (req, res) => {
  try {
    const {
      full_name,
      organisation_name = null,
      email,
      phone,
      password,
    } = req.body;

    const existing = await findOrganiserByEmail(email);

    if (existing) {
      if (existing.status === "pending") {
        return res.status(409).json({
          message: "Application is pending approval.",
        });
      }

      if (existing.status === "approved") {
        return res.status(409).json({
          message: "Email already registered.",
        });
      }

      if (existing.status === "rejected") {
        return res.status(403).json({
          message: "Application rejected.",
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
      expiresAt: Date.now() + 300000,
    };

    console.log("OTP STORE");
    console.log(otpStore);

    await sendOTP(email, otp);

    res.json({
      success: true,
      message: "OTP sent.",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// VERIFY
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("VERIFY REQUEST");

    const organiserData = otpStore[email];

    console.log(organiserData);

    if (!organiserData) {
      return res.status(400).json({
        message: "OTP expired.",
      });
    }

    if (Date.now() > organiserData.expiresAt) {
      delete otpStore[email];

      return res.status(400).json({
        message: "OTP expired.",
      });
    }

    if (organiserData.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP.",
      });
    }

    const hashedPassword = await bcrypt.hash(organiserData.password, 10);

    console.log("Saving organiser...");

    const organiser = await createOrganiser(
      organiserData.full_name,
      organiserData.organisation_name,
      organiserData.email,
      organiserData.phone,
      hashedPassword,
    );

    delete otpStore[email];

    res.status(201).json({
      success: true,

      message: "Registration Successful",

      organiser,
    });
  } catch (err) {
    console.log("VERIFY ERROR");
    console.log(err);

    res.status(500).json({
      message: err.message,
      detail: err.detail,
    });
  }
};

export const loginOrganiser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find organiser
    const organiser = await findOrganiserByEmail(email);

    if (!organiser) {
      return res.status(404).json({
        success: false,
        message: "Organiser not found",
      });
    }

    // Check organiser status
    if (organiser.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your organiser account is pending admin approval.",
      });
    }

    if (organiser.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your organiser application has been rejected.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, organiser.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Remove password before sending response
    delete organiser.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      organiser,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};