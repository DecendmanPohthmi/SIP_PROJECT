import express from "express";

import {
    registerAdmin,
    loginAdmin
} from "../controllers/adminController.js";
import { fetchPendingOrganisers } from "../controllers/organiserController.js";

const router = express.Router();

router.post("/register",registerAdmin);
router.post("/login",loginAdmin);
router.get("/organisers/pending", fetchPendingOrganisers);

export default router;