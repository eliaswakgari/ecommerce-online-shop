const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logoutUser);

module.exports = router;
