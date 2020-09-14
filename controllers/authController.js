const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signUp = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, photo } = req.body;
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      photo
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
  } catch (e) {
    res.statusCode = 400;
    res.json({
      status: 'fail',
      message: e
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // password is not returned because of Schema and select('+password') adds it
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const isPasswordCorrect = await user.correctPassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user._id);

    res.statusCode = 200;
    res.json({
      status: 'suceess',
      token
    });
  } catch (e) {
    res.statusCode = 400;
    res.json({
      status: 'fail',
      message: e
    });
  }
};
