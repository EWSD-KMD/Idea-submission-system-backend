import express from "express";
import {
  getAllAcademicYear,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from "../controllers/academicYearController.js";
import {
  validateAcademicYear,
  validateAcademicYearUpdate,
  validateIdInParams,
} from "../validator/validator.js";

const router = express.Router();

router.get("/", getAllAcademicYear);
router.get("/:id", validateIdInParams, getAcademicYearById);
router.post("/", validateAcademicYear, createAcademicYear);
router.put("/:id", validateAcademicYearUpdate, updateAcademicYear);
router.delete("/:id", validateIdInParams, deleteAcademicYear);

export default router;
