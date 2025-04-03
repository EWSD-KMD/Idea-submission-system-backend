export const seedRoles = async (prismaTx) => {
  console.log("🌱 Seeding Roles...");

  await prismaTx.role.createMany({
    data: [
      {
        name: "QA_COORDINATOR",
      },
      {
        name: "QA_MANAGER",
      },
    ],
  });

  console.log("✅ Roles seeded successfully!");
};
