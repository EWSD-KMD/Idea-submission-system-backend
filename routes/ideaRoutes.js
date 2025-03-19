import express from "express";
import {
  getAllIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea,
  likeIdea,
  dislikeIdea
} from "../controllers/ideaController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllIdeas);
router.get("/:id", getIdeaById);
router.post("/", authenticateToken, createIdea);
router.put("/:id", authenticateToken, updateIdea);
router.delete("/:id", authenticateToken, deleteIdea);
router.post("/:id/like", authenticateToken, likeIdea);
router.post("/:id/dislike", authenticateToken, dislikeIdea);

export default router;