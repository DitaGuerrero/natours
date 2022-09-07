//Users Route Handlers
const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
function filterObj(object, ...allowedFields) {
  let filteredObject = {};
  Object.entries(object).map(([key, value]) => {
    if (!allowedFields.includes(key)) return;
    filteredObject[key] = value;
  });
  return filteredObject;
}

const AppError = require('../util/AppError');

exports.getAllUsers = catchAsync(async (req, res, _next) => {
  const users = await User.find();

  // Send the response
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //  1) Create error if user post password data
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('This route is not for update passwords', 400));

  //  2) Update user data
  const filteredBody = filterObj(req.body, 'email', 'name');
  // To get the updatedUser, set new to true in options obj
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, _next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
