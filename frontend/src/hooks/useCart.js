import { useDispatch, useSelector } from "react-redux";
import { addItem, fetchCart, removeItem, updateItemQty, clearCart } from "../features/cart/cartSlice.js";

export default function useCart() {
  const dispatch = useDispatch();
  const { items, subtotal, totalAmount, loading, isGuest } = useSelector((s) => s.cart);
  
  return {
    items, 
    subtotal, 
    totalAmount,
    loading, 
    isGuest,
    refresh: () => dispatch(fetchCart()),
    add: (productId, quantity = 1, price = 0, reviewData = null) => dispatch(addItem({ productId, quantity, price, reviewData })),
    update: (id, quantity) => dispatch(updateItemQty({ id, quantity })),
    remove: (id) => dispatch(removeItem(id)),
    clear: () => dispatch(clearCart())
  };
}
