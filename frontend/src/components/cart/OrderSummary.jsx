import React from "react";
import { useSelector } from "react-redux";
import formatCurrency from "../../utils/formatCurrency.js";

export default function OrderSummary() {
  const cart = useSelector((s) => s.cart || { items: [], subtotal: 0 });
  const { items, subtotal } = cart;

  // Calculate subtotal if not provided by the cart state
  const calculatedSubtotal = subtotal || items.reduce((acc, it) => {
    const price = Number(it.price ?? it.product?.price ?? 0) || 0;
    const qty = Number(it.quantity ?? it.qty ?? 0) || 0;
    return acc + (price * qty);
  }, 0);

  const shipping = items.length ? 10 : 0;
  const tax = calculatedSubtotal * 0.1;
  const total = calculatedSubtotal + shipping + tax;

  return (
    <div className="order-summary space-y-3 text-sm">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span className="font-medium">{formatCurrency(calculatedSubtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Shipping:</span>
        <span className="font-medium">{formatCurrency(shipping)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax (10%):</span>
        <span className="font-medium">{formatCurrency(tax)}</span>
      </div>
      <div className="border-t pt-3 flex justify-between font-semibold">
        <span>Total:</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}