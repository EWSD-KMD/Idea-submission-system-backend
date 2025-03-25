import express from "express";
import {
  updateComment,
  deleteComment
} from "../controllers/commentController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);
router.put("/comments/:id", updateComment);
router.delete("/comments/:id", deleteComment);

export default router;