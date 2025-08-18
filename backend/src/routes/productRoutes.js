const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require("../controllers/productController");
const upload = require("../middleware/uploadMiddleware");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public endpoints for browsing
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only endpoints for managing products
router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
