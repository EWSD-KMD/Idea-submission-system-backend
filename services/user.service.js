import { Status } from "@prisma/client";
import prisma from "../prisma/prismaClient.js";
import { userSession } from "../utils/userSession.js";
import { transactional } from "../utils/db.js";
import { fileService } from "./file.service.js";

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

  async fullyDisabledUser(userId, disabledInd) {
    await this.disabledUser(userId, disabledInd);

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

  async updateProfileImage(file) {
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

    const profileImage = await prisma.profileImage.findUnique({
      where: { userId: userSession.getUserId() },
    });
    if (!profileImage) {
      await prisma.profileImage.create({
        data: {
          fileName: data.fileName,
          id: data.fileId,
          userId: userSession.getUserId(),
          createdBy: userSession.getUserId(),
        },
      });
    } else {
      await prisma.profileImage.update({
        where: { userId: userSession.getUserId() },
        data: {
          fileName: data.fileName,
          id: data.fileId,
          createdBy: userSession.getUserId(),
        },
      });
    }

    return data;
  }

  async getProfileImage(fileId) {
    const key = `profiles/${fileId}`;
    return await fileService.getFile(key);
  }
}

// transactional
UserService.prototype.fullyDisabledUser = transactional(
  UserService.prototype.fullyDisabledUser
);

export const userService = new UserService();
