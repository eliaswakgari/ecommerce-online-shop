import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  getDetailedProductsApi, 
  getDetailedOrdersApi, 
  getDetailedSalesApi 
} from "../../api/analyticsApi.js";

// ----------------- API Endpoints -----------------
const ANALYTICS_BASE = "/api/analytics";
const COUPONS_URL = "/api/coupons";

// ----------------- Helper: fetchJson -----------------
async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include", // include cookies (JWT)
    headers: { "content-type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = text || res.statusText || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ----------------- Thunks -----------------

// ✅ Fetch analytics
export const fetchAnalytics = createAsyncThunk(
  "admin/fetchAnalytics",
  async (_, thunkAPI) => {
    try {
      // Parallel fetch all analytics endpoints
      const [salesRes, topProductsRes, ordersByDateRes, usersRes, productsRes, ordersRes] =
        await Promise.all([
          fetchJson(`${ANALYTICS_BASE}/sales`),
          fetchJson(`${ANALYTICS_BASE}/top-products`),
          fetchJson(`${ANALYTICS_BASE}/orders-by-date`),
          fetchJson(`${ANALYTICS_BASE}/users/count`),
          fetchJson(`${ANALYTICS_BASE}/products/count`),
          fetchJson(`${ANALYTICS_BASE}/orders/count`),
        ]);

      return {
        sales: salesRes ?? { totalSales: 0, ordersCount: 0 },
        topProducts: topProductsRes ?? [],
        ordersByDate: ordersByDateRes ?? [],
        usersCount: usersRes?.count ?? 0,
        productsCount: productsRes?.count ?? 0,
        ordersCount: ordersRes?.count ?? 0,
      };
    } catch (err) {
      console.error("Fetch analytics failed:", err);
      return thunkAPI.rejectWithValue(err.message || "Failed to fetch analytics");
    }
  }
);

// ✅ Create Coupon
export const createCoupon = createAsyncThunk(
  "admin/createCoupon",
  async (couponData, thunkAPI) => {
    try {
      const res = await fetchJson(COUPONS_URL, {
        method: "POST",
        body: JSON.stringify(couponData),
      });
      return res; // backend should return created coupon
    } catch (err) {
      console.error("Create coupon error:", err);
      return thunkAPI.rejectWithValue(err.message || "Failed to create coupon");
    }
  }
);

// ✅ Fetch detailed products analytics
export const fetchDetailedProducts = createAsyncThunk(
  "admin/fetchDetailedProducts",
  async (period = 'all', thunkAPI) => {
    try {
      const response = await getDetailedProductsApi(period);
      return response.data;
    } catch (err) {
      console.error("Fetch detailed products error:", err);
      return thunkAPI.rejectWithValue(err.message || "Failed to fetch products analytics");
    }
  }
);

// ✅ Fetch detailed orders analytics
export const fetchDetailedOrders = createAsyncThunk(
  "admin/fetchDetailedOrders",
  async (period = 'all', thunkAPI) => {
    try {
      const response = await getDetailedOrdersApi(period);
      return response.data;
    } catch (err) {
      console.error("Fetch detailed orders error:", err);
      return thunkAPI.rejectWithValue(err.message || "Failed to fetch orders analytics");
    }
  }
);

// ✅ Fetch detailed sales analytics
export const fetchDetailedSales = createAsyncThunk(
  "admin/fetchDetailedSales",
  async (period = 'all', thunkAPI) => {
    try {
      const response = await getDetailedSalesApi(period);
      return response.data;
    } catch (err) {
      console.error("Fetch detailed sales error:", err);
      return thunkAPI.rejectWithValue(err.message || "Failed to fetch sales analytics");
    }
  }
);

// ----------------- Initial State -----------------
const initialState = {
  loading: false,
  error: null,
  sales: {},
  ordersByDate: [],
  topProducts: [],
  usersCount: 0,
  productsCount: 0,
  ordersCount: 0,

  // coupon-related
  creatingCoupon: false,
  coupons: [],

  // detailed analytics
  detailedProducts: [],
  detailedOrders: [],
  detailedSales: { dailySales: [], categorySales: [] },
  loadingDetailed: {
    products: false,
    orders: false,
    sales: false,
  },
  errorDetailed: {
    products: null,
    orders: null,
    sales: null,
  },
};

// ----------------- Slice -----------------
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    resetAdmin: (state) => Object.assign(state, initialState),
  },
  extraReducers: (builder) => {
    // Analytics
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.sales = payload.sales ?? {};
        state.ordersByDate = payload.ordersByDate ?? [];
        state.topProducts = payload.topProducts ?? [];
        state.usersCount = payload.usersCount ?? 0;
        state.productsCount = payload.productsCount ?? 0;
        state.ordersCount =
          payload.ordersCount ?? (payload.sales?.ordersCount ?? 0);
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load analytics";
      });

    // Create Coupon
    builder
      .addCase(createCoupon.pending, (state) => {
        state.creatingCoupon = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.creatingCoupon = false;
        if (action.payload) {
          state.coupons.push(action.payload);
        }
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.creatingCoupon = false;
        state.error = action.payload || "Failed to create coupon";
      });

    // Detailed Products Analytics
    builder
      .addCase(fetchDetailedProducts.pending, (state) => {
        state.loadingDetailed.products = true;
        state.errorDetailed.products = null;
      })
      .addCase(fetchDetailedProducts.fulfilled, (state, action) => {
        state.loadingDetailed.products = false;
        state.detailedProducts = action.payload || [];
      })
      .addCase(fetchDetailedProducts.rejected, (state, action) => {
        state.loadingDetailed.products = false;
        state.errorDetailed.products = action.payload || "Failed to load products analytics";
      });

    // Detailed Orders Analytics
    builder
      .addCase(fetchDetailedOrders.pending, (state) => {
        state.loadingDetailed.orders = true;
        state.errorDetailed.orders = null;
      })
      .addCase(fetchDetailedOrders.fulfilled, (state, action) => {
        state.loadingDetailed.orders = false;
        state.detailedOrders = action.payload || [];
      })
      .addCase(fetchDetailedOrders.rejected, (state, action) => {
        state.loadingDetailed.orders = false;
        state.errorDetailed.orders = action.payload || "Failed to load orders analytics";
      });

    // Detailed Sales Analytics
    builder
      .addCase(fetchDetailedSales.pending, (state) => {
        state.loadingDetailed.sales = true;
        state.errorDetailed.sales = null;
      })
      .addCase(fetchDetailedSales.fulfilled, (state, action) => {
        state.loadingDetailed.sales = false;
        state.detailedSales = action.payload || { dailySales: [], categorySales: [] };
      })
      .addCase(fetchDetailedSales.rejected, (state, action) => {
        state.loadingDetailed.sales = false;
        state.errorDetailed.sales = action.payload || "Failed to load sales analytics";
      });
  },
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;
