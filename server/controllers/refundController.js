import Razorpay from "razorpay";
import pool from "../config/db.js";

import {
  createRefundRequest,
  getPendingRefunds,
  getRefundById,
  getRefundsByUser,
  approveRefundRequest,
  rejectRefundRequest,
  markRefundProcessed,
  markBookingRefunded,
  restoreTicketQuantity,
  restoreEventCapacity,
  reverseAdminWallet,
  reverseOrganizerWallet,
  getAllRefunds,
  findUserTransactionsAndBank,
} from "../models/refundModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= STEP 1: USER REQUESTS REFUND =================

export const requestRefund = async (req, res) => {
  try {
    const user_id = req.user.id;
    const booking_id = req.params.id; // Correctly pull booking_id from route params (:id)
    const { transaction_id, refund_amount, reason } = req.body;

    if (!transaction_id || !booking_id || !refund_amount) {
      return res.status(400).json({
        success: false,
        message: "transaction_id, booking_id, and refund_amount are required.",
      });
    }

    const refund = await createRefundRequest({
      transaction_id,
      booking_id,
      user_id,
      refund_amount,
      reason: reason || "User requested refund",
    });

    return res.status(201).json({
      success: true,
      message: "Refund request submitted. Awaiting admin review.",
      refund,
    });
  } catch (error) {
    console.error("Refund request error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= FETCH: All REFUNDS (admin) =================

export const fetchALLRefunds = async (req, res) => {
  try {
    const refunds = await getAllRefunds();
    return res.status(200).json({ success: true, total: refunds.length, refunds });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= FETCH: PENDING REFUNDS (admin) =================

export const fetchPendingRefunds = async (req, res) => {
  try {
    const refunds = await getPendingRefunds();
    return res.status(200).json({ success: true, total: refunds.length, refunds });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= FETCH: MY REFUNDS (user) =================

export const fetchMyRefunds = async (req, res) => {
  try {
    const refunds = await getRefundsByUser(req.user.id);
    return res.status(200).json({ success: true, total: refunds.length, refunds });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= STEP 2a: ADMIN APPROVES =================

export const approveRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const refund = await approveRefundRequest(id);

    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund request not found or already handled." });
    }

    return res.status(200).json({
      success: true,
      message: "Refund approved. Ready to be processed.",
      refund,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= STEP 2b: ADMIN REJECTS =================

export const rejectRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: "A rejection reason is required." });
    }

    const refund = await rejectRefundRequest(id, reason.trim());

    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund request not found or already handled." });
    }

    return res.status(200).json({
      success: true,
      message: "Refund request rejected.",
      refund,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= STEP 3: PROCESS REFUND (Razorpay + full ACID update) =================

export const processRefund = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params; // refund_id

    const refund = await getRefundById(id);

    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund not found." });
    }

    if (refund.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Refund must be approved before it can be processed.",
      });
    }

    // Call Razorpay's refund API WITHOUT an amount parameter for a safe full refund
    const razorpayRefund = await razorpay.payments.refund(refund.razorpay_payment_id);

    await client.query("BEGIN");

    await markRefundProcessed(client, id, razorpayRefund.id);
    await markBookingRefunded(client, refund.booking_id);
    await restoreTicketQuantity(client, refund.ticket_type_id, refund.quantity);
    await restoreEventCapacity(client, refund.event_id, refund.quantity);

    const eventCheck = await client.query(
      `SELECT status FROM events WHERE event_id = $1`,
      [refund.event_id]
    );
    const eventStatus = eventCheck.rows[0]?.status;
    const isCancelled = eventStatus === "cancelled";

    if (isCancelled) {
      await reverseAdminWallet(client, refund.admin_commission);
      await reverseOrganizerWallet(client, refund.organiser_id, refund.organizer_payout);
    } else {
      await reverseOrganizerWallet(client, refund.organiser_id, refund.organizer_payout);
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully.",
      razorpay_refund_id: razorpayRefund.id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error processing refund (Rolled Back):", error);
    return res.status(500).json({
      success: false,
      message: error.error?.description || error.message || "Server Error while processing refund.",
    });
  } finally {
    client.release();
  }
};

export const searchUserTransactions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query (email, phone, or booking reference) is required.",
      });
    }

    const userData = await findUserTransactionsAndBank(query.trim());

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "No user or transaction records found matching the criteria.",
      });
    }

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Error searching user transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error while looking up transactions.",
    });
  }
};