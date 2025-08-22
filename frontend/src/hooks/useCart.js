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
} from "../features/cart/cartSlice.js";

/**
 * useCart - uses the cart slice and ensures API calls use the cart-item subdocument id when available.
 */
export default function useCart() {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart || { items: [], subtotal: 0, loading: false, isGuest: false });

  const refresh = useCallback(async () => {
    try {
      await dispatch(fetchCart()).unwrap();
    } catch (err) {
      // fetchCart handles toasts
    }
  }, [dispatch]);

  const add = useCallback(async ({ productId, quantity = 1, price = 0, product = null } = {}) => {
    try {
      await dispatch(addItem({ productId, quantity, price, product })).unwrap();
      await dispatch(fetchCart()).unwrap();
    } catch (err) {
      // handled in thunk
    }
  }, [dispatch]);

  const update = useCallback(async (uiId, quantity) => {
    // optimistic UI
    dispatch(updateLocalItem({ id: uiId, quantity }));

    const item = (cart.items || []).find(
      (it) => it._id === uiId || it.backendId === uiId || it.productId === uiId || it.id === uiId
    );

    // prefer the cart subdocument id (backendId/_id). fallback to product id only if necessary.
    const apiId = item?.backendId ?? item?._id ?? item?.product?._id ?? item?.productId ?? uiId;

    // debug info (remove in production)
    // eslint-disable-next-line no-console
    console.debug("Cart update - uiId:", uiId, "apiId:", apiId, "item:", item);

    try {
      const res = await dispatch(updateItemQty({ id: apiId, quantity })).unwrap();
      // if server returned authoritative items, apply them; otherwise refetch
      const serverItems = res?.items ?? res?.cartItems ?? res ?? null;
      if (Array.isArray(serverItems) && serverItems.length) {
        dispatch(setCartItems(serverItems));
      } else {
        await dispatch(fetchCart()).unwrap();
      }
    } catch (err) {
      // rollback to authoritative state
      await dispatch(fetchCart());
    }
  }, [dispatch, cart.items]);

  const remove = useCallback(async (uiId) => {
    // optimistic UI remove
    dispatch(removeLocalItem(uiId));

    const item = (cart.items || []).find(
      (it) => it._id === uiId || it.backendId === uiId || it.productId === uiId || it.id === uiId
    );
    const apiId = item?.backendId ?? item?._id ?? item?.product?._id ?? item?.productId ?? uiId;

    // eslint-disable-next-line no-console
    console.debug("Cart remove - uiId:", uiId, "apiId:", apiId, "item:", item);

    try {
      const res = await dispatch(removeItem(apiId)).unwrap();
      const serverItems = res?.items ?? res?.cartItems ?? res ?? null;
      if (Array.isArray(serverItems) && serverItems.length) {
        dispatch(setCartItems(serverItems));
      } else {
        await dispatch(fetchCart()).unwrap();
      }
    } catch (err) {
      await dispatch(fetchCart());
    }
  }, [dispatch, cart.items]);

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
  };
}