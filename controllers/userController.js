const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

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
