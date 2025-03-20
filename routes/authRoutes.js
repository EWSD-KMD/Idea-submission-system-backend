import express from "express";
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  resetPassword,
  updatePassword,
} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import {
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePassword,
} from "../validator/validator.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/refresh", refreshToken);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.post(
  "/update-password",
  authenticateToken,
  validateUpdatePassword,
  updatePassword
);

export default router;
