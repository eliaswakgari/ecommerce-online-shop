const express = require("express");
const passport = require('passport');
const {
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
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failure' }),
  googleAuthSuccess
);

router.get('/google/success', googleAuthSuccess);
router.get('/google/failure', googleAuthFailure);
router.get('/google/debug', googleAuthDebug); // Debug route

router.get("/profile", protect, getUserProfile);
router.get("/debug", protect, (req, res) => {
  res.json({
    message: 'User authenticated successfully',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      googleId: req.user.googleId || 'not set',
      hasPassword: !!req.user.password,
      createdAt: req.user.createdAt
    },
    cookies: req.cookies,
    headers: {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie
    }
  });
});
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logoutUser);

module.exports = router;
