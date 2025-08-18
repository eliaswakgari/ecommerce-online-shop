const asyncHandler = require("express-async-handler");
const Coupon = require("../models/Coupon");

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, amount, expirationDate, usageLimit } = req.body;

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    res.status(400);
    throw new Error("Coupon code already exists");
  }

  const coupon = new Coupon({
    code: code.toUpperCase(),
    discountType,
    amount,
    expirationDate,
    usageLimit,
  });

  const createdCoupon = await coupon.save();
  res.status(201).json(createdCoupon);
});

// @desc    Validate coupon
// @route   GET /api/coupons/:code
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  if (coupon.expirationDate < new Date()) {
    res.status(400);
    throw new Error("Coupon expired");
  }

  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error("Coupon usage limit exceeded");
  }

  res.json(coupon);
});


module.exports = { createCoupon, validateCoupon };
