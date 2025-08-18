const express = require("express");
const {
  placeOrder,
  stripeWebhook,
  getOrders,
  getUserOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, placeOrder);
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);
router.get("/", protect, admin, getOrders);
router.get("/user", protect, getUserOrders);
router.put("/:id", protect, admin, updateOrderStatus);

module.exports = router;
