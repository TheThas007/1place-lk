"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";
import { Activity, TrendingUp, TrendingDown, Eye, Plus, Search, Edit, Trash2, Package, FolderOpen, Image as ImageIcon, Star } from "lucide-react";

/* ─── Users Tab ─── */
function UsersTab({ users }: { users: any[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Registered Users</h3>
        <p className="text-xs text-white/40 mt-0.5">
          {users.length} users registered on your platform
        </p>
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
        </div>
      </div>
    </div>
  );
}

