// routes/paymentRoutes.js
import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Route to create a Razorpay order and save a pending transaction record
router.post("/create-order", authMiddleware, createOrder);

// Route to verify the Razorpay payment signature and update transaction, booking, and wallet balances
router.post("/verify-payment", authMiddleware, verifyPayment);

export default router;