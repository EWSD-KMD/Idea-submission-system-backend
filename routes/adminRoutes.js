import express from "express";

import {
  validateDeleteReportIdea,
  validateDisabledUser,
} from "../validator/validator.js";
import {
  getAllReport,
  deleteReport,
} from "../controllers/ideaReportController.js";
import {
  disabledUser,
  fullyDisabledUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/report", getAllReport);

router.delete("/report/:id", validateDeleteReportIdea, deleteReport);

router.put("/user/:id/disabled", validateDisabledUser, disabledUser);

router.put("/user/:id/fullyDisabled", validateDisabledUser, fullyDisabledUser);

export default router;
