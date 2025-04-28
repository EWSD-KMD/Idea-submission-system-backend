import express from "express";
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  resetPassword,
  updatePassword,
  getProfile,
  updateProfileImage,
  getProfileImage,
  getIdeas,
  deleteProfileImage,
} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import {
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePassword,
} from "../validator/validator.js";
import fileUpload from "../middlewares/fileUpload.js";

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
router.get("/profile", authenticateToken, getProfile);

router.post(
  "/profile/image",
  authenticateToken,
  fileUpload.single("profileImage"),
  updateProfileImage
);

router.get("/profile/image/:userId", getProfileImage);

router.get("/profile/idea", authenticateToken, getIdeas);

router.delete("/profile/image", authenticateToken, deleteProfileImage);

export default router;
