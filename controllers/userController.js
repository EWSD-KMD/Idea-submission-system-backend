import bcrypt from "bcrypt";

import prisma from "../prisma/prismaClient.js";
import response from "../utils/response.js";
import { userService } from "../services/user.service.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return response.success(res, users);
  } catch (err) {
    console.error("Error fetching users:", err);
    return response.error(res, 500, "Error fetching users");
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return response.error(res, 404, "User not found");
    }
    return response.success(res, user);
  } catch (err) {
    console.error("Error fetching user:", err);
    return response.error(res, 500, "Error fetching user");
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, name, password, roleId, departmentId, type } = req.body;
    if (!email || !name || !password || !roleId || !departmentId || !type) {
      return response.error(res, 400, "All fields are required");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        roleId,
        departmentId,
        type,
      },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        departmentId: true,
        type: true,
      },
    });
    return response.success(res, newUser);
  } catch (err) {
    console.error("Error creating user:", err);
    return response.error(res, 500, "Error creating user");
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { email, name, password, roleId } = req.body;
    const data = { email, name, roleId };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return response.success(res, updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    return response.error(res, 500, "Error updating user");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.user.delete({
      where: { id },
    });
    return response.success(res, { message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return response.error(res, 500, "Error deleting user");
  }
};

export const disabledUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { disabledInd } = req.body;
    await userService.disabledUser(id, disabledInd);
    return response.success(res, {
      message: "Updated user disabledInd successfully",
    });
  } catch (error) {
    console.error("Error disabled user", error);
    next(error);
  }
};

export const fullyDisabledUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { disabledInd } = req.body;
    await userService.fullyDisabledUser(id, disabledInd);
    return response.success(res, {
      message: "Updated user disabledInd for fully disabled successfully",
    });
  } catch (error) {
    console.error("Error fully disabled user", error);
    next(error);
  }
};
