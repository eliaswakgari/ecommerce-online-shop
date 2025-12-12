import React from "react";
import ProductCard from "./ProductCard.jsx";

export default function ProductList({ products = [] }) {
  if (!products.length) {
    return (
      <div className="text-center py-8 sm:py-12 lg:py-16">
        <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">🔍</div>
        <h3 className="text-responsive-xl font-semibold text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-responsive-base text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid-responsive">
      {products.map((p, index) => (
        <div
          key={p._id}
          className="fade-in-up"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
