import React from "react";
import ProductCard from "./ProductCard.jsx";

export default function ProductList({ products=[] }) {
  if (!products.length) return <div>No products found.</div>;
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p)=> <ProductCard key={p._id} product={p} />)}
    </div>
  );
}
