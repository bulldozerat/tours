const mongoose = require('mongoose');
const validator = require('validator');
const bycript = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plese tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now()
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    minlength: 8,
    validate: {
      // This only works on SAVE!!!
      validator: function(el) {
        return el === this.password;
      }
    },
    message: 'Passwords are not the same',
    select: false
  }
});

userSchema.pre('save', async function(next) {
  // Run only if password was modified
  if (!this.isModified('password')) return next();

  // Hash password with cost 12
  this.password = await bycript.hash(this.password, 12);
  // Delete passwordConfirm cause we dont need it in DB (also not hased)
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // this.password is not available because select: false, thats why we pass it in the func
  return await bycript.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtTimestamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
