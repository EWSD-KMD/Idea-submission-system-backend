import prisma from "../prisma/prismaClient.js";
import response from "../utils/response.js";
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      include: {
        menu: true,
        rolePermissions: {
          include: {
            role: true
          }
        }
      }
    });    
    return response.success(res, permissions);
  } catch (err) {
    console.error("Error fetching permissions:", err);
    return response.error(res, 500, "Error fetching permissions");
  }
};

export const getPermissionById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        menu: true,
        rolePermissions: true,
      },
    });
    if (!permission) {
      return response.error(res, 404, "Permission not found");
    }
    return response.success(res, permission);
  } catch (err) {
    console.error("Error fetching permission:", err);
    return response.error(res, 500, "Error fetching permission");
  }
};

export const createPermission = async (req, res) => {
  try {
    const { operation, menuId } = req.body;
    if (!operation || !menuId) {
      return response.error(res, 400, "Operation and menuId are required");
    }
    const newPermission = await prisma.permission.create({
      data: { operation, menuId },
    });
    return response.success(res, newPermission);
  } catch (err) {
    console.error("Error creating permission:", err);
    return response.error(res, 500, "Error creating permission");
  }
};

export const updatePermission = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { operation, menuId } = req.body;
    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: { operation, menuId },
    });
    return response.success(res, updatedPermission);
  } catch (err) {
    console.error("Error updating permission:", err);
    return response.error(res, 500, "Error updating permission");
  }
};

export const deletePermission = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.permission.delete({
      where: { id },
    });
    return response.success(res, {
      message: "Permission deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting permission:", err);
    return response.error(res, 500, "Error deleting permission");
  }
};
