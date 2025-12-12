import React from "react";
import { useSelector } from "react-redux";

export default function ProductFilter({ filters, onChange }) {
  const categories = useSelector((s) => s.product.categories) || [];
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-2 sm:p-3 lg:p-4 shadow-sm space-y-2 sm:space-y-3">
      {/* Top row title on small screens (optional) */}
      <div className="flex items-center justify-between sm:hidden">
        <h3 className="text-base font-semibold text-gray-900">Search & Filters</h3>
        <button
          className="text-xs text-gray-500 underline"
          onClick={() => onChange({ keyword: "", category: "", minPrice: undefined, maxPrice: undefined, sort: "newest", page: 1 })}
        >
          Reset
        </button>
      </div>

      {/* Inputs: stacked on mobile, compact single row on larger screens */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3">
        {/* Search */}
        <div className="w-full sm:w-56 lg:w-64 flex flex-col space-y-0.5">
          <label className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">Search</label>
          <input
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-xs sm:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.keyword || ""}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value, page: 1 })}
            placeholder="Name/description"
          />
        </div>

        {/* Category */}
        <div className="sm:w-40 lg:w-44 flex flex-col space-y-0.5">
          <label className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">Category</label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            value={filters.category || ""}
            onChange={(e) => onChange({ ...filters, category: e.target.value || undefined, page: 1 })}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div className="sm:w-32 lg:w-36 flex flex-col space-y-0.5">
          <label className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">Min Price</label>
          <input
            type="number"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            value={filters.minPrice ?? ""}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value || undefined, page: 1 })}
          />
        </div>

        {/* Max Price */}
        <div className="sm:w-32 lg:w-36 flex flex-col space-y-0.5">
          <label className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">Max Price</label>
          <input
            type="number"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value || undefined, page: 1 })}
          />
        </div>

        {/* Sort */}
        <div className="sm:w-40 lg:w-44 flex flex-col space-y-0.5">
          <label className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">Sort</label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            value={filters.sort || "newest"}
            onChange={(e) => onChange({ ...filters, sort: e.target.value, page: 1 })}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Reset button inline on desktop */}
        <div className="hidden sm:flex flex-1 justify-end">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs sm:text-sm text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 transition-colors"
            onClick={() => onChange({ keyword: "", category: "", minPrice: undefined, maxPrice: undefined, sort: "newest", page: 1 })}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
