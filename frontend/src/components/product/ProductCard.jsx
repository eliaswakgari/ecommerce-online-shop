import React from "react";
import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/20/solid";
import formatCurrency from "../../utils/formatCurrency.js";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="relative block card-responsive group overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50 to-indigo-50 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 hover:-translate-y-1 min-w-[230px]"
    >
      {/* Product Image */}
      <div className="relative z-10 overflow-hidden rounded-t-xl lg:rounded-t-2xl">
        <img
          src={product.images?.[0]?.url || "https://via.placeholder.com/600x400?text=No+Image"}
          alt={product.name}
          className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-500 group-hover:scale-[1.03] group-hover:brightness-110"
          loading="lazy"
        />
        {/* Product Badge */}
        {product.countInStock === 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Out of Stock
          </div>
        )}
        {product.countInStock > 0 && product.countInStock <= 5 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Low Stock
          </div>
        )}
      </div>

      {/* Full-card brand overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pink-500/0 via-rose-400/10 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Product Info */}
      <div className="relative z-10 p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3 min-h-[150px] flex flex-col justify-between">
        {/* Product Name */}
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${star <= (product.rating || 0)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
                  }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.numReviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="pt-1">
          {product.countInStock === 0 ? (
            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
          ) : product.countInStock <= 5 ? (
            <span className="text-xs text-orange-600 font-medium">
              Only {product.countInStock} left
            </span>
          ) : (
            <span className="text-xs text-green-600 font-medium">In Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
