exports.success = (res, data) => {
  res.status(200).json({
    err: 0,
    message: "success",
    data: data,
  });
};

exports.error = (res, errCode, errMsg) => {
  res.status(errCode).json({
    err: errCode,
    message: errMsg,
    data: null,
  });
};
