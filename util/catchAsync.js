const AppError = require('./AppError');

const catchAsync = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
