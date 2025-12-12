const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const isProd = process.env.NODE_ENV === "production";
const rawFrontendUrl = process.env.FRONTEND_URL;

function getFrontendUrl() {
  let url = rawFrontendUrl || (isProd ? "" : "http://localhost:5173");

  if (!url) {
    return "http://localhost:5173";
  }

  if (!/^https?:\/\//i.test(url)) {
    if (url.includes("localhost")) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  return url.replace(/\/+$/, "");
}
const authCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 3600 * 1000,
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password });
  if (user) {
    // Generate token & set HttpOnly cookie
    const token = generateToken(user);
    res.cookie("token", token, authCookieOptions);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      profileImagePublicId: user.profileImagePublicId,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user);
    res.cookie("token", token, authCookieOptions);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      profileImagePublicId: user.profileImagePublicId,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // Clear JWT auth cookie
  res.cookie("token", "", { ...authCookieOptions, expires: new Date(0) });

  // Log out from Passport (if session-based auth is active)
  if (typeof req.logout === 'function') {
    // Passport v0.6+ requires a callback
    await new Promise((resolve) => {
      req.logout(() => resolve());
    });
  }

  // Destroy Express session
  if (req.session) {
    await new Promise((resolve) => {
      req.session.destroy(() => resolve());
    });
  }

  res.json({ message: "Logged out successfully" });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      profileImagePublicId: user.profileImagePublicId,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.profileImage) {
      user.profileImage = req.body.profileImage;
    }
    if (req.body.profileImagePublicId) {
      user.profileImagePublicId = req.body.profileImagePublicId;
    }
    
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      profileImagePublicId: updatedUser.profileImagePublicId,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Verify current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated successfully" });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset url - point to frontend reset page
  const resetUrl = `${getFrontendUrl()}/reset-password/${resetToken}`;

  const message = `
    You are receiving this email because you (or someone else) has requested the reset of a password.
    Please click on the following link to reset your password: \n\n ${resetUrl}
    \n\n If you did not request this, please ignore this email and your password will remain unchanged.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
      resetUrl, // Pass resetUrl for HTML template
    });

    res.json({ message: 'Email sent' });
  } catch (error) {
    console.error('Email sending error:', error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid reset token');
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
});

// @desc    Google OAuth success callback
// @route   GET /api/auth/google/success
// @access  Public
const googleAuthSuccess = asyncHandler(async (req, res) => {
  if (req.user) {
    console.log('🔐 Google OAuth Success - User:', {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      googleId: req.user.googleId
    });

    // Generate token & set HttpOnly cookie
    const token = generateToken(req.user);
    res.cookie("token", token, authCookieOptions);

    // Redirect based on user role to appropriate dashboard
    if (req.user.role === 'admin') {
      console.log('🚀 Redirecting admin to admin dashboard');
      res.redirect(`${getFrontendUrl()}/admin?auth=success`);
    } else {
      console.log('🚀 Redirecting customer to home page');
      res.redirect(`${getFrontendUrl()}/?auth=success`);
    }
  } else {
    console.log('❌ Google OAuth failed - no user found');
    res.redirect(`${getFrontendUrl()}/login?error=auth_failed`);
  }
});

// @desc    Google OAuth failure callback
// @route   GET /api/auth/google/failure
// @access  Public
const googleAuthFailure = asyncHandler(async (req, res) => {
  res.redirect(`${getFrontendUrl()}/login?error=auth_failed`);
});

// @desc    Debug Google OAuth configuration
// @route   GET /api/auth/google/debug
// @access  Public
const googleAuthDebug = asyncHandler(async (req, res) => {
  res.json({
    message: 'Google OAuth Debug Info',
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    clientID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set',
    frontendURL: getFrontendUrl(),
    backendURL: process.env.BACKEND_URL,
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  googleAuthSuccess,
  googleAuthFailure,
  googleAuthDebug,
};
