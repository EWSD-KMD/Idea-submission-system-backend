const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const response = require("../utils/response");

exports.getAllRoles = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = page ? parseInt(page, 10) : 1;
    limit = limit ? parseInt(limit, 10) : 5;
    const skip = (page - 1) * limit;

    // Fetch roles and count total roles concurrently
    const [roles, total] = await Promise.all([
      prisma.role.findMany({ skip, take: limit }),
      prisma.role.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return response.success(res, {
      roles,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (err) {
    console.error("Error fetching roles:", err);
    return response.error(res, 500, "Error fetching roles");
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const role = await prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      return response.error(res, 404, "Role not found");
    }
    return response.success(res, role);
  } catch (err) {
    console.error("Error fetching role:", err);
    return response.error(res, 500, "Error fetching role");
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return response.error(res, 400, "Role name is required");
    }
    const newRole = await prisma.role.create({
      data: { name },
    });
    return response.success(res, newRole);
  } catch (err) {
    console.error("Error creating role:", err);
    return response.error(res, 500, "Error creating role");
  }
};

exports.updateRole = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    const updatedRole = await prisma.role.update({
      where: { id },
      data: { name },
    });
    return response.success(res, updatedRole);
  } catch (err) {
    console.error("Error updating role:", err);
    return response.error(res, 500, "Error updating role");
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.role.delete({
      where: { id },
    });
    return response.success(res, { message: "Role deleted successfully" });
  } catch (err) {
    console.error("Error deleting role:", err);
    return response.error(res, 500, "Error deleting role");
  }
};
