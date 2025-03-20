import response from "../utils/response.js";
import { academicYearService } from "../services/academicYear.service.js";

export const getAllAcademicYear = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await academicYearService.fetchAllAcademicYear(page, limit);
    return response.success(res, data);
  } catch (err) {
    console.error("Error fetching academic year:", err);
    next(err);
  }
};

export const getAcademicYearById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = await academicYearService.getAcademicYearById(id);
    return response.success(res, data);
  } catch (err) {
    console.error("Error fetching academic year:", err);
    next(err);
  }
};

export const createAcademicYear = async (req, res, next) => {
  try {
    const { year, startDate, closureDate, finalClosureDate } = req.body;

    const data = await academicYearService.createAcademicYear({
      year,
      startDate,
      closureDate,
      finalClosureDate,
    });

    return response.success(res, data);
  } catch (err) {
    console.error("Error creating academic year:", err);
    next(err);
  }
};

export const updateAcademicYear = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const { year, startDate, closureDate, finalClosureDate } = req.body;

    const data = await academicYearService.updateAcademicYear(id, {
      year,
      startDate,
      closureDate,
      finalClosureDate,
    });

    return response.success(res, data);
  } catch (err) {
    console.error("Error updating academic year:", err);
    next(err);
  }
};

export const deleteAcademicYear = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await academicYearService.deleteAcademicYear(id);

    return response.success(res, {
      message: "Academic year deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting Academic year:", err);
    next(err);
  }
};
