"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Eye, Calendar, Sparkles, Copy, Check, Tag, Clock, Smartphone, Monitor } from "lucide-react";
import { OfferBanner, BannerPlacement, BannerStatus } from "@/lib/types";

interface OfferBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (banner: Partial<OfferBanner>) => Promise<void>;
  initialData?: OfferBanner | null;
}

const PLACEMENTS: { id: BannerPlacement; label: string }[] = [
  { id: "homepage_hero", label: "Homepage Hero Slider" },
  { id: "homepage_below_header", label: "Homepage Below Header" },
  { id: "homepage_after_categories", label: "Homepage After Categories" },
  { id: "homepage_above_bestsellers", label: "Homepage Above Best Sellers" },
  { id: "homepage_above_new_arrivals", label: "Homepage Above New Arrivals" },
  { id: "homepage_before_testimonials", label: "Homepage Before Testimonials" },
  { id: "shop_top", label: "Shop Page Top" },
  { id: "category_top", label: "Category Page Top" },
  { id: "product_page", label: "Product Page Section" },
  { id: "cart_page", label: "Cart Page Section" },
  { id: "checkout_notice", label: "Checkout Notice Area" },
  { id: "announcement_bar", label: "Global Announcement Bar" },
  { id: "popup_campaign", label: "Promotional Popup Campaign" },
];

export default function OfferBannerModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: OfferBannerModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "media" | "placement" | "design" | "schedule">("info");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<OfferBanner>>({
    internalName: "",
    headline: "",
    highlightText: "",
    description: "",
    badgeText: "LIMITED OFFER",
    couponCode: "",
    termsText: "",
    primaryCtaText: "Shop Offer",
    primaryCtaUrl: "/products",
    linkType: "internal",
    openInNewTab: false,
    desktopImage: "",
    mobileImage: "",
    videoUrl: "",
    altText: "",
    overlayOpacity: 40,
    textAlign: "left",
    contentPosition: "center_left",
    stylePreset: "premium_dark",
    placement: "homepage_after_categories",
    status: "active",
    publishImmediately: true,
    noExpiry: true,
    targetDevice: "all",
    targetAudience: "all",
    countdownEnabled: false,
    countdownLabel: "Ends in:",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        internalName: "",
        headline: "",
        highlightText: "",
        description: "",
        badgeText: "LIMITED OFFER",
        couponCode: "",
        termsText: "",
        primaryCtaText: "Shop Offer",
        primaryCtaUrl: "/products",
        linkType: "internal",
        openInNewTab: false,
        desktopImage: "",
        mobileImage: "",
        videoUrl: "",
        altText: "",
        overlayOpacity: 40,
        textAlign: "left",
        contentPosition: "center_left",
        stylePreset: "premium_dark",
        placement: "homepage_after_categories",
        status: "active",
        publishImmediately: true,
        noExpiry: true,
        targetDevice: "all",
        targetAudience: "all",
        countdownEnabled: false,
        countdownLabel: "Ends in:",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.internalName || !formData.headline) {
      alert("Please provide at least an internal name and public headline.");
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save offer banner.");
    } finally {
      setLoading(false);
    }
  };

  const compressAndSetImage = (file: File, field: "desktopImage" | "mobileImage") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        setFormData((prev) => ({ ...prev, [field]: compressed }));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {initialData ? "Edit Offer Banner" : "Create Offer Banner"}
              </h2>
              <p className="text-xs text-white/50">Manage marketing banners, schedules, and placements</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                    previewDevice === "desktop" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                    previewDevice === "mobile" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-white/10 bg-zinc-900/30 overflow-x-auto">
            {[
              { id: "info", label: "Basic Info & CTA" },
              { id: "media", label: "Images & Media" },
              { id: "placement", label: "Placement & Audience" },
              { id: "design", label: "Design & Presets" },
              { id: "schedule", label: "Schedule & Countdown" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-amber-400 text-amber-400 bg-amber-400/5"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body with Form & Live Preview side-by-side */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Input Controls */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5 custom-scrollbar">
              {activeTab === "info" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Internal Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 16 Launch Festival Banner"
                      value={formData.internalName || ""}
                      onChange={(e) => setFormData({ ...formData, internalName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Headline *</label>
                      <input
                        type="text"
                        placeholder="e.g. Unbeatable Deals on"
                        value={formData.headline || ""}
                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Highlighted Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Flagship Smartphones"
                        value={formData.highlightText || ""}
                        onChange={(e) => setFormData({ ...formData, highlightText: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Get up to 20% off on authentic iPhones with islandwide delivery."
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Offer Badge</label>
                      <input
                        type="text"
                        placeholder="e.g. SPECIAL OFFER"
                        value={formData.badgeText || ""}
                        onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Coupon Code</label>
                      <input
                        type="text"
                        placeholder="e.g. STREET10"
                        value={formData.couponCode || ""}
                        onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50 uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Link Type</label>
                      <select
                        value={formData.linkType || "internal"}
                        onChange={(e) => setFormData({ ...formData, linkType: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                      >
                        <option value="internal">Internal Page</option>
                        <option value="product">Product Page</option>
                        <option value="category">Category Page</option>
                        <option value="whatsapp">WhatsApp Order</option>
                        <option value="custom">Custom URL</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Button Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Shop Now"
                        value={formData.primaryCtaText || ""}
                        onChange={(e) => setFormData({ ...formData, primaryCtaText: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Destination URL</label>
                      <input
                        type="text"
                        placeholder="e.g. /products?category=iphone"
                        value={formData.primaryCtaUrl || ""}
                        onChange={(e) => setFormData({ ...formData, primaryCtaUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                      />
                      {/* Quick Link Selector Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] text-white/40 self-center mr-1">Quick Links:</span>
                        {[
                          { label: "Products", url: "/products" },
                          { label: "Categories", url: "/categories" },
                          { label: "Gallery", url: "/gallery" },
                          { label: "Reviews", url: "/reviews" },
                          { label: "Contact", url: "/contact" },
                        ].map((chip) => (
                          <button
                            key={chip.url}
                            type="button"
                            onClick={() => setFormData({ ...formData, primaryCtaUrl: chip.url })}
                            className="px-2 py-0.5 rounded bg-white/10 hover:bg-amber-400 hover:text-black text-[10px] text-white/80 transition-colors"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-white/70">Desktop Image *</label>
                      <label className="cursor-pointer text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                        <ImageIcon className="w-3.5 h-3.5" /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) compressAndSetImage(file, "desktopImage");
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="https://... or paste image URL (1920x760 recommended)"
                      value={formData.desktopImage || ""}
                      onChange={(e) => setFormData({ ...formData, desktopImage: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-white/70">Mobile Image (Optional)</label>
                      <label className="cursor-pointer text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                        <ImageIcon className="w-3.5 h-3.5" /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) compressAndSetImage(file, "mobileImage");
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="https://... or paste mobile image URL (1080x1350 recommended)"
                      value={formData.mobileImage || ""}
                      onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Alt Text</label>
                    <input
                      type="text"
                      placeholder="Image description for accessibility"
                      value={formData.altText || ""}
                      onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-white/70 mb-1">
                      <span>Overlay Darkening</span>
                      <span>{formData.overlayOpacity || 40}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      step={5}
                      value={formData.overlayOpacity || 40}
                      onChange={(e) => setFormData({ ...formData, overlayOpacity: Number(e.target.value) })}
                      className="w-full accent-amber-400"
                    />
                  </div>
                </div>
              )}

              {activeTab === "placement" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Placement Slot *</label>
                    <select
                      value={formData.placement || "homepage_after_categories"}
                      onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                    >
                      {PLACEMENTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Target Device</label>
                      <select
                        value={formData.targetDevice || "all"}
                        onChange={(e) => setFormData({ ...formData, targetDevice: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                      >
                        <option value="all">All Devices</option>
                        <option value="desktop">Desktop Only</option>
                        <option value="mobile">Mobile Only</option>
                        <option value="tablet">Tablet Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Campaign Status</label>
                      <select
                        value={formData.status || "active"}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="paused">Paused</option>
                        <option value="expired">Expired</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "design" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Style Preset</label>
                    <select
                      value={formData.stylePreset || "premium_dark"}
                      onChange={(e) => setFormData({ ...formData, stylePreset: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                    >
                      <option value="premium_dark">Premium Dark (Black Glass & Gold/White)</option>
                      <option value="clean_light">Clean Light (White Glass & Dark Text)</option>
                      <option value="flash_sale">Flash Sale (Bold Red/Amber Glow)</option>
                      <option value="new_arrival">New Arrival (Sleek Cyan/White)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Text Alignment</label>
                      <select
                        value={formData.textAlign || "left"}
                        onChange={(e) => setFormData({ ...formData, textAlign: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Content Position</label>
                      <select
                        value={formData.contentPosition || "center_left"}
                        onChange={(e) => setFormData({ ...formData, contentPosition: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                      >
                        <option value="center_left">Center Left</option>
                        <option value="center">Center</option>
                        <option value="center_right">Center Right</option>
                        <option value="bottom_left">Bottom Left</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "schedule" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="countdownEnabled"
                      checked={formData.countdownEnabled || false}
                      onChange={(e) => setFormData({ ...formData, countdownEnabled: e.target.checked })}
                      className="w-4 h-4 accent-amber-400"
                    />
                    <label htmlFor="countdownEnabled" className="text-xs font-medium text-white">
                      Enable Countdown Timer
                    </label>
                  </div>

                  {formData.countdownEnabled && (
                    <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">Countdown End Date & Time</label>
                        <input
                          type="datetime-local"
                          value={formData.countdownEndAt || ""}
                          onChange={(e) => setFormData({ ...formData, countdownEndAt: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">Countdown Label</label>
                        <input
                          type="text"
                          placeholder="Offer ends in:"
                          value={formData.countdownLabel || ""}
                          onChange={(e) => setFormData({ ...formData, countdownLabel: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Interactive Preview Box */}
            <div className="w-full md:w-[380px] bg-zinc-900 p-5 border-t md:border-t-0 md:border-l border-white/10 flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Live Preview ({previewDevice})
              </h3>

              <div
                className={`relative rounded-2xl overflow-hidden border border-white/15 bg-black ${
                  previewDevice === "mobile" ? "aspect-[9/12] max-w-[260px] mx-auto" : "aspect-[16/9] w-full"
                }`}
              >
                {/* Background image / overlay */}
                {formData.desktopImage ? (
                  <img
                    src={previewDevice === "mobile" && formData.mobileImage ? formData.mobileImage : formData.desktopImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white/30 text-xs">
                    No image uploaded
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-black"
                  style={{ opacity: (formData.overlayOpacity || 40) / 100 }}
                />

                {/* Banner Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-center text-left text-white">
                  {formData.badgeText && (
                    <span className="self-start px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-extrabold uppercase mb-2">
                      {formData.badgeText}
                    </span>
                  )}
                  <h4 className="text-sm sm:text-base font-bold leading-tight">
                    {formData.headline || "Headline Here"} <span className="text-amber-400">{formData.highlightText}</span>
                  </h4>
                  {formData.description && (
                    <p className="text-[10px] text-white/70 mt-1 line-clamp-2">{formData.description}</p>
                  )}
                  {formData.couponCode && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 border border-white/20 text-[10px] font-mono">
                      <Tag className="w-2.5 h-2.5 text-amber-400" /> CODE: {formData.couponCode}
                    </div>
                  )}
                  {formData.primaryCtaText && (
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1.5 rounded-lg bg-white text-black text-[10px] font-bold">
                        {formData.primaryCtaText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* Footer Submit Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-zinc-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : initialData ? "Update Banner" : "Create & Save"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
