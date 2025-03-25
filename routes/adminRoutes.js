import express from "express";

import { validateDeleteReportIdea } from "../validator/validator.js";
import {
  getAllReport,
  deleteReport,
} from "../controllers/ideaReportController.js";

const router = express.Router();

router.get("/report", getAllReport);

router.delete("/report/:id", validateDeleteReportIdea, deleteReport);

export default router;
