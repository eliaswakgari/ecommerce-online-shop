import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProductList from "../components/product/ProductList.jsx";
import { fetchProducts, setFilters, fetchCategories } from "../features/product/productSlice.js";
import heroBanner1 from "../assets/images/hero-banner-1.jpg";
import heroBanner2 from "../assets/images/hero-banner-2.jpg";
import heroBanner3 from "../assets/images/hero-banner-3.jpg";
import heroBanner4 from "../assets/images/hero-banner-4.jpg";

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(s => s.product);
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = [
    {
      id: 0,
      title: "Fashionable gifts for style setters",
      subtitle: "Holiday deals",
      cta: "Shop Fashion Deals",
      image: heroBanner1,
      bg: "from-green-700 to-emerald-600"
    },
    {
      id: 1,
      title: "Shop holiday gift guides",
      subtitle: "Gifts for everyone on your list",
      cta: "Explore Gift Guides",
      image: heroBanner2,
      bg: "from-red-700 to-rose-600"
    },
    {
      id: 2,
      title: "Home & kitchen gifts under $40",
      subtitle: "Holiday deals",
      cta: "Shop Home & Kitchen",
      image: heroBanner3,
      bg: "from-pink-600 to-fuchsia-500"
    },
    {
      id: 3,
      title: "Stocking stuffers under $10",
      subtitle: "Holiday deals",
      cta: "Shop Stocking Stuffers",
      image: heroBanner4,
      bg: "from-pink-600 to-purple-500"
    }
  ];

  useEffect(() => {
    dispatch(setFilters({ page: 1, limit: 8, sort: "newest" }));
    dispatch(fetchProducts({ page: 1, limit: 8, sort: "newest" }));
    dispatch(fetchCategories());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <div className="space-mobile-y">
      {/* Mobile-First Hero Section */}
      <div className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl border shadow-sm">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`min-w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 bg-gradient-to-r ${slide.bg} text-white p-4 sm:p-6 lg:p-8`}
            >
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs sm:text-sm tracking-widest opacity-80 mb-2 uppercase">
                  {slide.subtitle}
                </p>
                <h1 className="text-responsive-4xl font-black leading-tight mb-4 lg:mb-6">
                  {slide.title}
                </h1>
                <button
                  onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
                  className="inline-flex items-center gap-2 bg-white/90 text-pink-600 px-4 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-3 rounded-full hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base font-medium"
                >
                  {slide.cta}
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
              {/* Hero Image */}
              <div className="hidden md:flex md:w-96 lg:w-[480px] flex-shrink-0 items-center justify-center">
                <div className="w-full h-40 sm:h-48 lg:h-64 rounded-xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-500">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel controls */}
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === activeSlide ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-responsive-2xl font-bold text-gray-900">
            Shop by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { key: "men", label: "Men" },
            { key: "women", label: "Women" },
            { key: "boys", label: "Boys" },
            { key: "girls", label: "Girls" },
            { key: "kids", label: "Children" },
            { key: "accessories", label: "Accessories" }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => navigate(`/products?category=${cat.key}`)}
              className="group relative flex flex-col items-center justify-between rounded-xl border bg-white p-3 sm:p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-full h-16 sm:h-20 rounded-lg bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 mb-2 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  {cat.label}
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-800 group-hover:text-pink-600">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

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
