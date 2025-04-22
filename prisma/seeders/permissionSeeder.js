export const seedPermissions = async (prismaTx) => {
  console.log("🌱 Seeding Permissions...");

  const menus = await prismaTx.menu.findMany();
  
  const menuMap = {};
  menus.forEach(menu => {
    menuMap[menu.name] = menu.id;
  });

  await prismaTx.permission.createMany({
    data: [
      {
        operation: "READ",
        menuId: menuMap["Admin"],
      },
      {
        operation: "CREATE",
        menuId: menuMap["Admin"],
      },
      {
        operation: "UPDATE",
        menuId: menuMap["Admin"],
      },
      {
        operation: "DELETE",
        menuId: menuMap["Admin"],
      },
      {
        operation: "READ",
        menuId: menuMap["Role"], 
      },
      {
        operation: "CREATE",
        menuId: menuMap["Role"],
      },
      {
        operation: "UPDATE",
        menuId: menuMap["Role"],
      },
      {
        operation: "DELETE",
        menuId: menuMap["Role"],
      },
      {
        operation: "READ",
        menuId: menuMap["Menu"],
      },
      {
        operation: "CREATE",
        menuId: menuMap["Menu"],
      },
      {
        operation: "UPDATE",
        menuId: menuMap["Menu"],
      },
      {
        operation: "DELETE",
        menuId: menuMap["Menu"],
      },
      {
        operation: "READ",
        menuId: menuMap["Permission"],
      },
      {
        operation: "CREATE",
        menuId: menuMap["Permission"],
      },
      {
        operation: "UPDATE",
        menuId: menuMap["Permission"],
      },
      {
        operation: "DELETE",
        menuId: menuMap["Permission"],
      },
      {
        operation: "READ",
        menuId: menuMap["Report"],
      },
      {
        operation: "DISABLE",
        menuId: menuMap["Report"],
      },
      {
        operation: "FULLY_DISABLE",
        menuId: menuMap["Report"],
      },
      {
        operation: "READ",
        menuId: menuMap["ReportChart"],
      },
      {
        operation: "READ",
        menuId: menuMap["Idea"],
      },
      {
        operation: "EXPORT",
        menuId: menuMap["Idea"],
      },
      {
        operation: "READ",
        menuId: menuMap["AcademicYear"],
      },
      {
        operation: "CREATE",
        menuId: menuMap["AcademicYear"],
      },
      {
        operation: "UPDATE",
        menuId: menuMap["AcademicYear"],
      },
      {
        operation: "DELETE",
        menuId: menuMap["AcademicYear"],
      },  
      {
        operation: "READ",
        menuId: menuMap["Department"],
      },
      {
        operation: "CREATE",
        menuId: menuMap["Department"],
      },
      {
        operation: "UPDATE",
        menuId: menuMap["Department"],
      },
      {
        operation: "DELETE",
        menuId: menuMap["Department"],
      },  
      {
        operation: "READ",  
        menuId: menuMap["Category"],
      },
      {
        operation: "CREATE",
        menuId: menuMap["Category"],
      },
      {
        operation: "UPDATE",
        menuId: menuMap["Category"],
      },
      {
        operation: "DELETE",
        menuId: menuMap["Category"],   
      },
    ],
  });

  console.log("✅ permissions seeded successfully!");
};