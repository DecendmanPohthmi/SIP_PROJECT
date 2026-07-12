import {
  createBooking,
  getBookingsByUser,
  getBookingById,
  updateBookingStatus,
} from "../models/bookingModel.js";

import pool from "../config/db.js";

// ================= CREATE BOOKING =================

export const bookTicket = async (req, res) => {
  try {
    const user_id = req.body.userId; // From JWT middleware

    const {
      event_id,
      ticket_type_id,
      quantity,
    } = req.body;

    // Get ticket details
    const ticketResult = await pool.query(
      `SELECT *
       FROM ticket_types
       WHERE ticket_type_id = $1`,
      [ticket_type_id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket type not found.",
      });
    }

    const ticket = ticketResult.rows[0];

    // Check availability
    if (ticket.available_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough tickets available.",
      });
    }

    // Calculate total
    const total_amount = ticket.price * quantity;

    // Generate Booking Reference
    const booking_reference =
      "EVN-" + Date.now();

    // Create Booking
    const booking = await createBooking(
      user_id,
      event_id,
      ticket_type_id,
      booking_reference,
      quantity,
      total_amount
    );

    // Reduce Available Tickets
    await pool.query(
      `UPDATE ticket_types
       SET available_quantity = available_quantity - $1
       WHERE ticket_type_id = $2`,
      [quantity, ticket_type_id]
    );

    res.status(201).json({
      success: true,
      message: "Booking Created Successfully.",
      booking,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= USER BOOKINGS =================

export const myBookings = async (req, res) => {
  try {

    const user_id = req.body.userId;

    const bookings = await getBookingsByUser(user_id);

    res.json({
      success: true,
      bookings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ================= BOOKING DETAILS =================

export const bookingDetails = async (req, res) => {

  try {

    const { booking_id } = req.params;

    const booking = await getBookingById(booking_id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.json({
      success: true,
      booking,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ================= CANCEL BOOKING =================

export const cancelBooking = async (req, res) => {

  try {

    const { booking_id } = req.params;

    await updateBookingStatus(
      booking_id,
      "cancelled"
    );

    res.json({
      success: true,
      message: "Booking Cancelled Successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};