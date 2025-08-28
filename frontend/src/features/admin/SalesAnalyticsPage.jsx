import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDetailedSales } from "./adminSlice.js";
import formatCurrency from "../../utils/formatCurrency.js";
import formatDate from "../../utils/formatDate.js";

export default function SalesAnalyticsPage() {
  const dispatch = useDispatch();
  const { detailedSales, loadingDetailed, errorDetailed } = useSelector(s => s.admin || {});
  
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [viewType, setViewType] = useState('daily'); // 'daily' or 'category'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('_id');
  const [sortOrder, setSortOrder] = useState('desc');

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
    console.log('SalesAnalyticsPage mounted, dispatching fetchDetailedSales');
    dispatch(fetchDetailedSales(selectedPeriod));
  }, [dispatch, selectedPeriod]);

  console.log('SalesAnalyticsPage render:', { detailedSales, loadingDetailed, errorDetailed });

  const { dailySales = [], categorySales = [] } = detailedSales || {};

  // Sort data based on current sort settings
  const sortedDailySales = [...dailySales].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === '_id') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const sortedCategorySales = [...categorySales].sort((a, b) => {
    let aValue = a[sortBy === '_id' ? 'totalRevenue' : sortBy];
    let bValue = b[sortBy === '_id' ? 'totalRevenue' : sortBy];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get current data based on view type
  const currentData = viewType === 'daily' ? sortedDailySales : sortedCategorySales;
  
  // Pagination calculations
  const totalItems = currentData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = currentData.slice(startIndex, endIndex);

  // Calculate summary stats
  const dailyStats = {
    totalRevenue: dailySales.reduce((sum, d) => sum + d.totalRevenue, 0),
    totalOrders: dailySales.reduce((sum, d) => sum + d.ordersCount, 0),
    avgDailyRevenue: dailySales.length > 0 
      ? dailySales.reduce((sum, d) => sum + d.totalRevenue, 0) / dailySales.length 
      : 0,
    bestDay: dailySales.reduce((best, current) => 
      current.totalRevenue > (best?.totalRevenue || 0) ? current : best, {}),
  };

  const categoryStats = {
    totalCategories: categorySales.length,
    topCategory: categorySales[0] || {},
    totalProductsSold: categorySales.reduce((sum, c) => sum + c.totalSold, 0),
    avgCategoryRevenue: categorySales.length > 0 
      ? categorySales.reduce((sum, c) => sum + c.totalRevenue, 0) / categorySales.length 
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

  const handleViewTypeChange = (newViewType) => {
    setViewType(newViewType);
    setCurrentPage(1); // Reset to first page
    setSortBy(newViewType === 'daily' ? '_id' : 'totalRevenue');
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
          Sales Analytics
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

      {/* View Type Selector and Summary Stats */}
      <motion.div 
        className="space-y-4"
        variants={itemVariants}
      >
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            onClick={() => handleViewTypeChange('daily')}
            className={`px-4 py-2 rounded-md transition-all duration-200 ${
              viewType === 'daily' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Daily Sales
          </motion.button>
          <motion.button
            onClick={() => handleViewTypeChange('category')}
            className={`px-4 py-2 rounded-md transition-all duration-200 ${
              viewType === 'category' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Category Sales
          </motion.button>
        </motion.div>

        {/* Summary Stats based on view type */}
        <AnimatePresence mode="wait">
          {viewType === 'daily' ? (
            <motion.div 
              key="daily-stats"
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {[
                { title: "Total Revenue", value: formatCurrency(dailyStats.totalRevenue), color: "bg-green-50 border-green-200", textColor: "text-green-600", valueColor: "text-green-900" },
                { title: "Total Orders", value: dailyStats.totalOrders, color: "bg-blue-50 border-blue-200", textColor: "text-blue-600", valueColor: "text-blue-900" },
                { title: "Avg Daily Revenue", value: formatCurrency(dailyStats.avgDailyRevenue), color: "bg-purple-50 border-purple-200", textColor: "text-purple-600", valueColor: "text-purple-900" },
                { title: "Best Day", value: dailyStats.bestDay._id ? formatDate(dailyStats.bestDay._id) : 'N/A', subtitle: dailyStats.bestDay.totalRevenue ? formatCurrency(dailyStats.bestDay.totalRevenue) : '', color: "bg-yellow-50 border-yellow-200", textColor: "text-yellow-600", valueColor: "text-yellow-900", subtitleColor: "text-yellow-700" }
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
                  {stat.subtitle && (
                    <div className={`text-sm ${stat.subtitleColor}`}>
                      {stat.subtitle}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="category-stats"
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {[
                { title: "Total Categories", value: categoryStats.totalCategories, color: "bg-indigo-50 border-indigo-200", textColor: "text-indigo-600", valueColor: "text-indigo-900" },
                { title: "Top Category", value: categoryStats.topCategory._id?.category || 'N/A', subtitle: categoryStats.topCategory.totalRevenue ? formatCurrency(categoryStats.topCategory.totalRevenue) : '', color: "bg-green-50 border-green-200", textColor: "text-green-600", valueColor: "text-green-900", subtitleColor: "text-green-700" },
                { title: "Products Sold", value: categoryStats.totalProductsSold, color: "bg-blue-50 border-blue-200", textColor: "text-blue-600", valueColor: "text-blue-900" },
                { title: "Avg Category Revenue", value: formatCurrency(categoryStats.avgCategoryRevenue), color: "bg-purple-50 border-purple-200", textColor: "text-purple-600", valueColor: "text-purple-900" }
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
                    className={`text-lg font-bold ${stat.valueColor}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.div>
                  {stat.subtitle && (
                    <div className={`text-sm ${stat.subtitleColor}`}>
                      {stat.subtitle}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pagination Controls */}
      <motion.div 
        className="bg-white border rounded-lg p-4 glass-effect"
        variants={itemVariants}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <motion.div 
            className="text-lg font-medium text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {viewType === 'daily' ? 'Daily Sales Report' : 'Sales by Category'} ({totalItems} items)
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
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
        {loadingDetailed?.sales && (
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
              Loading sales analytics...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {errorDetailed?.sales && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            Error: {errorDetailed.sales}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sales Table */}
      <AnimatePresence>
        {!loadingDetailed?.sales && !errorDetailed?.sales && (
          <motion.div 
            className="bg-white border rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
          <div className="overflow-x-auto">
            {viewType === 'daily' ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('_id')}
                    >
                      Date {getSortIcon('_id')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalRevenue')}
                    >
                      Revenue {getSortIcon('totalRevenue')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('ordersCount')}
                    >
                      Orders {getSortIcon('ordersCount')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('avgOrderValue')}
                    >
                      Avg Order Value {getSortIcon('avgOrderValue')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {currentItems.map((day, index) => (
                      <motion.tr 
                        key={day._id} 
                        className="hover:bg-gray-50 transition-colors duration-200"
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                      >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(day._id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(day.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.ordersCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(day.avgOrderValue)}
                      </td>
                    </motion.tr>
                  ))}
                  </AnimatePresence>
                </tbody>
              </table>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalRevenue')}
                    >
                      Revenue {getSortIcon('totalRevenue')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalSold')}
                    >
                      Units Sold {getSortIcon('totalSold')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('ordersCount')}
                    >
                      Orders {getSortIcon('ordersCount')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Revenue per Order
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {currentItems.map((category, index) => (
                      <motion.tr 
                        key={index} 
                        className="hover:bg-gray-50 transition-colors duration-200"
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                      >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                          {category._id?.category || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(category.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.totalSold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.ordersCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(category.totalRevenue / category.ordersCount)}
                      </td>
                    </motion.tr>
                  ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && renderPaginationControls()}
          
          {currentData.length === 0 && (
            <motion.div 
              className="text-center py-8 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              No {viewType} sales data available for the selected period.
            </motion.div>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}