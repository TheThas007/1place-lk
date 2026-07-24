"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";
import { Activity, TrendingUp, TrendingDown, Eye, Plus, Search, Edit, Trash2, Package, FolderOpen, Image as ImageIcon, Star } from "lucide-react";

/* ─── Reviews Tab ─── */
function ReviewsTab({ reviews, onDelete }: { reviews: Review[], onDelete: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Customer Reviews</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {reviews.length} reviews
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white text-sm font-bold">
                  {review.author_name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {review.author_name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-white/30">
                      {review.review_date}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    review.visible
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {review.visible ? "Visible" : "Hidden"}
                </span>
                <button 
                  onClick={() => onDelete(review.id!)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-white/60 mt-3 leading-relaxed">
              &ldquo;{review.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

