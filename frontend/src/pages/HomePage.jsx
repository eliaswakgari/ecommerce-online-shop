import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProductList from "../components/product/ProductList.jsx";
import { fetchProducts, setFilters, fetchCategories } from "../features/product/productSlice.js";

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(s=>s.product);

  useEffect(()=>{ 
    dispatch(setFilters({ page:1, limit:8, sort:"newest" }));
    dispatch(fetchProducts({ page:1, limit:8, sort:"newest" }));
    dispatch(fetchCategories());
  }, []);

  return (
    <div className="space-mobile-y">
      {/* Mobile-First Hero Section */}
      <div className="rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 border p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
        <div className="flex-1 text-center md:text-left">
          <p className="text-xs sm:text-sm tracking-widest text-gray-500 mb-2">
            NEW ARRIVALS ONLY
          </p>
          <h1 className="text-responsive-4xl font-black leading-tight mb-4 lg:mb-6">
            new 👋<br className="hidden sm:block" />
            <span className="sm:block">collections</span><br className="hidden sm:block" />
            <span className="sm:block">for everyone</span>
          </h1>
          <button 
            onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-3 rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base font-medium"
          >
            Latest Collection
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
        
        {/* Hero Image - Hidden on mobile, visible on larger screens */}
        <div className="hidden md:block md:w-80 lg:w-96 flex-shrink-0">
          <div className="w-full h-48 lg:h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-gray-500">
            <svg className="w-16 h-16 lg:w-20 lg:h-20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Featured Products Section */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-responsive-2xl font-bold text-gray-900">
            Featured Products
          </h2>
          <button 
            onClick={() => navigate('/products')}
            className="text-sm sm:text-base text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors self-start sm:self-auto"
          >
            View All →
          </button>
        </div>
        
        {/* Products Grid */}
        <div className="w-full">
          <ProductList products={items.slice(0, 8)} />
        </div>
      </section>
    </div>
  );
}
