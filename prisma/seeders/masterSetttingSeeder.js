export const seedMasterSetting = async (prismaTx) => {
  console.log("🌱 Seeding Master Setting...");

  const defaultAcademicYear = await prismaTx.academicYear.findFirst();
  await prismaTx.masterSetting.createMany({
    data: [
      {
        currentAcademicYearId: defaultAcademicYear.id,
      },
    ],
  });

  console.log("✅ Master Setting seeded successfully!");
};
