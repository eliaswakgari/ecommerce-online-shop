import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  addItem,
  updateItemQty,
  removeItem,
  updateLocalItem,
  removeLocalItem,
  setCartItems,
  clearCart,
} from "../features/cart/cartSlice.js";
import { toast } from "react-toastify";
import hotToast from "react-hot-toast";

/**
 * useCart - handles both guest cart (localStorage) and backend cart.
 */
export default function useCart() {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart || { items: [], subtotal: 0, loading: false, isGuest: false });

  const refresh = useCallback(async () => {
    try {
      await dispatch(fetchCart()).unwrap();
    } catch (err) {
      console.error("Failed to refresh cart", err);
    }
  }, [dispatch]);

  const add = useCallback(async ({ productId, quantity = 1, price = 0, product = null } = {}) => {
    console.log('🛒 useCart.add called:', { productId, quantity, price, isGuest: cart.isGuest });
    
    try {
      await dispatch(addItem({ productId, quantity, price, product })).unwrap();
      console.log('✅ Item added successfully, refreshing cart...');
      await dispatch(fetchCart()).unwrap();
      console.log('✅ Cart refreshed after adding item');
    } catch (err) {
      console.error('❌ Failed to add item', err);
      throw err;
    }
  }, [dispatch]);

  const update = useCallback(async (uiId, quantity) => {
    if (quantity <= 0) {
      console.error("Quantity must be positive");
      return;
    }

    console.log('🔄 useCart.update called:', { uiId, quantity, isGuest: cart.isGuest });

    const item = (cart.items || []).find(
      (it) => it._id === uiId || it.backendId === uiId || it.productId === uiId
    );
    
    if (!item) {
      console.error("❌ Item not found for update:", uiId);
      console.log('Available items:', cart.items.map(it => ({ _id: it._id, backendId: it.backendId, productId: it.productId })));
      // Try refreshing cart to get latest state
      await dispatch(fetchCart()).unwrap();
      return;
    }

    console.log('✅ Found item to update:', {
      _id: item._id,
      backendId: item.backendId,
      productId: item.productId,
      productName: item.product?.name,
      isGuest: cart.isGuest
    });

    // For guest users, handle locally
    if (cart.isGuest) {
      console.log('👤 Guest user - updating locally');
      dispatch(updateLocalItem({ id: uiId, quantity }));
      return;
    }

    // For authenticated users, we need the cart item ID (MongoDB subdocument _id)
    const cartItemId = item.backendId || item._id;
    
    if (!cartItemId) {
      console.error("❌ No cart item ID found for authenticated user. Item:", item);
      await dispatch(fetchCart()).unwrap();
      return;
    }

    // For generated backend IDs (when MongoDB _id is missing), use productId for API calls
    const apiId = cartItemId.startsWith('backend-') ? item.productId : cartItemId;
    
    console.log('🔐 Authenticated user - updating cart item:', {
      uiId,
      cartItemId,
      apiId,
      productId: item.productId
    });

    try {
      // Update on server using the appropriate ID
      await dispatch(updateItemQty({ id: apiId, quantity })).unwrap();
      
      console.log('✅ Successfully updated on server');
    } catch (err) {
      console.error("❌ Failed to update item on server", err);
      
      // If it's a 404 error (item not found), the cart is out of sync
      if (err.message?.includes('not found') || err.response?.status === 404) {
        console.warn('⚠️ Cart appears to be out of sync with server. Refreshing...');
        hotToast.error('Cart was updated elsewhere. Refreshing cart...');
      }
      
      // Always refresh from server to get the correct state
      await dispatch(fetchCart()).unwrap();
      throw err;
    }
  }, [dispatch, cart.items, cart.isGuest]);

  const remove = useCallback(async (uiId) => {
    console.log('🗑️ useCart.remove called with uiId:', uiId);
    
    const item = (cart.items || []).find(
      (it) => it._id === uiId || it.backendId === uiId || it.productId === uiId || it.id === uiId
    );
    if (!item) {
      console.error("❌ Item not found for removal:", uiId);
      console.log('Available items:', cart.items.map(it => ({
        _id: it._id,
        backendId: it.backendId,
        productId: it.productId,
        id: it.id
      })));
      return;
    }

    console.log('✅ Found item to remove:', {
      item: {
        _id: item._id,
        backendId: item.backendId,
        productId: item.productId,
        id: item.id,
        productName: item.product?.name
      },
      isGuest: cart.isGuest
    });

    // For guest users, handle locally
    if (cart.isGuest) {
      console.log('👤 Guest user - removing locally');
      dispatch(removeLocalItem(uiId));
      return;
    }

    // For authenticated users, we need the cart item ID (not product ID)
    const cartItemId = item.backendId || item._id;
    if (!cartItemId) {
      console.error("❌ No cart item ID found for authenticated user. Item:", item);
      await dispatch(fetchCart()).unwrap();
      return;
    }

    // For generated backend IDs (when MongoDB _id is missing), use productId for API calls
    const apiId = cartItemId.startsWith('backend-') ? item.productId : cartItemId;
    
    console.log('🔐 Authenticated user - removing from server:', {
      uiId,
      cartItemId,
      apiId,
      productId: item.productId
    });

    try {
      console.log('📤 Making API call to remove cart item...');
      // Remove from server using the appropriate ID
      await dispatch(removeItem(apiId)).unwrap();
      
      console.log('✅ Successfully removed from server');
    } catch (err) {
      console.error("❌ Failed to remove item from server", err);
      
      // If it's a 404 error (item not found), the cart is out of sync
      if (err.message?.includes('not found') || err.response?.status === 404) {
        console.warn('⚠️ Cart appears to be out of sync with server. Refreshing...');
        hotToast.error('Cart was updated elsewhere. Refreshing cart...');
      }
      
      // Refresh from server to restore correct state
      await dispatch(fetchCart()).unwrap();
      throw err;
    }
  }, [dispatch, cart.items, cart.isGuest]);

  const clear = useCallback(async () => {
    console.log('🗑️ useCart.clear called');
    try {
      await dispatch(clearCart()).unwrap();
      console.log('✅ Cart cleared successfully');
    } catch (err) {
      console.error('❌ Failed to clear cart', err);
      throw err;
    }
  }, [dispatch]);

  return {
    items: cart.items,
    subtotal: cart.subtotal,
    totalAmount: cart.totalAmount,
    loading: cart.loading,
    error: cart.error,
    isGuest: cart.isGuest,
    refresh,
    add,
    update,
    remove,
    clear,
  };
}