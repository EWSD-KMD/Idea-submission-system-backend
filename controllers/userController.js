import bcrypt from "bcrypt";

import prisma from "../prisma/prismaClient.js";
import response from "../utils/response.js";
import { userService } from "../services/user.service.js";
import { fetchPaginatedData } from "../utils/db.js";

export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, departmentId } = req.query;

    const users = await fetchPaginatedData(
      "user",
      page,
      limit,
      { deleted: false, ...(departmentId && { departmentId: parseInt(departmentId, 10) })},
      {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: true,
        type: true,
        departmentId: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      }
    );
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
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    operation: true,
                    menu: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!user) {
      return response.error(res, 404, "User not found");
    }

    // Transform the data to make it more readable
    const transformedUser = {
      ...user,
      role: {
        id: user.role.id,
        name: user.role.name,
        menus: user.role.rolePermissions.reduce((acc, rp) => {
          const menu = rp.permission.menu;
          const existingMenu = acc.find(m => m.id === menu.id);
          
          if (existingMenu) {
            existingMenu.permissions.push(rp.permission.operation);
          } else {
            acc.push({
              id: menu.id,
              name: menu.name,
              permissions: [rp.permission.operation]
            });
          }
          
          return acc;
        }, [])
      }
    };

    return response.success(res, transformedUser);
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
    
    // Check if user exists and is not already deleted
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return response.error(res, 404, "User not found");
    }

    if (user.deleted) {
      return response.error(res, 400, "User already deleted");
    }

    // Soft delete the user
    await prisma.user.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date()
      }
    });

    return response.success(res, { 
      message: "User deleted successfully",
      deletedAt: new Date()
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    return response.error(res, 500, "Error deleting user");
  }
};

export const restoreUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return response.error(res, 404, "User not found");
    }

    if (!user.deleted) {
      return response.error(res, 400, "User is not deleted");
    }

    await prisma.user.update({
      where: { id },
      data: {
        deleted: false,
        deletedAt: null
      }
    });

    return response.success(res, { 
      message: "User restored successfully" 
    });
  } catch (err) {
    console.error("Error restoring user:", err);
    return response.error(res, 500, "Error restoring user");
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
