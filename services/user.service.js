import prisma from "../prisma/prismaClient.js";
import { userSession } from "../utils/userSession.js";

class UserService {
  async getProfile() {
    const userId = userSession.getUserId();
    const user = prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    return user;
  }
}

export const userService = new UserService();
