import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { placeOrderApi, adminGetOrdersApi, adminUpdateOrderStatusApi, getUserOrdersApi } from "../../api/orderApi.js";
import { clearCart } from "../cart/cartSlice.js";
import toast from "react-hot-toast";

const initialState = {
  clientSecret: null,
  currentOrderId: null,
  loading: false,
  userOrders: [],
  adminOrders: []
};

export const placeOrder = createAsyncThunk(
  "order/place",
  async (payload, thunkAPI) => {
    try {
      const { data } = await placeOrderApi(payload); // { clientSecret, orderId }
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  "order/fetchUserOrders",
  async (_, thunkAPI) => {
    try {
      const { data } = await getUserOrdersApi();
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const adminGetOrders = createAsyncThunk(
  "order/adminGetOrders",
  async (_, thunkAPI) => {
    try {
      const { data } = await adminGetOrdersApi();
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const adminUpdateOrderStatus = createAsyncThunk(
  "order/adminUpdateStatus",
  async ({ orderId, status }, thunkAPI) => {
    try {
      const { data } = await adminUpdateOrderStatusApi(orderId, { status });
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

const slice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearPaymentState: (state) => {
      state.clientSecret = null;
      state.currentOrderId = null;
    },
    clearOrderState: (state) => {
      state.clientSecret = null;
      state.currentOrderId = null;
      state.userOrders = [];
      state.adminOrders = [];
    }
  },
  extraReducers: (b) => {
    b
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.clientSecret = payload.clientSecret;
        state.currentOrderId = payload.orderId;
      })
      .addCase(placeOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(String(payload));
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userOrders = payload;
      })
      .addCase(fetchUserOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(String(payload));
      })
      .addCase(adminGetOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminGetOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.adminOrders = payload;
      })
      .addCase(adminGetOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        toast.error(String(payload));
      })
      .addCase(adminUpdateOrderStatus.fulfilled, (state, { payload }) => {
        // Update the order in adminOrders array
        const index = state.adminOrders.findIndex(order => order._id === payload._id);
        if (index !== -1) {
          state.adminOrders[index] = payload;
        }
        toast.success("Order status updated successfully");
      })
      .addCase(adminUpdateOrderStatus.rejected, (state, { payload }) => {
        toast.error(String(payload));
      });
  }
});

export const { clearPaymentState, clearOrderState } = slice.actions;
export default slice.reducer;
