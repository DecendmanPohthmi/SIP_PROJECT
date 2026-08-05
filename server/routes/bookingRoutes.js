import express from "express";

import {
  makeBooking,
  cancelUserBooking,
  fetchBookingById,
  fetchBookingByReference,
  getBookingQRImage,
  fetchActiveUserBookings,
  fetchEventBookings,
  fetchEventWaitlist,
  joinWaitlist,
  changeBookingStatus,
  scanBookingQR,
  removeBooking,
  fetchAllUserBookingHistory,
  handleCancelRefundRequest,
} from "../controllers/bookingController.js";

import authMiddleware from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

// Attendee routes
router.post("/", authMiddleware, requireRole("attendee"), makeBooking);
router.post("/waitlist", authMiddleware, requireRole("attendee"), joinWaitlist);
router.get("/my-bookings/active", authMiddleware, requireRole("attendee"), fetchActiveUserBookings);
router.get("/my-bookings/history", authMiddleware, requireRole("attendee"), fetchAllUserBookingHistory);
router.post("/:id/cancel", authMiddleware, requireRole("attendee"), cancelUserBooking);

// Shared lookup (owner or admin — enforced in controller)
router.get("/reference/:reference", authMiddleware, fetchBookingByReference);
router.get("/:id/qr", authMiddleware, getBookingQRImage);
router.get("/:id", authMiddleware, fetchBookingById);

// Organiser/admin routes
router.get(
  "/event/:event_id",
  authMiddleware,
  requireRole("organiser", "admin"),
  fetchEventBookings
);

router.put("/:booking_id/cancel-refund", authMiddleware, handleCancelRefundRequest);

router.get(
  "/event/:event_id/waitlist",
  authMiddleware,
  requireRole("organiser", "admin"),
  fetchEventWaitlist
);

router.put("/scan", authMiddleware, requireRole("organiser", "admin"), scanBookingQR);

router.put(
  "/status/:id",
  authMiddleware,
  requireRole("organiser", "admin"),
  changeBookingStatus
);

router.put("/:id/refund", authMiddleware, );

router.delete("/:id", authMiddleware, removeBooking);

export default router;