import { seedRoles } from "./seeders/roleSeeder.js";
import prisma from "./prismaClient.js";
const seedDatabase = async () => {
  console.log("🚀 Running database seeders...");

  try {
    await prisma.$transaction(async () => {
      await seedRoles();
    });

    console.log("🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
