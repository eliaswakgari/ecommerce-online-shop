import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAnalytics } from "./adminSlice.js";
import SalesChart from "../../components/charts/SalesChart.jsx";
import TopProductsChart from "../../components/charts/TopProductsChart.jsx";
import formatCurrency from "../../utils/formatCurrency.js";

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { sales, ordersByDate, topProducts } = useSelector(s=>s.admin);

  useEffect(()=>{ dispatch(fetchAnalytics()); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Analytics Overview</h1>
      
      {/* Quick Navigation to Detailed Analytics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link 
          to="/admin/analytics/products" 
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center">
            <div className="bg-blue-500 text-white p-2 rounded-lg mr-3">
              📦
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Products Analytics</h3>
              <p className="text-sm text-blue-600">Detailed product performance, categories & inventory</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/admin/analytics/orders" 
          className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center">
            <div className="bg-green-500 text-white p-2 rounded-lg mr-3">
              📋
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Orders Analytics</h3>
              <p className="text-sm text-green-600">Order trends, customer data & delivery status</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/admin/analytics/sales" 
          className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
        >
          <div className="flex items-center">
            <div className="bg-purple-500 text-white p-2 rounded-lg mr-3">
              💰
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">Sales Analytics</h3>
              <p className="text-sm text-purple-600">Revenue trends, daily sales & category performance</p>
            </div>
          </div>
        </Link>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-500">Total Sales</div>
          <div className="text-2xl font-bold">{formatCurrency(sales?.totalSales ?? 0)}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-500">Orders</div>
          <div className="text-2xl font-bold">{sales?.ordersCount ?? 0}</div>
        </div>
      </div>
      <SalesChart data={ordersByDate} />
      <TopProductsChart data={topProducts} />
    </div>
  );
}
