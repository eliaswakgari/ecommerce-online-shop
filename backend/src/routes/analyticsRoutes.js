const express = require("express");
const {
  getSalesAnalytics,
  getTopProducts,
  getOrdersByDate,
} = require("../controllers/analyticsController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/sales", protect, admin, getSalesAnalytics);
router.get("/top-products", protect, admin, getTopProducts);
router.get("/orders-by-date", protect, admin, getOrdersByDate);

module.exports = router;
