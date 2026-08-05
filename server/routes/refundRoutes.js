import express, { Route } from "express";
import authMiddleware from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";
import { approveRefund, fetchALLRefunds, fetchMyRefunds, fetchPendingRefunds, processRefund, rejectRefund, requestRefund, searchUserTransactions } from "../controllers/refundController.js";

const router = express.Router();

// User
router.post("/:id", authMiddleware, requireRole("attendee"), requestRefund);
router.get("/my-refunds", authMiddleware, fetchMyRefunds);

// Admin
router.get("/", authMiddleware, requireRole("admin"), fetchALLRefunds);
router.get("/pending", authMiddleware, requireRole("admin"), fetchPendingRefunds);
router.put("/approve/:id", authMiddleware, requireRole("admin"), approveRefund);
router.put("/reject/:id", authMiddleware, requireRole("admin"), rejectRefund);
router.put("/process/:id", authMiddleware, requireRole("admin"), processRefund);
router.get("/transactions", authMiddleware, requireRole("admin"), searchUserTransactions);

export default router;