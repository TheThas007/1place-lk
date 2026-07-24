"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";
import { Activity, TrendingUp, TrendingDown, Eye, Plus, Search, Edit, Trash2, Package, FolderOpen, Image as ImageIcon, Star } from "lucide-react";

/* ─── Overview Tab ─── */
function OverviewTab({
  stats,
  products,
  reviews,
}: {
  stats: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    change: string;
    color: string;
  }[];
  products: Product[];
  reviews: Review[];
}) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:bg-slate-900 transition-all hover:border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
              <div className="text-xs text-white/50 mt-1 font-semibold">{stat.label}</div>
              <div className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgraded Web Analytics Panel with Wave Chart */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Live Traffic & Web Views Monitor
            </h3>
            <p className="text-xs text-white/40 mt-1">Real-time daily page views and visitor engagement analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-lg">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
              18 Active Now
            </span>
          </div>
        </div>

        {/* CSS/SVG Wave Line Chart */}
        <div className="relative w-full h-36 bg-slate-950/40 border border-white/5 rounded-xl overflow-hidden p-2 flex flex-col justify-end">
          <svg className="absolute inset-x-0 bottom-0 w-full h-24 text-purple-500/10" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path
              d="M0 80 Q 15 50, 30 70 T 60 40 T 90 20 T 100 0 L 100 100 L 0 100 Z"
              fill="currentColor"
            />
            <path
              d="M0 80 Q 15 50, 30 70 T 60 40 T 90 20 T 100 0"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
            />
          </svg>
          {/* Chart Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none text-[9px] text-white/20 font-mono">
            <div>3,000 views</div>
            <div>2,000 views</div>
            <div>1,000 views</div>
          </div>
          {/* Chart axis dates */}
          <div className="flex justify-between items-center px-4 py-1 text-[9px] text-white/40 font-mono relative z-10 bg-slate-950/60 border-t border-white/5">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun (Today)</span>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent Products</h3>
          <span className="text-xs text-white/40">
            {products.length} total
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {products.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {product.name}
                </div>
                <div className="text-xs text-white/40">
                  {product.category_name}
                </div>
              </div>
              <div className="text-sm font-semibold text-white">
                {formatPrice(product.price)}
              </div>
              <span
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  product.stock_status === "in_stock"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : product.stock_status === "low_stock"
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {product.stock_status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent Reviews</h3>
          <span className="text-xs text-white/40">
            {reviews.length} total
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {reviews.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="px-6 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white text-xs font-bold">
                  {review.author_name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {review.author_name}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/50 line-clamp-2">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

