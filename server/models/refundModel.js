import pool from "../config/db.js";

// Create a refund request
export const createRefundRequest = async (data) => {
  const { transaction_id, booking_id, user_id, refund_amount, reason, client } = data;
  const db = client || pool;

  // 1. Insert the refund request using `db`
  const result = await db.query(
    `INSERT INTO refunds
      (transaction_id, booking_id, user_id, refund_amount, reason, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [transaction_id, booking_id, user_id, refund_amount, reason]
  );

  // 2. Update the booking status using `db` and correct parameter index ($1)
  await db.query(
    `UPDATE bookings SET booking_status = 'refund_requested' WHERE booking_id = $1`,
    [booking_id]
  );

  return result.rows[0];
};

// Get all pending refund requests (admin)
export const getPendingRefunds = async () => {
  const result = await pool.query(
    `SELECT r.*, b.booking_reference, e.title AS event_title, u.full_name, u.email
     FROM refunds r
     JOIN bookings b ON r.booking_id = b.booking_id
     JOIN events e ON b.event_id = e.event_id
     JOIN users u ON r.user_id = u.user_id
     WHERE r.status = 'pending'
     ORDER BY r.created_at ASC`
  );
  return result.rows;
};

// Get single refund by ID (with transaction + booking info needed for processing)
// Current model query (missing total_amount)
export const getRefundById = async (refund_id) => {
  const result = await pool.query(
    `SELECT r.*, 
            t.razorpay_payment_id, 
            t.total_amount, 
            t.admin_commission, 
            t.organizer_payout, 
            t.organiser_id,
            b.ticket_type_id, 
            b.quantity, 
            b.event_id,
            e.status AS event_status
     FROM refunds r
     JOIN transactions t ON r.transaction_id = t.transaction_id
     JOIN bookings b ON r.booking_id = b.booking_id
     JOIN events e ON b.event_id = e.event_id
     WHERE r.refund_id = $1`,
    [refund_id]
  );
  return result.rows[0];
};

// Get ALL refunds by ADMIN
export const getAllRefunds = async () => {
  const result = await pool.query(
    `SELECT r.*, b.booking_reference, e.title AS event_title, u.full_name AS user_name, u.email AS user_email
     FROM refunds r
     JOIN bookings b ON r.booking_id = b.booking_id
     JOIN events e ON b.event_id = e.event_id
     JOIN users u ON r.user_id = u.user_id
     ORDER BY r.created_at DESC`
  );
  return result.rows;
};

// Get refunds by user
export const getRefundsByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT r.*, b.booking_reference, e.title AS event_title
     FROM refunds r
     JOIN bookings b ON r.booking_id = b.booking_id
     JOIN events e ON b.event_id = e.event_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [user_id]
  );
  return result.rows;
};

// Admin approves — status only, no money movement yet
export const approveRefundRequest = async (refund_id) => {
  const result = await pool.query(
    `UPDATE refunds SET status = 'approved' WHERE refund_id = $1 AND status = 'pending' RETURNING *`,
    [refund_id]
  );
  return result.rows[0];
};

// Admin rejects
export const rejectRefundRequest = async (refund_id, admin_note) => {
  const result = await pool.query(
    `UPDATE refunds
     SET status = 'rejected', admin_note = $1, processed_at = CURRENT_TIMESTAMP
     WHERE refund_id = $2 AND status = 'pending'
     RETURNING *`,
    [admin_note, refund_id]
  );
  return result.rows[0];
};

// ---------- ACID-safe steps for actual processing (called inside a transaction) ----------

export const markRefundProcessed = async (client, refund_id, razorpay_refund_id) => {
  const db = client || pool;
  await db.query(
    `UPDATE refunds
     SET status = 'completed', razorpay_refund_id = $1, processed_at = CURRENT_TIMESTAMP
     WHERE refund_id = $2`,
    [razorpay_refund_id, refund_id]
  );
};

export const markBookingRefunded = async (client, booking_id) => {
  const db = client || pool;
  await db.query(
    `UPDATE bookings SET booking_status = 'refunded', updated_at = CURRENT_TIMESTAMP WHERE booking_id = $1`,
    [booking_id]
  );
};

export const restoreTicketQuantity = async (client, ticket_type_id, quantity) => {
  const db = client || pool;
  await db.query(
    `UPDATE ticket_types SET available_quantity = available_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE ticket_type_id = $2`,
    [quantity, ticket_type_id]
  );
};

export const restoreEventCapacity = async (client, event_id, quantity) => {
  const db = client || pool;
  await db.query(
    `UPDATE events SET available_capacity = available_capacity + $1, updated_at = CURRENT_TIMESTAMP WHERE event_id = $2`,
    [quantity, event_id]
  );
};

export const reverseAdminWallet = async (client, amount) => {
  const db = client || pool;
  await db.query(
    `UPDATE wallets SET total_balance = total_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE owner_type = 'admin'`,
    [amount]
  );
};

export const reverseOrganizerWallet = async (client, organiser_id, amount) => {
  const db = client || pool;
  await db.query(
    `UPDATE wallets SET total_balance = total_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE owner_type = 'organizer' AND owner_id = $2`,
    [amount, organiser_id]
  );
};

export const findUserTransactionsAndBank = async (queryParam) => {
  // Query to find user by email, phone, or a booking reference associated with them
  const userQuery = `
    SELECT DISTINCT u.user_id, u.full_name, u.email, u.phone, 
           u.bank_account_number AS account_number, 
           u.bank_ifsc_code AS ifsc_code, 
           u.bank_name, 
           u.full_name AS bank_account_name
    FROM users u
    LEFT JOIN bookings b ON u.user_id = b.user_id
    WHERE u.email ILIKE $1 
       OR u.phone ILIKE $1 
       OR b.booking_reference ILIKE $1
    LIMIT 1;
  `;

  const userResult = await pool.query(userQuery, [`%${queryParam}%`]);

  if (userResult.rows.length === 0) {
    return null;
  }

  const user = userResult.rows[0];

  // Fetch recent transactions for this user along with event titles
  const txQuery = `
    SELECT t.transaction_id, t.total_amount AS amount, t.status AS payment_status, 
           t.created_at, b.booking_reference, e.title AS event_title
    FROM transactions t
    JOIN bookings b ON t.booking_id = b.booking_id
    JOIN events e ON b.event_id = e.event_id
    WHERE b.user_id = $1
    ORDER BY t.created_at DESC
    LIMIT 10;
  `;

  const txResult = await pool.query(txQuery, [user.user_id]);

  return {
    ...user,
    recent_transactions: txResult.rows,
  };
};