const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} ${err.value}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operations, trusted
  if (err.isOperational) {
    res.json({
      status: err.status || 'error',
      message: err.message
    });
    // Programming or other unknown error (don't leak error details)
  } else {
    console.error('ERROR: ', err);

    res.json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  res.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    sendErrorProd(error, res);
  }
};
