import bcrypt from "bcrypt";

import {
  generateJwtToken,
  verifyToken,
  getExpireDateFromToken,
  decodeToken,
  isValidTokenDate,
} from "../utils/jwt.js";
import prisma from "../prisma/prismaClient.js";
import { AppError } from "../utils/appError.js";
import { JwtTokenType } from "../constants/jwtConstant.js";
import { emailService } from "./email.service.js";
import { EMAIL_TEMPLATE } from "../constants/emailTemplateConstant.js";
import { userSession } from "../utils/userSession.js";
import { getPrettyUserAgent } from "../utils/common.js";

class AuthService {
  async #isValidPassword(pwd, pwdHash) {
    return await bcrypt.compare(pwd, pwdHash);
  }

  async #createAccessAndRefreshToken(userId, email, userType) {
    const accessToken = await generateJwtToken(
      { email, userId, type: userType },
      JwtTokenType.ACCESS_TOKEN
    );
    const refreshToken = await generateJwtToken(
      { email, userId, type: userType },
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

  async login(email, password, source, userAgent) {
    userAgent = getPrettyUserAgent(userAgent);
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new AppError("invalid username or password", 400);
    }

    if (source !== user.type) {
      throw new AppError("invalid username or password", 400);
    }
    if (!(await this.#isValidPassword(password, user.password))) {
      throw new AppError("invalid username or password", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginTime: new Date(), firstTimeLoginInd: false },
    });
    await this.#saveUserAgent(userAgent, user.id);
    const data = await this.#createAccessAndRefreshToken(
      user.id,
      user.email,
      user.type
    );
    return {
      ...data,
      firstTimeLogin: user.firstTimeLoginInd,
    };
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
    const { userId, email, type } = await decodeToken(oldRefreshToken);
    try {
      await verifyToken(oldRefreshToken, JwtTokenType.REFRESH_TOKEN);
    } catch (error) {
      throw new AppError("Unauthorize", 401);
    }
    await prisma.refreshToken.delete({
      where: { token: oldRefreshToken },
    });

    return await this.#createAccessAndRefreshToken(userId, email, type);
  }

  #sendEmailForgotPwd(userEmail, resetLink) {
    const htmlContent = emailService.compileTemplate(
      EMAIL_TEMPLATE.FORGOT_PWD_TP.PATH,
      {
        resetLink,
      }
    );

    emailService.sendEmail({
      fromEmail: process.env.GOOGLE_MAIL,
      toEmails: [userEmail],
      subject: EMAIL_TEMPLATE.FORGOT_PWD_TP.SUBJECT,
      htmlEmailContent: htmlContent,
    });
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const jwtToken = await generateJwtToken(
      { email: user.email, userId: user.id },
      JwtTokenType.TEMP_TOKEN
    );
    const resetLink = `${process.env.FRONT_END_BASE_URL}/users/forget-password?token=${jwtToken}`;
    if (user) {
      this.#sendEmailForgotPwd(user.email, resetLink);
    }
  }

  async resetPassword(tempToken, newPassword) {
    try {
      await verifyToken(tempToken, JwtTokenType.TEMP_TOKEN);
    } catch (error) {
      console.log(error);
      throw new AppError("unauthorize", 401);
    }
    const decodedToken = await decodeToken(tempToken);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decodedToken.userId },
      data: { password: hashedPassword, passwordUpdatedAt: new Date() },
    });
  }

  async updatePassword(currentPassword, newPassword) {
    const userId = userSession.getUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!(await this.#isValidPassword(currentPassword, user.password))) {
      throw new AppError("forbidden", 403);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, passwordUpdatedAt: new Date() },
    });
  }

  async #saveUserAgent(userAgent, userId) {
    console.log(userAgent);
    await prisma.user.update({
      where: { id: userId },
      data: { userAgent },
    });
  }
}

export const authService = new AuthService();
