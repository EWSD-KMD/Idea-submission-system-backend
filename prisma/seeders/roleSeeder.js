export const seedRoles = async (prismaTx) => {
  console.log("🌱 Seeding Roles...");

  const permissions = await prismaTx.permission.findMany({
    include: {
      menu: true
    }
  });

  const getPermissionIds = (operationMenuPairs) => {
    return operationMenuPairs.map(([operation, menuName]) => {
      const permission = permissions.find(p => 
        p.operation === operation && 
        p.menu.name === menuName
      );
      if (!permission) {
        throw new Error(`Permission not found for operation: ${operation}, menu: ${menuName}`);
      }
      return permission.id;
    });
  };

  const rolePermissions = {
    ROOT: [
      ["READ", "Admin"],
      ["CREATE", "Admin"],
      ["UPDATE", "Admin"],
      ["DELETE", "Admin"],
      ["READ", "Role"],
      ["CREATE", "Role"],
      ["UPDATE", "Role"],
      ["DELETE", "Role"],
      ["READ", "Menu"],
      ["CREATE", "Menu"],
      ["UPDATE", "Menu"],
      ["DELETE", "Menu"],
      ["READ", "Permission"],
      ["CREATE", "Permission"],
      ["UPDATE", "Permission"],
      ["DELETE", "Permission"],
      ["READ", "Report"],
      ["DISABLE", "Report"],
      ["FULLY_DISABLE", "Report"],
      ["READ", "ReportChart"],
      ["READ", "Idea"],
      ["EXPORT", "Idea"],
      ["READ", "AcademicYear"],
      ["CREATE", "AcademicYear"],
      ["UPDATE", "AcademicYear"],
      ["DELETE", "AcademicYear"],
      ["READ", "Department"],
      ["CREATE", "Department"],
      ["UPDATE", "Department"],
      ["DELETE", "Department"],
      ["READ", "Category"],
      ["CREATE", "Category"],
      ["UPDATE", "Category"],
      ["DELETE", "Category"]
    ],
    QA_COORDINATOR: [
      ["READ", "Idea"],
      ["READ", "Department"],
      ["CREATE", "Department"],
      ["UPDATE", "Department"],
      ["DELETE", "Department"]
    ],
    QA_MANAGER: [
      ["READ", "Report"],
      ["DISABLE", "Report"],
      ["FULLY_DISABLE", "Report"],
      ["READ", "Idea"],
      ["EXPORT", "Idea"],
      ["READ", "Category"],
      ["CREATE", "Category"],
      ["UPDATE", "Category"],
      ["DELETE", "Category"]
    ],
    Admin: [
      ["READ", "AcademicYear"],
      ["CREATE", "AcademicYear"],
      ["UPDATE", "AcademicYear"],
      ["DELETE", "AcademicYear"]
    ]
  };

  await Promise.all(
    Object.entries(rolePermissions).map(async ([roleName, permissionPairs]) => {
      const permissionIds = getPermissionIds(permissionPairs);
      
      const role = await prismaTx.role.create({
        data: {
          name: roleName
        }
      });

      await prismaTx.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId: role.id,
          permissionId
        }))
      });
    })
  );

  console.log("✅ Roles seeded successfully!");
};