import prisma from "../prisma/prismaClient.js";
import { fetchPaginatedData } from "../utils/db.js";
import { AppError } from "../utils/appError.js";
import { userSession } from "../utils/userSession.js";

class IdeaReport {
  async fetchAllIdeaReport(page, limit) {
    const data = await fetchPaginatedData(
      "report",
      page,
      limit,
      {},
      { user: { select: { email: true, name: true } }, idea: true }
    );
    return data;
  }

  async deleteIdeaReport(id) {
    const ideaReport = await prisma.report.findUnique({
      where: { id },
    });

    if (!ideaReport) {
      throw new AppError("Idea report not found", 404);
    }

    await prisma.report.delete({
      where: { id },
    });
  }

  async createIdeaReport(ideaId, type, detail) {
    const report = await prisma.report.create({
      data: {
        userId: userSession.getUserId(),
        ideaId,
        type,
        detail,
      },
      select: {
        type: true,
        detail: true,
        ideaId: true,
      },
    });
    return report;
  }
}

export const ideaReportService = new IdeaReport();
