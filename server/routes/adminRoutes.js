import express from "express";

import authMiddleware from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";

import {
    registerAdmin,
    loginAdmin,
    verifyAdminOTP
} from "../controllers/adminController.js";

import {
  fetchPendingOrganisers,
  fetchApprovedOrganisers,
  approveOrganiserByAdmin,
  rejectOrganiserByAdmin,
  deleteOrganiserByAdmin,
  fetchRejectedOrganiser,
} from "../controllers/organiserController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/verify", verifyAdminOTP);

router.get("/organisers/pending", authMiddleware, requireRole("admin"), fetchPendingOrganisers);
router.get("/organisers/approved", authMiddleware, requireRole("admin"), fetchApprovedOrganisers);
router.get("/organisers/rejected", authMiddleware, requireRole("admin"), fetchRejectedOrganiser);
router.put("/organisers/approve/:id", authMiddleware, requireRole("admin"), approveOrganiserByAdmin);
router.put("/organisers/reject/:id", authMiddleware, requireRole("admin"), rejectOrganiserByAdmin);
router.delete("/organisers/:id", authMiddleware, requireRole("admin"), deleteOrganiserByAdmin);

export default router;