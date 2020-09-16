const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
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

  const token = signToken(newUser._id);

  res.statusCode = 201;
  res.json({
    status: 'suceess',
    token,
    data: {
      user: newUser
    }
  });
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

  const token = signToken(user._id);

  res.statusCode = 200;
  res.json({
    status: 'suceess',
    token
  });
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
