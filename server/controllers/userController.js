import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { 
  findUserByEmail, 
  createUser, 
  findUserById,
  updateUserProfile,
  updateUserBankDetails,
  getUsers,
  getPlatformStats,
  getTopBookers
} from "../models/userModel.js";

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser(
      full_name,
      email,
      phone,
      hashedPassword
    );

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

// ================= USER PROFILE =================

export const userProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user.id) !== String(id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const user = await findUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= EDIT USER PROFILE =================
export const editUserProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { full_name, phone } = req.body;

    const user = await updateUserProfile(user_id, full_name, phone);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Profile updated.", user });
  } catch (error) {
    console.error("editUserProfile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= EDIT USER BANK DETAILS =================
export const editUserBankDetails = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { bank_name, bank_account_number, bank_ifsc_code, upi_id } = req.body;

    const user = await updateUserBankDetails(
      user_id, bank_name, bank_account_number, bank_ifsc_code, upi_id
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Bank details updated.", user });
  } catch (error) {
    console.error("editUserBankDetails error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ADMIN DASHBOARD USERS =================
export const getAdminUsersDashboard = async (req, res) => {
  try {
    const { search } = req.query;

    const [users, stats, topUsers] = await Promise.all([
      getUsers(search),
      getPlatformStats(),
      getTopBookers(5),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total_users: stats.total_users,
        total_bookings: stats.total_bookings,
        total_spent: stats.total_spent,
      },
      top_users: topUsers,
      users: users,
    });
  } catch (error) {
    console.error("getAdminUsersDashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching admin users data",
    });
  }
};