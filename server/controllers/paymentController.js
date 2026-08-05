// ==========================================
// controllers/paymentController.js
// ==========================================
import pool from "../config/db.js"; // Or whatever path points to your PostgreSQL pool configuration file
import Razorpay from "razorpay";
import crypto from "crypto";
import {
  createTransaction,
  findTransactionByOrderId,
  updateTransactionSuccess,
  updateBookingConfirmed,
  updateAdminWalletBalance,
  updateOrganizerWalletBalance,
  getTransactionsByUserId,
} from "../models/paymentModel.js";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// CREATE RAZORPAY ORDER & PENDING TRANSACTION
// ==========================================
export const createOrder = async (req, res) => {
  try {
    const { booking_id, total_amount, organiser_id } = req.body;

    if (!booking_id || !total_amount || !organiser_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: booking_id, total_amount, or organiser_id.",
      });
    }

    // Calculate split: 15% Admin Commission, 85% Organizer Payout
    const amountNum = parseFloat(total_amount);
    const admin_commission = Number((amountNum * 0.15).toFixed(2));
    const organizer_payout = Number((amountNum * 0.85).toFixed(2));

    // Create Razorpay order (Amount must be in paise for INR)
    const options = {
      amount: Math.round(amountNum * 100),
      currency: "INR",
      receipt: `receipt_booking_${booking_id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order.",
      });
    }

    // Save pending transaction in the database (using organiser_id)
    const transactionData = {
      booking_id,
      razorpay_order_id: order.id,
      total_amount: amountNum,
      admin_commission,
      organizer_payout,
      organiser_id,
    };

    const savedTransaction = await createTransaction(transactionData);

    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully.",
      order,
      transaction: savedTransaction,
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error while creating order.",
    });
  }
};

// ==========================================
// VERIFY RAZORPAY PAYMENT & UPDATE BALANCES (ACID SAFE)
// ==========================================
export const verifyPayment = async (req, res) => {
  const client = await pool.connect(); // Acquire dedicated client for transaction

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details.",
      });
    }

    // 1. Fetch transaction details to get commission splits & booking ID
    const transaction = await findTransactionByOrderId(razorpay_order_id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found for this order ID.",
      });
    }

    if (transaction.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This payment has already been verified and processed.",
      });
    }

    // 2. Verify Signature using Razorpay Secret
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature verification failed.",
      });
    }

    // ==========================================
    // BEGIN ACID TRANSACTION BLOCK
    // ==========================================
    await client.query("BEGIN");

    // 3. Mark transaction as successful
    await updateTransactionSuccess(
      client,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_order_id
    );

    // 4. Update Booking status to confirmed & decrease inventory
    await updateBookingConfirmed(client, transaction.booking_id);

    // 5. Update Admin Wallet Balance (Add Admin Commission)
    await updateAdminWalletBalance(client, transaction.admin_commission);

    // 6. Update Organizer Wallet Balance (Add Organizer Payout)
    await updateOrganizerWalletBalance(
      client,
      transaction.organiser_id,
      transaction.organizer_payout
    );

    // Commit all changes together successfully
    await client.query("COMMIT");
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully, booking confirmed, and wallets updated.",
    });
  } catch (error) {
    // Rollback all mutations if any single step fails
    await client.query("ROLLBACK");
    console.error("Error verifying payment (Rolled Back):", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error during payment verification.",
    });
  } finally {
    // Always release the client back to the connection pool
    client.release();
  }
};

export const getUserTransaction = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const transactions = await getTransactionsByUserId(userId);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error while fetching transactions.",
    });
  }
};