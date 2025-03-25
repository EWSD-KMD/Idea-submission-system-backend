import { body, header, param } from "express-validator";

import validate from "../middlewares/validationMiddleware.js";

const isValidIsoString = (value) => {
  try {
    const date = new Date(value);
    return date?.toISOString() === value;
  } catch {
    return false;
  }
};

export const validateIdInParams = validate([
  param("id").isNumeric().withMessage("Must be a valid number"),
]);

export const validateAcademicYear = validate([
  body("year").isNumeric().withMessage("Must be a valid number"),
  body("startDate")
    .custom(isValidIsoString)
    .withMessage("Must be iso date string"),
  body("closureDate")
    .custom(isValidIsoString)
    .withMessage("Must be iso date string"),
  body("finalClosureDate")
    .custom(isValidIsoString)
    .withMessage("Must be iso date string"),
]);

export const validateAcademicYearUpdate = validate([
  param("id").isNumeric().withMessage("Must be a valid number"),
  body("year").isNumeric().withMessage("Must be a valid number"),
  body("startDate")
    .custom(isValidIsoString)
    .withMessage("Must be iso date string"),
  body("closureDate")
    .custom(isValidIsoString)
    .withMessage("Must be iso date string"),
  body("finalClosureDate")
    .custom(isValidIsoString)
    .withMessage("Must be iso date string"),
]);

export const validateForgotPassword = validate([
  body("email").isEmail().withMessage("Must be email addr"),
]);

export const validateResetPassword = validate([
  header("x-temp-token")
    .notEmpty()
    .withMessage("x-temp-token header is required"),
  body("newPassword").notEmpty().withMessage("New password must be provide"),
]);

export const validateUpdatePassword = validate([
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password must be provide"),

  body("newPassword").notEmpty().withMessage("New password must be provide"),
]);

export const validateCreateReportIdea = validate([
  body("type").notEmpty().withMessage("type must be provide"),
]);

export const validateDeleteReportIdea = validate([
  param("id").notEmpty().withMessage("id must be provide"),
  param("id").isNumeric().withMessage("id must be number"),
]);
