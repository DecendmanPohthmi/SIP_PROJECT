import express from "express";

import {
    loginOrganiser,
    registerOrganiser,
    verifyOTP
} from "../controllers/organiserController.js";
import { addEvent } from "../controllers/eventController.js";


const router = express.Router();

router.post("/register", registerOrganiser);
router.post("/verify", verifyOTP);
router.post("/login", loginOrganiser);

export default router;