import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalytics } from "./adminSlice.js";
import SalesChart from "../../components/charts/SalesChart.jsx";
import TopProductsChart from "../../components/charts/TopProductsChart.jsx";
import formatCurrency from "../../utils/formatCurrency.js";
import { Link, Routes, Route } from "react-router-dom";
import ProductManagement from "./ProductManagement.jsx";
import OrderManagement from "./OrderManagement.jsx";
import CouponManagement from "./CouponManagement.jsx";
import AnalyticsPage from "./AnalyticsPage.jsx";
import ProductsAnalyticsPage from "./ProductsAnalyticsPage.jsx";
import OrdersAnalyticsPage from "./OrdersAnalyticsPage.jsx";
import SalesAnalyticsPage from "./SalesAnalyticsPage.jsx";
import axios from "../../api/axiosInstance.js";

/*
  Admin dashboard
  - Uses the Redux `fetchAnalytics` thunk when available
  - Falls back to direct API calls (axios) if thunk returns no data or on error
  - Polls every 30s to keep charts live
*/

function formatNumber(n) {
  if (n === null || n === undefined) return "0";
  const num = Number(n);
  if (Number.isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return String(num);
}

function StatCard({ title, value, icon, color = "bg-blue-500", subtitle }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 bg-white border rounded-lg sm:rounded-xl shadow-sm hover-lift card-responsive">
      <div
        className={`rounded-lg p-2 sm:p-3 ${color} text-white flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs sm:text-sm text-gray-500 font-medium">{title}</div>
        <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">{formatNumber(value)}</div>
        {subtitle && <div className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{subtitle}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const admin = useSelector((s) => s.admin || {});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    sales: adminSales = {},
    ordersByDate: adminOrdersByDate = [],
    topProducts: adminTopProducts = [],
    usersCount: adminUsersCount = 0,
    productsCount: adminProductsCount = 0,
    ordersCount: adminOrdersCount = 0,
    loading: adminLoading = false,
    error: adminError = null,
  } = admin;

  // local fallback state (direct API calls) — useful if thunk failed or returns empty
  const [fallback, setFallback] = useState({
    sales: { totalSales: 0, ordersCount: 0 },
    ordersByDate: [],
    topProducts: [],
    usersCount: 0,
    productsCount: 0,
    ordersCount: 0,
    loading: false,
    error: null,
  });

  const fetchFallback = async () => {
    try {
      setFallback((f) => ({ ...f, loading: true, error: null }));
      const [salesRes, topProductsRes, ordersByDateRes, usersRes, productsRes, ordersRes] = await Promise.all([
        axios.get("/api/analytics/sales").then((r) => r.data).catch(() => ({ totalSales: 0, ordersCount: 0 })),
        axios.get("/api/analytics/top-products").then((r) => r.data).catch(() => []),
        axios.get("/api/analytics/orders-by-date").then((r) => r.data).catch(() => []),
        axios.get("/api/analytics/users/count").then((r) => r.data).catch(() => ({ count: 0 })),
        axios.get("/api/analytics/products/count").then((r) => r.data).catch(() => ({ count: 0 })),
        axios.get("/api/analytics/orders/count").then((r) => r.data).catch(() => ({ count: 0 })),
      ]);

      setFallback({
        sales: salesRes ?? { totalSales: 0, ordersCount: 0 },
        ordersByDate: ordersByDateRes ?? [],
        topProducts: topProductsRes ?? [],
        usersCount: usersRes?.count ?? 0,
        productsCount: productsRes?.count ?? 0,
        ordersCount: ordersRes?.count ?? salesRes?.ordersCount ?? 0,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("fallback analytics fetch failed:", err);
      setFallback((f) => ({ ...f, loading: false, error: err?.message || String(err) }));
    }
  };

  // initial fetch and polling
  useEffect(() => {
    // dispatch thunk (primary)
    dispatch(fetchAnalytics());
    // also run fallback to ensure data shows even if thunk has issues
    fetchFallback();

    const id = setInterval(() => {
      dispatch(fetchAnalytics());
      fetchFallback();
    }, 30_000); // every 30 seconds

    return () => clearInterval(id);
  }, [dispatch]);

  // Choose admin data when available (non-empty), otherwise fallback
  const sales = (adminSales && Object.keys(adminSales).length > 0) ? adminSales : fallback.sales;
  const ordersByDate = (adminOrdersByDate && adminOrdersByDate.length > 0) ? adminOrdersByDate : fallback.ordersByDate;
  const topProducts = (adminTopProducts && adminTopProducts.length > 0) ? adminTopProducts : fallback.topProducts;
  const usersCount = adminUsersCount || fallback.usersCount || 0;
  const productsCount = adminProductsCount || fallback.productsCount || 0;
  const ordersCount = adminOrdersCount || fallback.ordersCount || 0;
  const loading = adminLoading || fallback.loading;
  const error = adminError || fallback.error;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-64 bg-white lg:bg-gray-100 border-r lg:border-0 shadow-xl lg:shadow-none
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 lg:p-4 border-b lg:border-0">
          <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <Link 
            to="/admin" 
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            <span className="text-sm sm:text-base font-medium">Dashboard</span>
          </Link>
          
          <Link 
            to="/admin/products" 
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm sm:text-base font-medium">Product Management</span>
          </Link>
          
          <Link 
            to="/admin/orders" 
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm sm:text-base font-medium">Order Management</span>
          </Link>
          
          <Link 
            to="/admin/coupons" 
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-sm sm:text-base font-medium">Coupon Management</span>
          </Link>
          
          <Link 
            to="/admin/analytics" 
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm sm:text-base font-medium">Analytics Overview</span>
          </Link>
          
          {/* Detailed Analytics Section */}
          <div className="pt-2 border-t border-gray-300">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Detailed Analytics</div>
            <div className="space-y-2">
              <Link 
                to="/admin/analytics/products" 
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors touch-target"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Products Analytics</span>
              </Link>
              
              <Link 
                to="/admin/analytics/orders" 
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors touch-target"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Orders Analytics</span>
              </Link>
              
              <Link 
                to="/admin/analytics/sales" 
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors touch-target"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Sales Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto space-mobile-y">
        <Routes>
          <Route
            index
            element={
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h1 className="text-responsive-3xl font-semibold text-gray-800 hidden lg:block">Admin Dashboard</h1>
                  <div className="text-sm text-gray-500">Welcome back, Admin</div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-700 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                    Error loading analytics: {String(error)}
                  </div>
                )}

                {/* Top stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  <StatCard
                    title="Total Users"
                    value={usersCount}
                    color="bg-indigo-600"
                    subtitle="Active registered customers"
                    icon={<svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                  />

                  <StatCard
                    title="Products"
                    value={productsCount}
                    color="bg-emerald-600"
                    subtitle="Items listed in the catalog"
                    icon={<svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
                  />

                  <StatCard
                    title="Orders"
                    value={ordersCount}
                    color="bg-yellow-600"
                    subtitle="Orders placed overall"
                    icon={<svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v4H3z"/><path d="M21 10v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7"/><path d="M16 14a4 4 0 11-8 0"/></svg>}
                  />
                </div>

                {/* Summary row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white border rounded-lg sm:rounded-xl p-4 sm:p-5 card-responsive">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Total Orders</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatNumber(ordersCount)}</div>
                  </div>
                  <div className="bg-white border rounded-lg sm:rounded-xl p-4 sm:p-5 card-responsive sm:col-span-1 lg:col-span-2">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Total Sales</div>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(sales?.totalSales ?? 0)}</div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white border rounded-lg sm:rounded-xl p-4 sm:p-5 card-responsive">
                    <h2 className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4 font-medium">Orders Over Time</h2>
                    {/* SalesChart expects data with _id and count — pass ordersByDate directly */}
                    <div className="h-48 sm:h-64" style={{ minHeight: 200 }}>
                      <SalesChart data={ordersByDate} />
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg sm:rounded-xl p-4 sm:p-5 card-responsive">
                    <h2 className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4 font-medium">Top Products</h2>
                    <div className="h-48 sm:h-64" style={{ minHeight: 200 }}>
                      <TopProductsChart data={topProducts} />
                    </div>
                  </div>
                </div>
              </div>
            }
          />

          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="coupons" element={<CouponManagement />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="analytics/products" element={<ProductsAnalyticsPage />} />
          <Route path="analytics/orders" element={<OrdersAnalyticsPage />} />
          <Route path="analytics/sales" element={<SalesAnalyticsPage />} />
        </Routes>
        </div>
      </div>
    </div>
  );
}
