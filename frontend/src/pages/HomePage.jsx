import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductList from "../components/product/ProductList.jsx";
import { fetchProducts, setFilters, fetchCategories } from "../features/product/productSlice.js";

export default function HomePage() {
  const dispatch = useDispatch();
  const { items } = useSelector(s=>s.product);

  useEffect(()=>{ 
    dispatch(setFilters({ page:1, limit:8, sort:"newest" }));
    dispatch(fetchProducts({ page:1, limit:8, sort:"newest" }));
    dispatch(fetchCategories());
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-b from-pink-50 to-gray-50 border p-8 flex items-center justify-between">
        <div>
          <p className="text-sm tracking-widest text-gray-500">NEW ARRIVALS ONLY</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mt-2">new 👋<br/>collections<br/>for everyone</h1>
          <button onClick={()=>window.scrollTo({top:999, behavior:'smooth'})} className="mt-6 inline-flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-full">
            Latest Collection
            <span>→</span>
          </button>
        </div>
        <div className="hidden md:block">
          {/* Hero image placeholder; project images are used from products */}
        </div>
      </div>
      <section>
        <h2 className="text-xl font-semibold mb-3">Featured Products</h2>
        <ProductList products={items.slice(0,8)} />
      </section>
    </div>
  );
}
