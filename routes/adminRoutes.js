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
import {
  getAllMasterSettingData,
  updateMasterSetting,
} from "../controllers/masterSettingController.js";
import { exportIdea } from "../controllers/ideaController.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/report", getAllReport);

router.delete("/report/:id", validateDeleteReportIdea, deleteReport);

router.put("/user/:id/disabled", validateDisabledUser, disabledUser);

router.put("/user/:id/fullyDisabled", validateDisabledUser, fullyDisabledUser);

router.get("/masterSetting", getAllMasterSettingData);

router.put("/masterSetting/:masterSettingId", updateMasterSetting);

router.get("/idea/export", exportIdea);

router.get('/stats', getDashboardStats);

export default router;
