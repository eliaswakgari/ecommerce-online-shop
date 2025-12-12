const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
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
const getUsersCount = asyncHandler(async (req, res) => {
  const count = await User.countDocuments();
  res.json({ count });
});

// @desc    Get detailed products analytics
// @route   GET /api/analytics/products/detailed
// @access  Admin
const getDetailedProductsAnalytics = asyncHandler(async (req, res) => {
  const { period = 'all' } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'today':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      };
      break;
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekStart } };
      break;
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: monthStart } };
      break;
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      dateFilter = { createdAt: { $gte: yearStart } };
      break;
  }
  
  const products = await Product.find(dateFilter)
    .sort({ createdAt: -1 })
    .populate('category', 'name')
    .select('name category price stock createdAt images');
  
  // Get product sales data
  const productSales = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        totalSold: { $sum: "$orderItems.quantity" },
        totalRevenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } }
      }
    }
  ]);
  
  // Create sales map for quick lookup
  const salesMap = {};
  productSales.forEach(sale => {
    salesMap[sale._id.toString()] = {
      totalSold: sale.totalSold,
      totalRevenue: sale.totalRevenue
    };
  });
  
  // Combine product data with sales data
  const enrichedProducts = products.map(product => ({
    _id: product._id,
    name: product.name,
    category: product.category?.name || 'Uncategorized',
    price: product.price,
    stock: product.stock,
    createdAt: product.createdAt,
    image: product.images?.[0]?.url || null,
    totalSold: salesMap[product._id.toString()]?.totalSold || 0,
    totalRevenue: salesMap[product._id.toString()]?.totalRevenue || 0
  }));
  
  res.json(enrichedProducts);
});

// @desc    Get detailed orders analytics
// @route   GET /api/analytics/orders/detailed
// @access  Admin
const getDetailedOrdersAnalytics = asyncHandler(async (req, res) => {
  const { period = 'all' } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'today':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      };
      break;
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekStart } };
      break;
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: monthStart } };
      break;
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      dateFilter = { createdAt: { $gte: yearStart } };
      break;
  }
  
  const orders = await Order.find(dateFilter)
    .populate('user', 'name email')
    .populate({
      path: 'orderItems.product',
      select: 'name images price'
    })
    .sort({ createdAt: -1 })
    .select('orderItems totalPrice itemsPrice shippingPrice taxPrice isPaid isDelivered status createdAt user shippingAddress paymentMethod paymentResult paidAt deliveredAt');
  
  const enrichedOrders = orders.map(order => ({
    _id: order._id,
    customerName: order.user?.name || 'Guest',
    customerEmail: order.user?.email || 'N/A',
    totalPrice: order.totalPrice,
    itemsPrice: order.itemsPrice,
    shippingPrice: order.shippingPrice,
    taxPrice: order.taxPrice,
    isPaid: order.isPaid,
    isDelivered: order.isDelivered,
    status: order.status,
    itemsCount: order.orderItems?.length || 0,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    deliveredAt: order.deliveredAt,
    shippingCity: order.shippingAddress?.city || 'N/A',
    shippingAddress: order.shippingAddress ? 
      `${order.shippingAddress.address || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.country || ''}`.replace(/, ,/g, ',').replace(/^,|,$/g, '') : 
      'Address not provided',
    paymentMethod: order.paymentMethod || 'Not specified',
    paymentResult: order.paymentResult,
    orderItems: order.orderItems?.map(item => ({
      name: item.product?.name || item.name || 'Unknown Product',
      image: item.product?.images?.[0]?.url || item.image || null,
      quantity: item.quantity,
      price: item.price
    })) || []
  }));
  
  res.json(enrichedOrders);
});

// @desc    Get detailed sales analytics
// @route   GET /api/analytics/sales/detailed
// @access  Admin
const getDetailedSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = 'all' } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'today':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      };
      break;
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekStart } };
      break;
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: monthStart } };
      break;
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      dateFilter = { createdAt: { $gte: yearStart } };
      break;
  }
  
  // Daily sales aggregation
  const dailySales = await Order.aggregate([
    { $match: { isPaid: true, ...dateFilter } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalRevenue: { $sum: "$totalPrice" },
        ordersCount: { $sum: 1 },
        avgOrderValue: { $avg: "$totalPrice" }
      }
    },
    { $sort: { _id: -1 } }
  ]);
  
  // Category-wise sales
  const categorySales = await Order.aggregate([
    { $match: { isPaid: true, ...dateFilter } },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "categories",
        localField: "product.category",
        foreignField: "_id",
        as: "category"
      }
    },
    {
      $group: {
        _id: {
          category: { $ifNull: [{ $arrayElemAt: ["$category.name", 0] }, "Uncategorized"] }
        },
        totalRevenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } },
        totalSold: { $sum: "$orderItems.quantity" },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);
  
  res.json({
    dailySales,
    categorySales
  });
});

// @desc    Get total products
// @route   GET /api/analytics/products/count
// @access  Admin
const getProductsCount = asyncHandler(async (req, res) => {
  const count = await Product.countDocuments();
  res.json({ count });
});

// @desc    Get total orders
// @route   GET /api/analytics/orders/count
// @access  Admin
const getOrdersCount = asyncHandler(async (req, res) => {
  const count = await Order.countDocuments();
  res.json({ count });
});
module.exports = {
  getSalesAnalytics,
  getTopProducts,
  getOrdersByDate,
  getUsersCount,
  getProductsCount,
  getOrdersCount,
  getDetailedProductsAnalytics,
  getDetailedOrdersAnalytics,
  getDetailedSalesAnalytics,
};
