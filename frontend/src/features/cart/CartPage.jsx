import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useCart from "../../hooks/useCart.js";
import formatCurrency from "../../utils/formatCurrency.js";
import Button from "../../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../auth/authSlice.js";

export default function CartPage() {
  const { items, subtotal, loading, isGuest, refresh, update, remove } = useCart();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qtys, setQtys] = useState({});

  useEffect(() => {
    refresh();
    if (!isGuest) {
      dispatch(getProfile());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = {};
    (items || []).forEach((it) => {
      const id = it.keyForReact || it._id || it.productId;
      map[id] = Number(it.quantity || 1);
    });
    setQtys(map);
  }, [items]);

  const handleQtyChange = (id, value) => {
    setQtys((prev) => ({ ...prev, [id]: Math.max(1, Number(value || 1)) }));
  };

  const handleUpdate = async (id) => {
    const newQty = Number(qtys[id] || 1);
    if (newQty <= 0) return;
    // Find item by keyForReact then use backendId/productId for API
    const item = (items || []).find((it) => (it.keyForReact === id || it._id === id || it.productId === id));
    const apiId = (item && item.backendId) ? item.backendId : (item && item.productId ? item.productId : id);
    try {
      await update(apiId, newQty);
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this item from your cart?")) return;
    const item = (items || []).find((it) => (it.keyForReact === id || it._id === id || it.productId === id));
    const apiId = (item && item.backendId) ? item.backendId : (item && item.productId ? item.productId : id);
    try {
      await remove(apiId);
    } catch (e) {
      console.error("Remove failed", e);
    }
  };

  const handleCheckout = () => {
    if (isGuest) {
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 px-4 py-6">
      <div className="lg:col-span-2 bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Cart</h1>

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

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {(!items || items.length === 0) ? (
              <div className="p-6 text-center text-gray-600 rounded border">Your cart is empty.</div>
            ) : (
              items.map((it) => {
                const id = it.keyForReact || it._id || it.productId;
                const image = it.product?.images?.[0] || it.product?.image || "https://via.placeholder.com/100";
                const name = it.product?.name || it._raw?.name || "Product";
                const unitPrice = Number(it.price ?? it.product?.price ?? 0);
                const qty = Number(qtys[id] ?? it.quantity ?? 1);

                return (
                  <div key={id} className="flex items-center gap-4 border rounded-lg p-4">
                    <img src={image} alt={name} className="w-24 h-24 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-semibold">{name}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(unitPrice)} each</div>

                      <div className="mt-3 flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(e) => handleQtyChange(id, Number(e.target.value))}
                          className="w-20 border rounded px-2 py-1"
                        />
                        <Button onClick={() => handleUpdate(id)} className="px-3 py-1">Update</Button>
                        <button onClick={() => handleRemove(id)} className="text-sm text-red-600 hover:text-red-800 ml-2">
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right w-28">
                      <div className="font-medium">{formatCurrency(unitPrice * qty)}</div>
                      <div className="text-xs text-gray-500 mt-1">{qty} item{qty > 1 ? "s" : ""}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <aside className="bg-white border rounded-xl p-6 h-fit">
        <h2 className="font-semibold mb-4">Order Summary</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping:</span>
            <span className="font-medium">{formatCurrency(10)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax (10%):</span>
            <span className="font-medium">{formatCurrency(subtotal * 0.1)}</span>
          </div>

          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(subtotal + 10 + subtotal * 0.1)}</span>
          </div>
        </div>

        <Button className="w-full mt-5" onClick={handleCheckout} disabled={!items || items.length === 0 || loading}>
          {isGuest ? "Sign in to Checkout" : "Proceed to Checkout"}
        </Button>

        {isGuest && items && items.length > 0 && (
          <p className="text-xs text-gray-500 mt-3 text-center">Your cart will be saved when you sign in.</p>
        )}
      </aside>
    </div>
  );
}