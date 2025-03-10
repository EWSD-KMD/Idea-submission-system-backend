import bcrypt from "bcrypt";

import prisma from "../prisma/prismaClient.js";
import * as response from "../utils/response.js";

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
    console.log(users);
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
    const { email, name, password, roleId } = req.body;
    if (!email || !name || !password || !roleId) {
      return response.error(res, 400, "All fields are required");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        roleId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
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
