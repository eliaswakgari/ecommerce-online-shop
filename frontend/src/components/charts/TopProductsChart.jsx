// src/components/charts/TopProductsPieChart.jsx
import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from "recharts";
import { useSelector } from "react-redux";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

const TopProductsChart = () => {
  const { topProducts, loading } = useSelector((state) => state.admin);

  if (loading) return <p className="text-center text-gray-500">Loading chart...</p>;

  if (!topProducts || topProducts.length === 0) {
    return <p className="text-center text-gray-500">No top product data available.</p>;
  }

  // Map backend totalSold -> value for PieChart
  const chartData = topProducts.map((p) => ({
    name: p.name,
    value: p.totalSold,
  }));

  return (
    <div className="w-full h-[400px] p-4 bg-white shadow-md rounded-2xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Top Products</h2>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"   // must match mapped field
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart;
