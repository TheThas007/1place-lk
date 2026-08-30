"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Rocket,
  Timer,
  Calendar,
  Clock,
  Globe,
  Play,
  Eye,
  CheckCircle,
  AlertTriangle,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Layers,
  Heart,
  MapPin,
  Star,
  Image as ImageIcon,
  Smartphone,
  Sliders,
} from "lucide-react";
import { useLaunchSettings } from "@/hooks/useLaunchSettings";
import { useServerTime } from "@/hooks/useServerTime";
import CountdownScreen from "@/components/launch/CountdownScreen";
import { DEFAULT_PRE_LAUNCH_SETTINGS } from "@/lib/data";
import { PreLaunchExperienceSettings } from "@/lib/types";

const TIMEZONES = [
  { value: "Asia/Colombo", label: "Asia/Colombo (Sri Lanka Time, GMT+5:30)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (Gulf Standard Time, GMT+4:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, GMT+8:00)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
];

const ROTATION_INTERVAL_PRESETS = [
  { value: 30, label: "30 Seconds (Fast Demo)" },
  { value: 60, label: "1 Minute" },
  { value: 120, label: "2 Minutes" },
  { value: 300, label: "5 Minutes (Recommended Default)" },
  { value: 600, label: "10 Minutes" },
  { value: 900, label: "15 Minutes" },
];

export default function LaunchControlTab() {
  const { settings, loading, saveSettings, revealNow, disableCountdown, enableCountdown } =
    useLaunchSettings();

  // Local form state
  const [enabled, setEnabled] = useState<boolean>(true);
  const [dateStr, setDateStr] = useState<string>("2026-09-01");
  const [timeStr, setTimeStr] = useState<string>("18:00:00");
  const [timezone, setTimezone] = useState<string>("Asia/Colombo");
  const [title, setTitle] = useState<string>("STREET MOBILE");
  const [tagline, setTagline] = useState<string>("VAVUNIYA • SRI LANKA");

  // Pre-launch experience configuration
  const [preLaunchEnabled, setPreLaunchEnabled] = useState<boolean>(true);
  const [rotationIntervalSeconds, setRotationIntervalSeconds] = useState<number>(300);
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [swipeEnabled, setSwipeEnabled] = useState<boolean>(true);
  const [thankYouEnabled, setThankYouEnabled] = useState<boolean>(true);
  const [locationEnabled, setLocationEnabled] = useState<boolean>(true);
  const [reviewsEnabled, setReviewsEnabled] = useState<boolean>(true);
  const [galleryEnabled, setGalleryEnabled] = useState<boolean>(true);
  const [momentsEnabled, setMomentsEnabled] = useState<boolean>(true);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Fullscreen Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Initialize from remote settings
  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled ?? true);
      setTimezone(settings.timezone || "Asia/Colombo");
      setTitle(settings.title || "STREET MOBILE");
      setTagline(settings.tagline || "VAVUNIYA • SRI LANKA");

      if (settings.launchTimestamp) {
        try {
          const d = new Date(settings.launchTimestamp);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          setDateStr(`${yyyy}-${mm}-${dd}`);

          const hh = String(d.getHours()).padStart(2, "0");
          const min = String(d.getMinutes()).padStart(2, "0");
          const ss = String(d.getSeconds()).padStart(2, "0");
          setTimeStr(`${hh}:${min}:${ss}`);
        } catch {
          // Keep current strings if parse fails
        }
      }

      // Pre-launch settings
      const pl = settings.preLaunchExperience || DEFAULT_PRE_LAUNCH_SETTINGS;
      setPreLaunchEnabled(pl.enabled ?? true);
      setRotationIntervalSeconds(pl.rotationIntervalSeconds ?? 300);
      setAutoplay(pl.autoplay ?? true);
      setSwipeEnabled(pl.swipeEnabled ?? true);
      setThankYouEnabled(pl.thankYouEnabled ?? true);
      setLocationEnabled(pl.locationEnabled ?? true);
      setReviewsEnabled(pl.reviewsEnabled ?? true);
      setGalleryEnabled(pl.galleryEnabled ?? true);
      setMomentsEnabled(pl.momentsEnabled ?? true);
    }
  }, [settings]);

  // Compute ISO string from date, time and timezone
  const computedLaunchTimestamp = useMemo(() => {
    try {
      return new Date(`${dateStr}T${timeStr}`).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }, [dateStr, timeStr]);

  // Live countdown hook
  const { countdown, isSynced } = useServerTime({
    targetTimestamp: computedLaunchTimestamp,
  });

  // Compiled PreLaunchExperience object
  const compiledPreLaunchSettings: PreLaunchExperienceSettings = useMemo(() => {
    return {
      enabled: preLaunchEnabled,
      rotationIntervalSeconds,
      autoplay,
      swipeEnabled,
      thankYouEnabled,
      locationEnabled,
      reviewsEnabled,
      galleryEnabled,
      momentsEnabled,
    };
  }, [
    preLaunchEnabled,
    rotationIntervalSeconds,
    autoplay,
    swipeEnabled,
    thankYouEnabled,
    locationEnabled,
    reviewsEnabled,
    galleryEnabled,
    momentsEnabled,
  ]);

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await saveSettings({
        enabled,
        launchTimestamp: computedLaunchTimestamp,
        timezone,
        title,
        tagline,
        manualReveal: false,
        preLaunchExperience: compiledPreLaunchSettings,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert("Failed to save launch settings. Check console or permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger 10-second test launch
  const handleTrigger10sTest = () => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("street-mobile-test-launch", {
        detail: { seconds: 10 },
      });
      window.dispatchEvent(event);
      alert("10-Second Test Launch triggered! Go to public home page or preview to watch the countdown & reveal.");
    }
  };

  return (
    <div className="space-y-8 text-white font-outfit">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Launch Control</h1>
              <p className="text-xs sm:text-sm text-white/50 mt-0.5 font-medium">
                Configure official website launch countdown, 5-minute rotating customer showcase, and reveal sequence.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4" /> Preview Pre-Launch Experience
          </button>
          <a
            href="/admin-preview"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <ExternalLink className="w-4 h-4" /> Open Admin Preview
          </a>
        </div>
      </div>

      {/* ── Status Overview Card ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Indicator */}
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Launch Status</span>
            <div
              className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                enabled && !countdown.isExpired
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  enabled && !countdown.isExpired ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                }`}
              />
              {enabled && !countdown.isExpired ? "COUNTDOWN ACTIVE" : "WEBSITE ACCESSIBLE"}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black">
              {enabled && !countdown.isExpired ? "Public Locked" : "Public Live"}
            </h3>
            <p className="text-xs text-white/50 mt-1">
              {enabled && !countdown.isExpired
                ? "Normal visitors only see the #FFFFFF rotating pre-launch showcase."
                : "The full Street Mobile website is currently visible to everyone."}
            </p>
          </div>

          <div className="pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
              <span className="ml-3 text-xs font-bold text-white">
                {enabled ? "Countdown Enabled" : "Countdown Disabled"}
              </span>
            </label>
          </div>
        </div>

        {/* Live Target Time */}
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Target Launch Time</span>
            <Clock className="w-4 h-4 text-white/40" />
          </div>

          <div>
            <h3 className="text-xl font-black font-mono">
              {dateStr} {timeStr}
            </h3>
            <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
              <Globe className="w-3 h-3" /> {timezone}
            </p>
          </div>

          <div className="pt-1 text-[11px] text-white/40 font-mono">
            {countdown.isExpired ? "Launch time has passed" : `${countdown.totalSeconds}s remaining`}
          </div>
        </div>

        {/* Server Clock Sync */}
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Server-Time Protection</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div>
            <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Clock Synced
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Visitor system clock changes cannot bypass or alter the launch countdown.
            </p>
          </div>

          <div className="text-[11px] text-emerald-400/80 font-mono">
            Status: Active & Protected
          </div>
        </div>
      </div>

      {/* ── Section 2: Pre-Launch Experience Controls ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-400" /> Pre-Launch Dynamic Customer Experience
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Rotating showcase below the persistent countdown, featuring customer appreciation, location, real reviews, and shop gallery.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={preLaunchEnabled}
              onChange={(e) => setPreLaunchEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
            <span className="ml-3 text-xs font-bold text-white">
              {preLaunchEnabled ? "Showcase ON" : "Showcase OFF"}
            </span>
          </label>
        </div>

        {/* Rotation Interval & Behavior Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          {/* Rotation Interval */}
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
              Main Slide Rotation Interval
            </label>
            <select
              value={rotationIntervalSeconds}
              onChange={(e) => setRotationIntervalSeconds(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            >
              {ROTATION_INTERVAL_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value} className="bg-slate-900 text-white">
                  {preset.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-white/40 mt-1">
              Controls when the entire pre-launch slide changes automatically.
            </p>
          </div>

          {/* Autoplay Toggle */}
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
              Autoplay Content
            </label>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAutoplay(true)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  autoplay ? "bg-red-600 text-white shadow-md shadow-red-600/20" : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                ON (Automatic)
              </button>
              <button
                type="button"
                onClick={() => setAutoplay(false)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  !autoplay ? "bg-red-600 text-white shadow-md shadow-red-600/20" : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                OFF (Manual Only)
              </button>
            </div>
          </div>

          {/* Mobile Swipe Support */}
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
              Mobile Touch Swipe
            </label>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSwipeEnabled(true)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  swipeEnabled ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                Enabled
              </button>
              <button
                type="button"
                onClick={() => setSwipeEnabled(false)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  !swipeEnabled ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                Disabled
              </button>
            </div>
          </div>
        </div>

        {/* ── Active Screens Selection ── */}
        <div className="pt-4 border-t border-white/10">
          <label className="block text-xs font-bold text-white/70 mb-3 uppercase tracking-wider">
            Enabled Pre-Launch Screens
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Thank You */}
            <label
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                thankYouEnabled ? "bg-white/10 border-red-500/40 text-white" : "bg-white/5 border-white/5 text-white/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Heart className={`w-5 h-5 ${thankYouEnabled ? "text-red-400" : "text-white/30"}`} />
                <input
                  type="checkbox"
                  checked={thankYouEnabled}
                  onChange={(e) => setThankYouEnabled(e.target.checked)}
                  className="rounded border-white/20 text-red-600 focus:ring-0"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold">1. Thank You</h4>
                <p className="text-[10px] text-white/50 mt-0.5">Customer appreciation message</p>
              </div>
            </label>

            {/* 2. We Are Near You */}
            <label
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                locationEnabled ? "bg-white/10 border-red-500/40 text-white" : "bg-white/5 border-white/5 text-white/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <MapPin className={`w-5 h-5 ${locationEnabled ? "text-red-400" : "text-white/30"}`} />
                <input
                  type="checkbox"
                  checked={locationEnabled}
                  onChange={(e) => setLocationEnabled(e.target.checked)}
                  className="rounded border-white/20 text-red-600 focus:ring-0"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold">2. Near You</h4>
                <p className="text-[10px] text-white/50 mt-0.5">Vavuniya address & hours</p>
              </div>
            </label>

            {/* 3. Customer Reviews */}
            <label
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                reviewsEnabled ? "bg-white/10 border-red-500/40 text-white" : "bg-white/5 border-white/5 text-white/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Star className={`w-5 h-5 ${reviewsEnabled ? "text-amber-400" : "text-white/30"}`} />
                <input
                  type="checkbox"
                  checked={reviewsEnabled}
                  onChange={(e) => setReviewsEnabled(e.target.checked)}
                  className="rounded border-white/20 text-red-600 focus:ring-0"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold">3. Reviews</h4>
                <p className="text-[10px] text-white/50 mt-0.5">Auto-slider of 5★ ratings</p>
              </div>
            </label>

            {/* 4. Shop Gallery */}
            <label
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                galleryEnabled ? "bg-white/10 border-red-500/40 text-white" : "bg-white/5 border-white/5 text-white/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <ImageIcon className={`w-5 h-5 ${galleryEnabled ? "text-blue-400" : "text-white/30"}`} />
                <input
                  type="checkbox"
                  checked={galleryEnabled}
                  onChange={(e) => setGalleryEnabled(e.target.checked)}
                  className="rounded border-white/20 text-red-600 focus:ring-0"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold">4. Shop Gallery</h4>
                <p className="text-[10px] text-white/50 mt-0.5">Store visit & device photos</p>
              </div>
            </label>

            {/* 5. Customer Moments */}
            <label
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                momentsEnabled ? "bg-white/10 border-red-500/40 text-white" : "bg-white/5 border-white/5 text-white/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Sparkles className={`w-5 h-5 ${momentsEnabled ? "text-purple-400" : "text-white/30"}`} />
                <input
                  type="checkbox"
                  checked={momentsEnabled}
                  onChange={(e) => setMomentsEnabled(e.target.checked)}
                  className="rounded border-white/20 text-red-600 focus:ring-0"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold">5. Moments</h4>
                <p className="text-[10px] text-white/50 mt-0.5">Every visit appreciation</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ── Section 3: Schedule Date & Time Form ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-extrabold flex items-center gap-2 border-b border-white/10 pb-4">
          <Calendar className="w-5 h-5 text-blue-400" /> Launch Schedule Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Launch Date */}
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
              Launch Date
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Launch Time */}
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
              Launch Time (HH : MM : SS)
            </label>
            <input
              type="time"
              step="1"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value} className="bg-slate-900 text-white">
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Screen Title */}
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
              Screen Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="STREET MOBILE"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Screen Tagline */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
              Screen Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="VAVUNIYA • SRI LANKA"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* ── Action Buttons Row ── */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Save Settings */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : saveSuccess ? "Saved Successfully!" : "Save Settings"}
            </button>

            {/* Test 10-Second Countdown */}
            <button
              onClick={handleTrigger10sTest}
              className="px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Test 10-Second Launch
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Reveal Now */}
            <button
              onClick={async () => {
                if (confirm("Are you sure you want to REVEAL NOW? This will immediately make the website public.")) {
                  await revealNow();
                  alert("Website is now LIVE and publicly revealed!");
                }
              }}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4" />
              Reveal Now
            </button>

            {/* Disable Countdown */}
            <button
              onClick={async () => {
                if (confirm("Disable countdown screen?")) {
                  await disableCountdown();
                  setEnabled(false);
                }
              }}
              className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Disable Countdown
            </button>
          </div>
        </div>
      </div>

      {/* ── Fullscreen Preview Modal ── */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[99999999] bg-black/80 backdrop-blur-md flex flex-col">
          <div className="bg-[#0F172A] border-b border-white/10 p-4 flex items-center justify-between z-50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white">Full-Screen Pre-Launch Experience Preview</span>
              <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md font-mono">
                ADMIN PREVIEW
              </span>
            </div>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all"
            >
              Close Preview
            </button>
          </div>

          <div className="relative flex-1 bg-white">
            <CountdownScreen
              countdown={countdown}
              title={title}
              tagline={tagline}
              isTestMode={false}
              preLaunchSettings={compiledPreLaunchSettings}
            />
          </div>
        </div>
      )}
    </div>
  );
}
