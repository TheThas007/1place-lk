"use client";

import React, { useState, useMemo } from "react";
import {
  normalizeOrder,
  formatLKR,
  printOrderInvoice,
  printPackingSlip,
  NormalizedOrder,
  OrderAuditEntry,
} from "@/lib/order-utils";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  PackageCheck,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Trash2,
  Edit,
  Check,
  ExternalLink,
  FileText,
  DollarSign,
  User,
  Clock,
  MapPin,
  Tag,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

interface OrdersTabProps {
  orders: any[];
  onUpdateStatus?: (id: string, newStatus: string) => void;
  onDeleteOrder?: (id: string) => void;
  onRefresh?: () => void;
}

export default function OrdersTab({
  orders: rawOrders,
  onUpdateStatus,
  onDeleteOrder,
  onRefresh,
}: OrdersTabProps) {
  // 1. Normalize All Orders (Fixes Customer Name undefined & zero totals)
  const normalizedOrders = useMemo(() => {
    return (rawOrders || []).map((ord) => normalizeOrder(ord, ord.id));
  }, [rawOrders]);

  // 2. Selection & Filter States
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    normalizedOrders.length > 0 ? normalizedOrders[0].id : null
  );
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Editing state inside details panel
  const [editingTracking, setEditingTracking] = useState("");
  const [editingNotes, setEditingNotes] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  // Modals
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkOrderStatus, setBulkOrderStatus] = useState("Processing");
  const [bulkPaymentStatus, setBulkPaymentStatus] = useState("Paid");

  // Filtered & Sorted Orders List
  const filteredOrders = useMemo(() => {
    let list = [...normalizedOrders];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.orderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.primaryPhone.toLowerCase().includes(q) ||
          o.alternativePhone.toLowerCase().includes(q)
      );
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      list = list.filter((o) => {
        const d = new Date(o.createdAt);
        if (dateRange === "today") return d.toDateString() === now.toDateString();
        if (dateRange === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return d >= weekAgo;
        }
        if (dateRange === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return d >= monthAgo;
        }
        return true;
      });
    }

    // Payment method filter
    if (paymentMethodFilter !== "all") {
      list = list.filter((o) => o.paymentMethod.toLowerCase() === paymentMethodFilter.toLowerCase());
    }

    // Payment status filter
    if (paymentStatusFilter !== "all") {
      list = list.filter((o) => o.paymentStatus.toLowerCase() === paymentStatusFilter.toLowerCase());
    } else {
      // Exclude unpaid / abandoned PayHere card attempts from standard orders view
      list = list.filter((o) => {
        const method = (o.paymentMethod || "").toString().toLowerCase();
        const isCardOrPayHere = method.includes("payhere") || method.includes("card");
        if (isCardOrPayHere) {
          const isPaid = o.paymentStatus.toLowerCase() === "paid" || o.orderStatus.toLowerCase() === "delivered" || o.orderStatus.toLowerCase() === "shipped" || o.orderStatus.toLowerCase() === "packed" || o.orderStatus.toLowerCase() === "confirmed";
          return isPaid;
        }
        return true;
      });
    }

    // Order status filter
    if (orderStatusFilter !== "all") {
      list = list.filter((o) => o.orderStatus.toLowerCase() === orderStatusFilter.toLowerCase());
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "highest") return b.grandTotal - a.grandTotal;
      if (sortBy === "lowest") return a.grandTotal - b.grandTotal;
      return 0;
    });

    return list;
  }, [normalizedOrders, searchQuery, dateRange, paymentMethodFilter, paymentStatusFilter, orderStatusFilter, sortBy]);

  // Paginated Orders
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // Currently Selected Order Object
  const selectedOrder = useMemo(() => {
    return normalizedOrders.find((o) => o.id === selectedOrderId) || filteredOrders[0] || null;
  }, [normalizedOrders, selectedOrderId, filteredOrders]);

  // Handle Order Selection
  const handleSelectOrderRow = (order: NormalizedOrder) => {
    setSelectedOrderId(order.id);
    setEditingTracking(order.trackingNumber || "");
    setEditingNotes(order.internalNotes || "");
  };

  // Selection Checkbox Handlers
  const handleToggleSelectAll = () => {
    if (selectedRowIds.length === paginatedOrders.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(paginatedOrders.map((o) => o.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter((r) => r !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  // Handlers for Order Updates
  const handleUpdateOrderStatus = async (orderId: string, newOrderStatus: NormalizedOrder["orderStatus"]) => {
    try {
      const auditEntry: OrderAuditEntry = {
        action: "Order Status Updated",
        previousStatus: selectedOrder?.orderStatus || "Pending",
        newStatus: newOrderStatus,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(doc(db, "orders", orderId), {
        orderStatus: newOrderStatus,
        status: newOrderStatus,
        updatedAt: new Date().toISOString(),
        statusHistory: arrayUnion(auditEntry),
      });

      if (onUpdateStatus) {
        onUpdateStatus(orderId, newOrderStatus);
      }
    } catch (e) {
      console.error("Error updating order status:", e);
      alert("Failed to update order status");
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: NormalizedOrder["paymentStatus"]) => {
    try {
      const auditEntry: OrderAuditEntry = {
        action: "Payment Status Updated",
        previousStatus: selectedOrder?.paymentStatus || "Pending",
        newStatus: newPaymentStatus,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(doc(db, "orders", orderId), {
        paymentStatus: newPaymentStatus,
        updatedAt: new Date().toISOString(),
        statusHistory: arrayUnion(auditEntry),
      });

      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Error updating payment status:", e);
      alert("Failed to update payment status");
    }
  };

  const handleConfirmCashCollected = async (orderId: string) => {
    if (!confirm("Confirm that cash has been collected for this COD order?")) return;
    await handleUpdatePaymentStatus(orderId, "Paid");
  };

  const handleSaveDetails = async () => {
    if (!selectedOrder) return;
    try {
      setSavingDetails(true);
      await updateDoc(doc(db, "orders", selectedOrder.id), {
        trackingNumber: editingTracking,
        internalNotes: editingNotes,
        updatedAt: new Date().toISOString(),
      });
      alert("Tracking number and admin notes saved!");
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Error saving order details:", e);
      alert("Failed to save order details");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleCancelOrderSubmit = async () => {
    if (!selectedOrder || !cancelReason.trim()) return;
    try {
      const auditEntry: OrderAuditEntry = {
        action: "Order Cancelled",
        previousStatus: selectedOrder.orderStatus,
        newStatus: "Cancelled",
        timestamp: new Date().toISOString(),
        note: cancelReason,
      };

      await updateDoc(doc(db, "orders", selectedOrder.id), {
        orderStatus: "Cancelled",
        status: "Cancelled",
        paymentStatus: "Cancelled",
        cancellationReason: cancelReason,
        updatedAt: new Date().toISOString(),
        statusHistory: arrayUnion(auditEntry),
      });

      setCancelModalOpen(false);
      setCancelReason("");
      alert("Order cancelled successfully.");
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Error cancelling order:", e);
      alert("Failed to cancel order");
    }
  };

  const handleDeleteOrderSubmit = async () => {
    if (!selectedOrder || !deleteReason.trim()) return;
    try {
      if (onDeleteOrder) {
        onDeleteOrder(selectedOrder.id);
      } else {
        await deleteDoc(doc(db, "orders", selectedOrder.id));
      }
      setDeleteModalOpen(false);
      setDeleteReason("");
      setSelectedOrderId(null);
      alert("Order record deleted successfully.");
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Error deleting order:", e);
      alert("Failed to delete order");
    }
  };

  const handleExportSelectedCSV = () => {
    const listToExport = selectedRowIds.length > 0
      ? normalizedOrders.filter((o) => selectedRowIds.includes(o.id))
      : filteredOrders;

    const headers = [
      "Order ID",
      "Order Date",
      "Customer Name",
      "Email",
      "Phone",
      "Delivery Address",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Subtotal (LKR)",
      "Delivery Fee (LKR)",
      "COD Fee (LKR)",
      "Grand Total (LKR)",
    ];

    const rows = listToExport.map((o) => [
      `"${o.id}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.primaryPhone}"`,
      `"${o.deliveryAddress.address}, ${o.deliveryAddress.city}, ${o.deliveryAddress.district}"`,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${o.subtotal}"`,
      `"${o.deliveryFee}"`,
      `"${o.codFee}"`,
      `"${o.grandTotal}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `street-mobile-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyBulkStatus = async () => {
    if (selectedRowIds.length === 0) return;
    try {
      const promises = selectedRowIds.map((id) =>
        updateDoc(doc(db, "orders", id), {
          orderStatus: bulkOrderStatus,
          status: bulkOrderStatus,
          paymentStatus: bulkPaymentStatus,
          updatedAt: new Date().toISOString(),
        })
      );
      await Promise.all(promises);
      setBulkStatusModalOpen(false);
      setSelectedRowIds([]);
      alert(`Updated status for ${selectedRowIds.length} orders!`);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Error applying bulk status update:", e);
      alert("Failed to apply bulk status update");
    }
  };

  return (
    <div className="space-y-6 text-gray-900 bg-gray-50/50 min-h-screen p-2 sm:p-6 rounded-3xl border border-gray-200/80 font-sans">
      {/* ── Top Header Toolbar ── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Orders Management</h1>
              <span className="bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-xs px-2.5 py-1 rounded-full">
                {normalizedOrders.length} Orders
              </span>
              {filteredOrders.length !== normalizedOrders.length && (
                <span className="bg-gray-100 text-gray-600 font-bold text-xs px-2.5 py-1 rounded-full">
                  {filteredOrders.length} Filtered
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Process customer purchases, track deliveries, manage cash collections and issue invoices
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                title="Refresh order records"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            )}
            <button
              onClick={handleExportSelectedCSV}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Export ({selectedRowIds.length > 0 ? selectedRowIds.length : "All"})
            </button>
            {selectedRowIds.length > 0 && (
              <button
                onClick={() => setBulkStatusModalOpen(true)}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 animate-pulse"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Bulk Update ({selectedRowIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2 border-t border-gray-100">
          {/* Search Bar */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Order ID, Customer, Phone, Email..."
              className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-blue-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">📅 All Time</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">💳 All Methods</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="payhere">PayHere Online</option>
              <option value="whatsapp">WhatsApp Direct</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">💲 All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Order Status & Sort */}
          <div>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">📦 All Order Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="out for delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Split Layout: Table (Left 65%) & Sticky Details Panel (Right 35%) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ORDERS TABLE (xl:col-span-8 or 7) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-black text-gray-500 uppercase tracking-wider select-none">
                    <th className="px-4 py-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.length === paginatedOrders.length && paginatedOrders.length > 0}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3.5">Order ID</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Method</th>
                    <th className="px-4 py-3.5">Payment</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                        <PackageCheck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p className="font-bold text-gray-600">No orders found matching filters.</p>
                        <p className="text-xs text-gray-400 mt-1">Try resetting search parameters.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((ord) => {
                      const isSelected = selectedOrderId === ord.id;

                      return (
                        <tr
                          key={ord.id}
                          onClick={() => {
                            handleSelectOrderRow(ord);
                            setMobileDrawerOpen(true);
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-50/80 border-l-4 border-l-blue-600 font-medium"
                              : "hover:bg-gray-50/80"
                          }`}
                        >
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedRowIds.includes(ord.id)}
                              onChange={() => handleToggleSelectRow(ord.id)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>

                          {/* Order ID */}
                          <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-gray-900">
                            #{ord.id.slice(-7).toUpperCase()}
                            {ord.needsReview && (
                              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 font-sans font-bold text-[9px] rounded">
                                Review
                              </span>
                            )}
                          </td>

                          {/* Order Date */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-gray-500">
                            {new Date(ord.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </td>

                          {/* Customer Name */}
                          <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-gray-900 max-w-[140px] truncate">
                            {ord.customerName}
                          </td>

                          {/* Payment Method Badge */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border ${
                                ord.paymentMethod === "PayHere"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : ord.paymentMethod === "COD"
                                  ? "bg-gray-100 text-gray-700 border-gray-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {ord.paymentMethod}
                            </span>
                          </td>

                          {/* Payment Status Badge */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                ord.paymentStatus === "Paid"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : ord.paymentStatus === "Failed" || ord.paymentStatus === "Cancelled"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : ord.paymentStatus === "Refunded"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                          </td>

                          {/* Order Status Badge */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                ord.orderStatus === "Delivered"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : ord.orderStatus === "Shipped" || ord.orderStatus === "Out for Delivery"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : ord.orderStatus === "Packed" || ord.orderStatus === "Processing"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : ord.orderStatus === "Cancelled"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </td>

                          {/* Total Price - Right aligned, single line */}
                          <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-gray-900 text-right">
                            {formatLKR(ord.grandTotal)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600 select-none">
                <span>
                  Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredOrders.length} total orders)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY ORDER DETAILS PANEL (xl:col-span-5) */}
        <div className="hidden xl:block xl:col-span-5">
          {selectedOrder ? (
            <OrderDetailsCard
              order={selectedOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onConfirmCashCollected={handleConfirmCashCollected}
              onSaveDetails={handleSaveDetails}
              editingTracking={editingTracking}
              setEditingTracking={setEditingTracking}
              editingNotes={editingNotes}
              setEditingNotes={setEditingNotes}
              savingDetails={savingDetails}
              onOpenCancelModal={() => setCancelModalOpen(true)}
              onOpenDeleteModal={() => setDeleteModalOpen(true)}
            />
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-bold text-gray-600">Select an order</p>
              <p className="text-xs text-gray-400 mt-1">Click any order in the left table to inspect details.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE FULL-SCREEN DRAWER (FOR SCREEN WIDTH < XL) ── */}
      {mobileDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 xl:hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto p-5 space-y-6 shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h2 className="font-extrabold text-base text-gray-900">Order Details #{selectedOrder.id.slice(-8)}</h2>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <OrderDetailsCard
              order={selectedOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onConfirmCashCollected={handleConfirmCashCollected}
              onSaveDetails={handleSaveDetails}
              editingTracking={editingTracking}
              setEditingTracking={setEditingTracking}
              editingNotes={editingNotes}
              setEditingNotes={setEditingNotes}
              savingDetails={savingDetails}
              onOpenCancelModal={() => setCancelModalOpen(true)}
              onOpenDeleteModal={() => setDeleteModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* ── CANCEL ORDER MODAL ── */}
      {cancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Cancel Order #{selectedOrder.id.slice(-8)}
              </h3>
              <button onClick={() => setCancelModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Please enter the mandatory reason for cancelling this customer order:
            </p>

            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation, Item out of stock..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-red-500 resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrderSubmit}
                disabled={!cancelReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl disabled:opacity-40"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE ORDER MODAL ── */}
      {deleteModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Permanently Delete Order
              </h3>
              <button onClick={() => setDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to delete order <strong>#{selectedOrder.id}</strong>? This action cannot be undone. Please state the deletion reason:
            </p>

            <textarea
              required
              rows={2}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="e.g. Duplicate test order removal..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-red-500 resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOrderSubmit}
                disabled={!deleteReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl disabled:opacity-40"
              >
                Confirm Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BULK STATUS UPDATE MODAL ── */}
      {bulkStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" /> Bulk Update ({selectedRowIds.length} Orders)
              </h3>
              <button onClick={() => setBulkStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Set New Order Status</label>
                <select
                  value={bulkOrderStatus}
                  onChange={(e) => setBulkOrderStatus(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold outline-none"
                >
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Set New Payment Status</label>
                <select
                  value={bulkPaymentStatus}
                  onChange={(e) => setBulkPaymentStatus(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBulkStatusModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkStatus}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Apply to {selectedRowIds.length} Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ── STICKY ORDER DETAILS CARD COMPONENT (PURE WHITE MINIMAL STYLE) ──
 */
function OrderDetailsCard({
  order,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onConfirmCashCollected,
  onSaveDetails,
  editingTracking,
  setEditingTracking,
  editingNotes,
  setEditingNotes,
  savingDetails,
  onOpenCancelModal,
  onOpenDeleteModal,
}: {
  order: NormalizedOrder;
  onUpdateOrderStatus: (id: string, st: NormalizedOrder["orderStatus"]) => void;
  onUpdatePaymentStatus: (id: string, st: NormalizedOrder["paymentStatus"]) => void;
  onConfirmCashCollected: (id: string) => void;
  onSaveDetails: () => void;
  editingTracking: string;
  setEditingTracking: (val: string) => void;
  editingNotes: string;
  setEditingNotes: (val: string) => void;
  savingDetails: boolean;
  onOpenCancelModal: () => void;
  onOpenDeleteModal: () => void;
}) {
  const whatsappMsg = `Hello ${order.customerName}, regarding your STREET MOBILE order #${order.id.slice(-8)}...`;
  const whatsappUrl = `https://wa.me/${(order.primaryPhone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="sticky top-6 bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 text-gray-900">
      {/* Top Header & PDF Action Buttons */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Selected Order</span>
          <h2 className="text-lg font-black text-gray-900 font-mono">#{order.id}</h2>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            Placed {new Date(order.createdAt).toLocaleString("en-GB")}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => printOrderInvoice(order)}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
            title="Download PDF Invoice"
          >
            <Printer className="w-4 h-4" /> Invoice
          </button>
          <button
            onClick={() => printPackingSlip(order)}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
            title="Download Packing Slip"
          >
            <PackageCheck className="w-4 h-4" /> Packing
          </button>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 space-y-3">
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Customer & Delivery</span>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-400 font-medium">Customer Name</p>
            <p className="font-extrabold text-gray-900 mt-0.5">{order.customerName}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium">Primary Phone</p>
            <p className="font-extrabold text-gray-900 font-mono mt-0.5">{order.primaryPhone}</p>
          </div>
        </div>

        {order.alternativePhone && (
          <div className="text-xs">
            <p className="text-gray-400 font-medium">Alternative Phone</p>
            <p className="font-semibold text-gray-800 font-mono mt-0.5">{order.alternativePhone}</p>
          </div>
        )}

        {order.customerEmail && order.customerEmail !== "Not provided" && (
          <div className="text-xs">
            <p className="text-gray-400 font-medium">Email Address</p>
            <p className="font-semibold text-gray-800 mt-0.5">{order.customerEmail}</p>
          </div>
        )}

        <div className="text-xs pt-2 border-t border-gray-200/60">
          <p className="text-gray-400 font-medium mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" /> Delivery Address
          </p>
          <p className="text-gray-800 leading-relaxed font-medium bg-white p-2.5 rounded-xl border border-gray-200">
            {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.district}, {order.deliveryAddress.province} ({order.deliveryAddress.postalCode})
            {order.deliveryAddress.landmark && <span className="block text-gray-500 mt-1">Landmark: {order.deliveryAddress.landmark}</span>}
            {order.deliveryAddress.instructions && <span className="block text-gray-500 mt-1">Note: {order.deliveryAddress.instructions}</span>}
          </p>
        </div>
      </div>

      {/* Separate Status Control Dropdowns */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Order Status Control */}
          <div>
            <label className="block font-extrabold text-gray-700 mb-1">Order Status</label>
            <select
              value={order.orderStatus}
              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Pending">⏳ Pending</option>
              <option value="Confirmed">✓ Confirmed</option>
              <option value="Processing">⚙️ Processing</option>
              <option value="Packed">📦 Packed</option>
              <option value="Shipped">🚚 Shipped</option>
              <option value="Out for Delivery">🛵 Out for Delivery</option>
              <option value="Delivered">✅ Delivered</option>
              <option value="Cancelled">❌ Cancelled</option>
              <option value="Returned">↩️ Returned</option>
            </select>
          </div>

          {/* Payment Status Control */}
          <div>
            <label className="block font-extrabold text-gray-700 mb-1">Payment Status</label>
            <select
              value={order.paymentStatus}
              onChange={(e) => onUpdatePaymentStatus(order.id, e.target.value as any)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Pending">⏳ Pending</option>
              <option value="Paid">✅ Paid</option>
              <option value="Failed">❌ Failed</option>
              <option value="Cancelled">🚫 Cancelled</option>
              <option value="Refunded">↩️ Refunded</option>
              <option value="Charged Back">⚠️ Charged Back</option>
            </select>
          </div>
        </div>

        {/* Special Action: Confirm Cash Collected for COD */}
        {order.paymentMethod === "COD" && order.paymentStatus !== "Paid" && (
          <button
            onClick={() => onConfirmCashCollected(order.id)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Banknote className="w-4 h-4" /> Confirm Cash Collected (Mark Paid)
          </button>
        )}

        {/* PayHere Online Details */}
        {order.paymentMethod === "PayHere" && (
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-1">
            <span className="font-extrabold text-blue-900 block">PayHere Gateway Transaction</span>
            <p className="text-blue-700">Transaction ID: {order.transactionId || "Verified Online"}</p>
          </div>
        )}
      </div>

      {/* Tracking Number & Internal Admin Notes */}
      <div className="space-y-3 pt-2 border-t border-gray-100 text-xs">
        <div>
          <label className="block font-bold text-gray-700 mb-1">Tracking Number</label>
          <input
            type="text"
            value={editingTracking}
            onChange={(e) => setEditingTracking(e.target.value)}
            placeholder="Enter courier tracking code..."
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-1">Internal Admin Notes</label>
          <textarea
            rows={2}
            value={editingNotes}
            onChange={(e) => setEditingNotes(e.target.value)}
            placeholder="Private notes for staff..."
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-blue-500 resize-none font-medium"
          />
        </div>

        <button
          onClick={onSaveDetails}
          disabled={savingDetails}
          className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all shadow-sm"
        >
          {savingDetails ? "Saving..." : "Save Tracking & Notes"}
        </button>
      </div>

      {/* Purchased Item Summary List */}
      <div className="space-y-3 pt-3 border-t border-gray-100">
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Ordered Items Summary</span>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-contain bg-white border border-gray-200 shrink-0" />
                <div className="truncate">
                  <p className="font-extrabold text-gray-900 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {[item.storage, item.color, item.ram].filter(Boolean).join(" • ")} × {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-mono font-bold text-gray-900 whitespace-nowrap shrink-0">{formatLKR(item.lineTotal)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown Footer */}
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>Items Subtotal</span>
          <span className="font-mono font-bold whitespace-nowrap">{formatLKR(order.subtotal)}</span>
        </div>
        {order.deliveryFee > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span className="font-mono font-bold whitespace-nowrap">{formatLKR(order.deliveryFee)}</span>
          </div>
        )}
        {order.codFee > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>COD Handling Fee</span>
            <span className="font-mono font-bold whitespace-nowrap">{formatLKR(order.codFee)}</span>
          </div>
        )}
        {order.discountTotal > 0 && (
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>Discount / Coupon</span>
            <span className="font-mono whitespace-nowrap">-{formatLKR(order.discountTotal)}</span>
          </div>
        )}
        <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm">
          <span className="font-black text-gray-900">Grand Total</span>
          <span className="font-mono font-black text-base text-blue-600 whitespace-nowrap">{formatLKR(order.grandTotal)}</span>
        </div>
      </div>

      {/* Actions Footer Bar */}
      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
        </a>

        <div className="flex items-center gap-2">
          {order.orderStatus !== "Cancelled" && (
            <button
              onClick={onOpenCancelModal}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onOpenDeleteModal}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
