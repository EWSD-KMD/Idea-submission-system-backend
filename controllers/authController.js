import { authService } from "../services/auth.service.js";
import response from "../utils/response.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
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
