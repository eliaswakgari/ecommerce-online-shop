const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Get total sales & revenue
// @route   GET /api/analytics/sales
// @access  Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const sales = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalPrice" },
        ordersCount: { $sum: 1 },
      },
    },
  ]);

  res.json(sales[0] || { totalSales: 0, ordersCount: 0 });
});

// @desc    Get top-selling products
// @route   GET /api/analytics/top-products
// @access  Admin
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        totalSold: { $sum: "$orderItems.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        productId: "$product._id",
        name: "$product.name",
        totalSold: 1,
      },
    },
  ]);

  res.json(products);
});

// @desc    Get orders count grouped by date
// @route   GET /api/analytics/orders-by-date
// @access  Admin
const getOrdersByDate = asyncHandler(async (req, res) => {
  const orders = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json(orders);
});

module.exports = {
  getSalesAnalytics,
  getTopProducts,
  getOrdersByDate,
};
