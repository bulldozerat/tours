const User = require('../models/userModel');

exports.signUp = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);

    res.statusCode = 201;
    res.json({
      status: 'suceess',
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
