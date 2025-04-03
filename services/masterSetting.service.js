import prisma from "../prisma/prismaClient.js";

class MasterSettingService {
  async getAllMasterSettingData() {
    const masterSetting = await prisma.masterSetting.findFirst({
      select: {
        id: true,
        currentAcademicYearId: true,
        currentAcademicYear: {
          select: {
            startDate: true,
            closureDate: true,
            finalClosureDate: true,
            year: true,
          },
        },
      },
    });
    return masterSetting;
  }

  async updateMasterSettingData(id, { currentAcademicYearId }) {
    return await prisma.masterSetting.update({
      where: { id },
      data: { currentAcademicYearId },
      select: {
        id: true,
        currentAcademicYearId: true,
        currentAcademicYear: {
          select: {
            startDate: true,
            closureDate: true,
            finalClosureDate: true,
            year: true,
          },
        },
      },
    });
  }
}

export const masterSettingService = new MasterSettingService();
