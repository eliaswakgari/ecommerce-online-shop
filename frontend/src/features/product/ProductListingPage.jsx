// src/features/product/ProductListingPage.jsx
import React, { useEffect, useState } from "react";
import ProductList from "../../components/product/ProductList.jsx";
import ProductFilter from "../../components/product/ProductFilter.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setFilters, fetchCategories } from "./productSlice.js";
import { PAGE_SIZE } from "../../utils/constants.js";
import usePagination from "../../hooks/usePagination.js";
import Loader from "../../components/ui/Loader.jsx";
import { AnimatePresence, motion } from "framer-motion";

export default function ProductListingPage() {
  const dispatch = useDispatch();
  const { items, total, loading, filters } = useSelector((s) => s.product);
  const { pages, hasPrev, hasNext } = usePagination(
    total,
    filters.page || 1,
    filters.limit || PAGE_SIZE
  );

  const [direction, setDirection] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [filters]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, []);

  const handlePageChange = (newPage) => {
    setDirection(newPage > (filters.page || 1) ? 1 : -1);
    dispatch(setFilters({ page: newPage }));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Products</h1>
      <ProductFilter
        filters={filters}
        onChange={(f) => dispatch(setFilters(f))}
      />

      {loading ? (
        <Loader />
      ) : (
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={filters.page} // animate per page
            initial={{ x: direction * 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 300, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductList products={items} />
          </motion.div>
        </AnimatePresence>
      )}

      <div className="flex items-center gap-2 justify-center mt-2">
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          disabled={!hasPrev}
          onClick={() => handlePageChange((filters.page || 1) - 1)}
        >
          Prev
        </button>
        <span className="text-sm">
          Page {filters.page || 1} of {pages}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          disabled={!hasNext}
          onClick={() => handlePageChange((filters.page || 1) + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
