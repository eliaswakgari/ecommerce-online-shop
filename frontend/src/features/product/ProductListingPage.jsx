import React, { useEffect } from "react";
import ProductList from "../../components/product/ProductList.jsx";
import ProductFilter from "../../components/product/ProductFilter.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setFilters, fetchCategories } from "./productSlice.js";
import { PAGE_SIZE } from "../../utils/constants.js";
import usePagination from "../../hooks/usePagination.js";
import Loader from "../../components/ui/Loader.jsx";

export default function ProductListingPage() {
  const dispatch = useDispatch();
  const { items, total, loading, filters } = useSelector(s=>s.product);
  const { pages, hasPrev, hasNext } = usePagination(total, filters.page || 1, filters.limit || PAGE_SIZE);

  useEffect(()=>{ dispatch(fetchProducts(filters)); }, [filters]);
  useEffect(()=>{ dispatch(fetchCategories()); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Products</h1>
      <ProductFilter filters={filters} onChange={(f)=>dispatch(setFilters(f))}/>
      {loading ? <Loader/> : <ProductList products={items} />}
      <div className="flex items-center gap-2 justify-center mt-2">
        <button className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50" disabled={!hasPrev} onClick={()=>dispatch(setFilters({ page: (filters.page||1) - 1 }))}>Prev</button>
        <span className="text-sm">Page {filters.page || 1} of {pages}</span>
        <button className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50" disabled={!hasNext} onClick={()=>dispatch(setFilters({ page: (filters.page||1) + 1 }))}>Next</button>
      </div>
    </div>
  );
}
