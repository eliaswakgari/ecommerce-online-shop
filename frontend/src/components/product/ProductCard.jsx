import React from "react";
import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/20/solid";
import formatCurrency from "../../utils/formatCurrency.js";

export default function ProductCard({ product }) {
  return (
    <div className="product-card bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
      <Link to={`/products/${product._id}`}>
        <img
          src={product.images?.[0] || "https://via.placeholder.com/600x400?text=No+Image"}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link to={`/products/${product._id}`} className="font-semibold line-clamp-1">
          {product.name}
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>

        {/* Rating Display */}
        <div className="flex items-center space-x-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`w-4 h-4 ${star <= (product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">
            ({product.numReviews || 0})
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold">{formatCurrency(product.price)}</span>
          <Link to={`/products/${product._id}`} className="text-blue-600 text-sm">View</Link>
        </div>
      </div>
    </div>
  );
}
