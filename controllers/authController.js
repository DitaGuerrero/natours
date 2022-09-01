const { promisify } = require('util');
const catchAsync = require('../util/catchAsync');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const AppError = require('../util/AppError');

function signToken(id) {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
}

exports.signUp = catchAsync(async (req, res, _next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: { user: newUser },
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //  1) Check if email and password exist
  if (!email || !password) {
    // 401 Error Code is for incorrect authentication
    return next(new AppError('Email and password are required', 400));
  }

  //  2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user) return next("User don't exist", 401);

  //  correctPassword is available in user, cause user is a document
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  if (!isPasswordCorrect)
    return next(new AppError('Password is not correct', 401));

  //  3) If everything is ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Check if token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1];
  if (!token)
    return next(
      new AppError('You are not logged in. Please login to get access!', 401)
    );

  // 2) Verification token
  const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exist
  const decodedUser = await User.findById(decodedJWT.id);
  if (!decodedUser)
    return next(
      new AppError("The user belonging this token doesn't exist anymore", 401)
    );

  // 4) Check if user changed password after JWT was issued
  if (decodedUser.changedPasswordAfter(decodedJWT.iat))
    return next(
      new AppError(
        'User have recently changed his password. Please login again!',
        401
      )
    );

  // To grant access to protected route
  next();
});
