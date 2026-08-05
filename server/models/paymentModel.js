import pool from "../config/db.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// ==========================================
// MODELS (Accepts an optional transaction `client`)
// ==========================================

// Create a new pending payment transaction
export const createTransaction = async (data) => {
  const {
    booking_id,
    razorpay_order_id,
    total_amount,
    admin_commission,
    organizer_payout,
    organiser_id,
  } = data;

  const query = `
    INSERT INTO transactions 
    (booking_id, razorpay_order_id, total_amount, admin_commission, organizer_payout, organiser_id, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING *;
  `;
  
  const values = [
    booking_id,
    razorpay_order_id,
    total_amount,
    admin_commission,
    organizer_payout,
    organiser_id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Find transaction by Razorpay order ID
export const findTransactionByOrderId = async (razorpay_order_id) => {
  const query = `SELECT booking_id, razorpay_order_id, total_amount, admin_commission, organizer_payout, organiser_id, status FROM transactions WHERE razorpay_order_id = $1`;
  const result = await pool.query(query, [razorpay_order_id]);
  return result.rows[0];
};

// Mark transaction as successfully completed (supports ACID client)
export const updateTransactionSuccess = async (client, razorpay_payment_id, razorpay_signature, razorpay_order_id) => {
  const db = client || pool;
  const query = `
    UPDATE transactions 
    SET razorpay_payment_id = $1, razorpay_signature = $2, status = 'completed' 
    WHERE razorpay_order_id = $3
  `;
  await db.query(query, [razorpay_payment_id, razorpay_signature, razorpay_order_id]);
};

// Update Admin wallet total balance (supports ACID client)
export const updateAdminWalletBalance = async (client, balance) => {
  const db = client || pool;
  const query = `
    UPDATE wallets 
    SET total_balance = total_balance + $1, updated_at = CURRENT_TIMESTAMP 
    WHERE owner_type = 'admin'
  `;
  await db.query(query, [balance]);
};

// Update Organizer wallet total balance (supports ACID client)
export const updateOrganizerWalletBalance = async (client, organiserId, balance) => {
  const db = client || pool;
  const query = `
    UPDATE wallets 
    SET total_balance = total_balance + $1, updated_at = CURRENT_TIMESTAMP 
    WHERE owner_type = 'organizer' AND owner_id = $2
  `;
  await db.query(query, [balance, organiserId]);
};

// Automatically create an organizer wallet upon approval
export const createOrganizerWallet = async (organiserId) => {
  const query = `
    INSERT INTO wallets (owner_type, owner_id, total_balance, withdrawn_amount, currency)
    VALUES ('organizer', $1, 0.00, 0.00, 'INR')
    ON CONFLICT DO NOTHING;
  `;
  const result = await pool.query(query, [organiserId]);
  return result.rows[0];
};

export const createAdminWallet = async (adminId) => {
  const query = `
    INSERT INTO wallets (owner_type, owner_id, total_balance, withdrawn_amount, currency)
    VALUES ('admin', $1, 0.00, 0.00, 'INR')
    ON CONFLICT DO NOTHING;
  `;
  const result = await pool.query(query, [adminId]);
  return result.rows[0];
};

// Update booking status to confirmed AND reduce available ticket/event quantities (supports ACID client)
export const updateBookingConfirmed = async (client, booking_id) => {
  const db = client || pool;

  // 1. Fetch booking details to get the event_id, ticket_type_id, and quantity
  const bookingRes = await db.query(
    `SELECT event_id, ticket_type_id, quantity FROM bookings WHERE booking_id = $1`,
    [booking_id]
  );
  const booking = bookingRes.rows[0];

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // 2. Update booking status to confirmed
  await db.query(
    `UPDATE bookings 
     SET booking_status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
     WHERE booking_id = $1`,
    [booking_id]
  );

  // 3. Decrement ticket type available quantity
  await db.query(
    `UPDATE ticket_types
     SET available_quantity = available_quantity - $1, updated_at = CURRENT_TIMESTAMP
     WHERE ticket_type_id = $2`,
    [booking.quantity, booking.ticket_type_id]
  );

  // 4. Decrement event available capacity
  await db.query(
    `UPDATE events
     SET available_capacity = available_capacity - $1, updated_at = CURRENT_TIMESTAMP
     WHERE event_id = $2`,
    [booking.quantity, booking.event_id]
  );
};

// Fetch all transactions for a specific user, joined with booking and event details
export const getTransactionsByUserId = async (userId) => {
  const query = `
    SELECT 
      t.transaction_id,
      t.razorpay_order_id,
      t.razorpay_payment_id,
      t.total_amount,
      t.admin_commission,
      t.organizer_payout,
      t.status AS transaction_status,
      t.created_at,
      b.booking_id,
      b.booking_reference,
      b.quantity,
      b.booking_status,
      e.title AS event_title,
      e.event_date,
      e.city
    FROM transactions t
    JOIN bookings b ON t.booking_id = b.booking_id
    JOIN events e ON b.event_id = e.event_id
    WHERE b.user_id = $1 AND t.status = 'completed'
    ORDER BY t.created_at DESC;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};