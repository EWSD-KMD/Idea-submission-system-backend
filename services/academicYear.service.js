import prisma from "../prisma/prismaClient.js";
import { AppError } from "../utils/appError.js";
import { fetchPaginatedData } from "../utils/db.js";

class AcademicYearService {
  async fetchAllAcademicYear(page, limit) {
    const data = await fetchPaginatedData("academicYear", page, limit);
    return data;
  }

  async createAcademicYear({ year, startDate, closureDate, finalClosureDate }) {
    const newAcademicYear = await prisma.academicYear.create({
      data: {
        year,
        startDate: new Date(startDate),
        closureDate: new Date(closureDate),
        finalClosureDate: new Date(finalClosureDate),
      },
    });
    return newAcademicYear;
  }

  async getAcademicYearById(id) {
    const data = await prisma.academicYear.findUnique({
      where: { id },
    });
    if (!data) {
      throw new AppError("Academic year not found", 404);
    }
    return data;
  }

  async updateAcademicYear(
    id,
    { year, startDate, closureDate, finalClosureDate }
  ) {
    const data = await prisma.academicYear.update({
      where: { id },
      data: { year, startDate, closureDate, finalClosureDate },
    });
    return data;
  }

  async deleteAcademicYear(id) {
    const academicYear = await prisma.academicYear.findUnique({
      where: { id },
    });

    if (!academicYear) {
      throw new AppError("Academic year not found", 404);
    }

    await prisma.academicYear.delete({
      where: { id },
    });
  }
}

export const academicYearService = new AcademicYearService();
