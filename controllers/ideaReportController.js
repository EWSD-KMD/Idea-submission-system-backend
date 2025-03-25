import { ideaReportService } from "../services/ideaReport.service.js";
import response from "../utils/response.js";

export const getAllReport = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await ideaReportService.fetchAllIdeaReport(page, limit);

    return response.success(res, data);
  } catch (err) {
    console.error("Error fetching all report:", err);
    next(err);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    await ideaReportService.deleteIdeaReport(parseInt(id));

    return response.success(res);
  } catch (err) {
    console.error("Error delete idea report:", err);
    next(err);
  }
};
