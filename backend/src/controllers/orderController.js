const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const stripe = require("../config/stripe"); // your stripe instance from require
const sendEmail = require("../utils/sendEmail");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
// @desc    Place order & process payment
// @route   POST /api/orders
// @access  Private
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  // 1) Get user cart
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  // 2) Compute totals & stock check
  let subtotal = 0;
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Product ${item.product.name} is out of stock`);
    }
    subtotal += item.product.price * item.quantity;
  }

  // 3) Apply coupon (optional)
  let discountAmount = 0;
  let coupon;
  if (couponCode) {
    coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      expirationDate: { $gte: new Date() },
    });
    if (!coupon || coupon.usageCount >= coupon.usageLimit) {
      res.status(400);
      throw new Error("Invalid, expired, or usage limit exceeded coupon code");
    }
    discountAmount =
      coupon.discountType === "percentage"
        ? (subtotal * coupon.amount) / 100
        : coupon.amount;
  }

  const shippingPrice = 10;
  const taxPrice = (subtotal - discountAmount) * 0.1;
  const total = Math.max(subtotal - discountAmount, 0) + shippingPrice + taxPrice;

  // 4) Create Order first
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod, // 'stripe'
    taxPrice,
    shippingPrice,
    totalPrice: total,
    isPaid: false,
    isDelivered: false,
    status: "pending",
    // optionally store coupon usage intent here
  });

  // 5) Create PaymentIntent with metadata
  const amountInCents = Math.round(total * 100);
  const idempotencyKey = `pi-${order._id.toString()}-${amountInCents}`;

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: req.user.email, // if you have it on req.user
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    },
    { idempotencyKey }
  );

  // 6) (Optional) Reserve coupon usage only after webhook success to avoid burning it on failures
  // If you insist on incrementing now, do it here:
  if (coupon) {
    await Coupon.updateOne(
      { _id: coupon._id, usageCount: { $lt: coupon.usageLimit } },
      { $inc: { usageCount: 1 } }
    );
  }

  res.json({
    clientSecret: paymentIntent.client_secret,
    orderId: order._id,
  });
});

// @desc    Stripe webhook
// @route   POST /api/orders/webhook
// @access  Public
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    // IMPORTANT: req.body is the raw Buffer (see server.js route order below)
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const { orderId, userId } = pi.metadata || {};

    // Update the exact order
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      console.error("Order not found for metadata:", pi.metadata);
      return res.json({ received: true }); // ack anyway to avoid retries
    }

    // Update order with payment details
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = "processing"; // Changed from "delivered" to "processing"
    order.paymentResult = {
      id: pi.id,
      status: pi.status,
      update_time: new Date().toISOString(),
      email_address: pi.receipt_email || "",
    };

    // Deduct stock from products
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(product.stock - item.quantity, 0);
        await product.save();
      }
    }
    
    await order.save();

    // Clear user cart after successful payment
    await Cart.findOneAndDelete({ user: order.user });

    // Send order confirmation email
    const user = await User.findById(order.user);
    if (user) {
      const orderSummary = order.orderItems.map(item => 
        `${item.product.name} x ${item.quantity} - $${item.price * item.quantity}`
      ).join('\n');

      const emailContent = `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order!</p>
        
        <h2>Order Details:</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        
        <h3>Items Ordered:</h3>
        <ul>
          ${order.orderItems.map(item => 
            `<li>${item.product.name} - Quantity: ${item.quantity} - Price: $${item.price}</li>`
          ).join('')}
        </ul>
        
        <h3>Shipping Address:</h3>
        <p>${order.shippingAddress.address}</p>
        <p>${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
        <p>${order.shippingAddress.country}</p>
        
        <h3>Payment Summary:</h3>
        <p><strong>Subtotal:</strong> $${order.totalPrice - order.shippingPrice - order.taxPrice}</p>
        <p><strong>Shipping:</strong> $${order.shippingPrice}</p>
        <p><strong>Tax:</strong> $${order.taxPrice}</p>
        <p><strong>Total:</strong> $${order.totalPrice}</p>
        
        <p>Your order is being processed and will be shipped soon!</p>
      `;

      await sendEmail({
        to: user.email,
        subject: "Order Confirmation - Thank You!",
        html: emailContent,
      });
    }

    // Send notification to admin
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "New Order Placed",
      html: `
        <h1>New Order Received</h1>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Customer:</strong> ${user?.name || 'Unknown'}</p>
        <p><strong>Total Amount:</strong> $${order.totalPrice}</p>
        <p><strong>Payment Status:</strong> Paid</p>
      `,
    });

    return res.json({ received: true });
  }

  // Always acknowledge other events to prevent retries
  return res.json({ received: true });
});


// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort("-createdAt");
  res.json(orders);
});

// @desc    Get logged in user's order history
// @route   GET /api/orders/user
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("orderItems.product", "name images price")
    .sort("-createdAt");
  res.json(orders);
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Validate status transition
  const validTransitions = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [], // Final state
    cancelled: [] // Final state
  };

  const currentStatus = order.status;
  const allowedTransitions = validTransitions[currentStatus] || [];

  if (!allowedTransitions.includes(status)) {
    res.status(400);
    throw new Error(`Cannot change status from ${currentStatus} to ${status}`);
  }

  // Update order status and related fields
  order.status = status;
  
  // Handle specific status changes
  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  } else if (status === "cancelled") {
    // If order was already paid, we might want to handle refund logic here
    // For now, just update the status
    order.isDelivered = false;
    order.deliveredAt = undefined;
  } else if (status === "shipped") {
    order.isDelivered = false;
    order.deliveredAt = undefined;
  }

  const updatedOrder = await order.save();
  
  // Log the status change for audit purposes
  console.log(`Order ${order._id} status changed from ${currentStatus} to ${status} by admin`);
  
  res.json(updatedOrder);
});

module.exports = {
  placeOrder,
  stripeWebhook,
  // Fallback confirmation when webhooks are not available in dev
  confirmPayment: asyncHandler(async (req, res) => {
    const { paymentIntentId, orderId } = req.body || {};
    if (!paymentIntentId || !orderId) {
      res.status(400);
      throw new Error("paymentIntentId and orderId are required");
    }

    // Retrieve PI from Stripe to verify status server-side
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!pi || pi.status !== "succeeded") {
      res.status(400);
      throw new Error("Payment not successful");
    }

    const metaOrderId = pi.metadata?.orderId;
    if (metaOrderId && metaOrderId !== String(orderId)) {
      res.status(400);
      throw new Error("Payment metadata does not match order");
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // If already processed via webhook, just return
    if (order.isPaid) {
      return res.json({ message: "Already confirmed", order });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = "processing";
    order.paymentResult = {
      id: pi.id,
      status: pi.status,
      update_time: new Date().toISOString(),
      email_address: pi.receipt_email || req.user.email || "",
    };

    // Deduct stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(product.stock - item.quantity, 0);
        await product.save();
      }
    }

    await order.save();

    // Clear user cart
    await Cart.findOneAndDelete({ user: order.user });

    // Basic notification (keep lightweight here)
    try {
      const user = await User.findById(order.user);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: "Order Confirmation",
          html: `<p>Your payment was successful. Order ${order._id} is now processing.</p>`,
        });
      }
    } catch (e) {
      console.warn("Email send failed but order confirmed:", e?.message);
    }

    res.json({ message: "Payment confirmed", order });
  }),
  getOrders,
  getUserOrders,
  updateOrderStatus,
};
