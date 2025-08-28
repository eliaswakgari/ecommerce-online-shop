const express = require("express");
const {
  getSalesAnalytics,
  getTopProducts,
  getOrdersByDate,
  getUsersCount,
  getProductsCount,
  getOrdersCount,
  getDetailedProductsAnalytics,
  getDetailedOrdersAnalytics,
  getDetailedSalesAnalytics,
} = require("../controllers/analyticsController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/sales", protect, admin, getSalesAnalytics);
router.get("/top-products", protect, admin, getTopProducts);
router.get("/orders-by-date", protect, admin, getOrdersByDate);
router.get("/users/count", protect, admin, getUsersCount);
router.get("/products/count", protect, admin, getProductsCount);
router.get("/orders/count", protect, admin, getOrdersCount);
router.get("/products/detailed", protect, admin, getDetailedProductsAnalytics);
router.get("/orders/detailed", protect, admin, getDetailedOrdersAnalytics);
router.get("/sales/detailed", protect, admin, getDetailedSalesAnalytics);

module.exports = router;
