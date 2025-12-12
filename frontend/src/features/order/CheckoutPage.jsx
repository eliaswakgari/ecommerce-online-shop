import React, { useEffect, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button.jsx";
import { placeOrder, clearPaymentState } from "./orderSlice.js";
import { clearCart} from "../cart/cartSlice.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCart from "../../hooks/useCart.js";
import formatCurrency from "../../utils/formatCurrency.js";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { clientSecret, currentOrderId, loading } = useSelector((s) => s.order);
  const { items, subtotal, isGuest, refresh } = useCart();

  const [shipping, setShipping] = useState({ address: "", city: "", postalCode: "", country: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    refresh();
    dispatch(clearPaymentState());
  }, []);

  // Redirect guest users to login
  useEffect(() => {
    if (isGuest) {
      toast.error("Please sign in to checkout");
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [isGuest, navigate]);

  const createIntent = async () => {
    if (!shipping.address) return toast.error("Enter shipping address");
    if (!shipping.city) return toast.error("Enter city");
    if (!shipping.postalCode) return toast.error("Enter postal code");
    if (!shipping.country) return toast.error("Enter country");

    const res = await dispatch(placeOrder({ shippingAddress: shipping, paymentMethod: "card" }));
    if (res.meta.requestStatus === "rejected") return;
    toast.success("Payment ready. Enter card info below.");
  };

  const pay = async () => {
    if (!stripe || !elements) return;
    if (!clientSecret) return toast.error("Please create payment first");

    setIsProcessing(true);

    try {
      const card = elements.getElement(CardElement);
      if (!card) {
        toast.error("Card element not found. Please refresh the page.");
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        console.log('💳 Payment successful:', {
          paymentIntentId: result.paymentIntent.id,
          status: result.paymentIntent.status,
          orderId: currentOrderId
        });
        
        toast.success("Payment successful! Confirming order...");

        // Immediate fallback confirmation for dev environments
        try {
          console.log('🔄 Attempting fallback payment confirmation...');
          const confirmResponse = await fetch('/api/orders/confirm-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              paymentIntentId: result.paymentIntent.id,
              orderId: currentOrderId
            })
          });
          
          if (confirmResponse.ok) {
            const confirmData = await confirmResponse.json();
            console.log('✅ Payment confirmation successful:', confirmData);
            toast.success('Payment confirmed! Order status updated.');
          } else {
            const errorData = await confirmResponse.json();
            console.log('⚠️ Fallback confirmation failed:', errorData);
            toast.success('Payment successful! Order being processed...');
          }
        } catch (confirmError) {
          console.log('⚠️ Payment confirmation error:', confirmError);
          toast.success('Payment successful! Order being processed...');
        }

        // Clear cart state immediately
        dispatch(clearCart());

        // Small delay to ensure confirmation completes
        setTimeout(() => {
          navigate(`/order-confirmation/${currentOrderId}`);
        }, 2000); // Increased delay for better UX
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const total = subtotal + 10 + subtotal * 0.1;

  if (isGuest) {
    return null; // Will redirect to login
  }

  return (
    <div className="space-mobile-y">
      {/* Page Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-responsive-3xl font-bold text-gray-900 mb-2">
          Secure Checkout
        </h1>
        <p className="text-responsive-base text-gray-600">
          Complete your order securely and quickly
        </p>
      </div>

      {/* Mobile-First Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Delivery Details Section */}
        <div className="order-2 lg:order-1">
          <div className="card-responsive">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-responsive-2xl font-bold text-gray-900">Delivery Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-3 sm:py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base touch-target"
                  placeholder="Enter your street address"
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-3 sm:py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base touch-target"
                    placeholder="Enter city"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-3 sm:py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base touch-target"
                    placeholder="Enter postal code"
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-3 sm:py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base touch-target"
                  placeholder="Enter country"
                  value={shipping.country}
                  onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                />
              </div>
            </div>

            {/* Payment Section */}
            {!clientSecret ? (
              <div className="mt-6 sm:mt-8">
                <Button
                  className="w-full py-3 sm:py-4 text-base sm:text-lg font-medium"
                  onClick={createIntent}
                  loading={loading}
                  disabled={!items.length || !shipping.address || !shipping.city || !shipping.postalCode || !shipping.country}
                >
                  {loading ? "Preparing Payment..." : "Proceed to Payment"}
                </Button>
              </div>
            ) : (
              <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Payment Information</h3>
                  </div>
                  <div className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all duration-300">
                    <CardElement 
                      options={{ 
                        hidePostalCode: true,
                        style: {
                          base: {
                            fontSize: window.innerWidth < 640 ? '14px' : '16px',
                            color: '#374151',
                            fontFamily: '"Inter", sans-serif',
                            '::placeholder': {
                              color: '#9CA3AF',
                            },
                          },
                        },
                      }} 
                    />
                  </div>
                </div>
                
                <Button
                  className="w-full py-3 sm:py-4 text-base sm:text-lg font-medium bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  onClick={pay}
                  loading={isProcessing || loading}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </div>
                  ) : (
                    `Complete Payment ${formatCurrency(total)}`
                  )}
                </Button>
                
                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="order-1 lg:order-2">
          <div className="card-responsive sticky top-20">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-responsive-2xl font-bold text-gray-900">Order Summary</h2>
            </div>
            
            {/* Cart Items */}
            <div className="space-y-3 sm:space-y-4 mb-6">
              {items.map((item) => {
                const itemTotal = (item.product?.price || item.price) * item.quantity;
                return (
                  <div key={item._id || item.id || item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img 
                      src={item.product?.images?.[0]?.url || item.product?.image || "https://via.placeholder.com/60"}
                      alt={item.product?.name || "Product"}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-1">
                        {item.product?.name || "Product"}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Qty: {item.quantity} × {formatCurrency(item.product?.price || item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">
                        {formatCurrency(itemTotal)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Price Breakdown */}
            <div className="space-y-3 text-sm sm:text-base">
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
              
              <div className="border-t-2 border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-lg sm:text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free returns within 30 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>2-3 business days delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
