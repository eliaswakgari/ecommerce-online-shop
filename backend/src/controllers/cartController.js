const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { convertCartImageUrls } = require("../utils/imageUtils");

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart) {
    return res.json({ items: [] });
  }
  
  // Convert relative image paths to full URLs for cart items
  const cartWithFullUrls = convertCartImageUrls(req, cart);
  res.json(cartWithFullUrls);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, reviewData } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error("Not enough stock available");
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  const populatedCart = await cart.populate("items.product");

  // If review data is provided, create/update the review
  if (reviewData && reviewData.rating && reviewData.title && reviewData.comment) {
    try {
      const Review = require("../models/Review");
      let review = await Review.findOne({ user: req.user._id, product: productId });

      if (review) {
        // Update existing review
        review.rating = reviewData.rating;
        review.title = reviewData.title;
        review.comment = reviewData.comment;
        await review.save();
      } else {
        // Create new review
        review = await Review.create({
          user: req.user._id,
          product: productId,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment
        });
      }

      // Update product rating and review count
      await updateProductRating(productId);
    } catch (error) {
      console.error("Error creating/updating review:", error);
      // Don't fail the cart operation if review fails
    }
  }

  // Convert relative image paths to full URLs for cart items
  const cartWithFullUrls = convertCartImageUrls(req, populatedCart);
  res.status(201).json(cartWithFullUrls);
});

// Helper function to update product rating and review count
const updateProductRating = async (productId) => {
  const Review = require("../models/Review");
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

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.id(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  const product = await Product.findById(item.product);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error("Not enough stock available");
  }

  item.quantity = quantity;
  await cart.save();

  const populatedCart = await cart.populate("items.product");
  
  // Convert relative image paths to full URLs for cart items
  const cartWithFullUrls = convertCartImageUrls(req, populatedCart);
  res.json(cartWithFullUrls);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.id(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  item.remove();
  await cart.save();

  const populatedCart = await cart.populate("items.product");
  
  // Convert relative image paths to full URLs for cart items
  const cartWithFullUrls = convertCartImageUrls(req, populatedCart);
  res.json(cartWithFullUrls);
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.json({ items: [] });
  }

  cart.items = [];
  await cart.save();

  res.json({ items: [] });
});

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
