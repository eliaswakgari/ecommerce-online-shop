import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import productReducer from "../features/product/productSlice.js";
import cartReducer from "../features/cart/cartSlice.js";
import orderReducer from "../features/order/orderSlice.js";
import adminReducer from "../features/admin/adminSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    admin: adminReducer
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false })
});

export default store;
