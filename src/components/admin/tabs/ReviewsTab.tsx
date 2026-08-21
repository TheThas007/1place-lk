"use client";

import React, { useState } from "react";
import { Review, GoogleReviewsSettings } from "@/lib/types";
import {
  Plus, Search, Edit, Trash2, Star, Eye, EyeOff, Sparkles, ChevronUp, ChevronDown, ExternalLink, Save, CheckCircle2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface ReviewsTabProps {
  reviews: Review[];
  settings: GoogleReviewsSettings;
  onAdd: () => void;
  onEdit: (review: Review) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, currentVisible: boolean) => void;
  onToggleFeatured: (id: string, currentFeatured: boolean) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
  onSaveSettings: (newSettings: GoogleReviewsSettings) => void;
}

export default function ReviewsTab({
  reviews,
  settings,
  onAdd,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
  onReorder,
  onSaveSettings,
}: ReviewsTabProps) {
  // Settings Form State
  const [googleSettings, setGoogleSettings] = useState<GoogleReviewsSettings>({
    overall_rating: settings?.overall_rating ?? 4.9,
    total_reviews_count: settings?.total_reviews_count ?? 250,
    write_review_url: settings?.write_review_url ?? "https://www.google.com/maps/place//@8.7505237,80.5028315,17z/data=!3m1!4b1!4m3!3m2!1s0x3afc159b991b1da5:0xa03e8d7360fe634a!12e1?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D",
    view_all_reviews_url: settings?.view_all_reviews_url ?? "https://www.google.com/maps/place//@8.7505237,80.5028315,17z/data=!3m1!4b1!4m3!3m2!1s0x3afc159b991b1da5:0xa03e8d7360fe634a!12e1?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "featured" | "visible" | "hidden">("all");

  const handleSaveGoogleSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "google_reviews"), googleSettings, { merge: true });
      onSaveSettings(googleSettings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (e) {
      console.error("Error saving Google Reviews settings:", e);
      alert("Failed to save Google Reviews settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      (r.author_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.text || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === "featured") return !!r.featured;
    if (filterType === "visible") return r.visible !== false;
    if (filterType === "hidden") return r.visible === false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <h1 className="text-2xl font-extrabold text-white">Google Reviews Management</h1>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Free manual Google Reviews system — zero API cost. Manage customer feedback, ratings, and featured reviews.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Manual Google Review
        </button>
      </div>

      {/* ── Overall Google Rating & Buttons Settings ── */}
      <form onSubmit={handleSaveGoogleSettings} className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Website Google Rating & Button Links
          </h3>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            OVERALL GOOGLE BRANDING
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Overall Rating (e.g. 4.9)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={googleSettings.overall_rating}
              onChange={(e) => setGoogleSettings({ ...googleSettings, overall_rating: Number(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Total Reviews Count</label>
            <input
              type="number"
              value={googleSettings.total_reviews_count}
              onChange={(e) => setGoogleSettings({ ...googleSettings, total_reviews_count: Number(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">&ldquo;Write a Review&rdquo; URL</label>
            <input
              type="url"
              placeholder="https://g.page/r/..."
              value={googleSettings.write_review_url}
              onChange={(e) => setGoogleSettings({ ...googleSettings, write_review_url: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">&ldquo;View All Reviews&rdquo; URL</label>
            <input
              type="url"
              placeholder="https://maps.google.com/..."
              value={googleSettings.view_all_reviews_url}
              onChange={(e) => setGoogleSettings({ ...googleSettings, view_all_reviews_url: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {settingsSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Google Review settings saved!
            </span>
          ) : (
            <span className="text-[11px] text-white/40">Used across home section and reviews page.</span>
          )}

          <button
            type="submit"
            disabled={savingSettings}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {savingSettings ? "Saving..." : "Save Google Settings"}
          </button>
        </div>
      </form>

      {/* ── Controls: Search & Filter ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search reviews by name or text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto">
          {(["all", "featured", "visible", "hidden"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 ${
                filterType === type
                  ? "bg-blue-600 text-white shadow"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {type} ({
                type === "all"
                  ? reviews.length
                  : type === "featured"
                  ? reviews.filter((r) => r.featured).length
                  : type === "visible"
                  ? reviews.filter((r) => r.visible !== false).length
                  : reviews.filter((r) => r.visible === false).length
              })
            </button>
          ))}
        </div>
      </div>

      {/* ── Reviews Cards Grid ── */}
      {filteredReviews.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/5 space-y-3">
          <p className="text-white/60 text-sm">No Google reviews found matching your filter criteria.</p>
          <button
            onClick={onAdd}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all"
          >
            + Add First Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredReviews.map((review, index) => (
            <div
              key={review.id}
              className={`group relative rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                review.visible !== false
                  ? "bg-[#0F172A] border-white/10 hover:border-white/20"
                  : "bg-[#0F172A]/50 border-red-500/20 opacity-60"
              }`}
            >
              {/* Top Row: Author & Rating */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden font-bold text-white text-sm">
                      {review.author_photo ? (
                        <img src={review.author_photo} alt={review.author_name} className="w-full h-full object-cover" />
                      ) : (
                        review.author_name?.charAt(0)?.toUpperCase() || "G"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-white truncate">{review.author_name}</h4>
                        <span className="text-[10px] text-white/40 font-mono">#{index + 1}</span>
                      </div>
                      <p className="text-[11px] text-white/40">{review.review_date || "Verified Customer"}</p>
                    </div>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-0.5 bg-white/5 rounded-lg border border-white/10 p-0.5 shrink-0">
                    <button
                      onClick={() => onReorder(review.id, "up")}
                      disabled={index === 0}
                      className="p-1 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onReorder(review.id, "down")}
                      disabled={index === filteredReviews.length - 1}
                      className="p-1 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < (review.rating || 5) ? "fill-amber-400 text-amber-400" : "fill-transparent text-white/10"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-1">{review.rating || 5}.0</span>
                </div>

                {/* Review Text */}
                <p className="text-xs text-white/80 leading-relaxed italic line-clamp-4">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>

              {/* Bottom: Badges & Controls */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                {/* Google Review Link indicator */}
                {review.google_url ? (
                  <a
                    href={review.google_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-blue-400 hover:underline font-mono truncate max-w-full"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{review.google_url}</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-white/30 italic">No specific Google link (uses main page)</span>
                )}

                {/* Controls Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Featured Toggle */}
                    <button
                      onClick={() => onToggleFeatured(review.id, !review.featured)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                        review.featured
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-white/5 text-white/40 hover:text-white border border-white/10"
                      }`}
                      title="Toggle Featured"
                    >
                      <Sparkles className="w-3 h-3" />
                      {review.featured ? "Featured" : "Feature"}
                    </button>

                    {/* Visibility Toggle */}
                    <button
                      onClick={() => onToggleVisibility(review.id, review.visible !== false)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                        review.visible !== false
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                      title="Toggle Visibility"
                    >
                      {review.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {review.visible !== false ? "Visible" : "Hidden"}
                    </button>
                  </div>

                  {/* Edit & Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(review)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Edit Review"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(review.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
