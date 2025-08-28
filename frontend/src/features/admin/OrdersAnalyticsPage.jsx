import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDetailedOrders } from "./adminSlice.js";
import formatCurrency from "../../utils/formatCurrency.js";
import formatDate from "../../utils/formatDate.js";

export default function OrdersAnalyticsPage() {
  const dispatch = useDispatch();
  const { detailedOrders, loadingDetailed, errorDetailed } = useSelector(s => s.admin || {});
  
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const tableRowVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  useEffect(() => {
    console.log('OrdersAnalyticsPage mounted, dispatching fetchDetailedOrders');
    dispatch(fetchDetailedOrders(selectedPeriod));
  }, [dispatch, selectedPeriod]);

  // Filter and sort orders
  const filteredOrders = (detailedOrders || [])
    .filter(order => {
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'paid' && order.isPaid) ||
        (statusFilter === 'unpaid' && !order.isPaid) ||
        (statusFilter === 'delivered' && order.isDelivered) ||
        (statusFilter === 'pending' && !order.isDelivered);
      
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination calculations
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredOrders.slice(startIndex, endIndex);

  // Calculate summary stats
  const stats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0),
    paidOrders: filteredOrders.filter(o => o.isPaid).length,
    deliveredOrders: filteredOrders.filter(o => o.isDelivered).length,
    pendingOrders: filteredOrders.filter(o => !o.isDelivered).length,
    avgOrderValue: filteredOrders.length > 0 
      ? filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0) / filteredOrders.length 
      : 0,
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const getStatusBadge = (order) => {
    if (order.isDelivered) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">✓ Delivered</span>;
    }
    if (order.isPaid) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Processing</span>;
    }
    return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
  };

  const getPaymentBadge = (isPaid) => {
    return isPaid ? (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">✓ Completed</span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Pending</span>
    );
  };

  const toggleOrderDetails = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const OrderDetailsRow = ({ order }) => {
    return (
      <motion.tr
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-50"
      >
        <td colSpan="8" className="px-6 py-4">
          <motion.div 
            className="bg-white rounded-lg p-6 shadow-sm border"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Details Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Order Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono text-gray-900">#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="text-gray-900">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span>{getStatusBadge(order)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span>{getPaymentBadge(order.isPaid)}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="pt-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Shipping Address</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{order.customerName}</div>
                    <div>{order.shippingAddress || 'Address not provided'}</div>
                    <div>{order.shippingCity || 'City not provided'}</div>
                  </div>
                </div>
              </div>

              {/* Order Items & Payment Summary */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Order Items</h4>
                <div className="space-y-2">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item, index) => (
                      <motion.div 
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-md"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(item.price)} each</div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">No order items available</div>
                  )}
                </div>

                {/* Payment Summary */}
                <div className="pt-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Payment Summary</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">{formatCurrency(order.itemsPrice || order.totalPrice * 0.9)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-900">{formatCurrency(order.shippingPrice || 10)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">{formatCurrency(order.taxPrice || order.totalPrice * 0.1)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">{formatCurrency(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                {order.paymentMethod && (
                  <div className="pt-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Payment Information</h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="text-gray-900">{order.paymentMethod}</span>
                      </div>
                      {order.paymentResult && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-mono text-gray-900 text-xs">{order.paymentResult.id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </td>
      </motion.tr>
    );
  };

  const renderPaginationControls = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 text-sm border rounded ${
                currentPage === number 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  console.log('OrdersAnalyticsPage render:', { detailedOrders, loadingDetailed, errorDetailed });

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <motion.h1 
          className="text-2xl font-semibold text-gray-900"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Orders Analytics
        </motion.h1>
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <motion.select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            whileFocus={{ scale: 1.02 }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </motion.select>
        </motion.div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-6 gap-4"
        variants={itemVariants}
      >
        {[
          { title: "Total Orders", value: stats.totalOrders, color: "bg-blue-50 border-blue-200", textColor: "text-blue-600", valueColor: "text-blue-900" },
          { title: "Total Revenue", value: formatCurrency(stats.totalRevenue), color: "bg-green-50 border-green-200", textColor: "text-green-600", valueColor: "text-green-900" },
          { title: "Paid Orders", value: stats.paidOrders, color: "bg-purple-50 border-purple-200", textColor: "text-purple-600", valueColor: "text-purple-900" },
          { title: "Delivered", value: stats.deliveredOrders, color: "bg-yellow-50 border-yellow-200", textColor: "text-yellow-600", valueColor: "text-yellow-900" },
          { title: "Pending", value: stats.pendingOrders, color: "bg-red-50 border-red-200", textColor: "text-red-600", valueColor: "text-red-900" },
          { title: "Avg Order Value", value: formatCurrency(stats.avgOrderValue), color: "bg-indigo-50 border-indigo-200", textColor: "text-indigo-600", valueColor: "text-indigo-900" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            className={`${stat.color} border rounded-lg p-4 hover-lift`}
            variants={cardVariants}
            whileHover="hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className={`text-sm ${stat.textColor}`}>{stat.title}</div>
            <motion.div 
              className={`text-2xl font-bold ${stat.valueColor}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
            >
              {stat.value}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Pagination Controls */}
      <motion.div 
        className="bg-white border rounded-lg p-4 glass-effect"
        variants={itemVariants}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Orders</label>
              <motion.input
                type="text"
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                placeholder="Search by customer, email, or order ID..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <motion.select
                value={statusFilter}
                onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                whileFocus={{ scale: 1.02 }}
              >
                <option value="all">All Orders</option>
                <option value="paid">Paid Orders</option>
                <option value="unpaid">Unpaid Orders</option>
                <option value="delivered">Delivered Orders</option>
                <option value="pending">Pending Delivery</option>
              </motion.select>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
            <div className="flex gap-2">
              {[5, 10, 20, 50].map((size, index) => (
                <motion.button
                  key={size}
                  onClick={() => handleItemsPerPageChange(size)}
                  className={`px-3 py-2 text-sm border rounded transition-all duration-200 ${
                    itemsPerPage === size 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'hover:bg-gray-50 hover:border-gray-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {loadingDetailed?.orders && (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            ></motion.div>
            <motion.p 
              className="mt-2 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Loading orders analytics...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {errorDetailed?.orders && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            Error: {errorDetailed.orders}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Table */}
      <AnimatePresence>
        {!loadingDetailed?.orders && !errorDetailed?.orders && (
          <motion.div 
            className="bg-white border rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('customerName')}
                  >
                    Customer {getSortIcon('customerName')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalPrice')}
                  >
                    Total {getSortIcon('totalPrice')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('itemsCount')}
                  >
                    Items {getSortIcon('itemsCount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipping City
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    Order Date {getSortIcon('createdAt')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {currentItems.map((order, index) => (
                    <React.Fragment key={order._id}>
                      <motion.tr 
                        className="hover:bg-gray-50 transition-colors duration-200"
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.button
                            onClick={() => toggleOrderDetails(order._id)}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                              expandedOrders.has(order._id)
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.span
                              animate={{ rotate: expandedOrders.has(order._id) ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="mr-1"
                            >
                              ▶
                            </motion.span>
                            {expandedOrders.has(order._id) ? 'Hide' : 'View'} Details
                          </motion.button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order._id.slice(-8).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.totalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.itemsCount} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentBadge(order.isPaid)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.shippingCity || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {expandedOrders.has(order._id) && (
                          <OrderDetailsRow order={order} />
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && renderPaginationControls()}
          
          {filteredOrders.length === 0 && (
            <motion.div 
              className="text-center py-8 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              No orders found matching your filters.
            </motion.div>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}