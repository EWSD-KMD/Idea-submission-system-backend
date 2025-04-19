

export const seedPermissions = async (prismaTx) => {
  console.log("🌱 Seeding Permissions...");

  await prismaTx.permission.createMany({
    data: [
      {
        operation: "READ",
        menuId: 1,
      },
      {
        operation: "CREATE",
        menuId: 1,
      },
      {
        operation: "UPDATE",
        menuId: 1,
      },
      {
        operation: "DELETE",
        menuId: 1,
      },
      {
        operation: "READ",
        menuId: 2, 
      },
      {
        operation: "CREATE",
        menuId: 2,
      },
      {
        operation: "UPDATE",
        menuId: 2,
      },
      {
        operation: "DELETE",
        menuId: 2,
      },
      {
        operation: "READ",
        menuId: 3,
      },
      {
        operation: "CREATE",
        menuId: 3,
      },
      {
        operation: "UPDATE",
        menuId: 3,
      },
      {
        operation: "DELETE",
        menuId: 3,
      },
      {
        operation: "READ",
        menuId: 4,
      },
      {
        operation: "CREATE",
        menuId: 4,
      },
      {
        operation: "UPDATE",
        menuId: 4,
      },
      {
        operation: "DELETE",
        menuId: 4,
      },
      {
        operation: "READ",
        menuId: 5,
      },
      {
        operation: "DISABLE",
        menuId: 5,
      },
      {
        operation: "FULLY_DISABLE",
        menuId: 5,
      },
      {
        operation: "READ",
        menuId: 6,
      },
      {
        operation: "READ",
        menuId: 7,
      },
      {
        operation: "EXPORT",
        menuId: 7,
      },
      {
        operation: "READ",
        menuId: 8,
      },
      {
        operation: "CREATE",
        menuId: 8,
      },
      {
        operation: "UPDATE",
        menuId: 8,
      },
      {
        operation: "DELETE",
        menuId: 8,
      },  
      {
        operation: "READ",
        menuId: 9,
      },
      {
        operation: "CREATE",
        menuId: 9,
      },
      {
        operation: "UPDATE",
        menuId: 9,
      },
      {
        operation: "DELETE",
        menuId: 9,
      },  
      {
        operation: "READ",  
        menuId: 10,
      },
      {
        operation: "CREATE",
        menuId: 10,
      },
      {
        operation: "UPDATE",
        menuId: 10,
      },
      {
        operation: "DELETE",
        menuId: 10,   
      },
    ],
  });

  console.log("✅ permissons seeded successfully!");
};
