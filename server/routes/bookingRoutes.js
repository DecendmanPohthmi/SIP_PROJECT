import express from "express";

import {
  makeBooking,
  fetchBookingById,
  fetchBookingByReference,
  getBookingQRImage,
  fetchMyBookings,
  fetchEventBookings,
  changeBookingStatus,
  scanBookingQR,
  removeBooking,
} from "../controllers/bookingController.js";

import authMiddleware from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

// Attendee routes
router.post("/", authMiddleware, requireRole("attendee"), makeBooking);
router.get("/my-bookings", authMiddleware, requireRole("attendee"), fetchMyBookings);

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

router.put("/scan", authMiddleware, requireRole("organiser", "admin"), scanBookingQR);

router.put(
  "/status/:id",
  authMiddleware,
  requireRole("organiser", "admin"),
  changeBookingStatus
);

router.delete("/:id", authMiddleware, removeBooking);

export default router;