import express from "express";

import {

    registerUser,
    verifyOTP,
    loginUser

} from "../controllers/userController.js";

import {
  bookTicket,
  myBookings,
  bookingDetails,
  cancelBooking,
} from "../controllers/bookingController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyOTP);
router.post("/login", loginUser);

// BookingTicket Routes
// Booking
router.post("/book", authMiddleware, bookTicket);
// My Bookings
router.get("/my-bookings", authMiddleware, myBookings);
// Booking Details
router.get("/booking/:booking_id", authMiddleware, bookingDetails);
// Cancel Booking
router.put("/booking/:booking_id/cancel", authMiddleware, cancelBooking);

export default router;