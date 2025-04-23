import { seedRoles } from "./seeders/roleSeeder.js";
import prisma from "./prismaClient.js";
import { seedAcademicYear } from "./seeders/academicYearSeeder.js";
import { seedMasterSetting } from "./seeders/masterSetttingSeeder.js";
import { seedPermissions } from "./seeders/permissionSeeder.js";
import { seedMenus } from "./seeders/menuSeeder.js";

const seedDatabase = async () => {
  console.log("🚀 Running database seeders...");

  try {
    await prisma.$transaction(async (prismaTx) => {
      await seedMenus(prismaTx);
      await seedPermissions(prismaTx);
      await seedRoles(prismaTx);
      await seedAcademicYear(prismaTx);
      await seedMasterSetting(prismaTx);
    });

    console.log("🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
