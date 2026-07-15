import pool from "../config/db.js";
import crypto from "crypto";

// ================= CREATE BOOKING =================

// In your booking MODEL file (bookingModel.js / wherever createBooking lives)

export const createBooking = async (
  user_id,
  event_id,
  ticket_type_id,
  booking_reference,
  quantity,
  total_amount
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const ticketResult = await client.query(
      `SELECT price, available_quantity
       FROM ticket_types
       WHERE ticket_type_id = $1
       FOR UPDATE`,
      [ticket_type_id]
    );

    const ticket = ticketResult.rows[0];
    if (!ticket) throw new Error("Ticket type not found.");
    if (ticket.available_quantity < quantity) {
      throw new Error("Not enough tickets available.");
    }

    const isFree = Number(ticket.price) === 0;
    const booking_status = isFree ? "confirmed" : "pending";
    const qr_token = crypto.randomUUID();

    const bookingResult = await client.query(
      `INSERT INTO bookings
        (user_id, event_id, ticket_type_id, booking_reference, quantity, total_amount, booking_status, qr_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [user_id, event_id, ticket_type_id, booking_reference, quantity, total_amount, booking_status, qr_token]
    );

    const booking = bookingResult.rows[0];

    // 👇 THIS is the seat/capacity reduction — happens right here, same transaction
    if (booking_status === "confirmed") {
      await client.query(
        `UPDATE ticket_types
         SET available_quantity = available_quantity - $1, updated_at = CURRENT_TIMESTAMP
         WHERE ticket_type_id = $2`,
        [quantity, ticket_type_id]
      );

      await client.query(
        `UPDATE events
         SET available_capacity = available_capacity - $1, updated_at = CURRENT_TIMESTAMP
         WHERE event_id = $2`,
        [quantity, event_id]
      );
    }

    await client.query("COMMIT");
    return booking;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ================= GET BOOKING BY ID =================

export const getBookingById = async (booking_id) => {
  const result = await pool.query(
    `SELECT * FROM bookings WHERE booking_id = $1`,
    [booking_id]
  );

  return result.rows[0];
};

// ================= GET BOOKING BY REFERENCE =================

export const getBookingByReference = async (booking_reference) => {
  const result = await pool.query(
    `SELECT * FROM bookings WHERE booking_reference = $1`,
    [booking_reference]
  );

  return result.rows[0];
};

// ================= GET BOOKING BY QR TOKEN (for scanning) =================

export const getBookingByQRToken = async (qr_token) => {
  const result = await pool.query(
    `SELECT
        b.*,
        e.title AS event_title,
        e.event_date,
        e.organiser_id,
        u.full_name AS attendee_name,
        u.email AS attendee_email,
        tt.ticket_name
     FROM bookings b
     JOIN events e ON b.event_id = e.event_id
     JOIN users u ON b.user_id = u.user_id
     JOIN ticket_types tt ON b.ticket_type_id = tt.ticket_type_id
     WHERE b.qr_token = $1`,
    [qr_token]
  );

  return result.rows[0];
};

// ================= CHECK IN BOOKING (organiser scans QR) =================

export const checkInBooking = async (qr_token) => {
  const result = await pool.query(
    `UPDATE bookings
     SET
        is_checked_in = true,
        checked_in_at = CURRENT_TIMESTAMP
     WHERE qr_token = $1
       AND booking_status = 'confirmed'
       AND is_checked_in = false
     RETURNING *`,
    [qr_token]
  );

  return result.rows[0];
};

// ================= GET USER BOOKINGS =================

export const getBookingsByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT
        b.*,
        e.title,
        e.event_date,
        e.city,
        tt.ticket_name
     FROM bookings b
     JOIN events e ON b.event_id = e.event_id
     JOIN ticket_types tt ON b.ticket_type_id = tt.ticket_type_id
     WHERE b.user_id = $1
     ORDER BY b.booking_date DESC`,
    [user_id]
  );

  return result.rows;
};

// ================= GET BOOKINGS BY EVENT =================

export const getBookingsByEvent = async (event_id) => {
  const result = await pool.query(
    `SELECT
        b.*,
        u.full_name,
        u.email,
        tt.ticket_name
     FROM bookings b
     JOIN users u ON b.user_id = u.user_id
     JOIN ticket_types tt ON b.ticket_type_id = tt.ticket_type_id
     WHERE b.event_id = $1
     ORDER BY b.booking_date DESC`,
    [event_id]
  );

  return result.rows;
};

// ================= UPDATE BOOKING STATUS =================

export const updateBookingStatus = async (booking_id, booking_status) => {
  const result = await pool.query(
    `UPDATE bookings
     SET
        booking_status = $1,
        updated_at = CURRENT_TIMESTAMP
     WHERE booking_id = $2
     RETURNING *`,
    [booking_status, booking_id]
  );

  return result.rows[0];
};

// ================= DELETE BOOKING =================

export const deleteBooking = async (booking_id) => {
  await pool.query(`DELETE FROM bookings WHERE booking_id = $1`, [booking_id]);
};