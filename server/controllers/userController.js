import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";

import otpStore from "../otpStore.js";

import { sendOTP } from "../utils/sendEmail.js";

import { findUserByEmail, createUser } from "../models/userModel.js";

// ================= REGISTER =================

export const registerUser = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
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

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const userData = otpStore[email];

    if (!userData) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    if (Date.now() > userData.expiresAt) {
      delete otpStore[email];

      return res.status(400).json({
        message: "OTP Expired",
      });
    }

    if (otp !== userData.otp) {
      return res.status(400).json({
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

    delete user.password;

    res.status(201).json({
      message: "Registration Successful",

      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ================= LOGIN =================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,

      user.password,
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    delete user.password;

    res.status(200).json({
      message: "Login Successful",

      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
