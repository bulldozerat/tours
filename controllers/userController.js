const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.statusCode = 200;
  res.json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update. Please use /updateMyPassword',
        400
      )
    );
  }

  const newUserData = filterObj(req.body, 'name', 'email');

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true
  });

  res.statusCode = 200;
  res.json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.statusCode = 204;
  res.json({
    status: 'success',
    message: 'User was successfully deleted'
  });
});

exports.getUser = (req, res) => {
  res.statusCode = 500;
  res.json({
    status: 'error',
    message: 'This route is not implemented'
  });
};

exports.createUser = (req, res) => {
  res.statusCode = 500;
  res.json({
    status: 'error',
    message: 'This route is not implemented'
  });
};

exports.updateUser = (req, res) => {
  res.statusCode = 500;
  res.json({
    status: 'error',
    message: 'This route is not implemented'
  });
};

exports.deleteUser = (req, res) => {
  res.statusCode = 500;
  res.json({
    status: 'error',
    message: 'This route is not implemented'
  });
};
