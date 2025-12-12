const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  console.log("🔐 Auth middleware - Cookies received:", req.cookies);
  console.log("🔐 Auth middleware - Headers:", {
    authorization: req.headers.authorization,
    cookie: req.headers.cookie
  });
  
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
    console.log("✅ Token found in cookies");
  }

  if (!token) {
    console.log("❌ No token found in request");
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔓 Token decoded successfully:", { userId: decoded.id });
    
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      console.log("❌ User not found in database for ID:", decoded.id);
      res.status(401);
      throw new Error("User not found");
    }
    
    console.log("✅ User authenticated:", {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      googleId: req.user.googleId || 'not set',
      hasPassword: !!req.user.password
    });
    
    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error("Admin access required");
  }
};


module.exports = { protect, admin };
