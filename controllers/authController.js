const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

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

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

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
