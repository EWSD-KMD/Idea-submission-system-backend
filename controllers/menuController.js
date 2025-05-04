import prisma from "../prisma/prismaClient.js";
import response from "../utils/response.js";

export const getAllMenus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        skip,
        take: limit,
        include: {
          permissions: true,
        },
      }),
      prisma.menu.count(),
    ]);

    return response.success(res, {
      data: menus,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching menus:", err);
    return response.error(res, 500, "Error fetching menus");
  }
};



export const getMenuById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });
    if (!menu) {
      return response.error(res, 404, "Menu not found");
    }
    return response.success(res, menu);
  } catch (err) {
    console.error("Error fetching menu:", err);
    return response.error(res, 500, "Error fetching menu");
  }
};

export const createMenu = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return response.error(res, 400, "Menu name is required");
    }
    const newMenu = await prisma.menu.create({
      data: { name },
    });
    return response.success(res, newMenu);
  } catch (err) {
    console.error("Error creating menu:", err);
    return response.error(res, 500, "Error creating menu");
  }
};

export const updateMenu = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: { name },
    });
    return response.success(res, updatedMenu);
  } catch (err) {
    console.error("Error updating menu:", err);
    return response.error(res, 500, "Error updating menu");
  }
};

export const deleteMenu = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.menu.delete({
      where: { id },
    });
    return response.success(res, { message: "Menu deleted successfully" });
  } catch (err) {
    console.error("Error deleting menu:", err);
    return response.error(res, 500, "Error deleting menu");
  }
};
