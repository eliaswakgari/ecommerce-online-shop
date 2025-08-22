const express = require("express");
const cookieParser =require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
//const logger = require("./config/logger");
const errorHandler = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// Increase body size limits to support base64 image payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json({ limit: "10mb" }));
// CORS configuration (adjust origins as needed)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
