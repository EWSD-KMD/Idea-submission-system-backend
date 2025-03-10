import bcrypt from "bcrypt";

import {
  generateJwtToken,
  verifyToken,
  getExpireDateFromToken,
  decodeToken,
} from "../utils/jwt.js";
import prisma from "../prisma/prismaClient.js";
import { AppError } from "../utils/appError.js";
import { JwtTokenType } from "../constants/jwtConstant.js";
import { userSession } from "../utils/userSession.js";

class AuthService {
  async #isValidPassword(pwd, pwdHash) {
    return await bcrypt.compare(pwd, pwdHash);
  }

  async #createAccessAndRefreshToken(userId, email) {
    const accessToken = await generateJwtToken(
      { email, userId },
      JwtTokenType.ACCESS_TOKEN
    );
    const refreshToken = await generateJwtToken(
      { email, userId },
      JwtTokenType.REFRESH_TOKEN
    );
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: await getExpireDateFromToken(refreshToken),
        userId: userId,
      },
    });
    return { accessToken, refreshToken };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new AppError("invalid username or password", 400);
    }
    if (!(await this.#isValidPassword(password, user.password))) {
      throw new AppError("invalid username or password", 400);
    }
    return await this.#createAccessAndRefreshToken(user.id, user.email);
  }

  async logout(refreshToken) {
    const token = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!token) {
      throw new AppError("invalid refresh token", 400);
    }
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
  }

  async refreshToken(oldRefreshToken) {
    console.log(oldRefreshToken);
    const { userId, email } = await decodeToken(oldRefreshToken);
    await verifyToken(oldRefreshToken, JwtTokenType.REFRESH_TOKEN);
    await prisma.refreshToken.delete({
      where: { token: oldRefreshToken },
    });

    return await this.#createAccessAndRefreshToken(userId, email);
  }
}

export const authService = new AuthService();
