const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
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
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//#region Document Middleware
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
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // Set the passwordChangedAt 1s after, cause it use to execute before
  // the token has been really issued
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//#endregion

//#region Query middleware
// (These will execute before a query
// I mean if we are using any function that starts with find
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  // so, we can concat other find query
  this.find({ active: { $ne: false } });
  next();
});
//#endregion

//#region Instant methods
// These are going to be available in every document of this collection
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

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
//#endregion

const User = mongoose.model('User', userSchema);

module.exports = User;
