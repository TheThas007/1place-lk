"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";
import { Activity, TrendingUp, TrendingDown, Eye, Plus, Search, Edit, Trash2, Package, FolderOpen, Image as ImageIcon, Star, Download } from "lucide-react";

/* ─── Orders Tab ─── */
function OrdersTab({ 
  orders, 
  onUpdateStatus, 
  onDeleteOrder 
}: { 
  orders: any[], 
  onUpdateStatus: (id: string, status: string) => void,
  onDeleteOrder: (id: string) => void
}) {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const downloadPDF = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const items = (order.items || []).map((item: any) =>
      `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.name}${item.storage ? ` (${item.storage})` : ""}${item.color ? ` - ${item.color}` : ""}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">Rs. ${(item.price * item.quantity).toLocaleString()}</td></tr>`
    ).join("");
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Invoice #${order.id}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h1{font-size:22px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#f4f4f4;padding:10px;text-align:left}@media print{button{display:none}}</style></head><body><h1>STREET MOBILE</h1><p style="color:#666;margin:0">Premium Mobile Store in Vavuniya | Tel: +94 77 414 1118</p><hr style="margin:20px 0"/><h2 style="font-size:14px">INVOICE / ORDER SUMMARY</h2><p><strong>Order ID:</strong> ${order.id}<br/><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleString()}<br/><strong>Payment:</strong> ${order.paymentMethod}<br/><strong>Status:</strong> ${order.status}</p><h3>Customer Details</h3><p><strong>Name:</strong> ${order.customerName}<br/><strong>Phone:</strong> ${order.primaryPhone || "N/A"}<br/><strong>Address:</strong> ${order.address || "N/A"}, ${order.district || ""}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${items}</tbody></table><p style="text-align:right;font-size:18px;font-weight:bold;margin-top:20px">Total: Rs. ${(order.totalPrice || 0).toLocaleString()}</p><p style="margin-top:40px;color:#666;font-size:12px">Thank you for shopping with Street Mobile! For support: streetmobilevavuniya@gmail.com</p><button onclick="window.print()" style="margin-top:20px;padding:10px 24px;background:#000;color:#fff;border:none;cursor:pointer;font-size:14px">Print / Save as PDF</button></body></html>`);
    printWindow.document.close();
  };



  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Left: Orders List */}
      <div className="xl:col-span-2 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">All Orders</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {orders.length} orders received from customers
          </p>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-widest bg-white/[0.02]">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Method</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-white/85">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-white/30">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className={`cursor-pointer hover:bg-white/[0.02] transition-colors ${selectedOrder?.id === order.id ? "bg-white/[0.03]" : ""}`}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-white/40">#{order.id.slice(-6)}</td>
                      <td className="px-6 py-4 font-semibold">{order.customerName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/60">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">{formatPrice(order.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : 
                          order.status === "processing" ? "bg-blue-500/10 text-blue-400" :
                          order.status === "completed" ? "bg-green-500/10 text-green-400" :
                          "bg-amber-500/10 text-amber-400"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPDF(order);
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all"
                          title="Download PDF Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right: Selected Order Detail Card */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Order Details</h3>
          <p className="text-xs text-white/40 mt-0.5">
            Click any order to view details
          </p>
        </div>

        {selectedOrder ? (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <p className="text-xs text-white/40">Order Reference</p>
                <p className="font-mono text-sm font-semibold text-white mt-1">#{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => downloadPDF(selectedOrder)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/40">Customer Name</p>
                  <p className="font-semibold text-white mt-0.5">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Contact Phone</p>
                  <p className="font-semibold text-white mt-0.5">{selectedOrder.primaryPhone || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-white/40 font-semibold">Delivery Address</p>
                <p className="text-white/80 mt-1 whitespace-pre-wrap">
                  {selectedOrder.address || "N/A"}
                  {selectedOrder.district && `\nDistrict: ${selectedOrder.district}`}
                  {selectedOrder.postalCode && `\nPostal Code: ${selectedOrder.postalCode}`}
                </p>
              </div>

              {selectedOrder.secondaryPhone && (
                <div>
                  <p className="text-xs text-white/40">Alternative Phone</p>
                  <p className="font-semibold text-white mt-0.5">{selectedOrder.secondaryPhone}</p>
                </div>
              )}
            </div>

            {/* Items Ordered List */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Items Summary</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(selectedOrder.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-3 rounded-xl text-xs">
                    <div>
                      <p className="font-bold text-white leading-snug">{item.name}</p>
                      <p className="text-white/40 mt-0.5">
                        {[item.storage, item.color].filter(Boolean).join(" · ")} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-extrabold text-white">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total & Status controls */}
            <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs text-white/40">Total Price</p>
                <p className="text-lg font-black text-white mt-0.5">{formatPrice(selectedOrder.totalPrice)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  selectedOrder.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : 
                  selectedOrder.status === "processing" ? "bg-blue-500/10 text-blue-400" :
                  selectedOrder.status === "completed" ? "bg-green-500/10 text-green-400" :
                  "bg-amber-500/10 text-amber-400"
                }`}>
                  {selectedOrder.status}
                </span>

                {selectedOrder.status !== "processing" && selectedOrder.status !== "completed" && (
                  <button 
                    onClick={() => {
                      onUpdateStatus(selectedOrder.id, "processing");
                      setSelectedOrder({ ...selectedOrder, status: "processing" });
                    }}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Process
                  </button>
                )}
                {selectedOrder.status === "processing" && (
                  <button 
                    onClick={() => {
                      onUpdateStatus(selectedOrder.id, "completed");
                      setSelectedOrder({ ...selectedOrder, status: "completed" });
                    }}
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Complete
                  </button>
                )}
                <button 
                  onClick={() => {
                    onDeleteOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center text-white/20 text-sm">
            Please select an order from the list on the left to see details.
          </div>
        )}
      </div>
    </div>
  );
}

