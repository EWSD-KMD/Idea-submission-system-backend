export const seedRoles = async (prismaTx) => {
  console.log("🌱 Seeding Roles...");

  await prismaTx.role.createMany({
    data: [
      {
        name: "ROOT",
        permissionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 20, 31, 32, 33, 34],
      },
      {
        name: "QA_COORDINATOR",
        permissionIds: [21, 27, 28, 29, 30],
      },
      {
        name: "QA_MANAGER",
        permissionIds: [17, 18, 19, 21, 22, 31, 32, 33, 34],
      },
      {
        name: "Admin",
        permissionIds: [20, 23, 24, 25, 26]
      },
    ],
  });

  console.log("✅ Roles seeded successfully!");
};
