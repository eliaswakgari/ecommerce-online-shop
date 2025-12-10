const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const session = require('express-session');
const passport = require('passport');
//const logger = require("./config/logger");
const errorHandler = require("./middleware/errorMiddleware");

// Initialize Passport config
require('./config/passport');

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

const isProd = process.env.NODE_ENV === 'production';

// Increase body size limits to support base64 image payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(bodyParser.json({ limit: "10mb" }));

// Session configuration for Passport
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration (supports local + production frontends)
const defaultFrontend = "http://localhost:5173";
const rawOrigins = (process.env.FRONTEND_URL || defaultFrontend)
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Normalize origins: ensure they include protocol so they match browser Origin
const corsOrigins = rawOrigins.map((origin) => {
  if (origin.startsWith("http://") || origin.startsWith("https://")) {
    return origin;
  }
  if (origin.includes("localhost")) {
    return `http://${origin}`;
  }
  return `https://${origin}`;
});

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);

// Mount ONLY the webhook raw route first (before json/body-parser)
app.use("/api/orders", (req, res, next) => {
  if (req.originalUrl === "/api/orders/webhook") return next(); // let router handle raw
  return express.json()(req, res, next); // JSON for everything else
});

app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
