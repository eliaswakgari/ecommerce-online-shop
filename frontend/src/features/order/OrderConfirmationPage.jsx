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
  const [refreshing, setRefreshing] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing order status for order:', orderId);
      const result = await dispatch(fetchUserOrders());
      if (result.meta.requestStatus === "fulfilled") {
        const foundOrder = result.payload.find(o => o._id === orderId);
        setOrder(foundOrder);
        console.log('✅ Order refreshed:', {
          orderId: foundOrder?._id,
          isPaid: foundOrder?.isPaid,
          status: foundOrder?.status,
          paidAt: foundOrder?.paidAt
        });
      }
    } catch (error) {
      console.error("Error refreshing order:", error);
    } finally {
      setRefreshing(false);
    }
  };

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
      <div className="space-mobile-y">
        <div className="card-responsive max-w-2xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-responsive-base text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-mobile-y">
        <div className="card-responsive max-w-2xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">❌</div>
            <h1 className="text-responsive-3xl font-bold text-red-600 mb-4">Order Not Found</h1>
            <p className="text-responsive-base text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
            <Link to="/orders">
              <Button className="px-6 py-3 text-base font-medium">View My Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          /* Hide all page elements except the order content */
          body * {
            visibility: hidden;
          }
          
          /* Show only the printable container and its children */
          .print-container, .print-container * {
            visibility: visible;
          }
          
          /* Hide navbar, footer, and other page elements */
          nav, header, footer, .navbar, .footer {
            display: none !important;
          }
          
          /* Hide elements with no-print class */
          .no-print {
            display: none !important;
          }
          
          /* Position the print container */
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 600px !important;
            margin: 0 auto !important;
            padding: 40px 20px !important;
            border: 2px solid #000 !important;
            border-radius: 8px !important;
            background: white !important;
            font-family: Arial, sans-serif !important;
          }
          
          /* Center the success section */
          .print-success {
            text-align: center;
            margin-bottom: 40px;
          }
          
          /* Green checkmark box */
          .print-checkmark {
            display: inline-block;
            width: 60px;
            height: 60px;
            background-color: #22c55e;
            border: 3px solid #000;
            margin-bottom: 20px;
            position: relative;
          }
          
          .print-checkmark::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 32px;
            font-weight: bold;
          }
          
          /* Order confirmed title */
          .print-confirmed-title {
            font-size: 24px;
            font-weight: bold;
            color: #22c55e;
            margin-bottom: 10px;
          }
          
          /* Thank you message */
          .print-thank-you {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
          }
          
          /* Section titles */
          .print-section-title {
            font-size: 16px;
            font-weight: bold;
            color: #000;
            margin: 30px 0 15px 0;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
          }
          
          /* Order details table layout */
          .print-details-table {
            width: 100%;
            margin-bottom: 20px;
          }
          
          .print-details-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          
          .print-details-label {
            font-weight: bold;
            color: #000;
          }
          
          .print-details-value {
            color: #000;
          }
          
          /* Address styling */
          .print-address {
            line-height: 1.6;
            margin-bottom: 20px;
          }
          
          /* Items styling */
          .print-item-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          
          /* Payment summary */
          .print-payment-summary {
            margin-top: 20px;
          }
          
          .print-summary-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          
          .print-total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-top: 2px solid #000;
            font-weight: bold;
            font-size: 16px;
          }
          
          /* Colors for different statuses */
          .print-status-pending {
            color: #ef4444;
          }
          
          .print-status-paid {
            color: #22c55e;
          }
          
          /* Remove page margins */
          @page {
            margin: 0.5in;
            size: A4;
          }
          
          /* Ensure proper printing */
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
      
      <div className="space-mobile-y">
        <div className="card-responsive max-w-4xl mx-auto print-container">
          {/* Success Section */}
          <div className="text-center mb-6 sm:mb-8 print-success">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 print:hidden">✅</div>
            <div className="print:block hidden print-checkmark"></div>
            <h1 className="text-responsive-3xl font-bold text-green-600 mb-2 print-confirmed-title">Order Confirmed!</h1>
            <p className="text-responsive-base text-gray-600 print-thank-you">Thank you for your purchase. Your order has been successfully placed.</p>
          </div>

          {/* Action Buttons - Hidden during printing */}
          <div className="mb-6 sm:mb-8 no-print flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handlePrint}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base touch-target"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm3-5h.01M9 16h6" />
              </svg>
              Print Order
            </Button>
            <Button 
              onClick={handleRefresh}
              loading={refreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base touch-target"
              variant="outline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? "Refreshing..." : "Refresh Status"}
            </Button>
          </div>

        {/* Payment Status Alert */}
        {!order.isPaid && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 no-print">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Payment Status: Pending</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  If you've completed payment but the status still shows pending, please click "Refresh Status" or wait a few minutes for the payment to process.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Order Details */}
          <div className="bg-gray-50 p-4 sm:p-5 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-responsive-xl font-semibold text-gray-900 print-section-title">Order Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 print-details-table">
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 print-details-row">
                <span className="block text-xs sm:text-sm text-gray-500 mb-1 print-details-label">Order ID</span>
                <span className="block text-sm sm:text-base font-medium text-gray-900 break-all print-details-value">{order._id}</span>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 print-details-row">
                <span className="block text-xs sm:text-sm text-gray-500 mb-1 print-details-label">Order Date</span>
                <span className="block text-sm sm:text-base font-medium text-gray-900 print-details-value">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 print-details-row">
                <span className="block text-xs sm:text-sm text-gray-500 mb-1 print-details-label">Status</span>
                <span className="block text-sm sm:text-base font-medium text-gray-900 capitalize print-details-value">{order.status}</span>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 print-details-row">
                <span className="block text-xs sm:text-sm text-gray-500 mb-1 print-details-label">Payment Status</span>
                <span className={`block text-sm sm:text-base font-semibold flex items-center gap-2 print-details-value ${order.isPaid ? 'text-green-600 print-status-paid' : 'text-red-600 print-status-pending'}`}>
                  {order.isPaid ? "✅ Completed" : "⏳ Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 p-4 sm:p-5 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-responsive-xl font-semibold text-gray-900 print-section-title">Shipping Address</h2>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200">
              <div className="text-sm sm:text-base space-y-1 print-address">
                <p className="font-medium text-gray-900">{order.shippingAddress.address}</p>
                <p className="text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p className="text-gray-700">{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 p-4 sm:p-5 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-responsive-xl font-semibold text-gray-900 print-section-title">Order Items</h2>
            </div>
            <div className="space-y-3">
              {order.orderItems.map((item, index) => (
                <div key={index} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 print-item-row">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {item.product?.images?.[0] && (
                        <img 
                          src={item.product.images[0].url} 
                          alt={item.product.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 no-print"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{item.product?.name || "Product"}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 sm:p-5 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h2 className="text-responsive-xl font-semibold text-gray-900 print-section-title">Payment Summary</h2>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 print-payment-summary">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 print-summary-row">
                  <span className="text-sm sm:text-base text-gray-600">Subtotal:</span>
                  <span className="text-sm sm:text-base font-medium text-gray-900">{formatCurrency(order.totalPrice - order.shippingPrice - order.taxPrice)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 print-summary-row">
                  <span className="text-sm sm:text-base text-gray-600">Shipping:</span>
                  <span className="text-sm sm:text-base font-medium text-gray-900">{formatCurrency(order.shippingPrice)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 print-summary-row">
                  <span className="text-sm sm:text-base text-gray-600">Tax:</span>
                  <span className="text-sm sm:text-base font-medium text-gray-900">{formatCurrency(order.taxPrice)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 print-total-row">
                  <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-base sm:text-lg font-bold text-green-600">{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {order.paymentResult && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-5 rounded-lg sm:rounded-xl border border-green-200 print-section">
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-responsive-lg font-semibold text-green-800">Payment Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base">
                <div>
                  <span className="block text-xs sm:text-sm text-green-600 font-medium mb-1">Payment ID</span>
                  <span className="block text-gray-800 break-all">{order.paymentResult.id}</span>
                </div>
                <div>
                  <span className="block text-xs sm:text-sm text-green-600 font-medium mb-1">Status</span>
                  <span className="block text-gray-800 capitalize font-medium">{order.paymentResult.status}</span>
                </div>
                {order.paymentResult.email_address && (
                  <div className="sm:col-span-2">
                    <span className="block text-xs sm:text-sm text-green-600 font-medium mb-1">Email</span>
                    <span className="block text-gray-800 break-all">{order.paymentResult.email_address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-5 rounded-lg sm:rounded-xl border border-blue-200 no-print">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-responsive-lg font-semibold text-blue-800">What's Next?</h3>
            </div>
            <ul className="text-sm sm:text-base text-blue-700 space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>You'll receive an email confirmation shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>We'll notify you when your order ships</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>You can track your order status in your account</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 no-print">
            <Link to="/products" className="">
              <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105 touch-target" variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Continue Shopping
              </Button>
            </Link>
            <Link to="/orders" className="">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105 touch-target">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View My Orders
              </Button>
            </Link>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
