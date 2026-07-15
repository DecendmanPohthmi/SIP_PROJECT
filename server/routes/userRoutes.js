import express from "express";

import {

    registerUser,
    verifyOTP,
    loginUser

} from "../controllers/userController.js";

import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyOTP);
router.post("/login", loginUser);


export default router;