const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name field must be required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email field must be required'],
    unique: [true, 'Email field must be unique'],
    lowercase: true,
    trim: true,
    // Using validator package
    validate: [validator.isEmail, 'Email field is not valid'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Password field is required'],
    select: false,
    minlength: [8, 'Password field must have at least 8 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'PasswordConfirm field is required'],
    select: false,
    validate: {
      validator: function (passwordConfirm) {
        return passwordConfirm === this.password;
      },
      message: 'Confirmation password must be equal to password',
    },
  },
  passwordChangedAt: Date,
});

// This is a document middleware, and it will run before
// the data is saved to the DB
userSchema.pre('save', async function (next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();

  //Hash the password with cost 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the password confirm to don't persisted in the db
  this.passwordConfirm = undefined;
  next();
});

// Instant method: Method that is going to be available
// in every document of this collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // user changed his password after this JWT was created
    return JWTTimestamp < changedTimestamp;
  }
  // User haven't changed its password
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
