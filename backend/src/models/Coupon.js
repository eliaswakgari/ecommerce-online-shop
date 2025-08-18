const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  amount: { type: Number, required: true },
  expirationDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 0 },
  usageCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
