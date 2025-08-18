import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getOrdersByDateApi, getSalesApi, getTopProductsApi } from "../../api/analyticsApi.js";
import { adminCreateCouponApi } from "../../api/couponApi.js";
import toast from "react-hot-toast";

const initialState = { sales:null, topProducts:[], ordersByDate:[], creatingCoupon:false };

export const fetchAnalytics = createAsyncThunk("admin/analytics", async (_, thunkAPI)=>{
  try {
    const [sales, top, dates] = await Promise.all([getSalesApi(), getTopProductsApi(), getOrdersByDateApi()]);
    return { sales: sales.data, top: top.data, dates: dates.data };
  } catch(e){ return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); }
});

export const createCoupon = createAsyncThunk("admin/createCoupon", async (body, thunkAPI)=>{
  try { const { data } = await adminCreateCouponApi(body); toast.success("Coupon created"); return data; }
  catch(e){ return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); }
});

const slice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (b)=>{
    b.addCase(fetchAnalytics.fulfilled, (s,{payload})=>{
      s.sales = payload.sales; s.topProducts = payload.top; s.ordersByDate = payload.dates;
    });
    b.addCase(createCoupon.pending, (s)=>{s.creatingCoupon=true;});
    b.addCase(createCoupon.fulfilled, (s)=>{s.creatingCoupon=false;});
    b.addCase(createCoupon.rejected, (s)=>{s.creatingCoupon=false;});
  }
});

export default slice.reducer;
