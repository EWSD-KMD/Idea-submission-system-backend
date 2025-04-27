import { Status } from "@prisma/client";
import prisma from "../prisma/prismaClient.js";
import { userSession } from "../utils/userSession.js";
import { transactional } from "../utils/db.js";
import { fileService } from "./file.service.js";
import crypto from "crypto";

class UserService {
  constructor() {
    this.prisma = prisma;
  }
  async getProfile() {
    const userId = userSession.getUserId();
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        profileImage: { select: { id: true, fileName: true } },
        lastLoginTime: true,
        department: { select: { id: true, name: true } },
      },
    });
    return user;
  }

  async disabledUser(userId, disabledInd) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { disabledInd },
    });
  }

  async fullyDisabled(userId, fullyDisabledInd) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fullyDisabledInd, disabledInd: fullyDisabledInd },
    });
  }

  async fullyDisabledUser(userId, disabledInd) {
    await this.fullyDisabled(userId, disabledInd);

    // update the status of all the idea and comments
    await this.prisma.idea.updateMany({
      where: { userId },
      data: { status: disabledInd ? Status.HIDE : Status.SHOW },
    });

    await this.prisma.comment.updateMany({
      where: { userId },
      data: { status: disabledInd ? Status.HIDE : Status.SHOW },
    });
  }

  async updateProfileImage(file, userId) {
    const uuid = crypto.randomUUID();
    const filePath = `profiles/${uuid}`;
    console.log("fileId", uuid);

    const data = await fileService.uploadFile(
      file.path,
      filePath,
      file.mimetype,
      uuid,
      file.originalname
    );

    console.log("userId", userId);
    const profileImage = await prisma.profileImage.findUnique({
      where: { userId },
    });
    if (!profileImage) {
      await prisma.profileImage.create({
        data: {
          fileName: data.fileName,
          id: data.fileId,
          userId,
          createdBy: userId,
        },
      });
    } else {
      await prisma.profileImage.update({
        where: { userId },
        data: {
          fileName: data.fileName,
          id: data.fileId,
          createdBy: userId,
        },
      });
    }

    return data;
  }

  async getProfileImage(fileId) {
    const key = `profiles/${fileId}`;
    return await fileService.getFile(key);
  }

  async getIdea() {
    const data = await prisma.idea.findMany({
      where: { userId: userSession.getUserId() },
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
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        files: {
          select: {
            id: true,
            fileName: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
            reports: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const transformedIdeas = await Promise.all(
      data.map(async (idea) => {
        const noti = await prisma.notification.findFirst({
          where: {
            ideaId: idea.id,
            fromUserId: userSession.getUserId(),
            type: {
              in: ["LIKE", "DISLIKE"],
            },
          },
        });
        console.log("noti", noti);

        return {
          ...idea,
          comments: idea.comments.map((comment) => ({
            ...comment,
            user: idea.anonymous
              ? {
                  id: comment.user.id,
                  name:
                    comment.user.id === idea.userId
                      ? "Anonymous (Author)"
                      : comment.user.name,
                  department: comment.user.department,
                }
              : comment.user,
          })),
          likeInd: noti?.type === "LIKE",
          dislikeInd: noti?.type === "DISLIKE",
        };
      })
    );
    return transformedIdeas;
  }
}

// transactional
UserService.prototype.fullyDisabledUser = transactional(
  UserService.prototype.fullyDisabledUser
);

export const userService = new UserService();
