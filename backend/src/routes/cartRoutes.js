const express = require("express");
const {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/cart - Get user's cart
router.get("/", protect, getCart);

// POST /api/cart - Add item to cart
router.post("/", protect, addItemToCart);

// PUT /api/cart/:id - Update cart item by ID
router.put("/:id", protect, updateCartItem);

// DELETE /api/cart/:id - Remove item from cart
router.delete("/:id", protect, removeCartItem);

// DELETE /api/cart - Clear entire cart
router.delete("/", protect, clearCart);

module.exports = router;
