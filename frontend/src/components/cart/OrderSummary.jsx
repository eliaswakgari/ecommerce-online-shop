import React from "react";
import { useSelector } from "react-redux";

export default function OrderSummary() {
  const { items } = useSelector((s) => s.cart || { items: [] });

  const subtotal = items.reduce((acc, it) => {
    const price = Number(it.price ?? it.product?.price ?? 0) || 0;
    const qty = Number(it.quantity ?? it.qty ?? 0) || 0;
    return acc + price * qty;
  }, 0);

  const shipping = items.length ? 10 : 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  return (
    <div className="order-summary">
      <div>Subtotal: ${subtotal.toFixed(2)}</div>
      <div>Shipping: ${shipping.toFixed(2)}</div>
      <div>Tax: ${tax.toFixed(2)}</div>
      <hr />
      <div>Total: ${total.toFixed(2)}</div>
    </div>
  );
}