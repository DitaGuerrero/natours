const AppError = require('./AppError');

module.exports = (func) => {
  return (req, res, next) => {
    func(req, res).catch((reason) => {
      next(new AppError(reason, reason.status));
    });
  };
};
