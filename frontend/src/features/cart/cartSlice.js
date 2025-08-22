import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addToCartApi, getCartApi, removeCartItemApi, updateCartItemApi, clearCartApi } from "../../api/cartApi.js";
import toast from "react-hot-toast";

// Guest cart localStorage key
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

/**
 * Normalizes incoming cart items (from server or guest store) and ensures unique keys.
 */
const normalizeAndEnsureUniqueKeys = (rawItems = []) => {
  const normalized = rawItems.map((raw, idx) => {
    const backendId = raw._id ?? raw.id ?? raw.backendId ?? null;
    const productObj = raw.product ?? raw.productDetail ?? null;
    const productId = raw.productId ?? (productObj && (productObj._id || productObj.id)) ?? null;
    const price = Number(raw.price ?? (productObj && productObj.price) ?? raw.unitPrice ?? 0) || 0;
    const quantity = Number(raw.quantity ?? raw.qty ?? raw.count ?? 0) || 0;

    const keyForReact = backendId ? String(backendId) : (productId ? `${productId}-${idx}` : `tmp-${idx}-${Date.now()}`);

    return {
      _raw: raw,
      backendId,
      productId,
      product: productObj,
      price,
      quantity,
      keyForReact,
    };
  });

  const mergedBy = new Map();
  normalized.forEach((it) => {
    const mergeKey = it.backendId ? `b:${it.backendId}` : (it.productId ? `p:${it.productId}` : `k:${it.keyForReact}`);
    if (mergedBy.has(mergeKey)) {
      const existing = mergedBy.get(mergeKey);
      existing.quantity = existing.quantity + it.quantity;
      existing._raw = existing._raw && existing._raw.concat ? existing._raw.concat(it._raw) : existing._raw;
    } else {
      mergedBy.set(mergeKey, { ...it });
    }
  });

  const items = Array.from(mergedBy.values()).map((it, idx) => {
    const _id = it.backendId ?? it.productId ?? `tmp-${idx}`;
    return {
      _id,
      backendId: it.backendId,
      productId: it.productId,
      product: it.product,
      price: it.price,
      quantity: it.quantity,
      keyForReact: it.backendId ? String(it.backendId) : `${it.productId ?? "tmp"}-${idx}`,
      _raw: it._raw,
    };
  });

  const seen = new Map();
  items.forEach((it, index) => {
    let k = it.keyForReact;
    if (seen.has(k)) {
      let count = seen.get(k) + 1;
      seen.set(k, count);
      k = `${k}-${count}`;
      it.keyForReact = k;
    } else {
      seen.set(k, 0);
    }
  });

  return items;
};

const calcSubtotal = (items = []) =>
  items.reduce((sum, it) => sum + Number(it.price || (it.product && it.product.price) || 0) * Number(it.quantity || 0), 0);

export const fetchCart = createAsyncThunk("cart/fetch", async (_, thunkAPI) => {
  const { auth } = thunkAPI.getState();

  if (!auth || !auth.user) {
    const guestCart = getGuestCart();
    return { items: guestCart.items || [], totalAmount: guestCart.totalAmount || 0, isGuest: true };
  }

  try {
    const { data } = await getCartApi();
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
      guestCart.items.push({
        productId: payload.productId,
        quantity: payload.quantity,
        price: payload.price || 0,
        totalPrice: (payload.price || 0) * payload.quantity,
      });
    }
    guestCart.totalAmount = guestCart.items.reduce((s, it) => s + (it.totalPrice || it.price * it.quantity || 0), 0);
    saveGuestCart(guestCart);
    toast.success("Added to cart");
    return { items: guestCart.items, totalAmount: guestCart.totalAmount, isGuest: true };
  }

  try {
    const apiPayload = { productId: payload.productId, quantity: payload.quantity };
    if (payload.reviewData) apiPayload.reviewData = payload.reviewData;
    const { data } = await addToCartApi(apiPayload);
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
      const idx = state.items.findIndex(
        (it) => it._id === id || it.backendId === id || it.productId === id || it.id === id
      );
      if (idx >= 0) {
        state.items[idx].quantity = quantity;
        state.subtotal = calcSubtotal(state.items);
        state.totalAmount = state.subtotal;
        saveGuestCart({ items: state.items, totalAmount: state.totalAmount });
      }
    },

    removeLocalItem(state, action) {
      const id = action.payload;
      state.items = state.items.filter(
        (it) => !(it._id === id || it.backendId === id || it.productId === id || it.id === id)
      );
      state.subtotal = calcSubtotal(state.items);
      state.totalAmount = state.subtotal;
      saveGuestCart({ items: state.items, totalAmount: state.totalAmount });
    },

    setCartItems(state, action) {
      const items = normalizeAndEnsureUniqueKeys(action.payload || []);
      state.items = items;
      state.subtotal = calcSubtotal(items);
      state.totalAmount = state.subtotal;
    },
  },
  extraReducers: (b) => {
    const pending = (s) => {
      s.loading = true;
      s.error = null;
    };
    const rejected = (s, { payload }) => {
      s.loading = false;
      s.error = payload;
      toast.error(String(payload));
    };
    const fulfilled = (s, { payload }) => {
      s.loading = false;
      const rawItems = (payload && payload.items) ? payload.items : [];
      const items = normalizeAndEnsureUniqueKeys(rawItems);

      s.items = items;
      s.subtotal = calcSubtotal(items);
      s.totalAmount = payload && payload.totalAmount ? payload.totalAmount : s.subtotal;
      s.isGuest = !!(payload && payload.isGuest);
    };

    b.addCase(fetchCart.pending, pending).addCase(fetchCart.fulfilled, fulfilled).addCase(fetchCart.rejected, rejected);
    b.addCase(addItem.pending, pending).addCase(addItem.fulfilled, fulfilled).addCase(addItem.rejected, rejected);
    b.addCase(updateItemQty.pending, pending).addCase(updateItemQty.fulfilled, fulfilled).addCase(updateItemQty.rejected, rejected);
    b.addCase(removeItem.pending, pending).addCase(removeItem.fulfilled, fulfilled).addCase(removeItem.rejected, rejected);
    b.addCase(clearCart.pending, pending).addCase(clearCart.fulfilled, fulfilled).addCase(clearCart.rejected, rejected);
  },
});

export const { clearCartState, updateLocalItem, removeLocalItem, setCartItems } = slice.actions;
export default slice.reducer;
