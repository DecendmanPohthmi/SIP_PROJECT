import express from "express";

import {
  registerUser,
  loginUser,
  userProfile,
  editUserProfile,
  editUserBankDetails,
  getAdminUsersDashboard
} from "../controllers/userController.js";

import authMiddleware from "../middleware/auth.js";
import { getUserTransaction } from "../controllers/paymentController.js";

const router = express.Router();

// Public Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected User Profile Routes
router.get("/me/:id", authMiddleware, userProfile);
router.put("/profile", authMiddleware, editUserProfile);
router.put("/bank-details", authMiddleware, editUserBankDetails);

//get Transaction
router.get("/:id/transactions", authMiddleware, getUserTransaction);

// Protected Admin Route
router.get("/admin/users", authMiddleware, getAdminUsersDashboard);

export default router;