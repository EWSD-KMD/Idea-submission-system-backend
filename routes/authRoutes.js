import express from "express";
import { login, logout, refreshToken } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/refresh", refreshToken);

export default router;
