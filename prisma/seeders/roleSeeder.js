import prisma from "../prismaClient.js";

export const seedRoles = async () => {
  console.log("🌱 Seeding Roles...");

  await prisma.role.createMany({
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
