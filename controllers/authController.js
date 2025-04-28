import { authService } from "../services/auth.service.js";
import { userService } from "../services/user.service.js";
import response from "../utils/response.js";
import { userSession } from "../utils/userSession.js";
import prisma from "../prisma/prismaClient.js";
import { masterSettingService } from "../services/masterSetting.service.js";
import { retriveBearerToken, decodeToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";

export const login = async (req, res, next) => {
  try {
    const { email, password, source } = req.body;
    const data = await authService.login(email, password, source);
    return response.success(res, data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.headers["x-refresh-token"];
    await authService.logout(refreshToken);
    return response.success(res);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.headers["x-refresh-token"];
    const data = await authService.refreshToken(refreshToken);
    return response.success(res, data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const data = await authService.forgotPassword(email);
    return response.success(res, data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const tempToken = req.headers["x-temp-token"];
    console.log(tempToken);
    await authService.resetPassword(tempToken, newPassword);
    return response.success(res);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.updatePassword(currentPassword, newPassword);
    return response.success(res);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const data = await userService.getProfile();
    const data1 = await masterSettingService.getAllMasterSettingData();
    return response.success(res, {
      ...data,
      currentAcademicYear: data1.currentAcademicYear,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updateProfileImage = async (req, res, next) => {
  try {
    const bearerToken = retriveBearerToken(req.headers.authorization);
    const { userId } = await decodeToken(bearerToken);
    const data = await userService.updateProfileImage(req.file, userId);
    return response.success(res, data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getProfileImage = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const profileImage = await prisma.profileImage.findUnique({
      where: { userId: parseInt(userId) },
    });
    if (!profileImage) {
      throw new AppError("Profile image not found", 404);
    }
    const { Body, ContentType, ContentLength, ContentDisposition } =
      await userService.getProfileImage(profileImage.id);
    // Detect if Body is a stream or buffer
    const isReadable = Body && typeof Body.pipe === "function";

    res.setHeader("Content-Type", ContentType || "application/octet-stream");
    if (ContentLength) res.setHeader("Content-Length", ContentLength);
    res.setHeader(
      "Content-Disposition",
      ContentDisposition || `inline; filename="${profileImage.fileName}"`
    );

    if (isReadable) {
      Body.pipe(res); // pipe stream directly
    } else {
      // fallback: if Body is a buffer or Uint8Array
      res.end(Body);
    }
  } catch (err) {
    console.error("Error creating report:", err);
    next(err);
  }
};

export const getIdeas = async (req, res, next) => {
  try {
    const data = await userService.getIdea();
    return response.success(res, data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const deleteProfileImage = async (req, res, next) => {
  try {
    await userService.deleteProfileImage();
    return response.success(res, {});
  } catch (error) {
    console.error(error);
    next(error);
  }
};
