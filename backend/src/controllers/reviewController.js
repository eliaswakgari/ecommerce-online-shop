const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Product = require("../models/Product");

// @desc    Create or update product review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if user has already reviewed this product
  let review = await Review.findOne({ user: req.user._id, product: productId });

  if (review) {
    // Update existing review
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save();
  } else {
    // Create new review
    review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      title,
      comment
    });
  }

  // Update product rating and review count
  await updateProductRating(productId);

  // Populate user info for response
  await review.populate("user", "name profileImage");

  res.status(201).json(review);
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const reviews = await Review.find({ product: productId })
    .populate("user", "name profileImage")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments({ product: productId });

  res.json({
    reviews,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate("product", "name images price")
    .sort({ createdAt: -1 });

  res.json(reviews);
});

// @desc    Update review helpful status
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const updateReviewHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { helpful } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Check if user has already marked this review as helpful/unhelpful
  const existingIndex = review.helpful.findIndex(h => h.user.toString() === req.user._id.toString());

  if (existingIndex >= 0) {
    // Update existing helpful status
    review.helpful[existingIndex].helpful = helpful;
  } else {
    // Add new helpful status
    review.helpful.push({ user: req.user._id, helpful });
  }

  await review.save();
  res.json(review);
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(401);
    throw new Error("Not authorized to delete this review");
  }

  const productId = review.product;
  await review.remove();

  // Update product rating and review count
  await updateProductRating(productId);

  res.json({ message: "Review removed" });
});

// Helper function to update product rating and review count
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    numReviews: reviews.length
  });
};

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReviewHelpful,
  deleteReview
};
