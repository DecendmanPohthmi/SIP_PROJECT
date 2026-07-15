import crypto from "crypto";
import QRCode from "qrcode";

import {
  createBooking,
  getBookingById,
  getBookingByReference,
  getBookingByQRToken,
  checkInBooking,
  getBookingsByUser,
  getBookingsByEvent,
  updateBookingStatus,
  deleteBooking,
} from "../models/bookingModel.js";

// Generates a short, human-shareable reference like "BK-4F2A9C1D"
// Fits comfortably inside booking_reference varchar(30).
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

    // Encode just the token — the scanning organiser looks it up server-side,
    // so nothing sensitive needs to live inside the QR image itself.
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

export const fetchMyBookings = async (req, res) => {
  try {
    const user_id = req.user.id;

    const bookings = await getBookingsByUser(user_id);

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

// ================= UPDATE BOOKING STATUS (e.g. confirm after payment) =================

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