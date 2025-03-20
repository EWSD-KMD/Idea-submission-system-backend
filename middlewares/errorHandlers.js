const errorHandler = async (error, _req, res, next) => {
  let statusCode = error.statusCode || 500;

  // handle db error for record not found
  if (error.code === "P2025") {
    statusCode = 404;
    error.message = "record not found";
  }

  const response = {
    err: statusCode,
    message: statusCode < 500 ? error.message : "something wrong",
    data: null,
  };

  if (error.errors && statusCode < 500) {
    response.data = error.errors;
  }

  res.status(statusCode).json(response);
  next();
};

export default errorHandler;
