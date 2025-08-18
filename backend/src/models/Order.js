const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderItems: [orderItemSchema],
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: { type: String, required: true },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  },
  taxPrice: { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
