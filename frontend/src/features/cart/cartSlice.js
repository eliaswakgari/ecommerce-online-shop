import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addToCartApi, getCartApi, removeCartItemApi, updateCartItemApi, clearCartApi } from "../../api/cartApi.js";
import toast from "react-hot-toast";

// Guest cart localStorage key
const GUEST_CART_KEY = 'guest_cart';

// Helper functions for guest cart
const getGuestCart = () => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : { items: [], totalAmount: 0 };
  } catch (error) {
    console.error('Error reading guest cart:', error);
    return { items: [], totalAmount: 0 };
  }
};

const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
};

const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error('Error clearing guest cart:', error);
  }
};

const initialState = {
  items: [],
  loading: false,
  error: null,
  subtotal: 0,
  totalAmount: 0,
  isGuest: false
};

export const fetchCart = createAsyncThunk("cart/fetch", async (_, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  
  // If user is not authenticated, return guest cart
  if (!auth.user) {
    const guestCart = getGuestCart();
    return {
      items: guestCart.items || [],
      totalAmount: guestCart.totalAmount || 0,
      isGuest: true
    };
  }
  
  try { 
    const { data } = await getCartApi(); 
    return { ...data, isGuest: false }; 
  } catch (e) { 
    return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); 
  }
});

export const addItem = createAsyncThunk("cart/add", async (payload, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  
  // If user is not authenticated, handle guest cart
  if (!auth.user) {
    const guestCart = getGuestCart();
    const existingItemIndex = guestCart.items.findIndex(item => item.productId === payload.productId);
    
    if (existingItemIndex >= 0) {
      guestCart.items[existingItemIndex].quantity += payload.quantity;
    } else {
      guestCart.items.push({
        productId: payload.productId,
        quantity: payload.quantity,
        price: payload.price || 0,
        totalPrice: (payload.price || 0) * payload.quantity
      });
    }
    
    // Recalculate total
    guestCart.totalAmount = guestCart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    saveGuestCart(guestCart);
    
    toast.success("Added to cart");
    return { items: guestCart.items, totalAmount: guestCart.totalAmount, isGuest: true };
  }
  
  try { 
    // Prepare the payload for the API call
    const apiPayload = {
      productId: payload.productId,
      quantity: payload.quantity
    };
    
    // If review data is provided, include it
    if (payload.reviewData) {
      apiPayload.reviewData = payload.reviewData;
    }
    
    const { data } = await addToCartApi(apiPayload); 
    toast.success("Added to cart"); 
    return { ...data, isGuest: false }; 
  } catch (e) { 
    return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); 
  }
});

export const updateItemQty = createAsyncThunk("cart/update", async ({ id, quantity }, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  
  // If user is not authenticated, handle guest cart
  if (!auth.user) {
    const guestCart = getGuestCart();
    const itemIndex = guestCart.items.findIndex(item => item.productId === id);
    
    if (itemIndex >= 0) {
      guestCart.items[itemIndex].quantity = quantity;
      guestCart.items[itemIndex].totalPrice = guestCart.items[itemIndex].price * quantity;
      guestCart.totalAmount = guestCart.items.reduce((sum, item) => sum + item.totalPrice, 0);
      saveGuestCart(guestCart);
      return { items: guestCart.items, totalAmount: guestCart.totalAmount, isGuest: true };
    }
  }
  
  try { 
    const { data } = await updateCartItemApi(id, { quantity }); 
    return { ...data, isGuest: false }; 
  } catch (e) { 
    return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); 
  }
});

export const removeItem = createAsyncThunk("cart/remove", async (id, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  
  // If user is not authenticated, handle guest cart
  if (!auth.user) {
    const guestCart = getGuestCart();
    guestCart.items = guestCart.items.filter(item => item.productId !== id);
    guestCart.totalAmount = guestCart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    saveGuestCart(guestCart);
    toast.success("Removed from cart");
    return { items: guestCart.items, totalAmount: guestCart.totalAmount, isGuest: true };
  }
  
  try { 
    const { data } = await removeCartItemApi(id); 
    toast.success("Removed from cart"); 
    return { ...data, isGuest: false }; 
  } catch (e) { 
    return thunkAPI.rejectWithValue(e.response?.data?.message || e.message); 
  }
});

export const clearCart = createAsyncThunk("cart/clear", async (_, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  
  // Always clear guest cart regardless of auth status
  clearGuestCart();
  
  // If user is authenticated, also clear from backend
  if (auth.user) {
    try { 
      await clearCartApi(); 
    } catch (e) { 
      console.error("Failed to clear cart from backend:", e);
      // Don't throw error, still clear local state
    }
  }
  
  // Return cleared state
  return { items: [], totalAmount: 0, isGuest: !auth.user };
});

const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.totalAmount = 0;
      state.isGuest = false;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (b) => {
    const fulfilled = (s, { payload }) => {
      s.loading = false;
      s.items = payload.items?.map(i => ({
        ...i,
        id: i._id || i.id || i.productId // ensure id presence for UI updates
      })) || [];
      s.subtotal = s.items.reduce((sum, it) => sum + (it.product?.price || it.price || 0) * it.quantity, 0);
      s.totalAmount = payload.totalAmount || s.subtotal;
      s.isGuest = payload.isGuest || false;
    };
    const pending = (s) => { s.loading = true; s.error = null; };
    const rejected = (s, { payload }) => { s.loading = false; s.error = payload; toast.error(String(payload)); };

    b.addCase(fetchCart.pending, pending).addCase(fetchCart.fulfilled, fulfilled).addCase(fetchCart.rejected, rejected);
    b.addCase(addItem.pending, pending).addCase(addItem.fulfilled, fulfilled).addCase(addItem.rejected, rejected);
    b.addCase(updateItemQty.pending, pending).addCase(updateItemQty.fulfilled, fulfilled).addCase(updateItemQty.rejected, rejected);
    b.addCase(removeItem.pending, pending).addCase(removeItem.fulfilled, fulfilled).addCase(removeItem.rejected, rejected);
    b.addCase(clearCart.pending, pending).addCase(clearCart.fulfilled, fulfilled).addCase(clearCart.rejected, rejected);
  }
});

export const { clearCartState } = slice.actions;
export default slice.reducer;
