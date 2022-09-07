const { promisify } = require('util');
const catchAsync = require('../util/catchAsync');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const AppError = require('../util/AppError');
const { sendEmail } = require('../util/email');
const crypto = require('crypto');

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

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  if (statusCode === 201)
    res.status(statusCode).json({
      status: 'success',
      token,
      data: { user },
    });
  res.status(statusCode).json({
    status: 'success',
    token,
  });
};

exports.signUp = catchAsync(async (req, res, _next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createAndSendToken(newUser, 201, res);
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
  createAndSendToken(user, 200, res);
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
  // We can add new data to the request object in order
  // to save a value that we might need in other middleware
  req.user = decodedUser;
  next();
});

exports.restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    // roles = [ 'admin', 'lead-guide' ]
    if (!roles.includes(req.user.role))
      // Status 403 Forbidden Resource
      return next(new AppError('User has not access to this resource', 403));
    next();
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //  1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('User not found', 404));

  //  2) Generate a random reset token
  const resetToken = user.createPasswordResetToken();
  // This option is to avoid run the validators
  await user.save({ validateBeforeSave: false });

  //  3) Send it to users email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Follow this link ${resetURL} to reset your password. If you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset password',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('Forgot password email not send. Try again!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken });
  if (!user) return next(new AppError('User not found', 404));

  //2) Check if token has expired
  const currentTime = Date.now();
  if (user.passwordResetExpires < currentTime)
    return next(
      new AppError(
        'Token has expired. Please re-send the reset password email',
        500
      )
    );

  //3) Update password and changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // We must use user.save() in order to run the pre-middleware
  // that encrypt the password and verify the passwordConfirm
  // It won't work with update
  await user.save();

  //4) Log the user in, send JWT
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //  1) Get user from collection. It must be done like this
  //  because we specified in the schema that the password
  //  is not selectable by default
  const user = await User.findOne(req.user._id).select('+password');
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;

  //  2) Check if posted current password is correct
  const isPasswordCorrect = await user.correctPassword(
    oldPassword,
    user.password
  );
  if (!isPasswordCorrect)
    return next(new AppError('Password is not correct', 401));

  //  3) If so, update password;
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  // It will run the pre middleware that change passwordChangedAt automatically
  await user.save();

  //  4) Log the user in, send JWT
  createAndSendToken(user, 200, res);
});
