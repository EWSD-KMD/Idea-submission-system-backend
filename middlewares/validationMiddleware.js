import { AppError } from "../utils/appError.js";

const validate = (validations) => {
  return async (req, res, next) => {
    try {
      for (const validation of validations) {
        const result = await validation.run(req);
        if (!result.isEmpty()) {
          throw new AppError("validation error", 400, result.array());
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validate;
