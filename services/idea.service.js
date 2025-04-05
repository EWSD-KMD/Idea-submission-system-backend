import { EMAIL_TEMPLATE } from "../constants/emailTemplateConstant.js";
import { getQaManagerEmailsByDepartmentId } from "../utils/common.js";
import { emailService } from "./email.service.js";
import prisma from "../prisma/prismaClient.js";
import { getPrettyDate } from "../utils/common.js";
import { userSession } from "../utils/userSession.js";
import { AppError } from "../utils/appError.js";

class IdeaService {
  async #sendEmailCreateIdea(
    departmentId,
    { ownerProfileLink, ideaTitle, createdAt, ideaLink, ownerName }
  ) {
    try {
      const toEmails = getQaManagerEmailsByDepartmentId(departmentId);
      const htmlContent = emailService.compileTemplate(
        EMAIL_TEMPLATE.CREATE_IDEA_TP.PATH,
        {
          ownerProfileLink,
          createdAt,
          ideaTitle,
          ideaLink,
          ownerName,
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

  async #sendEmailCommentIdea({
    ideaOwnerEmail,
    ideaOwnerName,
    ideaTitle,
    commentOwnerProfileLink,
    commentOwnerName,
    commentText,
    createdAt,
    ideaLink,
  }) {
    try {
      const htmlContent = emailService.compileTemplate(
        EMAIL_TEMPLATE.CREATE_COMMENT_TP.PATH,
        {
          ideaOwnerName,
          ideaTitle,
          commentOwnerProfileLink,
          commentOwnerName,
          commentText,
          createdAt,
          ideaLink,
        }
      );

      emailService.sendEmail({
        fromEmail: process.env.GOOGLE_MAIL,
        toEmails: [ideaOwnerEmail],
        subject: EMAIL_TEMPLATE.CREATE_COMMENT_TP.SUBJECT,
        htmlEmailContent: htmlContent,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async createIdea({ title, description, categoryId, departmentId }) {
    const userId = userSession.getUserId();
    const masterSetting = await prisma.masterSetting.findFirst();
    if (!masterSetting) {
      throw new AppError("master setting not found", 500);
    }
    const newIdea = await prisma.idea.create({
      data: {
        title,
        description,
        categoryId,
        departmentId,
        userId,
        academicYearId: masterSetting.currentAcademicYearId,
      },
      include: {
        category: true,
        department: true,
        academicYear: {
          select: {
            id: true,
            year: true,
            startDate: true,
            closureDate: true,
            finalClosureDate: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.#sendEmailCreateIdea(departmentId, {
      ownerProfileLink: `${process.env.FRONT_END_BASE_URL}/users/${userId}`,
      ideaTitle: title,
      createdAt: getPrettyDate(newIdea.createdAt),
      ideaLink: `${process.env.FRONT_END_BASE_URL}/ideas/${newIdea.id}`,
      ownerName: newIdea.user.name,
    });
    return newIdea;
  }

  async commentIdea(ideaId, content) {
    const userId = userSession.getUserId();

    const idea = await prisma.idea.findUnique({
      where: { id: parseInt(ideaId, 10) },
      select: {
        userId: true,
        title: true,
        user: { select: { email: true, name: true } },
      },
    });

    const comment = await prisma.comment.create({
      data: {
        content,
        ideaId: parseInt(ideaId, 10),
        userId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.#sendEmailCommentIdea({
      ideaOwnerEmail: idea.user.email,
      ideaOwnerName: idea.user.name,
      ideaTitle: idea.title,
      commentOwnerProfileLink: `${process.env.FRONT_END_BASE_URL}/users/${comment.user.id}`,
      commentOwnerName: comment.user.name,
      commentText: comment.content,
      createdAt: getPrettyDate(comment.createdAt),
      ideaLink: `${process.env.FRONT_END_BASE_URL}/ideas/${ideaId}`,
    });
    return { userId, idea, comment };
  }
}

export const ideaService = new IdeaService();
