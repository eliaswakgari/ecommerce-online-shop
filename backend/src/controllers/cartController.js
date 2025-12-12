const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { convertCartImageUrls } = require("../utils/imageUtils");

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  try {
    console.log(`📦 Getting cart for user:`, {
      userId: req.user._id,
      userRole: req.user.role,
      userEmail: req.user.email,
      googleId: req.user.googleId || 'not set',
      hasPassword: !!req.user.password
    });
    
    // Validate user object
    if (!req.user || !req.user._id) {
      console.error('❌ Invalid user object in request');
      res.status(401);
      throw new Error('Authentication failed - invalid user');
    }
    
    console.log(`🔍 Searching for cart with user ID: ${req.user._id}`);
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    
    if (!cart) {
      console.log(`📦 No cart found for user ${req.user._id}, returning empty cart`);
      return res.json({ items: [] });
    }

    console.log(`📦 Cart found for user ${req.user._id}:`, {
      cartId: cart._id,
      itemCount: cart.items.length,
      items: cart.items.map(item => ({
        _id: item._id.toString(),
        product: item.product ? item.product._id.toString() : 'null',
        productName: item.product ? item.product.name : 'product missing',
        quantity: item.quantity
      }))
    });

    // Validate cart items have valid products
    const validItems = cart.items.filter(item => item.product != null);
    if (validItems.length !== cart.items.length) {
      console.log(`⚠️  Found ${cart.items.length - validItems.length} items with missing products, filtering them out`);
      cart.items = validItems;
      await cart.save();
    }

    const cartWithFullUrls = convertCartImageUrls(req, cart);
    
    console.log(`🚀 Sending cart response:`, {
      itemCount: cartWithFullUrls.items.length,
      structure: cartWithFullUrls.items[0] ? {
        hasCartItemId: !!cartWithFullUrls.items[0]._id,
        hasProduct: !!cartWithFullUrls.items[0].product,
        productHasId: !!cartWithFullUrls.items[0].product?._id
      } : 'no items'
    });
    
    res.json(cartWithFullUrls);
  } catch (error) {
    console.error('❌ Error in getCart:', {
      error: error.message,
      stack: error.stack,
      user: req.user ? {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        googleId: req.user.googleId
      } : 'no user'
    });
    res.status(500);
    throw new Error(`Failed to get cart: ${error.message}`);
  }
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

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  const populatedCart = await cart.populate("items.product");

  // Handle optional review creation/update
  if (reviewData && reviewData.rating && reviewData.title && reviewData.comment) {
    try {
      const Review = require("../models/Review");
      let review = await Review.findOne({ user: req.user._id, product: productId });

      if (review) {
        review.rating = reviewData.rating;
        review.title = reviewData.title;
        review.comment = reviewData.comment;
        await review.save();
      } else {
        review = await Review.create({
          user: req.user._id,
          product: productId,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
        });
      }

      await updateProductRating(productId);
    } catch (error) {
      console.error("Error creating/updating review:", error);
    }
  }

  const cartWithFullUrls = convertCartImageUrls(req, populatedCart);
  res.status(201).json(cartWithFullUrls);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params; // cart item id (product _id inside cart.items)
  const { quantity } = req.body;

  console.log(`🔄 Update cart item request: itemId=${id}, quantity=${quantity}, userId=${req.user._id}`);

  if (quantity <= 0) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    console.log(`❌ Cart not found for user ${req.user._id}`);
    res.status(404);
    throw new Error("Cart not found");
  }

  console.log(`📦 Current cart items:`, cart.items.map(item => ({
    _id: item._id.toString(),
    product: item.product.toString(),
    quantity: item.quantity
  })));

  const itemIndex = cart.items.findIndex((item) => item._id.toString() === id);
  if (itemIndex === -1) {
    console.log(`❌ Item with ID ${id} not found in cart. Available items:`, cart.items.map(item => item._id.toString()));
    res.status(404);
    throw new Error("Item not found in cart");
  }

  const product = await Product.findById(cart.items[itemIndex].product);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error("Not enough stock available");
  }

  console.log(`✅ Updating item at index ${itemIndex} from quantity ${cart.items[itemIndex].quantity} to ${quantity}`);
  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  const populatedCart = await cart.populate("items.product");

  const cartWithFullUrls = convertCartImageUrls(req, populatedCart);
  console.log(`✅ Cart item updated successfully`);
  res.json(cartWithFullUrls);
});

// @desc    Remove cart item
// @route   DELETE /api/cart/:id
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex((item) => item._id.toString() === id);
  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();
  const populatedCart = await cart.populate("items.product");

  const cartWithFullUrls = convertCartImageUrls(req, populatedCart);
  res.json(cartWithFullUrls);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ items: [] });
});

// Helper: recalc product rating
const updateProductRating = async (productId) => {
  const Review = require("../models/Review");
  const reviews = await Review.find({ product: productId });

  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
  } else {
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: reviews.length,
    });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
