const AppError = require('../util/AppError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational error are trusted
  if (err.isOperational)
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message,
    });

  // Unknown error, so we don't want to leak the details
  // to client
  console.error('ERROR', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

function handleCastErrorDB(err) {
  return new AppError(`Invalid ${err.path} with value ${err.value}`, 400);
}

function handleDuplicatedValue(err) {
  const duplicatedField = Object.keys(err.keyValue)[0];
  const duplicatedValue = Object.values(err.keyValue)[0];
  return new AppError(
    `Duplicated field ${duplicatedField}: ${duplicatedValue}. Please use another one`
  );
}

function handleValidationErrorDB(err) {
  const errorMessages = Object.values(err.errors).join('.');
  // 400 Error Code is for Bad requests
  return new AppError(`Validation error occurred: ${errorMessages}`, 400);
}

module.exports = (err, req, res, _next) => {
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  if (process.env.NODE_ENV === 'production') {
    switch (err.name) {
      case 'CastError':
        const castError = handleCastErrorDB(err);
        sendErrorProd(castError, res);
        break;
      case 'MongoError':
        if (err.code === 11000) {
          console.log('mongo error');
          const duplicateError = handleDuplicatedValue(err);
          sendErrorProd(duplicateError, res);
        }
        break;
      case 'ValidationError':
        const validationError = handleValidationErrorDB(err);
        sendErrorProd(validationError, res);
        break;
      default:
        sendErrorProd(err, res);
        break;
    }
  }
};
