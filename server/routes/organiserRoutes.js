import express from "express";

import {
  editOrganiserBankDetails,
  editOrganiserProfile,
  loginOrganiser,
  organiserProfile,
  registerOrganiser,
  fetchPendingOrganisers,
  fetchApprovedOrganisers,
  fetchRejectedOrganiser,
  approveOrganiserByAdmin,
  rejectOrganiserByAdmin,
  deleteOrganiserByAdmin,
  fetchAllOrganisers,
  getMyWallet,
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

// Auth Routes
router.post("/register", registerOrganiser);
router.post("/login", loginOrganiser);

// Ticket Type Routes
router.post("/tickets", authMiddleware, addTicketType);
router.get("/tickets/:event_id", authMiddleware, getEventTicketTypes);
router.get("/ticket/:ticket_type_id", authMiddleware, getTicket);
router.put("/ticket/:ticket_type_id", authMiddleware, editTicketType);
router.delete("/ticket/:ticket_type_id", authMiddleware, removeTicketType);

// Organiser Profile Routes
router.get("/me/:id", authMiddleware, requireRole("organiser"), organiserProfile);
router.put("/profile", authMiddleware, editOrganiserProfile);
router.put("/bank-details", authMiddleware, editOrganiserBankDetails);
router.get("/my-wallet", authMiddleware, getMyWallet);

// Admin Routes
router.get("/admin/all", authMiddleware, requireRole("admin"), fetchAllOrganisers);
router.get("/admin/pending", authMiddleware, requireRole("admin"), fetchPendingOrganisers);
router.get("/admin/approved", authMiddleware, requireRole("admin"), fetchApprovedOrganisers);
router.get("/admin/rejected", authMiddleware, requireRole("admin"), fetchRejectedOrganiser);
router.put("/admin/approve/:id", authMiddleware, requireRole("admin"), approveOrganiserByAdmin);
router.put("/admin/reject/:id", authMiddleware, requireRole("admin"), rejectOrganiserByAdmin);
router.delete("/admin/:id", authMiddleware, requireRole("admin"), deleteOrganiserByAdmin);

export default router;