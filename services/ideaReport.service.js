import prisma from "../prisma/prismaClient.js";
import { fetchPaginatedData } from "../utils/db.js";
import { AppError } from "../utils/appError.js";
import { userSession } from "../utils/userSession.js";
import { emailService } from "./email.service.js";
import { EMAIL_TEMPLATE } from "../constants/emailTemplateConstant.js";
import {
  getPrettyDate,
  getQaManagerEmailsByDepartmentId,
} from "../utils/common.js";

class IdeaReport {
  async fetchAllIdeaReport(page, limit) {
    const data = await fetchPaginatedData(
      "report",
      page,
      limit,
      {},
      {
        user: {
          select: {
            email: true,
            name: true,
            disabledInd: true,
            fullyDisabledInd: true,
          },
        },
        idea: {
          select: {
            user: {
              select: {
                name: true,
                disabledInd: true,
                email: true,
                fullyDisabledInd: true,
              },
            },
            id: true,
            title: true,
            description: true,
            status: true,
            anonymous: true,
            categoryId: true,
            departmentId: true,
            userId: true,
            academicYearId: true,
            likes: true,
            dislikes: true,
            views: true,
          },
        },
      }
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

  async #sendEmailReportIdea(
    departmentId,
    {
      reporterEmail,
      ideaTitle,
      type,
      reportedAt,
      ideaLink,
      reporterProfileLink,
    }
  ) {
    try {
      const toEmails = await getQaManagerEmailsByDepartmentId(departmentId);
      const htmlContent = emailService.compileTemplate(
        EMAIL_TEMPLATE.REPORT_IDEA_TP.PATH,
        {
          reporterEmail,
          reporterProfileLink,
          ideaTitle,
          type,
          reportedAt,
          ideaLink,
        }
      );

      emailService.sendEmail({
        fromEmail: process.env.GOOGLE_MAIL,
        toEmails,
        subject: EMAIL_TEMPLATE.CREATE_IDEA_TP.SUBJECT,
        htmlEmailContent: htmlContent,
      });
    } catch (error) {
      console.error(error);
    }
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
        userId: true,
        idea: {
          select: {
            title: true,
            departmentId: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    });

    this.#sendEmailReportIdea(report.idea.departmentId, {
      reporterEmail: report.user.name,
      ideaTitle: report.idea.title,
      type: report.type,
      reportedAt: getPrettyDate(report.createdAt),
      ideaLink: `${process.env.FRONT_END_BASE_URL}/ideas/${report.ideaId}`,
      reporterProfileLink: `${process.env.FRONT_END_BASE_URL}/users/${report.userId}`,
    });

    return report;
  }
}

export const ideaReportService = new IdeaReport();
