import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import useCart from "../../hooks/useCart.js";
import formatCurrency from "../../utils/formatCurrency.js";
import Button from "../../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../auth/authSlice.js";

export default function CartPage() {
  const { items, subtotal, totalAmount, loading, isGuest, refresh, update, remove } = useCart();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    refresh();
    if (!isGuest) {
      dispatch(getProfile());
    }
  }, []);

  const handleCheckout = () => {
    if (isGuest) {
      // Redirect guest users to login with cart preservation
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white border rounded-xl p-4">
        <h1 className="text-xl font-semibold mb-3">Cart</h1>

        {isGuest && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              You're shopping as a guest.
              <button
                onClick={() => navigate("/login", { state: { from: "/cart" } })}
                className="ml-1 underline font-medium"
              >
                Sign in
              </button>
              to save your cart and checkout.
            </p>
          </div>
        )}

        {loading ? "Loading..." : (
          <div className="space-y-3">
            {items.length === 0 && <div>Your cart is empty.</div>}
            {items.map((it) => (
              <div key={it._id || it.id || it.productId} className="flex items-center gap-4 border rounded-lg p-3">
                <img src={it.product?.images?.[0] || "https://via.placeholder.com/100"} alt="" className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-semibold">{it.product?.name || "Product"}</div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(it.product?.price || it.price)} each
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => update(it._id || it.id || it.productId, Number(e.target.value))}
                      className="w-20 border rounded px-2 py-1"
                    />
                    <button
                      onClick={() => remove(it._id || it.id || it.productId)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency((it.product?.price || it.price) * it.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border rounded-xl p-4 h-fit">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>{formatCurrency(10)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{formatCurrency(subtotal * 0.1)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(subtotal + 10 + subtotal * 0.1)}</span>
          </div>
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleCheckout}
          disabled={items.length === 0 || loading}
        >
          {isGuest ? "Sign in to Checkout" : "Proceed to Checkout"}
        </Button>

        {isGuest && items.length > 0 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Your cart will be saved when you sign in
          </p>
        )}
      </div>
    </div>
  );
}
