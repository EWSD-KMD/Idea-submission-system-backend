const errorHandler = async (error, _req, res, next) => {
  const statusCode = error.statusCode || 500;

  const response = {
    err: statusCode,
    message: error.message,
    data: null,
  };

  if (error.errors) {
    response.errors = error.errors;
  }

  res.status(statusCode).json(response);
  next();
};

export default errorHandler;
