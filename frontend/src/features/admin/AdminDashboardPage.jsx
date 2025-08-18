import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalytics } from "./adminSlice.js";
import SalesChart from "../../components/charts/SalesChart.jsx";
import TopProductsChart from "../../components/charts/TopProductsChart.jsx";
import formatCurrency from "../../utils/formatCurrency.js";
import { Link, Routes, Route } from "react-router-dom";
import ProductManagement from "./ProductManagement.jsx";
import OrderManagement from "./OrderManagement.jsx";

function DashboardMain({ sales, ordersByDate, topProducts }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold">{sales?.ordersCount ?? 0}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-500">Total Sales</div>
          <div className="text-2xl font-bold">
            {formatCurrency(sales?.totalSales ?? 0)}
          </div>
        </div>
      </div>
      <SalesChart data={ordersByDate} />
      <TopProductsChart data={topProducts} />
    </div>
  );
}

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { sales, ordersByDate, topProducts } = useSelector((s) => s.admin);

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
      <div className="flex-1 p-4">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardMain
                sales={sales}
                ordersByDate={ordersByDate}
                topProducts={topProducts}
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
