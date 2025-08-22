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
        toast.success("Payment successful! Your order has been placed.");

        // Clear cart state immediately
        dispatch(clearCart());

        // Also clear cart from backend/localStorage
        dispatch(clearCart());

        // Small delay to ensure state updates before navigation
        setTimeout(() => {
          navigate(`/order-confirmation/${currentOrderId}`);
        }, 500);
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
    <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Delivery Details</h2>
        <div className="grid grid-cols-1 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Address"
            value={shipping.address}
            onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="City"
            value={shipping.city}
            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Postal Code"
            value={shipping.postalCode}
            onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Country"
            value={shipping.country}
            onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
          />
        </div>

        {!clientSecret ? (
          <Button
            className="mt-4 w-full"
            onClick={createIntent}
            loading={loading}
            disabled={!items.length || !shipping.address || !shipping.city || !shipping.postalCode || !shipping.country}
          >
            Proceed to Payment
          </Button>
        ) : (
          <>
            <div className="mt-4">
              <CardElement options={{ hidePostalCode: true }} />
            </div>
            <Button
              className="mt-4 w-full"
              onClick={pay}
              loading={isProcessing || loading}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Pay ${formatCurrency(total)}`}
            </Button>
          </>
        )}
      </div>

      <div className="bg-white border rounded-xl p-4 h-fit">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item._id || item.id || item.productId} className="flex justify-between">
              <span>{item.product?.name || "Product"} x {item.quantity}</span>
              <span>{formatCurrency((item.product?.price || item.price) * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between">
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
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
