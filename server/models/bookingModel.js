import pool from "../config/db.js";
import crypto from "crypto";

// ================= CREATE BOOKING =================
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

// ================= CANCEL BOOKING =================
export const cancelBookingModel = async (booking_id, user_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const bookingResult = await client.query(
      `SELECT * FROM bookings 
       WHERE booking_id = $1 AND user_id = $2 AND booking_status = 'confirmed'
       FOR UPDATE`,
      [booking_id, user_id]
    );

    const booking = bookingResult.rows[0];
    if (!booking) {
      throw new Error("Confirmed booking not found or unauthorized.");
    }

    const updateBookingResult = await client.query(
      `UPDATE bookings 
       SET booking_status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE booking_id = $1 
       RETURNING *`,
      [booking_id]
    );

    await client.query(
      `UPDATE ticket_types
       SET available_quantity = available_quantity + $1, updated_at = CURRENT_TIMESTAMP
       WHERE ticket_type_id = $2`,
      [booking.quantity, booking.ticket_type_id]
    );

    await client.query(
      `UPDATE events
       SET available_capacity = available_capacity + $1, updated_at = CURRENT_TIMESTAMP
       WHERE event_id = $2`,
      [booking.quantity, booking.event_id]
    );

    await client.query("COMMIT");
    return updateBookingResult.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getBookingById = async (booking_id) => {
  const result = await pool.query(
    `SELECT b.*, t.transaction_id 
     FROM bookings b
     LEFT JOIN transactions t ON b.booking_id = t.booking_id
     WHERE b.booking_id = $1`,
    [booking_id]
  );
  return result.rows[0];
};

export const getBookingByReference = async (booking_reference) => {
  const result = await pool.query(`SELECT * FROM bookings WHERE booking_reference = $1`, [booking_reference]);
  return result.rows[0];
};

export const getBookingByQRToken = async (qr_token) => {
  const result = await pool.query(
    `SELECT
        b.*,
        e.title AS event_title,
        e.event_date,
        e.organiser_id,
        e.pricing_mode,
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

export const checkInBooking = async (qr_token) => {
  const result = await pool.query(
    `UPDATE bookings
     SET is_checked_in = true, checked_in_at = CURRENT_TIMESTAMP
     WHERE qr_token = $1 AND booking_status = 'confirmed' AND is_checked_in = false
     RETURNING *`,
    [qr_token]
  );
  return result.rows[0];
};

export const getActiveBookingsByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT
        b.booking_id, b.event_id, b.ticket_type_id, b.booking_reference,
        b.quantity, b.total_amount, b.booking_status, b.booking_date,
        e.title, e.event_date::text AS event_date, e.start_time AS event_starting_time, e.city, e.status AS event_status,
        tt.ticket_name
     FROM bookings b
     JOIN events e ON b.event_id = e.event_id
     JOIN ticket_types tt ON b.ticket_type_id = tt.ticket_type_id
     WHERE b.user_id = $1 AND b.booking_status != 'cancelled' AND b.booking_status != 'pending'
     ORDER BY b.booking_date DESC`,
    [user_id]
  );
  return result.rows;
};

export const getAllBookingsByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT
        b.booking_id, b.event_id, b.ticket_type_id, b.booking_reference,
        b.quantity, b.total_amount, b.booking_status, b.booking_date, b.is_checked_in AS checkedin,
        e.title, e.event_date::text AS event_date, e.start_time AS event_starting_time, e.city, e.status AS event_status, e.cancelled_at AS event_cancelled_at,
        tt.ticket_name
     FROM bookings b
     JOIN events e ON b.event_id = e.event_id
     JOIN ticket_types tt ON b.ticket_type_id = tt.ticket_type_id
     WHERE b.user_id = $1 AND b.booking_status != 'pending'
     ORDER BY b.booking_date DESC`,
    [user_id]
  );
  return result.rows;
};

export const getBookingsByEvent = async (event_id) => {
  const result = await pool.query(
    `SELECT b.*, u.full_name, u.email, tt.ticket_name
     FROM bookings b
     JOIN users u ON b.user_id = u.user_id
     JOIN ticket_types tt ON b.ticket_type_id = tt.ticket_type_id
     WHERE b.event_id = $1
     ORDER BY b.booking_date DESC`,
    [event_id]
  );
  return result.rows;
};

export const getWaitlistByEvent = async (event_id) => {
  const result = await pool.query(
    `SELECT w.*, u.full_name, u.email
     FROM waitlists w
     JOIN users u ON w.user_id = u.user_id
     WHERE w.event_id = $1
     ORDER BY w.created_at ASC`,
    [event_id]
  );
  return result.rows;
};

// ================= WAITLIST MODEL =================
export const WaitlistModel = {
  async addToWaitlist(event_id, user_id, email) {
    const query = `
      INSERT INTO waitlists (event_id, user_id, email, status)
      VALUES ($1, $2, $3, 'waiting')
      RETURNING *;
    `;
    const result = await pool.query(query, [event_id, user_id, email]);
    return result.rows[0];
  },

  async findExistingEntry(event_id, user_id) {
    const query = `
      SELECT * FROM waitlists 
      WHERE event_id = $1 AND user_id = $2 AND status = 'waiting';
    `;
    const result = await pool.query(query, [event_id, user_id]);
    return result.rows[0];
  },

  async getWaitlistByEvent(event_id) {
    const query = `
      SELECT * FROM waitlists 
      WHERE event_id = $1 
      ORDER BY created_at ASC;
    `;
    const result = await pool.query(query, [event_id]);
    return result.rows;
  },

  async updateStatus(waitlist_id, status) {
    const query = `
      UPDATE waitlists 
      SET status = $1 
      WHERE waitlist_id = $2 
      RETURNING *;
    `;
    const result = await pool.query(query, [status, waitlist_id]);
    return result.rows[0];
  }
};

export const updateBookingStatus = async (booking_id, booking_status) => {
  const result = await pool.query(
    `UPDATE bookings SET booking_status = $1, updated_at = CURRENT_TIMESTAMP WHERE booking_id = $2 RETURNING *`,
    [booking_status, booking_id]
  );
  return result.rows[0];
};

export const deleteBooking = async (booking_id) => {
  await pool.query(`DELETE FROM bookings WHERE booking_id = $1`, [booking_id]);
};

export const cancelRequestBooking = async (booking_id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Delete the refund record associated with this booking
    await client.query(
      `DELETE FROM refunds WHERE booking_id = $1`,
      [booking_id]
    );

    // 2. Set the booking status back to 'confirmed'
    const result = await client.query(
      `UPDATE bookings 
       SET booking_status = 'confirmed' 
       WHERE booking_id = $1 
       RETURNING *`,
      [booking_id]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
