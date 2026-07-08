import express from "express";

import authMiddleware from "../middleware/auth.js";

import {
  addEvent,
  fetchAllEvents,
  fetchApprovedEvents,
  fetchPendingEvents,
  fetchEvent,
  fetchMyEvents,
  editEvent,
  approveEventByAdmin,
  rejectEventByAdmin,
  removeEvent,
} from "../controllers/eventController.js";

const router = express.Router();

// ================= ORGANISER =================

// Create Event
router.post("/create", authMiddleware, addEvent);

// Get Logged-in Organiser's Events
router.get("/my-events", authMiddleware, fetchMyEvents);

// Update Event
router.put("/update/:id", authMiddleware, editEvent);

// Delete Event
router.delete("/delete/:id", authMiddleware, removeEvent);

// ================= PUBLIC =================

// Get All Events
router.get("/", fetchAllEvents);

// Get Approved Events Only
router.get("/approved", fetchApprovedEvents);

// Get Single Event
router.get("/:id", fetchEvent);

// ================= ADMIN =================

// Get Pending Events
router.get("/pending", authMiddleware, fetchPendingEvents);

// Approve Event
router.put("/approve/:id", authMiddleware, approveEventByAdmin);

// Reject Event
router.put("/reject/:id", authMiddleware, rejectEventByAdmin);

export default router;