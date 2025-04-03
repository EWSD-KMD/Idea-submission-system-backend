import moment from "moment";
import prisma from "../prisma/prismaClient.js";
import { AppError } from "../utils/appError.js";

export const closureDateChecker = async (req, res, next) => {
  try {
    const masterSetting = await prisma.masterSetting.findFirst({
      select: { currentAcademicYear: { select: { closureDate: true } } },
    });
    if (!masterSetting) {
      console.error("master setting not found");
      throw new AppError("Master Setting not found", 500);
    }
    console.log(masterSetting);
    const isAfterClosureDate = moment().isAfter(
      masterSetting.currentAcademicYear.closureDate
    );
    if (isAfterClosureDate) {
      throw new AppError(
        "New ideas posting are not allowed after closure date",
        400
      );
    }
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const finalClosureDateChecker = async (req, res, next) => {
  try {
    const { ideaId } = req.params;
    const idea = await prisma.idea.findUnique({
      where: { id: parseInt(ideaId) },
      select: { academicYear: { select: { finalClosureDate: true } } },
    });
    console.log("idea", idea);

    const isAfterFinalClosureDate = moment().isAfter(
      idea.academicYear.finalClosureDate
    );
    if (isAfterFinalClosureDate) {
      throw new AppError(
        "New comment are not allowed after final closure date",
        400
      );
    }
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};
