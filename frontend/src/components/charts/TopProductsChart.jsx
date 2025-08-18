import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TopProductsChart({ data=[] }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="font-semibold mb-3">Top Products</h3>
      <div className="w-full h-64">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalSold" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-gray-500">Hover bars to see product names</div>
    </div>
  );
}
