export class AppError extends Error {
  statusCode;
  errors;

  constructor(message, statusCode, errorObj) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    if (errorObj) {
      this.errors = errorObj;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}
