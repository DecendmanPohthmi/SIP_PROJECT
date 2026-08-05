import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { findAdminByEmail, createAdmin, getInfo, findById, updateProfile } from "../models/adminModel.js";

import { isValidEmail, isStrongPassword } from "../utils/validators.js";
import { createAdminWallet } from "../models/paymentModel.js";

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await createAdmin(
      full_name,
      email,
      phone,
      hashedPassword,
    );

    delete admin.password;

    const token = generateToken(admin.admin_id || admin.id);
    await createAdminWallet(admin.admin_id || admin.id);

    res.status(201).json({
      message: "Admin Registered Successfully and wallet initialized.",
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

    const token = generateToken(admin.admin_id || admin.id);

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

// ================= FETCH HOME INFO =================

export const fetchHomeInfo = async (req, res) => {
  try {
    const homeInfo = await getInfo();

    res.status(200).json({
      success: true,
      admin_total_balance: homeInfo.admin_total_balance || 0,
      admin_withdrawn: homeInfo.admin_withdrawn || 0,
      organizer_total_balance: homeInfo.organizer_total_balance || 0,
      organizer_withdrawn: homeInfo.organizer_withdrawn || 0,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET ADMIN PROFILE =================

export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id || req.user.admin_id;

    const admin = await findById(adminId);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.log("Error fetching admin profile:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= UPDATE ADMIN PROFILE =================

export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id || req.user.admin_id;
    const { full_name, phone } = req.body;

    if (!full_name) {
      return res.status(400).json({ success: false, message: "Full name is required" });
    }

    const updatedAdmin = await updateProfile(adminId, full_name, phone);

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.log("Error updating admin profile:", error);

    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: "Phone number already in use by another account." });
    }

    return res.status(500).json({ success: false, message: "Server Error" });
  }
};