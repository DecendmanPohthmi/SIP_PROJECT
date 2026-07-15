import express from "express";

import {
  editOrganiserBankDetails,
  editOrganiserProfile,
    loginOrganiser,
    organiserProfile,
    registerOrganiser,
    verifyOTP
} from "../controllers/organiserController.js";

import {
  addTicketType,
  getEventTicketTypes,
  getTicket,
  editTicketType,
  removeTicketType,
} from "../controllers/ticketTypeController.js";
import authMiddleware from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

router.post("/register", registerOrganiser);
router.post("/verify", verifyOTP);
router.post("/login", loginOrganiser);

// Ticket Type Routes
router.post("/tickets", authMiddleware, addTicketType);

router.get("/tickets/:event_id", authMiddleware, getEventTicketTypes);

router.get("/ticket/:ticket_type_id", authMiddleware, getTicket);

router.put("/ticket/:ticket_type_id", authMiddleware, editTicketType);

router.delete("/ticket/:ticket_type_id", authMiddleware, removeTicketType);
router.get("/me/:id", authMiddleware, requireRole("organiser"), organiserProfile);
router.put("/profile", authMiddleware, editOrganiserProfile);
router.put("/bank-details", authMiddleware, editOrganiserBankDetails);

export default router;