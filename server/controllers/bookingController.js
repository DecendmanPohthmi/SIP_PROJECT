import crypto from "crypto";
import QRCode from "qrcode";
import pool from "../config/db.js";

import {
  createBooking,
  cancelBookingModel,
  getBookingById,
  getBookingByReference,
  getBookingByQRToken,
  checkInBooking,
  getActiveBookingsByUser,
  getBookingsByEvent,
  getWaitlistByEvent,
  updateBookingStatus,
  deleteBooking,
  getAllBookingsByUser,
  WaitlistModel,
  cancelRequestBooking,
} from "../models/bookingModel.js";

// Generates a short, human-shareable reference like "BK-4F2A9C1D"
const generateBookingReference = () => {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `BK-${random}`;
};

// ================= CREATE BOOKING (attendee) =================

export const makeBooking = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { event_id, ticket_type_id, quantity, total_amount } = req.body;

    if (!event_id || !ticket_type_id || !quantity || total_amount == null) {
      return res.status(400).json({
        success: false,
        message: "event_id, ticket_type_id, quantity and total_amount are required.",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
      });
    }

    const booking_reference = generateBookingReference();

    const booking = await createBooking(
      user_id,
      event_id,
      ticket_type_id,
      booking_reference,
      quantity,
      total_amount
    );

    return res.status(201).json({
      success: true,
      message:
        booking.booking_status === "confirmed"
          ? "Booking confirmed. Your ticket QR is ready."
          : "Booking created. Complete payment to confirm.",
      booking,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Ticket type not found.") {
      return res.status(404).json({ success: false, message: error.message });
    }

    if (error.message === "Not enough tickets available.") {
      return res.status(409).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= CANCEL BOOKING (attendee) =================

export const cancelUserBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const cancelledBooking = await cancelBookingModel(id, user_id);

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully and capacity restored.",
      booking: cancelledBooking,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Confirmed booking not found or unauthorized.") {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= GET BOOKING BY ID =================

export const fetchBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await getBookingById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= GET BOOKING BY REFERENCE =================

export const fetchBookingByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    const booking = await getBookingByReference(reference);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= GET QR CODE IMAGE FOR A BOOKING (attendee) =================

export const getBookingQRImage = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await getBookingById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (booking.booking_status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "QR code is only available once the booking is confirmed.",
      });
    }

    if (!booking.qr_token) {
      return res.status(400).json({
        success: false,
        message: "No QR token found for this booking.",
      });
    }

    const qrDataUrl = await QRCode.toDataURL(booking.qr_token, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
    });

    return res.status(200).json({
      success: true,
      booking_id: booking.booking_id,
      qr_token: booking.qr_token,
      qr_image: qrDataUrl,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= GET MY BOOKINGS (attendee) =================

export const fetchActiveUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id;

    const bookings = await getActiveBookingsByUser(user_id);

    return res.status(200).json({ success: true, total: bookings.length, bookings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= GET ALL BOOKINGS HISTORY (attendee) =================

export const fetchAllUserBookingHistory = async (req, res) => {
  try {
    const user_id = req.user.id;

    const bookings = await getAllBookingsByUser(user_id);

    return res.status(200).json({ success: true, total: bookings.length, bookings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= GET BOOKINGS FOR AN EVENT (organiser/admin) =================

export const fetchEventBookings = async (req, res) => {
  try {
    const { event_id } = req.params;

    const bookings = await getBookingsByEvent(event_id);

    return res.status(200).json({ success: true, total: bookings.length, bookings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= GET WAITLIST FOR AN EVENT (organiser/admin) =================

export const fetchEventWaitlist = async (req, res) => {
  try {
    const { event_id } = req.params;

    const waitlist = await getWaitlistByEvent(event_id);

    return res.status(200).json({ success: true, total: waitlist.length, waitlist });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= JOIN WAITLIST (attendee) =================

export const joinWaitlist = async (req, res) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.id;

    if (!event_id) {
      return res.status(400).json({ success: false, message: "event_id is required." });
    }

    const userQuery = await pool.query("SELECT email FROM users WHERE user_id = $1", [user_id]);
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const email = userQuery.rows[0].email;

    const existing = await WaitlistModel.findExistingEntry(event_id, user_id);
    if (existing) {
      return res.status(400).json({ success: false, message: "You are already on the waitlist for this event." });
    }

    const waitlistEntry = await WaitlistModel.addToWaitlist(event_id, user_id, email);

    return res.status(201).json({
      success: true,
      message: "Successfully added to the waitlist!",
      waitlist: waitlistEntry,
    });
  } catch (error) {
    console.error("Error joining waitlist:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ================= UPDATE BOOKING STATUS =================

export const changeBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_status } = req.body;

    const allowedStatuses = ["pending", "confirmed", "cancelled", "refunded"];

    if (!allowedStatuses.includes(booking_status)) {
      return res.status(400).json({
        success: false,
        message: `booking_status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const booking = await updateBookingStatus(id, booking_status);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated.",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= SCAN QR / CHECK IN (organiser) =================

export const scanBookingQR = async (req, res) => {
  try {
    const { qr_token } = req.body;

    if (!qr_token) {
      return res.status(400).json({ success: false, message: "qr_token is required." });
    }

    const booking = await getBookingByQRToken(qr_token);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Invalid ticket QR." });
    }

    if (req.user.role !== "admin" && booking.organiser_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to scan tickets for this event.",
      });
    }

    if (booking.booking_status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "This booking is not confirmed and cannot be checked in.",
      });
    }

    if (booking.is_checked_in) {
      return res.status(409).json({
        success: false,
        message: "This ticket has already been used to check in.",
        checked_in_at: booking.checked_in_at,
      });
    }

    const checkedInBooking = await checkInBooking(qr_token);

    if (!checkedInBooking) {
      return res.status(409).json({
        success: false,
        message: "This ticket has already been used to check in.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Checked in: ${booking.attendee_name}`,
      booking: checkedInBooking,
      attendee_name: booking.attendee_name,
      ticket_name: booking.ticket_name,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= DELETE BOOKING =================

export const removeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await getBookingById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (req.user.role !== "admin" && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await deleteBooking(id);

    return res.status(200).json({ success: true, message: "Booking deleted." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const handleCancelRefundRequest = async (req, res) => {
  const { booking_id } = req.params;

  try {
    const updatedBooking = await cancelRequestBooking(booking_id);

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Refund request cancelled successfully and booking status reverted to confirmed.",
      booking: updatedBooking,
    });
  } catch (err) {
    console.error("handleCancelRefundRequest error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while cancelling the refund request.",
    });
  }
};