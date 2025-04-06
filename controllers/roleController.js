import response from "../utils/response.js";
import prisma from "../prisma/prismaClient.js";

export const getAllRoles = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = page ? parseInt(page, 10) : 1;
    limit = limit ? parseInt(limit, 10) : 5;
    const skip = (page - 1) * limit;

    // Fetch roles and count total roles concurrently
    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        skip,
        take: limit,
        include: {
          rolePermissions: {
            include: {
              permission: {
                include: {
                  menu: true,
                },
              },
            },
          },
        },
      }),
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


export const getRoleById = async (req, res) => {
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

export const createRole = async (req, res) => {
  try {
    const { name, permissionIds } = req.body;
    if (!name) {
      return response.error(res, 400, "Role name is required");
    }
    const newRole = await prisma.role.create({
      data: {
        name,
        rolePermissions: {
          create: permissionIds.map(permissionId => ({
            permission: { connect: { id: permissionId } }
          }))
        }
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });
    return response.success(res, newRole);
  } catch (err) {
    console.error("Error creating role:", err);
    return response.error(res, 500, "Error creating role");
  }
};

export const updateRole = async (req, res) => {
  try {
      const id = parseInt(req.params.id, 10);
      const { name, permissionIds } = req.body;

      const existingRole = await prisma.role.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingRole) {
        throw new NotFoundError('Role not found');
      }

      const role = await prisma.role.update({
        where: { id: parseInt(id) },
        data: {
          name,
          rolePermissions: {
            deleteMany: {}, // Remove all existing permissions
            create: permissionIds.map(permissionId => ({
              permission: { connect: { id: permissionId } }
            }))
          }
        },
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      });
  } catch (err) {
    console.error("Error updating role:", err);
    return response.error(res, 500, "Error updating role");
  }
};

export const deleteRole = async (req, res) => {
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
