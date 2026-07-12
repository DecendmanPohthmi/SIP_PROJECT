import express from "express";

import {
    loginOrganiser,
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

export default router;