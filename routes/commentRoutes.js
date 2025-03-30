import express from "express";
import {
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import {
  authenticateToken,
  disabledUserChecker,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);
router.put(
  "/comments/:id",
  authenticateToken,
  disabledUserChecker,
  updateComment
);
router.delete(
  "/comments/:id",
  authenticateToken,
  disabledUserChecker,
  deleteComment
);

export default router;
