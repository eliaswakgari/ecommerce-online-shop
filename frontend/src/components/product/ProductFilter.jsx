import React from "react";
import { useSelector } from "react-redux";

export default function ProductFilter({ filters, onChange }) {
  const categories = useSelector((s)=> s.product.categories) || [];
  return (
    <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3 items-end">
      <div>
        <label className="text-sm block">Search</label>
        <input
          className="border rounded px-3 py-2"
          value={filters.keyword || ""}
          onChange={(e)=>onChange({ ...filters, keyword: e.target.value, page:1 })}
          placeholder="Name/description"
        />
      </div>
      <div>
        <label className="text-sm block">Category</label>
        <select
          className="border rounded px-3 py-2"
          value={filters.category || ""}
          onChange={(e)=>onChange({ ...filters, category:e.target.value || undefined, page:1 })}
        >
          <option value="">All</option>
          {categories.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm block">Min Price</label>
        <input
          type="number"
          className="border rounded px-3 py-2 w-32"
          value={filters.minPrice ?? ""}
          onChange={(e)=>onChange({ ...filters, minPrice:e.target.value || undefined, page:1 })}
        />
      </div>
      <div>
        <label className="text-sm block">Max Price</label>
        <input
          type="number"
          className="border rounded px-3 py-2 w-32"
          value={filters.maxPrice ?? ""}
          onChange={(e)=>onChange({ ...filters, maxPrice:e.target.value || undefined, page:1 })}
        />
      </div>
      <div>
        <label className="text-sm block">Sort</label>
        <select
          className="border rounded px-3 py-2"
          value={filters.sort || "newest"}
          onChange={(e)=>onChange({ ...filters, sort:e.target.value, page:1 })}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
      <button
        className="ml-auto px-4 py-2 bg-gray-200 rounded"
        onClick={()=>onChange({ keyword:"", category:"", minPrice:undefined, maxPrice:undefined, sort:"newest", page:1 })}
      >Reset</button>
    </div>
  );
}
