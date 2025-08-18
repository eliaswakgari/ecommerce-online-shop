const express = require("express");
const {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReviewHelpful,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes
router.use(protect); // All routes below this require authentication

router.post("/", createReview);
router.get("/user", getUserReviews);
router.put("/:id/helpful", updateReviewHelpful);
router.delete("/:id", deleteReview);

module.exports = router;
