import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
      <h1 className="text-2xl font-semibold">Analytics</h1>
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
