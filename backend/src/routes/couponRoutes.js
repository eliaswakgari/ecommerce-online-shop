const express = require("express");
const { createCoupon, validateCoupon } = require("../controllers/couponController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, admin, createCoupon);
router.get("/:code", validateCoupon);

module.exports = router;
