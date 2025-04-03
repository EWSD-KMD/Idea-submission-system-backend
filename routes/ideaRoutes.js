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
import {
  getAllComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

import {
  authenticateToken,
  disabledUserChecker,
} from "../middlewares/authMiddleware.js";
import { validateCreateReportIdea } from "../validator/validator.js";
import {
  closureDateChecker,
  finalClosureDateChecker,
} from "../middlewares/closureDateMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getAllIdeas);
router.get("/:id", getIdeaById);
router.post(
  "/",
  authenticateToken,
  disabledUserChecker,
  closureDateChecker,
  createIdea
);
router.put("/:id", authenticateToken, disabledUserChecker, updateIdea);
router.delete("/:id", authenticateToken, disabledUserChecker, deleteIdea);
router.post("/:id/like", authenticateToken, disabledUserChecker, likeIdea);
router.post(
  "/:id/dislike",
  authenticateToken,
  disabledUserChecker,
  dislikeIdea
);
router.post(
  "/:id/report",
  authenticateToken,
  validateCreateReportIdea,
  reportIdea
);
router.get(
  "/:ideaId/comments",
  authenticateToken,
  disabledUserChecker,
  getAllComments
);
router.post(
  "/:ideaId/comments",
  authenticateToken,
  disabledUserChecker,
  finalClosureDateChecker,
  createComment
);

export default router;
