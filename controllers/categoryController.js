import { PrismaClient } from "@prisma/client";
import response from "../utils/response.js";

const prisma = new PrismaClient();

export const getAllCategories = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = page ? parseInt(page, 10) : 1;
    limit = limit ? parseInt(limit, 10) : 10;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: { ideas: true }
          }
        }
      }),
      prisma.category.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    return response.success(res, {
      categories,
      page,
      limit,
      total,
      totalPages
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return response.error(res, 500, "Error fetching categories");
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        ideas: true,
        _count: {
          select: { ideas: true }
        }
      }
    });

    if (!category) {
      return response.error(res, 404, "Category not found");
    }

    return response.success(res, category);
  } catch (err) {
    console.error("Error fetching category:", err);
    return response.error(res, 500, "Error fetching category");
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return response.error(res, 400, "Category name is required");
    }

    const newCategory = await prisma.category.create({
      data: { name }
    });

    return response.success(res, newCategory);
  } catch (err) {
    if (err.code === 'P2002') {
      return response.error(res, 400, "Category name already exists");
    }
    console.error("Error creating category:", err);
    return response.error(res, 500, "Error creating category");
  }
};

export const updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;

    if (!name) {
      return response.error(res, 400, "Category name is required");
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name }
    });

    return response.success(res, updatedCategory);
  } catch (err) {
    if (err.code === 'P2002') {
      return response.error(res, 400, "Category name already exists");
    }
    if (err.code === 'P2025') {
      return response.error(res, 404, "Category not found");
    }
    console.error("Error updating category:", err);
    return response.error(res, 500, "Error updating category");
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Check if category has associated ideas
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { ideas: true }
        }
      }
    });

    if (!category) {
      return response.error(res, 404, "Category not found");
    }

    if (category._count.ideas > 0) {
      return response.error(res, 400, "Cannot delete category with associated ideas");
    }

    await prisma.category.delete({
      where: { id }
    });

    return response.success(res, { message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    return response.error(res, 500, "Error deleting category");
  }
};