export const seedMenus = async (prismaTx) => {
  console.log("🌱 Seeding Menus...");

  await prismaTx.menu.createMany({
    data: [
      {
        name: "Admin",
      },
      {
        name: "Role",
      },
      {
        name: "Menu",
      },
      {
        name: "Permission",
      },
      {
        name: "Report",
      },
      {
        name: "ReportChart",
      },
      {
        name: "Idea",
      },
      {
        name: "AcademicYear",
      },
      {
        name: "Department",
      },
      {
        name: "Category",
      },
    ],
  });

  console.log("✅ Menus seeded successfully!");
};
