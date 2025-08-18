import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminGetOrders, adminUpdateOrderStatus } from "../order/orderSlice.js";
import Modal from "../../components/ui/Modal.jsx";
import Button from "../../components/ui/Button.jsx";
import formatCurrency from "../../utils/formatCurrency.js";
import toast from "react-hot-toast";

export default function OrderManagement() {
  const dispatch = useDispatch();
  const { adminOrders } = useSelector(s => s.order);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, orderId: null, currentStatus: "", newStatus: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    dispatch(adminGetOrders());
  }, [dispatch]);

  const openStatusModal = (order) => {
    const validNextStatuses = getValidNextStatuses(order.status);
    setStatusModal({
      open: true,
      orderId: order._id,
      currentStatus: order.status,
      newStatus: validNextStatuses.length > 0 ? validNextStatuses[0] : ""
    });
  };

  const updateStatus = async () => {
    if (!statusModal.newStatus) return;

    setIsUpdatingStatus(true);
    try {
      const result = await dispatch(adminUpdateOrderStatus({
        orderId: statusModal.orderId,
        status: statusModal.newStatus
      })).unwrap();

      // Enhanced status change confirmation toast
      const statusEmoji = getStatusIcon(statusModal.newStatus);
      toast.success(`Order status updated to ${statusModal.newStatus.charAt(0).toUpperCase() + statusModal.newStatus.slice(1)} ${statusEmoji}`, {
        duration: 4000,
        icon: statusEmoji,
      });

      setStatusModal({ open: false, orderId: null, currentStatus: "", newStatus: "" });
      dispatch(adminGetOrders()); // Refresh orders
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(error?.message || "Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "⏳",
      processing: "⚙️",
      shipped: "📦",
      delivered: "✅",
      cancelled: "❌"
    };
    return icons[status] || "❓";
  };

  const getValidNextStatuses = (currentStatus) => {
    const validTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [], // Final state
      cancelled: [] // Final state
    };
    return validTransitions[currentStatus] || [];
  };

  const isFinalState = (status) => {
    return status === "delivered" || status === "cancelled";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getOrderSummary = () => {
    const summary = {
      total: adminOrders.length,
      pending: adminOrders.filter(o => o.status === 'pending').length,
      processing: adminOrders.filter(o => o.status === 'processing').length,
      shipped: adminOrders.filter(o => o.status === 'shipped').length,
      delivered: adminOrders.filter(o => o.status === 'delivered').length,
      cancelled: adminOrders.filter(o => o.status === 'cancelled').length,
      paid: adminOrders.filter(o => o.isPaid).length
    };
    return summary;
  };

  const getFilteredOrders = () => {
    let filtered = adminOrders;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Pagination logic
  const filteredOrders = getFilteredOrders();
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order Management</h1>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{getOrderSummary().total}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{getOrderSummary().pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{getOrderSummary().processing}</div>
          <div className="text-sm text-gray-600">Processing</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{getOrderSummary().shipped}</div>
          <div className="text-sm text-gray-600">Shipped</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{getOrderSummary().delivered}</div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{getOrderSummary().cancelled}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{getOrderSummary().paid}</div>
          <div className="text-sm text-gray-600">Paid</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
            <input
              type="text"
              placeholder="Search by customer name, email, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map(order => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{order._id.slice(-8)}</td>
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{order.user?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.user?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="p-3 font-medium">{formatCurrency(order.totalPrice)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(order.status)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    {order.isPaid && (
                      <div className="text-xs text-green-600 mt-1">✓ Paid</div>
                    )}
                    {order.isDelivered && (
                      <div className="text-xs text-blue-600">✓ Delivered</div>
                    )}
                  </td>
                  <td className="p-3 text-sm">{formatDate(order.createdAt)}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-xs transition-colors ${isFinalState(order.status)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      onClick={() => !isFinalState(order.status) && openStatusModal(order)}
                      disabled={isFinalState(order.status)}
                      title={isFinalState(order.status) ? "Cannot update final status" : "Update status"}
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
              {currentOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    {adminOrders.length === 0 ? "No orders found" : "No orders match your filters"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded text-sm ${currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border hover:bg-gray-50'
                    }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded text-sm ${currentPage === number
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border hover:bg-gray-50'
                      }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded text-sm ${currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border hover:bg-gray-50'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          open={true}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details - ${selectedOrder._id.slice(-8)}`}
          footer={
            <button
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700">Customer Information</h4>
                <p className="text-sm text-gray-600">{selectedOrder.user?.name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.user?.email}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Order Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(selectedOrder.status)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  {selectedOrder.isPaid && (
                    <div className="text-xs text-green-600">✓ Paid on {selectedOrder.paidAt ? new Date(selectedOrder.paidAt).toLocaleDateString() : 'N/A'}</div>
                  )}
                  {selectedOrder.isDelivered && (
                    <div className="text-xs text-blue-600">✓ Delivered on {selectedOrder.deliveredAt ? new Date(selectedOrder.deliveredAt).toLocaleDateString() : 'N/A'}</div>
                  )}
                  {selectedOrder.paymentResult?.id && (
                    <div className="text-xs text-gray-600">Payment ID: {selectedOrder.paymentResult.id}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Change History */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Status History</h4>
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-600">⏳ Pending</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-blue-600">⚙️ Processing</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-purple-600">📦 Shipped</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-600">✅ Delivered</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Any status can be cancelled ❌
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedOrder.orderItems?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{item.product?.name || 'Product'}</span>
                    <span className="text-sm text-gray-600">
                      {item.quantity} x {formatCurrency(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(selectedOrder.totalPrice)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Update Modal */}
      {statusModal.open && (
        <Modal
          open={statusModal.open}
          onClose={() => setStatusModal({ open: false, orderId: null, currentStatus: "", newStatus: "" })}
          title="Update Order Status"
          footer={
            <>
              <button
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setStatusModal({ open: false, orderId: null, currentStatus: "", newStatus: "" })}
              >
                Cancel
              </button>
              <Button
                onClick={updateStatus}
                disabled={!statusModal.newStatus || getValidNextStatuses(statusModal.currentStatus).length === 0 || isUpdatingStatus}
              >
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(statusModal.currentStatus)}`}>
                  {statusModal.currentStatus}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={statusModal.newStatus}
                onChange={(e) => setStatusModal(prev => ({ ...prev, newStatus: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              >
                {getValidNextStatuses(statusModal.currentStatus).map(status => (
                  <option key={status} value={status}>
                    {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              {getValidNextStatuses(statusModal.currentStatus).length === 0 && (
                <div className="text-sm text-gray-500 mt-2">
                  This order has reached a final status and cannot be changed further.
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status Flow:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Pending → Processing → Shipped → Delivered</div>
                <div>Any status can be cancelled</div>
                <div>Delivered and Cancelled are final states</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
