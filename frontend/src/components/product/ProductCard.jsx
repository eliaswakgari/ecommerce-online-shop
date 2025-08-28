import React from "react";
import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/20/solid";
import formatCurrency from "../../utils/formatCurrency.js";

export default function ProductCard({ product }) {
  return (
    <div className="card-responsive hover-lift group overflow-hidden">
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="block relative overflow-hidden rounded-t-lg sm:rounded-t-xl lg:rounded-t-2xl">
        <img
          src={product.images?.[0]?.url || "https://via.placeholder.com/600x400?text=No+Image"}
          alt={product.name}
          className="w-full h-40 sm:h-48 lg:h-52 object-cover transition-transform duration-300 group-hover:scale-105"
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
      </Link>
      
      {/* Product Info */}
      <div className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
        {/* Product Name */}
        <Link 
          to={`/products/${product._id}`} 
          className="block font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          <h3 className="text-sm sm:text-base lg:text-lg line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </Link>
        
        {/* Product Description */}
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  star <= (product.rating || 0) 
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

        {/* Price and Action */}
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
          
          <Link 
            to={`/products/${product._id}`} 
            className="px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors touch-target group"
          >
            <span className="block sm:hidden">View</span>
            <span className="hidden sm:block">View Details</span>
          </Link>
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
    </div>
  );
}
