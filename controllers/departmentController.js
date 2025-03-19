import { PrismaClient } from "@prisma/client";
import response from "../utils/response.js";

const prisma = new PrismaClient();

export const getAllDepartments = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = page ? parseInt(page, 10) : 1;
    limit = limit ? parseInt(limit, 10) : 10;
    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: { ideas: true }
          }
        }
      }),
      prisma.department.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    return response.success(res, {
      departments,
      page,
      limit,
      total,
      totalPages
    });
  } catch (err) {
    console.error("Error fetching departments:", err);
    return response.error(res, 500, "Error fetching departments");
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        ideas: true,
        _count: {
          select: { ideas: true }
        }
      }
    });

    if (!department) {
      return response.error(res, 404, "Department not found");
    }

    return response.success(res, department);
  } catch (err) {
    console.error("Error fetching department:", err);
    return response.error(res, 500, "Error fetching department");
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return response.error(res, 400, "Department name is required");
    }

    const newDepartment = await prisma.department.create({
      data: { name }
    });

    return response.success(res, newDepartment);
  } catch (err) {
    if (err.code === 'P2002') {
      return response.error(res, 400, "Department name already exists");
    }
    console.error("Error creating department:", err);
    return response.error(res, 500, "Error creating department");
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;

    if (!name) {
      return response.error(res, 400, "Department name is required");
    }

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: { name }
    });

    return response.success(res, updatedDepartment);
  } catch (err) {
    if (err.code === 'P2002') {
      return response.error(res, 400, "Department name already exists");
    }
    if (err.code === 'P2025') {
      return response.error(res, 404, "Department not found");
    }
    console.error("Error updating department:", err);
    return response.error(res, 500, "Error updating department");
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Check if department has associated ideas
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { ideas: true }
        }
      }
    });

    if (!department) {
      return response.error(res, 404, "Department not found");
    }

    if (department._count.ideas > 0) {
      return response.error(res, 400, "Cannot delete department with associated ideas");
    }

    await prisma.department.delete({
      where: { id }
    });

    return response.success(res, { message: "Department deleted successfully" });
  } catch (err) {
    console.error("Error deleting department:", err);
    return response.error(res, 500, "Error deleting department");
  }
};