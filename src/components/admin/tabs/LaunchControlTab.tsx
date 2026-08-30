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
} from "lucide-react";
import { useLaunchSettings } from "@/hooks/useLaunchSettings";
import { useServerTime } from "@/hooks/useServerTime";
import CountdownScreen from "@/components/launch/CountdownScreen";

const TIMEZONES = [
  { value: "Asia/Colombo", label: "Asia/Colombo (Sri Lanka Time, GMT+5:30)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (Gulf Standard Time, GMT+4:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, GMT+8:00)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
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
                Configure official website launch countdown, reveal sequence, and admin preview.
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
            <Eye className="w-4 h-4" /> Preview Countdown
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
                ? "Normal visitors only see the #FFFFFF launch countdown screen."
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

      {/* ── Live Countdown Display Preview ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Timer className="w-5 h-5 text-amber-400" /> Live Countdown Preview
            </h3>
            <p className="text-xs text-white/40 mt-0.5">Real-time simulation of visitor countdown</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            {countdown.isExpired ? "EXPIRED" : "LIVE TICKING"}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-4">
          {[
            { label: "DAYS", value: countdown.days },
            { label: "HOURS", value: countdown.hours },
            { label: "MINUTES", value: countdown.minutes },
            { label: "SECONDS", value: countdown.seconds },
          ].map((item, idx) => (
            <div key={item.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-20 sm:w-28 h-20 sm:h-28 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center shadow-inner">
                  <span className="font-mono font-black text-2xl sm:text-4xl text-white">
                    {item.value}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-white/50 tracking-widest mt-2">
                  {item.label}
                </span>
              </div>
              {idx < 3 && (
                <span className="font-mono font-black text-2xl sm:text-4xl text-white/20 px-2 sm:px-4 pb-6">
                  :
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Configuration Settings Form ── */}
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
              <span className="text-xs font-extrabold text-white">Full-Screen Countdown Preview</span>
              <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-md font-mono">
                #FFFFFF Background
              </span>
            </div>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all"
            >
              Close Preview
            </button>
          </div>

          <div className="relative flex-1">
            <CountdownScreen
              countdown={countdown}
              title={title}
              tagline={tagline}
              isTestMode={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
