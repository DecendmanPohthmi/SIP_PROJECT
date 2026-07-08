import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

import otpStore from "../otpStore.js";

import { sendOTP } from "../utils/sendEmail.js";

import { findAdminByEmail, createAdmin } from "../models/adminModel.js";

import { isValidEmail, isStrongPassword } from "../utils/validators.js";

// ---------- Token Helper ----------

const generateToken = (id) => {
  return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ================= REGISTER =================

export const registerAdmin = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a symbol",
      });
    }

    const existing = await findAdminByEmail(email);

    if (existing) {
      return res.status(409).json({
        message: "Admin already exists",
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    otpStore[email] = {
      full_name,
      email,
      phone,
      password,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    await sendOTP(email, otp);

    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ================= VERIFY OTP =================

export const verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const adminData = otpStore[email];

    if (!adminData) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    if (Date.now() > adminData.expiresAt) {
      delete otpStore[email];

      return res.status(400).json({
        message: "OTP Expired",
      });
    }

    if (otp !== adminData.otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const admin = await createAdmin(
      adminData.full_name,
      adminData.email,
      adminData.phone,
      hashedPassword,
    );

    delete otpStore[email];

    delete admin.password;

    const token = generateToken(admin.id);

    res.status(201).json({
      message: "Admin Registered Successfully",
      token,
      admin,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ================= LOGIN =================

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const admin = await findAdminByEmail(email);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    delete admin.password;

    const token = generateToken(admin.id);

    res.status(200).json({
      message: "Login Successful",
      token,
      admin,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
