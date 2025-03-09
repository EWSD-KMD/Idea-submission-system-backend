const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");

exports.getAllMenus = async (req, res) => {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        permissions: true,
      },
    });
    return response.success(res, menus);
  } catch (err) {
    console.error("Error fetching menus:", err);
    return response.error(res, 500, "Error fetching menus");
  }
};

exports.getMenuById = async (req, res) => {
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

exports.createMenu = async (req, res) => {
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

exports.updateMenu = async (req, res) => {
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

exports.deleteMenu = async (req, res) => {
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