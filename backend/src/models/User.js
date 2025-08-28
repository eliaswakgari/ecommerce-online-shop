const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // Made optional for Google OAuth users
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  profileImage: { type: String, default: "" },
  profileImagePublicId: { type: String, default: "" },
  googleId: { type: String }, // For Google OAuth
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Password hash middleware
userSchema.pre("save", async function(next) {
  // Skip password hashing if password is not provided (OAuth users) or not modified
  if (!this.password || !this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password match method
userSchema.methods.matchPassword = async function(enteredPassword) {
  // Return false if no password is set (OAuth users)
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
