import { EMAIL_TEMPLATE } from "../constants/emailTemplateConstant.js";
import { getQaManagerEmailsByDepartmentId } from "../utils/common.js";
import { emailService } from "./email.service.js";
import prisma from "../prisma/prismaClient.js";
import { getPrettyDate } from "../utils/common.js";
import { userSession } from "../utils/userSession.js";
import { AppError } from "../utils/appError.js";
import { fileService } from "./file.service.js";
import crypto from "crypto";

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

  async createIdea({
    title,
    description,
    categoryId,
    departmentId,
    files,
    anonymous,
  }) {
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
        anonymous,
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

    if (files?.length > 0) {
      const ideaFileArr = files.map((file) => {
        return {
          id: file.fileId,
          fileName: file.fileName,
          ideaId: newIdea.id,
          createdBy: userSession.getUserId(),
        };
      });

      console.log(ideaFileArr);
      await prisma.ideaFile.createMany({
        data: ideaFileArr,
      });
    }

    this.#sendEmailCreateIdea(departmentId, {
      ownerProfileLink: `${process.env.FRONT_END_BASE_URL}/users/${userId}`,
      ideaTitle: title,
      createdAt: getPrettyDate(newIdea.createdAt),
      ideaLink: `${process.env.FRONT_END_BASE_URL}/ideas/${newIdea.id}`,
      ownerName: newIdea.user.name,
    });
    return newIdea;
  }

  async commentIdea(ideaId, content, anonymous = false) {
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
        anonymous
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        anonymous: true,
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

  async uploadIdeaFile(files) {
    const filesPromises = files.map((file) => {
      const uuid = crypto.randomUUID();
      const filePath = `ideas/${uuid}`;
      console.log("fileId", uuid);
      return {
        fileId: uuid,
        source: file.path,
        dest: filePath,
        fileType: file.mimetype,
        fileName: file.originalname,
      };
    });
    const data = await Promise.all(
      filesPromises.map(async (item) => {
        return await fileService.uploadFile(
          item.source,
          item.dest,
          item.fileType,
          item.fileId,
          item.fileName
        );
      })
    );
    return data;
  }

  async getIdeaFile(fileId) {
    const key = `ideas/${fileId}`;

    return await fileService.getFile(key);
  }
}

export const ideaService = new IdeaService();
