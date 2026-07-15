import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

import otpStore from "../otpStore.js";

import { sendOTP } from "../utils/sendEmail.js";

import { findUserByEmail, createUser } from "../models/userModel.js";

import { isValidEmail, isStrongPassword } from "../utils/validators.js";

// ---------- Token Helper ----------

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      role: "attendee",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ================= REGISTER =================

export const registerUser = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

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
          "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a symbol",
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
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
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= VERIFY OTP =================

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const userData = otpStore[email];

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (Date.now() > userData.expiresAt) {
      delete otpStore[email];

      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    if (otp !== userData.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await createUser(
      userData.full_name,
      userData.email,
      userData.phone,
      hashedPassword,
    );

    delete otpStore[email];

    const token = generateToken(user);

    delete user.password;

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= LOGIN =================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = generateToken(user);

    delete user.password;

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};