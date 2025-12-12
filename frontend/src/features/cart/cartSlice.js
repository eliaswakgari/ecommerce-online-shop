import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addToCartApi, getCartApi, removeCartItemApi, updateCartItemApi, clearCartApi } from "../../api/cartApi.js";
import toast from "react-hot-toast";

const GUEST_CART_KEY = "guest_cart";

const getGuestCart = () => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : { items: [], totalAmount: 0 };
  } catch (e) {
    console.error("read guest cart:", e);
    return { items: [], totalAmount: 0 };
  }
};
const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("save guest cart:", e);
  }
};
const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (e) {
    console.error("clear guest cart:", e);
  }
};

const initialState = {
  items: [],
  loading: false,
  error: null,
  subtotal: 0,
  totalAmount: 0,
  isGuest: false,
};

const normalizeAndEnsureUniqueKeys = (rawItems = [], isBackendCart = false) => {
  console.log('🔄 Normalizing cart items:', rawItems.length, 'items', 'isBackendCart:', isBackendCart);
  
  if (!rawItems || rawItems.length === 0) {
    return [];
  }

  const normalized = rawItems.map((raw, idx) => {
    console.log(`Processing item ${idx}:`, {
      raw_id: raw._id,
      productId: raw.productId,
      product: raw.product ? { _id: raw.product._id, name: raw.product.name } : null,
      fullRawItem: raw // Show complete structure
    });
    
    // For backend cart items, each item has its own MongoDB subdocument _id
    const cartItemId = raw._id; // This is the cart item's unique MongoDB _id
    const productObj = raw.product;
    const productId = raw.productId || (productObj?._id);
    const price = Number(raw.price || productObj?.price || 0);
    const quantity = Number(raw.quantity || 1);
    
    console.log(`Item ${idx} analysis:`, {
      hasCartItemId: !!cartItemId,
      cartItemId,
      productId,
      isBackendItem: isBackendCart
    });
    
    return { 
      _raw: raw, 
      cartItemId,
      productId,
      product: productObj, 
      price, 
      quantity
    };
  });

  console.log('📦 Cart type:', isBackendCart ? 'Backend (authenticated)' : 'Guest (localStorage)');
  
  let finalItems;
  if (isBackendCart) {
    // Backend cart items - each should have unique MongoDB _id
    finalItems = normalized.map((it, idx) => {
      // For backend carts, if cartItemId is missing, generate one from productId + index
      // This handles cases where backend doesn't send cart item IDs properly
      const backendId = it.cartItemId || `backend-${it.productId}-${idx}`;
      
      console.log(`Creating backend cart item ${idx}:`, {
        originalCartItemId: it.cartItemId,
        generatedBackendId: backendId,
        productId: it.productId
      });
      
      return { 
        _id: backendId,            // Use cart item ID or generated ID as React key
        backendId: backendId,      // Store for API calls  
        productId: it.productId, 
        product: it.product, 
        price: it.price, 
        quantity: it.quantity, 
        keyForReact: backendId,
        _raw: it._raw 
      };
    });
  } else {
    // Guest cart items - merge by productId since guest can have duplicates
    const mergedBy = new Map();
    normalized.forEach((it, idx) => {
      const mergeKey = it.productId || `temp-${idx}`;
      if (mergedBy.has(mergeKey)) {
        const existing = mergedBy.get(mergeKey);
        existing.quantity += it.quantity;
      } else {
        mergedBy.set(mergeKey, { ...it });
      }
    });

    finalItems = Array.from(mergedBy.values()).map((it, idx) => {
      const tempId = it.productId || `guest-${idx}`;
      return { 
        _id: tempId,
        backendId: null,           // Guest items have no backend ID
        productId: it.productId, 
        product: it.product, 
        price: it.price, 
        quantity: it.quantity, 
        keyForReact: tempId,
        _raw: it._raw 
      };
    });
  }

  console.log('✅ Normalized cart items:', finalItems.map(it => ({
    _id: it._id,
    backendId: it.backendId,
    productId: it.productId,
    quantity: it.quantity
  })));

  return finalItems;
};

const calcSubtotal = (items = []) => {
  return items.reduce((sum, it) => {
    const price = Number(it.price ?? it.product?.price ?? 0) || 0;
    const quantity = Number(it.quantity ?? 0) || 0;
    return sum + (price * quantity);
  }, 0);
};

export const fetchCart = createAsyncThunk("cart/fetch", async (_, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  if (!auth || !auth.user) {
    const guestCart = getGuestCart();
    return { items: guestCart.items || [], totalAmount: guestCart.totalAmount || 0, isGuest: true };
  }
  try {
    const { data } = await getCartApi();
    console.log('📦 Raw backend cart response:', data);
    return { ...data, isGuest: false };
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const addItem = createAsyncThunk("cart/add", async (payload, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  if (!auth || !auth.user) {
    const guestCart = getGuestCart();
    const idx = guestCart.items.findIndex((i) => i.productId === payload.productId);
    if (idx >= 0) {
      guestCart.items[idx].quantity += payload.quantity;
      guestCart.items[idx].totalPrice = (guestCart.items[idx].price || 0) * guestCart.items[idx].quantity;
    } else {
      guestCart.items.push({ productId: payload.productId, quantity: payload.quantity, price: payload.price || 0, totalPrice: (payload.price || 0) * payload.quantity });
    }
    guestCart.totalAmount = guestCart.items.reduce((s, it) => s + (it.totalPrice || it.price * it.quantity || 0), 0);
    saveGuestCart(guestCart);
    toast.success("Added to cart");
    return { items: guestCart.items, totalAmount: guestCart.totalAmount, isGuest: true };
  }
  try {
    const { data } = await addToCartApi({ productId: payload.productId, quantity: payload.quantity });
    toast.success("Added to cart");
    return { ...data, isGuest: false };
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const updateItemQty = createAsyncThunk("cart/update", async ({ id, quantity }, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  if (!auth || !auth.user) {
    const guestCart = getGuestCart();
    const idx = guestCart.items.findIndex((i) => i.productId === id);
    if (idx >= 0) {
      guestCart.items[idx].quantity = quantity;
      guestCart.items[idx].totalPrice = (guestCart.items[idx].price || 0) * quantity;
      guestCart.totalAmount = guestCart.items.reduce((s, it) => s + (it.totalPrice || it.price * it.quantity || 0), 0);
      saveGuestCart(guestCart);
      return { items: guestCart.items, totalAmount: guestCart.totalAmount, isGuest: true };
    }
    return thunkAPI.rejectWithValue("Item not found in guest cart");
  }
  try {
    const { data } = await updateCartItemApi(id, { quantity });
    return { ...data, isGuest: false };
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const removeItem = createAsyncThunk("cart/remove", async (id, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  if (!auth || !auth.user) {
    const guestCart = getGuestCart();
    guestCart.items = (guestCart.items || []).filter((i) => i.productId !== id);
    guestCart.totalAmount = guestCart.items.reduce((s, it) => s + (it.totalPrice || it.price * it.quantity || 0), 0);
    saveGuestCart(guestCart);
    toast.success("Removed from cart");
    return { items: guestCart.items, totalAmount: guestCart.totalAmount, isGuest: true };
  }
  try {
    const { data } = await removeCartItemApi(id);
    toast.success("Removed from cart");
    return { ...data, isGuest: false };
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const clearCart = createAsyncThunk("cart/clear", async (_, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  clearGuestCart();
  if (auth && auth.user) {
    try {
      await clearCartApi();
    } catch (e) {
      console.error("Failed to clear backend cart:", e);
    }
  }
  return { items: [], totalAmount: 0, isGuest: !(auth && auth.user) };
});

const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState(state) {
      state.items = [];
      state.subtotal = 0;
      state.totalAmount = 0;
      state.isGuest = false;
      state.loading = false;
      state.error = null;
    },
    updateLocalItem(state, action) {
      const { id, quantity } = action.payload;
      const idx = state.items.findIndex(it => it._id === id || it.backendId === id || it.productId === id || it.id === id);
      if (idx >= 0) {
        state.items[idx].quantity = quantity;
        state.subtotal = calcSubtotal(state.items);
        state.totalAmount = state.subtotal;
        
        // Save to localStorage for guest users
        if (state.isGuest) {
          saveGuestCart({ items: state.items, totalAmount: state.totalAmount });
        }
      }
    },
    removeLocalItem(state, action) {
      const id = action.payload;
      state.items = state.items.filter(it => !(it._id === id || it.backendId === id || it.productId === id || it.id === id));
      state.subtotal = calcSubtotal(state.items);
      state.totalAmount = state.subtotal;
      
      // Save to localStorage for guest users
      if (state.isGuest) {
        saveGuestCart({ items: state.items, totalAmount: state.totalAmount });
      }
    },
    setCartItems(state, action) {
      const items = normalizeAndEnsureUniqueKeys(action.payload || [], false);
      state.items = items;
      state.subtotal = calcSubtotal(items);
      state.totalAmount = state.subtotal;
    },
    forceRefresh(state) {
      // This action triggers a cart refresh from server
      state.loading = true;
      state.error = null;
      console.log('🔄 Force refreshing cart due to sync issues...');
    },
  },
  extraReducers: (b) => {
    const pending = s => { s.loading = true; s.error = null; };
    const rejected = (s, { payload }) => { s.loading = false; s.error = payload; toast.error(String(payload)); };
    const fulfilled = (s, { payload }) => {
      s.loading = false;
      const rawItems = (payload && payload.items) ? payload.items : [];
      
      console.log('🛒 Cart updated:', {
        itemCount: rawItems.length,
        isGuest: !!payload?.isGuest,
        isBackendCart: !payload?.isGuest
      });
      
      const items = normalizeAndEnsureUniqueKeys(rawItems, !payload?.isGuest);
      
      s.items = items;
      s.subtotal = calcSubtotal(items);
      s.totalAmount = payload?.totalAmount ?? s.subtotal;
      s.isGuest = !!payload?.isGuest;
    };

    b.addCase(fetchCart.pending, pending).addCase(fetchCart.fulfilled, fulfilled).addCase(fetchCart.rejected, rejected);
    b.addCase(addItem.pending, pending).addCase(addItem.fulfilled, fulfilled).addCase(addItem.rejected, rejected);
    b.addCase(updateItemQty.pending, pending).addCase(updateItemQty.fulfilled, fulfilled).addCase(updateItemQty.rejected, rejected);
    b.addCase(removeItem.pending, pending).addCase(removeItem.fulfilled, fulfilled).addCase(removeItem.rejected, rejected);
    b.addCase(clearCart.pending, pending).addCase(clearCart.fulfilled, fulfilled).addCase(clearCart.rejected, rejected);
  },
});

export const { clearCartState, updateLocalItem, removeLocalItem, setCartItems, forceRefresh } = slice.actions;
export default slice.reducer;
