const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true // can not be accessed or modified with the browser
  };
  if (process.env.node.NODE_ENV === 'production') cookieOptions.serure = true; // can not be accessed or modified with the browser

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.statusCode = statusCode;
  res.json({
    status: 'suceess',
    token,
    data: {
      user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, photo, role } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    photo,
    role
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // password is not returned because of Schema and select('+password') adds it
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const isPasswordCorrect = await user.correctPassword(password, user.password);

  if (!isPasswordCorrect) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Get token and check if its there
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You need to log in to get access', 401));
  }

  // Verify token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists
  const verifiedExistingUser = await User.findById(decoded.id);
  if (!verifiedExistingUser) {
    return next(new AppError('The user for this token does not exist', 401));
  }

  // Check if password changed after thet token was issued
  const isPasswordChanged = await verifiedExistingUser.changedPasswordAfter(
    decoded.iat
  );

  if (isPasswordChanged) {
    return next(
      new AppError('Recenty user changed password. Please log in again', 401)
    );
  }

  req.user = verifiedExistingUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user.role if from protect middleware
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user from posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user with this email ', 404));
  }

  // Generate random reset token and save user data in DB
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}\nIf you didn't forget your password, please ignore this email!`;

  try {
    sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.statusCode = 200;
    res.json({
      status: 'suceess',
      message: 'Token send to email'
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(err, 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  });

  // If token has not expired, and there is user set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expared', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  user.password = req.body.passwordConfirm;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});
