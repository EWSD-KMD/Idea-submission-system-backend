import { Status } from "@prisma/client";
import prisma from "../prisma/prismaClient.js";
import { userSession } from "../utils/userSession.js";
import { transactional } from "../utils/db.js";
import { fileService } from "./file.service.js";
import crypto from "crypto";

class UserService {
  get prisma() {
    return prisma;
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

  async fullyDisabled(userId, fullyDisabledInd, txnPrisma) {
    await txnPrisma.user.update({
      where: { id: userId },
      data: { fullyDisabledInd, disabledInd: fullyDisabledInd },
    });
  }

  async fullyDisabledUser(userId, disabledInd) {
    await prisma.$transaction(async (txnPrisma) => {
      await this.fullyDisabled(userId, disabledInd, txnPrisma);

      // update the status of all the idea and comments
      await txnPrisma.idea.updateMany({
        where: { userId },
        data: { status: disabledInd ? Status.HIDE : Status.SHOW },
      });

      await txnPrisma.comment.updateMany({
        where: { userId },
        data: { status: disabledInd ? Status.HIDE : Status.SHOW },
      });
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
      where: {
        NOT: { status: Status.DELETED },
        userId: userSession.getUserId(),
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
        const notis = await prisma.notification.findMany({
          where: {
            ideaId: idea.id,
            fromUserId: userSession.getUserId(),
            type: {
              in: ["LIKE", "DISLIKE"],
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        const noti = notis[0];
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

  async deleteProfileImage() {
    await this.prisma.profileImage.delete({
      where: { userId: userSession.getUserId() },
    });
  }
}

export const userService = new UserService();
