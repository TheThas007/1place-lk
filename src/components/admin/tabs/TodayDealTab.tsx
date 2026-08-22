"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Save,
  Check,
  Smartphone,
  Monitor,
  Tablet,
  Upload,
  RefreshCw,
  Eye,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Clock,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TodayDealSettings, TodayDealStatus } from "@/lib/types";
import { DEFAULT_TODAY_DEAL_SETTINGS } from "@/lib/data";
import { uploadImageWithFallback } from "@/lib/upload-utils";
import TodayDealSection from "@/components/home/today-deal-section";

interface TodayDealTabProps {
  initialSettings?: TodayDealSettings | null;
  onRefresh?: () => void;
}

// Convert ISO date string to datetime-local input string YYYY-MM-DDTHH:mm
function toDateTimeLocal(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

// Convert datetime-local input string to ISO string
function fromDateTimeLocal(localStr: string): string {
  if (!localStr) return "";
  try {
    const d = new Date(localStr);
    return isNaN(d.getTime()) ? "" : d.toISOString();
  } catch {
    return "";
  }
}

export default function TodayDealTab({ initialSettings, onRefresh }: TodayDealTabProps) {
  const [settings, setSettings] = useState<TodayDealSettings>(() => {
    return { ...DEFAULT_TODAY_DEAL_SETTINGS, ...(initialSettings || {}) };
  });

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [activeTabGroup, setActiveTabGroup] = useState<"content" | "media" | "appearance" | "countdown">("content");

  // Sync initial settings if updated from parent
  useEffect(() => {
    if (initialSettings) {
      setSettings((prev) => ({ ...prev, ...initialSettings }));
    }
  }, [initialSettings]);

  // Load from Firestore if initialSettings not provided
  useEffect(() => {
    async function loadSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "today_deal"));
        if (snap.exists()) {
          setSettings((prev) => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.warn("Could not fetch today's deal settings:", err);
      }
    }
    if (!initialSettings) {
      loadSettings();
    }
  }, [initialSettings]);

  // Compute live campaign status
  const campaignStatus: TodayDealStatus = useMemo(() => {
    if (!settings.enabled) return "draft";
    const now = Date.now();
    const startTime = settings.startsAt ? new Date(settings.startsAt).getTime() : 0;
    const endTime = settings.endsAt ? new Date(settings.endsAt).getTime() : 0;

    if (startTime && now < startTime) return "scheduled";
    if (endTime && now >= endTime) return "expired";
    return "live";
  }, [settings.enabled, settings.startsAt, settings.endsAt]);

  // Handle image upload
  const handleFileUpload = async (file: File, type: "desktop" | "mobile") => {
    if (type === "desktop") setUploadingDesktop(true);
    else setUploadingMobile(true);

    try {
      const downloadUrl = await uploadImageWithFallback(file, "today_deal");
      if (type === "desktop") {
        setSettings((prev) => ({ ...prev, desktopImageUrl: downloadUrl }));
      } else {
        setSettings((prev) => ({ ...prev, mobileImageUrl: downloadUrl }));
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try a smaller image file.");
    } finally {
      if (type === "desktop") setUploadingDesktop(false);
      else setUploadingMobile(false);
    }
  };

  // Save Settings to Firestore
  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload: TodayDealSettings = {
        ...settings,
        status: campaignStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: "Admin",
      };

      // Save to primary settings doc
      await setDoc(doc(db, "settings", "today_deal"), payload, { merge: true });
      // Also sync to siteSettings doc if needed
      await setDoc(doc(db, "siteSettings", "todayDeal"), payload, { merge: true });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to save today's deal settings:", err);
      alert("Failed to save settings. Please check your internet connection.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to Street Mobile defaults
  const handleResetDefaults = () => {
    if (confirm("Reset Today's Deal section to Street Mobile official defaults? Any unsaved edits will be replaced.")) {
      setSettings(DEFAULT_TODAY_DEAL_SETTINGS);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* ── TOP HEADER & SAVE ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Today&apos;s Deal Promotional Banner
              </h1>
              {/* Campaign Status Badge */}
              <span
                className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                  !settings.enabled
                    ? "bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
                    : campaignStatus === "live"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : campaignStatus === "scheduled"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}
              >
                ● {!settings.enabled ? "OFF (Disabled)" : campaignStatus}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Manage promotional banner image, real HTML overlay content, colors, and live countdown timer on homepage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Banner ON / OFF Switch */}
          <button
            type="button"
            onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 border cursor-pointer ${
              settings.enabled
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                settings.enabled ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
              }`}
            />
            {settings.enabled ? "Banner: ON" : "Banner: OFF"}
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" /> Saved Live!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── LIVE INTERACTIVE PREVIEW ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-red-400" /> Live Interactive Preview
            </h3>
            <p className="text-[11px] text-white/40">
              Updates in real-time as you adjust content, colors, images, and countdown timer.
            </p>
          </div>

          {/* Device Tabs */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                previewDevice === "desktop" ? "bg-red-600 text-white shadow-md" : "text-white/60 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("tablet")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                previewDevice === "tablet" ? "bg-red-600 text-white shadow-md" : "text-white/60 hover:text-white"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" /> Tablet
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                previewDevice === "mobile" ? "bg-red-600 text-white shadow-md" : "text-white/60 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>
        </div>

        {/* Device Canvas Frame */}
        <div className="bg-[#020617] border border-white/5 rounded-2xl p-4 sm:p-6 flex items-center justify-center overflow-x-auto min-h-[300px]">
          <div
            className="transition-all duration-300 w-full"
            style={{
              maxWidth: previewDevice === "mobile" ? "375px" : previewDevice === "tablet" ? "768px" : "100%",
            }}
          >
            <TodayDealSection settings={settings} isLivePreview={true} />
          </div>
        </div>
      </div>

      {/* ── SETTINGS CONFIGURATION PANELS ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Navigation Tabs for Configuration */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTabGroup("content")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              activeTabGroup === "content" ? "bg-white/15 text-white border border-white/20" : "text-white/50 hover:text-white"
            }`}
          >
            📝 Content &amp; Headlines
          </button>
          <button
            type="button"
            onClick={() => setActiveTabGroup("media")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              activeTabGroup === "media" ? "bg-white/15 text-white border border-white/20" : "text-white/50 hover:text-white"
            }`}
          >
            🖼️ Banner Images &amp; Focal Points
          </button>
          <button
            type="button"
            onClick={() => setActiveTabGroup("appearance")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              activeTabGroup === "appearance" ? "bg-white/15 text-white border border-white/20" : "text-white/50 hover:text-white"
            }`}
          >
            🎨 Overlay Box, Colors &amp; Layout
          </button>
          <button
            type="button"
            onClick={() => setActiveTabGroup("countdown")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              activeTabGroup === "countdown" ? "bg-white/15 text-white border border-white/20" : "text-white/50 hover:text-white"
            }`}
          >
            ⏱️ Countdown Timer &amp; Expiry
          </button>
        </div>

        {/* ── GROUP A & B: CONTENT & HEADLINES ── */}
        {activeTabGroup === "content" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            
            {/* Visibility & Enable Switch */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Enable Today&apos;s Deal Section on Homepage
                </h4>
                <p className="text-[11px] text-white/50 mt-0.5">
                  When disabled, the section is completely removed from the homepage without leaving empty whitespace.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
              </label>
            </div>

            {/* Content Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-1.5">
                  Eyebrow Tagline
                </label>
                <input
                  type="text"
                  value={settings.eyebrow}
                  onChange={(e) => setSettings({ ...settings, eyebrow: e.target.value })}
                  placeholder="TODAY'S DEAL"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-red-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-1.5">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={settings.heading}
                  onChange={(e) => setSettings({ ...settings, heading: e.target.value })}
                  placeholder="Today Only. Better Prices."
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-red-500 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Limited-time savings on selected devices & accessories."
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-red-500 resize-none font-medium text-xs"
                />
              </div>

              <div>
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-1.5">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={settings.ctaLabel}
                  onChange={(e) => setSettings({ ...settings, ctaLabel: e.target.value })}
                  placeholder="Shop Today's Deals"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-red-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-1.5">
                  CTA Destination URL
                </label>
                <input
                  type="text"
                  value={settings.ctaUrl}
                  onChange={(e) => setSettings({ ...settings, ctaUrl: e.target.value })}
                  placeholder="/products"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-1.5">
                  Entire Banner Link (Optional)
                </label>
                <input
                  type="text"
                  value={settings.bannerUrl || ""}
                  onChange={(e) => setSettings({ ...settings, bannerUrl: e.target.value })}
                  placeholder="/products"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.openInNewTab}
                    onChange={(e) => setSettings({ ...settings, openInNewTab: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600" />
                </label>
                <span className="text-xs font-bold text-white/80">Open Links in New Tab</span>
              </div>
            </div>
          </div>
        )}

        {/* ── GROUP C: BANNER IMAGES ── */}
        {activeTabGroup === "media" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              
              {/* Desktop Banner Image */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-400" /> Desktop Banner Image
                  </h4>
                  <span className="text-[10px] font-bold text-white/40">1600 × 800 px (2:1)</span>
                </div>

                <div>
                  <label className="block text-white/60 font-bold uppercase tracking-wider mb-1">Image URL</label>
                  <input
                    type="text"
                    value={settings.desktopImageUrl}
                    onChange={(e) => setSettings({ ...settings, desktopImageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-black/40 border border-white/10 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-red-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <input
                    type="file"
                    id="desktopDealImageUpload"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "desktop")}
                    className="hidden"
                  />
                  <label
                    htmlFor="desktopDealImageUpload"
                    className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 border border-white/10"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    {uploadingDesktop ? "Uploading Image..." : "Upload Desktop Banner"}
                  </label>
                </div>

                {/* Focal Position Selector */}
                <div>
                  <label className="block text-white/60 font-bold uppercase tracking-wider mb-1.5">
                    Desktop Focal Position
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["left", "center", "right"] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setSettings({ ...settings, desktopFocalPosition: pos })}
                        className={`py-2 rounded-xl font-bold uppercase text-[11px] transition-all capitalize ${
                          settings.desktopFocalPosition === pos
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white/5 text-white/50 hover:text-white"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Banner Image */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" /> Mobile Banner Image (Optional)
                  </h4>
                  <span className="text-[10px] font-bold text-white/40">900 × 1100 px</span>
                </div>

                <div>
                  <label className="block text-white/60 font-bold uppercase tracking-wider mb-1">Mobile Image URL</label>
                  <input
                    type="text"
                    value={settings.mobileImageUrl || ""}
                    onChange={(e) => setSettings({ ...settings, mobileImageUrl: e.target.value })}
                    placeholder="Leave empty to use desktop banner"
                    className="w-full bg-black/40 border border-white/10 px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-red-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <input
                    type="file"
                    id="mobileDealImageUpload"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "mobile")}
                    className="hidden"
                  />
                  <label
                    htmlFor="mobileDealImageUpload"
                    className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 border border-white/10"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    {uploadingMobile ? "Uploading Image..." : "Upload Mobile Banner"}
                  </label>
                </div>

                {/* Mobile Focal Position Selector */}
                <div>
                  <label className="block text-white/60 font-bold uppercase tracking-wider mb-1.5">
                    Mobile Focal Position
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["left", "center", "right"] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setSettings({ ...settings, mobileFocalPosition: pos })}
                        className={`py-2 rounded-xl font-bold uppercase text-[11px] transition-all capitalize ${
                          settings.mobileFocalPosition === pos
                            ? "bg-emerald-600 text-white shadow-md"
                            : "bg-white/5 text-white/50 hover:text-white"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div>
              <label className="block text-white/60 font-bold uppercase tracking-wider text-xs mb-1.5">
                Accessible Image Alt Text (SEO)
              </label>
              <input
                type="text"
                value={settings.imageAlt}
                onChange={(e) => setSettings({ ...settings, imageAlt: e.target.value })}
                placeholder="Today's Deal promotional devices and accessories"
                className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-red-500 font-medium text-xs"
              />
            </div>
          </div>
        )}

        {/* ── GROUP D: OVERLAY BOX, COLORS & LAYOUT ── */}
        {activeTabGroup === "appearance" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            
            {/* Color Pickers Matrix */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Color Customization (HEX &amp; Color Pickers)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                
                {/* Box Background */}
                <div>
                  <label className="block text-white/60 font-bold mb-1">Box Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.boxBackgroundColor || "#090909"}
                      onChange={(e) => setSettings({ ...settings, boxBackgroundColor: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.boxBackgroundColor}
                      onChange={(e) => setSettings({ ...settings, boxBackgroundColor: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Heading Color */}
                <div>
                  <label className="block text-white/60 font-bold mb-1">Heading Text</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.headingColor || "#FFFFFF"}
                      onChange={(e) => setSettings({ ...settings, headingColor: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.headingColor}
                      onChange={(e) => setSettings({ ...settings, headingColor: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Description Color */}
                <div>
                  <label className="block text-white/60 font-bold mb-1">Description Text</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.descriptionColor || "#E5E5E5"}
                      onChange={(e) => setSettings({ ...settings, descriptionColor: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.descriptionColor}
                      onChange={(e) => setSettings({ ...settings, descriptionColor: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Eyebrow / Live Dot */}
                <div>
                  <label className="block text-white/60 font-bold mb-1">Eyebrow &amp; Live Dot</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.eyebrowColor || "#ED0712"}
                      onChange={(e) => setSettings({ ...settings, eyebrowColor: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.eyebrowColor}
                      onChange={(e) => setSettings({ ...settings, eyebrowColor: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* CTA Background */}
                <div>
                  <label className="block text-white/60 font-bold mb-1">CTA Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.ctaBackgroundColor || "#ED0712"}
                      onChange={(e) => setSettings({ ...settings, ctaBackgroundColor: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.ctaBackgroundColor}
                      onChange={(e) => setSettings({ ...settings, ctaBackgroundColor: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* CTA Text Color */}
                <div>
                  <label className="block text-white/60 font-bold mb-1">CTA Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.ctaTextColor || "#FFFFFF"}
                      onChange={(e) => setSettings({ ...settings, ctaTextColor: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.ctaTextColor}
                      onChange={(e) => setSettings({ ...settings, ctaTextColor: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Countdown Background */}
                <div>
                  <label className="block text-white/60 font-bold mb-1">Timer Box Bg</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.countdownBackgroundColor || "#FFFFFF"}
                      onChange={(e) => setSettings({ ...settings, countdownBackgroundColor: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.countdownBackgroundColor}
                      onChange={(e) => setSettings({ ...settings, countdownBackgroundColor: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Countdown Text Color */}
                <div>
                  <label className="block text-white/60 font-bold mb-1">Timer Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.countdownTextColor || "#090909"}
                      onChange={(e) => setSettings({ ...settings, countdownTextColor: e.target.value })}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.countdownTextColor}
                      onChange={(e) => setSettings({ ...settings, countdownTextColor: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Box Positioning & Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              
              {/* Horizontal Position */}
              <div>
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-2">
                  Box Position (Horizontal)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["left", "center", "right"] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setSettings({ ...settings, boxPosition: pos })}
                      className={`py-2.5 rounded-xl font-bold uppercase text-[11px] transition-all capitalize ${
                        settings.boxPosition === pos ? "bg-red-600 text-white shadow-md" : "bg-white/5 text-white/50 hover:text-white"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical Alignment */}
              <div>
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-2">
                  Vertical Alignment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["top", "center", "bottom"] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setSettings({ ...settings, verticalAlignment: align })}
                      className={`py-2.5 rounded-xl font-bold uppercase text-[11px] transition-all capitalize ${
                        settings.verticalAlignment === align ? "bg-red-600 text-white shadow-md" : "bg-white/5 text-white/50 hover:text-white"
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Layout Mode */}
              <div>
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-2">
                  Mobile Layout Mode (&lt; 768px)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, mobileLayout: "stacked" })}
                    className={`py-2.5 rounded-xl font-bold uppercase text-[11px] transition-all ${
                      settings.mobileLayout === "stacked" ? "bg-red-600 text-white shadow-md" : "bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    Stacked (Clean)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, mobileLayout: "overlay" })}
                    className={`py-2.5 rounded-xl font-bold uppercase text-[11px] transition-all ${
                      settings.mobileLayout === "overlay" ? "bg-red-600 text-white shadow-md" : "bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    Overlay
                  </button>
                </div>
              </div>

              {/* Box Width Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-white/60 font-bold">
                  <span>Box Width (Desktop)</span>
                  <span className="text-white">{settings.boxWidth ?? 40}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="60"
                  value={settings.boxWidth ?? 40}
                  onChange={(e) => setSettings({ ...settings, boxWidth: Number(e.target.value) })}
                  className="w-full accent-red-600"
                />
              </div>

              {/* Box Opacity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-white/60 font-bold">
                  <span>Box Opacity</span>
                  <span className="text-white">{settings.boxBackgroundOpacity ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={settings.boxBackgroundOpacity ?? 100}
                  onChange={(e) => setSettings({ ...settings, boxBackgroundOpacity: Number(e.target.value) })}
                  className="w-full accent-red-600"
                />
              </div>

              {/* Dark Image Overlay */}
              <div className="space-y-1">
                <div className="flex justify-between text-white/60 font-bold">
                  <span>Image Dark Tint Overlay</span>
                  <span className="text-white">{settings.imageOverlayOpacity ?? 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={settings.imageOverlayOpacity ?? 0}
                  onChange={(e) => setSettings({ ...settings, imageOverlayOpacity: Number(e.target.value) })}
                  className="w-full accent-red-600"
                />
              </div>

              {/* Corner Radius */}
              <div className="space-y-1">
                <div className="flex justify-between text-white/60 font-bold">
                  <span>Border Radius</span>
                  <span className="text-white">{settings.borderRadius ?? 8}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={settings.borderRadius ?? 8}
                  onChange={(e) => setSettings({ ...settings, borderRadius: Number(e.target.value) })}
                  className="w-full accent-red-600"
                />
              </div>

              {/* Box Padding */}
              <div className="space-y-1">
                <div className="flex justify-between text-white/60 font-bold">
                  <span>Internal Padding</span>
                  <span className="text-white">{settings.boxPadding ?? 32}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={settings.boxPadding ?? 32}
                  onChange={(e) => setSettings({ ...settings, boxPadding: Number(e.target.value) })}
                  className="w-full accent-red-600"
                />
              </div>

            </div>
          </div>
        )}

        {/* ── GROUP E: COUNTDOWN TIMER & EXPIRY ── */}
        {activeTabGroup === "countdown" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200 text-xs">
            
            {/* Enable Countdown Switch */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Enable Live Countdown Timer
                </h4>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Calculates time based on Asia/Colombo timezone without client hydration mismatches.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.countdownEnabled}
                  onChange={(e) => setSettings({ ...settings, countdownEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
              </label>
            </div>

            {/* Date Time Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-1.5">
                  Start Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(settings.startsAt)}
                  onChange={(e) => setSettings({ ...settings, startsAt: fromDateTimeLocal(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-red-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-1.5">
                  End Date &amp; Time (Expiry)
                </label>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(settings.endsAt)}
                  onChange={(e) => setSettings({ ...settings, endsAt: fromDateTimeLocal(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-red-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-white/60 font-bold uppercase tracking-wider mb-1.5">
                  Timezone Standard
                </label>
                <select
                  value={settings.timezone || "Asia/Colombo"}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-red-500 font-bold text-xs"
                >
                  <option value="Asia/Colombo" className="bg-[#0F172A]">Asia/Colombo (Sri Lanka Time, GMT+5:30)</option>
                  <option value="Asia/Dubai" className="bg-[#0F172A]">Asia/Dubai (GST, GMT+4)</option>
                  <option value="UTC" className="bg-[#0F172A]">UTC / GMT Standard</option>
                </select>
              </div>
            </div>

            {/* Expiry Behavior Selector */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400" /> Expiry Behavior (What happens when timer reaches 00:00:00)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: "deal-ended", label: 'Show "Deal Ended"', desc: "Displays closed deal status" },
                  { id: "hide", label: "Hide Complete Section", desc: "Leaves no empty whitespace" },
                  { id: "replacement-cta", label: "Replace with Another CTA", desc: "Swaps button link & label" },
                  { id: "keep-banner", label: "Keep Banner Visible", desc: "Hides timer only" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, expiryAction: item.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      settings.expiryAction === item.id
                        ? "bg-red-600/20 border-red-500 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    <span className="font-extrabold text-white text-xs">{item.label}</span>
                    <span className="text-[10px] text-white/40 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>

              {settings.expiryAction === "replacement-cta" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-white/60 font-bold uppercase tracking-wider mb-1">
                      Replacement CTA Label
                    </label>
                    <input
                      type="text"
                      value={settings.replacementCtaLabel || ""}
                      onChange={(e) => setSettings({ ...settings, replacementCtaLabel: e.target.value })}
                      placeholder="Browse All Deals"
                      className="w-full bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-red-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 font-bold uppercase tracking-wider mb-1">
                      Replacement CTA URL
                    </label>
                    <input
                      type="text"
                      value={settings.replacementCtaUrl || ""}
                      onChange={(e) => setSettings({ ...settings, replacementCtaUrl: e.target.value })}
                      placeholder="/products"
                      className="w-full bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl text-white outline-none focus:border-red-500 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
