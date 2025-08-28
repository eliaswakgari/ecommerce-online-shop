// src/pages/cart/CartPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useCart from "../../hooks/useCart.js";
import formatCurrency from "../../utils/formatCurrency.js";
import Button from "../../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../auth/authSlice.js";
import { clearCart } from "./cartSlice.js";
import { toast } from "react-toastify";

export default function CartPage() {
  const { items, subtotal, loading, isGuest, refresh, update, remove } = useCart();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qtys, setQtys] = useState({});

  useEffect(() => {
    refresh();
    if (!isGuest) dispatch(getProfile());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = {};
    (items || []).forEach((it) => {
      // Use the most reliable ID available
      const id = it._id || it.backendId || it.productId;
      if (id) {
        map[id] = Number(it.quantity || 1);
      }
    });
    setQtys(map);
  }, [items]);

  const handleQtyChange = (id, value) => {
    setQtys((prev) => ({ ...prev, [id]: Math.max(1, Number(value || 1)) }));
  };

  const handleUpdate = async (id) => {
    if (isGuest) {
      toast.info("Sign in to update cart items.");
      return;
    }

    const newQty = Number(qtys[id] || 1);
    if (newQty <= 0) return;

    const item = (items || []).find(
      (it) => it._id === id || it.backendId === id || it.productId === id
    );

    if (!item) {
      console.error("Cannot find item to update", id);
      toast.error("Failed to update cart item.");
      return;
    }

    console.log('🔄 Updating cart item:', {
      uiId: id,
      item: {
        _id: item._id,
        backendId: item.backendId,
        productId: item.productId,
        name: item.product?.name
      },
      newQuantity: newQty
    });

    try {
      await update(id, newQty);
      toast.success(`Updated quantity for "${item.product?.name || "Product"}"`); 
    } catch (e) {
      console.error("Update failed", e);
      
      if (e.response?.status === 404 || e.message?.includes('not found')) {
        toast.error("This item is no longer in your cart. Cart refreshed.");
      } else {
        toast.error("Failed to update cart item.");
      }
      
      // Restore original quantity on error
      setQtys((prev) => ({ ...prev, [id]: item.quantity }));
    }
  };

  const handleRemove = async (id) => {
    if (isGuest) {
      toast.info("Sign in to remove items from your cart.");
      return;
    }

    if (!window.confirm("Remove this item from your cart?")) return;

    const item = (items || []).find(
      (it) => it._id === id || it.backendId === id || it.productId === id
    );

    if (!item) {
      console.error("Cannot find item to remove", id);
      toast.error("Failed to remove cart item.");
      return;
    }

    try {
      await remove(id);
      toast.success(`Removed "${item.product?.name || "Product"}" from cart`);
    } catch (e) {
      console.error("Remove failed", e);
      
      if (e.response?.status === 404 || e.message?.includes('not found')) {
        toast.error("This item was already removed. Cart refreshed.");
      } else {
        toast.error("Failed to remove cart item.");
      }
    }
  };

  const handleCheckout = () => {
    if (isGuest) {
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      navigate("/checkout");
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) return;
    
    try {
      await dispatch(clearCart()).unwrap();
      toast.success("Cart cleared successfully");
    } catch (e) {
      console.error("Clear cart failed", e);
      toast.error("Failed to clear cart");
    }
  };

  return (
    <div className="space-mobile-y">
      {/* Mobile-first responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="card-responsive">
            {/* Cart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <h1 className="text-responsive-3xl font-bold text-gray-900">Shopping Cart</h1>
              {items && items.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 hover:border-red-400 rounded-lg transition-colors self-start sm:self-auto touch-target"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Guest Notice */}
            {isGuest && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
                <p className="text-sm sm:text-base text-blue-800">
                  You're shopping as a guest.
                  <button
                    onClick={() => navigate("/login", { state: { from: "/cart" } })}
                    className="ml-1 underline font-medium hover:text-blue-900 transition-colors"
                  >
                    Sign in
                  </button>{" "}
                  to save your cart and checkout.
                </p>
              </div>
            )}

            {/* Cart Items List */}
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center">
                  <div className="spinner mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your cart...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {(!items || items.length === 0) ? (
                  <div className="text-center py-8 sm:py-12 lg:py-16">
                    <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">🛒</div>
                    <h3 className="text-responsive-xl font-semibold text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-responsive-base text-gray-500 mb-6">
                      Discover amazing products and add them to your cart
                    </p>
                    <button
                      onClick={() => navigate('/products')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  items.map((item) => {
                    const id = item._id || item.backendId || item.productId;
                    const image = item.product?.images?.[0] || item.product?.image || "https://via.placeholder.com/100";
                    const name = item.product?.name || "Product";
                    const unitPrice = Number(item.price ?? item.product?.price ?? 0);
                    const qty = Number(qtys[id] ?? item.quantity ?? 1);

                    return (
                      <div key={id} className="border rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
                        {/* Mobile Layout: Stack vertically */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0 mx-auto sm:mx-0">
                            <img 
                              src={image} 
                              alt={name} 
                              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-cover rounded-lg" 
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 space-y-2 sm:space-y-3 text-center sm:text-left">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg">{name}</h3>
                              <p className="text-xs sm:text-sm text-gray-500">{formatCurrency(unitPrice)} each</p>
                            </div>

                            {/* Quantity and Actions - Mobile optimized */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <label className="text-xs sm:text-sm text-gray-600 font-medium">Qty:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={qty}
                                  onChange={(e) => handleQtyChange(id, Number(e.target.value))}
                                  className="w-16 sm:w-20 border rounded-lg px-2 py-1 text-center text-sm touch-target"
                                  disabled={isGuest}
                                />
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                {!isGuest && (
                                  <>
                                    <button
                                      onClick={() => handleUpdate(id)}
                                      className="px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors touch-target"
                                    >
                                      Update
                                    </button>
                                    <button
                                      onClick={() => handleRemove(id)}
                                      className="px-3 py-1.5 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors touch-target"
                                    >
                                      Remove
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Price Display */}
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex justify-between items-center text-sm sm:text-base">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-bold text-gray-900">{formatCurrency(unitPrice * qty)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Order Summary Section */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="card-responsive sticky top-20">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

            {/* Summary Details */}
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium text-gray-900">{formatCurrency(10)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal * 0.1)}</span>
              </div>

              <div className="border-t border-gray-200 pt-3 sm:pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                    {formatCurrency(subtotal + 10 + subtotal * 0.1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="mt-6 sm:mt-8">
              <Button 
                className="w-full py-3 sm:py-4 text-base sm:text-lg font-medium" 
                onClick={handleCheckout} 
                disabled={!items || items.length === 0 || loading}
              >
                {isGuest ? "Sign in to Checkout" : "Proceed to Checkout"}
              </Button>

              {isGuest && items && items.length > 0 && (
                <p className="text-xs sm:text-sm text-gray-500 mt-3 text-center">
                  Your cart will be saved when you sign in.
                </p>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free shipping on orders over $50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
