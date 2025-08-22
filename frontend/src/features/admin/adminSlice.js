import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// ----------------- API Endpoints -----------------
const ADMIN_ANALYTICS_URL = "/api/admin/analytics";
const COUPONS_URL = "/api/admin/coupons";

const USERS_COUNT_URL = "/api/users/count";
const PRODUCTS_COUNT_URL = "/api/products/count";
const ORDERS_COUNT_URL = "/api/orders/count";

// ----------------- Helper: fetchJson -----------------
async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
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
      const analytics = await fetchJson(ADMIN_ANALYTICS_URL);
      return {
        sales: analytics.sales ?? analytics.salesData ?? {},
        ordersByDate: analytics.ordersByDate ?? [],
        topProducts: analytics.topProducts ?? [],
        usersCount: analytics.usersCount ?? analytics.users ?? analytics.totalUsers ?? null,
        productsCount: analytics.productsCount ?? analytics.totalProducts ?? null,
        ordersCount: analytics.ordersCount ?? analytics.totalOrders ?? null,
      };
    } catch (err) {
      try {
        const [usersResp, productsResp, ordersResp] = await Promise.allSettled([
          fetchJson(USERS_COUNT_URL).catch(() => null),
          fetchJson(PRODUCTS_COUNT_URL).catch(() => null),
          fetchJson(ORDERS_COUNT_URL).catch(() => null),
        ]);

        const usersCount =
          usersResp?.status === "fulfilled"
            ? usersResp.value.count ?? usersResp.value.total ?? usersResp.value
            : null;
        const productsCount =
          productsResp?.status === "fulfilled"
            ? productsResp.value.count ?? productsResp.value.total ?? productsResp.value
            : null;
        const ordersCount =
          ordersResp?.status === "fulfilled"
            ? ordersResp.value.count ?? ordersResp.value.total ?? ordersResp.value
            : null;

        let sales = {};
        let ordersByDate = [];
        let topProducts = [];
        try {
          const partial = await fetchJson(ADMIN_ANALYTICS_URL);
          sales = partial.sales ?? {};
          ordersByDate = partial.ordersByDate ?? [];
          topProducts = partial.topProducts ?? [];
        } catch (_) {
          // ignore
        }

        return {
          sales,
          ordersByDate,
          topProducts,
          usersCount: usersCount ?? 0,
          productsCount: productsCount ?? 0,
          ordersCount: ordersCount ?? (sales?.ordersCount ?? 0),
        };
      } catch (_) {
        return {
          sales: {},
          ordersByDate: [],
          topProducts: [],
          usersCount: 0,
          productsCount: 0,
          ordersCount: 0,
        };
      }
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
      return thunkAPI.rejectWithValue(err.message || "Failed to create coupon");
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
        state.usersCount = payload.usersCount ?? state.usersCount ?? 0;
        state.productsCount = payload.productsCount ?? state.productsCount ?? 0;
        state.ordersCount =
          payload.ordersCount ?? state.ordersCount ?? (payload.sales?.ordersCount ?? 0);
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message ?? "Failed to load analytics";
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
  },
});

export const { resetAdmin } = adminSlice.actions;
export default adminSlice.reducer;
