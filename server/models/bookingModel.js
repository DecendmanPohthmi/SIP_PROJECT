import pool from "../config/db.js";

// ================= CREATE BOOKING =================

export const createBooking = async (
  user_id,
  event_id,
  ticket_type_id,
  booking_reference,
  quantity,
  total_amount
) => {
  const result = await pool.query(
    `INSERT INTO bookings
    (
      user_id,
      event_id,
      ticket_type_id,
      booking_reference,
      quantity,
      total_amount
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [
      user_id,
      event_id,
      ticket_type_id,
      booking_reference,
      quantity,
      total_amount,
    ]
  );

  return result.rows[0];
};

// ================= GET BOOKING BY ID =================

export const getBookingById = async (booking_id) => {
  const result = await pool.query(
    `SELECT *
     FROM bookings
     WHERE booking_id = $1`,
    [booking_id]
  );

  return result.rows[0];
};

// ================= GET BOOKING BY REFERENCE =================

export const getBookingByReference = async (booking_reference) => {
  const result = await pool.query(
    `SELECT *
     FROM bookings
     WHERE booking_reference = $1`,
    [booking_reference]
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

     JOIN events e
     ON b.event_id = e.event_id

     JOIN ticket_types tt
     ON b.ticket_type_id = tt.ticket_type_id

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

     JOIN users u
     ON b.user_id = u.user_id

     JOIN ticket_types tt
     ON b.ticket_type_id = tt.ticket_type_id

     WHERE b.event_id = $1

     ORDER BY b.booking_date DESC`,
    [event_id]
  );

  return result.rows;
};

// ================= UPDATE BOOKING STATUS =================

export const updateBookingStatus = async (
  booking_id,
  booking_status
) => {
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
  await pool.query(
    `DELETE FROM bookings
     WHERE booking_id = $1`,
    [booking_id]
  );
};