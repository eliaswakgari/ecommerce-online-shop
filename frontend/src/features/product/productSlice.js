import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminCreateProductApi, adminDeleteProductApi, adminUpdateProductApi, getProductByIdApi, getProductsApi, getCategoriesApi } from "../../api/productApi.js";
import toast from "react-hot-toast";

const initialState = {
  items: [],
  total: 0,
  page: 1,
  loading: false,
  filters: { page:1, limit:12, sort:"newest" },
  current: null,
  error: null,
  categories: [],
};

export const fetchProducts = createAsyncThunk("product/fetch", async (params, thunkAPI)=>{
  try {
    const { data } = await getProductsApi(params);
    return data;
  } catch (e) { 
    return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); 
  }
});

export const fetchProductById = createAsyncThunk("product/detail", async (id, thunkAPI)=>{
  try {
    const { data } = await getProductByIdApi(id);
    return data;
  } catch (e) { 
    return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); 
  }
});

export const fetchCategories = createAsyncThunk("product/categories", async (_, thunkAPI) => {
  try {
    const { data } = await getCategoriesApi();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.response?.data?.message || e.message);
  }
});

// Admin
export const adminCreateProduct = createAsyncThunk("product/adminCreate", async (body, thunkAPI)=>{
  try { 
    const { data } = await adminCreateProductApi(body); 
    toast.success("Product created"); 
    return data; 
  } catch (e) { 
    return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); 
  }
});

export const adminUpdateProduct = createAsyncThunk("product/adminUpdate", async ({id, body}, thunkAPI)=>{
  try { 
    const { data } = await adminUpdateProductApi(id, body); 
    toast.success("Product updated"); 
    return data; 
  } catch (e) { 
    return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); 
  }
});

export const adminDeleteProduct = createAsyncThunk("product/adminDelete", async (id, thunkAPI)=>{
  try { 
    const { data } = await adminDeleteProductApi(id); 
    toast.success("Product deleted"); 
    return { id, data }; 
  } catch (e) { 
    return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); 
  }
});

const slice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setFilters(s, {payload}) { s.filters = { ...s.filters, ...payload }; }
  },
  extraReducers: (b)=>{
    b
      .addCase(fetchProducts.pending, (s)=>{s.loading=true;})
      .addCase(fetchProducts.fulfilled, (s,{payload})=>{
        s.loading=false; s.items=payload.products; s.total=payload.total; s.page=payload.page;
      })
      .addCase(fetchProducts.rejected, (s,{payload})=>{s.loading=false; s.error=payload;})

      .addCase(fetchProductById.fulfilled, (s,{payload})=>{s.current=payload;})

      .addCase(fetchCategories.fulfilled, (s,{payload})=>{ s.categories = payload || []; })

      .addCase(adminCreateProduct.fulfilled, (s,{payload})=>{s.items.unshift(payload.product);})
      .addCase(adminUpdateProduct.fulfilled, (s,{payload})=>{
        s.items = s.items.map(i => i._id===payload._id ? payload : i);
        if (s.current?._id === payload._id) s.current = payload;
      })
      .addCase(adminDeleteProduct.fulfilled, (s,{payload})=>{
        s.items = s.items.filter(i => i._id !== payload.id);
        s.current = null; // Clear current product if it was deleted
      });
  }
});

export const { setFilters } = slice.actions;
export default slice.reducer;
