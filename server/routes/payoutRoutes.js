import express from "express";
import { requestWithdrawal, fetchAllWithdrawHistory } from "../controllers/payoutController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// POST: Request withdrawal through bank or UPI
router.post("/withdraw", authMiddleware, requestWithdrawal);

// GET: Fetch all past withdrawal history for the logged-in organiser
router.get("/payouts", authMiddleware, fetchAllWithdrawHistory);

export default router;