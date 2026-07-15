import express from "express";
import authMiddleware from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";
import upload from "../middleware/upload.js";

import {
  addEvent,
  fetchAllEvents,
  fetchEventsByStatus,
  searchEvents,
  fetchEvent,
  fetchMyEvents,
  fetchMyEventsByStatus,
  editEvent,
  approveEventByAdmin,
  rejectEventByAdmin,
  goLive,
  cancelEventByOrganiser,
  completeEventByAdmin,
  removeEvent,
  fetchLivedEvents,
} from "../controllers/eventController.js";
import { getEventTicketTypes } from "../controllers/ticketTypeController.js";

const router = express.Router();

// ================= ORGANISER =================
router.post("/create", authMiddleware, upload.single("image"), addEvent);
router.get("/my-events", authMiddleware, fetchMyEvents);
router.get("/my-events/status/:status", authMiddleware, fetchMyEventsByStatus);
router.put("/update/:id", authMiddleware, upload.single("image"), editEvent);
router.put("/publish/:id", authMiddleware, goLive);
router.put("/cancel/:id", authMiddleware, cancelEventByOrganiser);
router.delete("/delete/:id", authMiddleware, removeEvent);

// ================= PUBLIC =================
router.get("/", fetchAllEvents);
router.get("/approved", fetchLivedEvents); // live events, attendee-facing

// ================= ADMIN (must be before /:id) =================
router.get("/status/:status", authMiddleware, requireRole("admin"), fetchEventsByStatus);
router.get("/search", authMiddleware, requireRole("admin"), searchEvents);
router.put("/approve/:id", authMiddleware, requireRole("admin"), approveEventByAdmin);
router.put("/reject/:id", authMiddleware, requireRole("admin"), rejectEventByAdmin);
router.put("/complete/:id", authMiddleware, requireRole("organiser"), completeEventByAdmin);
router.get("/:event_id/tickets", getEventTicketTypes);

// ================= WILDCARD — MUST STAY LAST =================
router.get("/:id", fetchEvent);

export default router;