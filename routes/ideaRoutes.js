import express from "express";
import {
  getAllIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea,
  likeIdea,
  dislikeIdea,
  reportIdea,
} from "../controllers/ideaController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { validateCreateReportIdea } from "../validator/validator.js";

const router = express.Router();

router.get("/", authenticateToken, getAllIdeas);
router.get("/:id", getIdeaById);
router.post("/", authenticateToken, createIdea);
router.put("/:id", authenticateToken, updateIdea);
router.delete("/:id", authenticateToken, deleteIdea);
router.post("/:id/like", authenticateToken, likeIdea);
router.post("/:id/dislike", authenticateToken, dislikeIdea);
router.post(
  "/:id/report",
  authenticateToken,
  validateCreateReportIdea,
  reportIdea
);

export default router;
