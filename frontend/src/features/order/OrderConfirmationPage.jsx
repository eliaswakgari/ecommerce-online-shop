import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchUserOrders } from "./orderSlice.js";
import formatCurrency from "../../utils/formatCurrency.js";
import Button from "../../components/ui/Button.jsx";

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await dispatch(fetchUserOrders());
        if (result.meta.requestStatus === "fulfilled") {
          const foundOrder = result.payload.find(o => o._id === orderId);
          setOrder(foundOrder);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, dispatch]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white border rounded-xl p-6">
        <div className="text-center">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto bg-white border rounded-xl p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find the order you're looking for.</p>
          <Link to="/orders">
            <Button>View My Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-semibold text-green-600 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <h2 className="font-semibold mb-2">Order Details</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Order ID:</span></div>
            <div>{order._id}</div>
            <div><span className="font-medium">Order Date:</span></div>
            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
            <div><span className="font-medium">Status:</span></div>
            <div className="capitalize">{order.status}</div>
            <div><span className="font-medium">Payment Status:</span></div>
            <div className={order.isPaid ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {order.isPaid ? "Paid" : "Pending"}
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="font-semibold mb-2">Shipping Address</h2>
          <div className="text-sm">
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="font-semibold mb-2">Order Items</h2>
          <div className="space-y-2">
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.product?.name || "Product"} x {item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Payment Summary</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.totalPrice - order.shippingPrice - order.taxPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{formatCurrency(order.shippingPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(order.taxPrice)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Total:</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {order.paymentResult && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-semibold mb-1">Payment Information</h3>
            <div className="text-sm text-gray-600">
              <p>Payment ID: {order.paymentResult.id}</p>
              <p>Status: {order.paymentResult.status}</p>
              {order.paymentResult.email_address && (
                <p>Email: {order.paymentResult.email_address}</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• You'll receive an email confirmation shortly</li>
            <li>• We'll notify you when your order ships</li>
            <li>• You can track your order status in your account</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Link to="/products" className="flex-1">
            <Button className="w-full" variant="outline">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/orders" className="flex-1">
            <Button className="w-full">
              View My Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
