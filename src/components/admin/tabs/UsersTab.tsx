"use client";

import React, { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";
import { Activity, TrendingUp, TrendingDown, Eye, Plus, Search, Edit, Trash2, Package, FolderOpen, Image as ImageIcon, Star, Download } from "lucide-react";

/* ─── Users Tab ─── */
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
function UsersTab({ users }: { users: any[] }) {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  const exportUsersCSV = () => {
    if (!users || users.length === 0) {
      alert("No user data to export.");
      return;
    }
    const headers = ["User ID", "Name", "Email", "Joined Date"];
    const rows = users.map((u) => [
      `"${u.id || ""}"`,
      `"${(u.displayName || "Google User").replace(/"/g, '""')}"`,
      `"${(u.email || "").replace(/"/g, '""')}"`,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `street_mobile_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchOrders = async (userId: string) => {
    try {
      const snap = await getDocs(collection(db, "orders"));
      const filtered = snap.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .filter((order: any) => order.userId === userId);
      setUserOrders(filtered);
    } catch (e) {
      console.error("Failed to fetch orders for user", e);
    }
  };

  const handleViewOrders = (user: any) => {
    setSelectedUser(user);
    fetchOrders(user.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Registered Users</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {users.length} users registered on your platform
          </p>
        </div>
        <button
          onClick={exportUsersCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] w-fit"
        >
          <Download className="w-4 h-4" />
          Download Users Data (CSV)
        </button>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-widest bg-white/[0.02]">
                <th className="px-6 py-4 font-semibold">User ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-white/80">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-white/30">
                    No registered users found in database.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-white/40">{u.id}</td>
                    <td className="px-6 py-4 font-semibold">{u.displayName || "Google User"}</td>
                    <td className="px-6 py-4 text-white/60">{u.email}</td>
                    <td className="px-6 py-4 text-white/40 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
 {selectedUser && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white">Orders for {selectedUser.displayName || selectedUser.email}</h3>
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-widest bg-white/[0.02]">
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Total</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-white/80">
                  {userOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-white/30">No orders for this user.</td>
                    </tr>
                  ) : (
                    userOrders.map(order => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 font-mono text-xs text-white/40">#{order.id.slice(-6)}</td>
                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{formatPrice(order.totalPrice)}</td>
                        <td className="px-6 py-4">{order.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
       </div>
      </div>
    </div>
  );
}

