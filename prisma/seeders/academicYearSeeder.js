import moment from "moment";

export const seedAcademicYear = async (prismaTx) => {
  console.log("🌱 Seeding Academic Year...");

  await prismaTx.academicYear.createMany({
    data: [
      {
        startDate: moment({ year: 2020, month: 0, day: 1 }).format(),
        closureDate: moment({ year: 2020, month: 1, day: 28 }).format(),
        finalClosureDate: moment({ year: 2025, month: 2, day: 30 }).format(),
        year: 2020,
      },
    ],
  });

  console.log("✅ Academic Year seeded successfully!");
};
