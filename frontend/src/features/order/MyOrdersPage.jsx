import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "./orderSlice.js";
import { Link } from "react-router-dom";
import formatCurrency from "../../utils/formatCurrency.js";

export default function MyOrdersPage() {
         const dispatch = useDispatch();
         const { userOrders, loading } = useSelector((s) => s.order);

         useEffect(() => {
                  dispatch(fetchUserOrders());
         }, [dispatch]);

         const getStatusColor = (status) => {
                  switch (status) {
                           case "pending":
                                    return "text-yellow-600 bg-yellow-100";
                           case "processing":
                                    return "text-blue-600 bg-blue-100";
                           case "shipped":
                                    return "text-purple-600 bg-purple-100";
                           case "delivered":
                                    return "text-green-600 bg-green-100";
                           case "cancelled":
                                    return "text-red-600 bg-red-100";
                           default:
                                    return "text-gray-600 bg-gray-100";
                  }
         };

         if (loading) {
                  return (
                           <div className="max-w-4xl mx-auto bg-white border rounded-xl p-6">
                                    <div className="text-center">Loading your orders...</div>
                           </div>
                  );
         }

         return (
                  <div className="max-w-4xl mx-auto bg-white border rounded-xl p-6">
                           <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

                           {userOrders.length === 0 ? (
                                    <div className="text-center py-8">
                                             <div className="text-4xl mb-4">📦</div>
                                             <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                                             <p className="text-gray-600 mb-4">Start shopping to see your orders here.</p>
                                             <Link to="/products" className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                                      Browse Products
                                             </Link>
                                    </div>
                           ) : (
                                    <div className="space-y-4">
                                             {userOrders.map((order) => (
                                                      <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                               <div className="flex justify-between items-start mb-3">
                                                                        <div>
                                                                                 <h3 className="font-semibold">Order #{order._id.slice(-8)}</h3>
                                                                                 <p className="text-sm text-gray-600">
                                                                                          {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                                                                 </p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                                 <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                                                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                                 </div>
                                                                                 <div className="text-lg font-semibold mt-1">
                                                                                          {formatCurrency(order.totalPrice)}
                                                                                 </div>
                                                                        </div>
                                                               </div>

                                                               <div className="space-y-2 mb-3">
                                                                        {order.orderItems.map((item, index) => (
                                                                                 <div key={index} className="flex justify-between text-sm">
                                                                                          <span>{item.product?.name || "Product"} x {item.quantity}</span>
                                                                                          <span>{formatCurrency(item.price * item.quantity)}</span>
                                                                                 </div>
                                                                        ))}
                                                               </div>

                                                               <div className="border-t pt-3 flex justify-between items-center">
                                                                        <div className="text-sm text-gray-600">
                                                                                 <div>Payment: {order.isPaid ? "✅ Paid" : "⏳ Pending"}</div>
                                                                                 {order.isDelivered && <div>Delivery: ✅ Delivered</div>}
                                                                        </div>
                                                                        <Link
                                                                                 to={`/order-confirmation/${order._id}`}
                                                                                 className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                                        >
                                                                                 View Details →
                                                                        </Link>
                                                               </div>
                                                      </div>
                                             ))}
                                    </div>
                           )}
                  </div>
         );
}
