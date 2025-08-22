import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalytics } from "./adminSlice.js";
import SalesChart from "../../components/charts/SalesChart.jsx";
import TopProductsChart from "../../components/charts/TopProductsChart.jsx";
import formatCurrency from "../../utils/formatCurrency.js";
import { Link, Routes, Route } from "react-router-dom";
import ProductManagement from "./ProductManagement.jsx";
import OrderManagement from "./OrderManagement.jsx";

/**
 * Small helper to format large integers (1.2k, 3.4M, etc.)
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
    <div className="flex items-center gap-4 p-4 bg-white border rounded-xl shadow-sm">
      <div className={`rounded-lg p-3 ${color} text-white flex items-center justify-center w-14 h-14`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{title}</div>
        <div className="text-2xl font-semibold text-gray-900">{formatNumber(value)}</div>
        {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

function DashboardMain({ sales, ordersByDate, topProducts, usersCount, productsCount, ordersCount }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">Welcome back, Admin</div>
      </div>

      {/* Top analytics row: Users, Products, Orders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={usersCount ?? 0}
          color="bg-indigo-600"
          subtitle="Active registered customers"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />

        <StatCard
          title="Products"
          value={productsCount ?? 0}
          color="bg-emerald-600"
          subtitle="Items listed in the catalog"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          }
        />

        <StatCard
          title="Orders"
          value={ordersCount ?? (sales?.ordersCount ?? 0)}
          color="bg-yellow-600"
          subtitle="Orders placed overall"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h18v4H3z" />
              <path d="M21 10v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7" />
              <path d="M16 14a4 4 0 11-8 0" />
            </svg>
          }
        />
      </div>

      {/* Summary row: Total Orders & Total Sales (existing) */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold">{sales?.ordersCount ?? 0}</div>
        </div>
        <div className="bg-white border rounded-xl p-4 md:col-span-2">
          <div className="text-sm text-gray-500">Total Sales</div>
          <div className="text-2xl font-bold">{formatCurrency(sales?.totalSales ?? 0)}</div>
        </div>
      </div>

      <SalesChart data={ordersByDate} />
      <TopProductsChart data={topProducts} />
    </div>
  );
}

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const {
    sales,
    ordersByDate,
    topProducts,
    // these fields should be provided by your admin analytics thunk (fetchAnalytics)
    usersCount = 0,
    productsCount = 0,
    ordersCount = 0,
  } = useSelector((s) => s.admin || {});

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 space-y-3">
        <Link
          to="/admin"
          className="block px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Dashboard
        </Link>
        <Link
          to="/admin/products"
          className="block px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Product Management
        </Link>
        <Link
          to="/admin/orders"
          className="block px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Order Management
        </Link>
        <Link
          to="/admin/coupons"
          className="block px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Coupon Management
        </Link>
        <Link
          to="/profile"
          className="block px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          My Profile
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardMain
                sales={sales}
                ordersByDate={ordersByDate}
                topProducts={topProducts}
                usersCount={usersCount}
                productsCount={productsCount}
                ordersCount={ordersCount}
              />
            }
          />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/coupons" element={<div>Coupons Page</div>} />
        </Routes>
      </div>
    </div>
  );
}