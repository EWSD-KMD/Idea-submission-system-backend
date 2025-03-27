import { Status } from "@prisma/client";
import prisma from "../prisma/prismaClient.js";
import { userSession } from "../utils/userSession.js";
import { transactional } from "../utils/db.js";

class UserService {
  constructor() {
    this.prisma = prisma;
  }
  async getProfile() {
    const userId = userSession.getUserId();
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
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
}

// transactional
UserService.prototype.fullyDisabledUser = transactional(
  UserService.prototype.fullyDisabledUser
);

export const userService = new UserService();
