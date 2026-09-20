"use client";

import React, { useState, useEffect } from "react";
import { Settings, Sparkles, Star, Image as ImageIcon, Bot, Save, Check } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminTheme } from "@/app/admin/dashboard/layout";

export default function SettingsTab({
  settings,
  onSave,
}: {
  settings?: any;
  onSave?: (newSettings: any) => void;
}) {
  const { isLight } = useAdminTheme();
  const [localSettings, setLocalSettings] = useState<any>(settings || {});
  const [galleryEnabled, setGalleryEnabled] = useState<boolean>(true);
  const [reviewsEnabled, setReviewsEnabled] = useState<boolean>(true);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }

    // Load independent section states from Firestore
    async function loadSectionStates() {
      try {
        const [galleryDoc, reviewsDoc, authDoc] = await Promise.all([
          getDoc(doc(db, "settings", "gallery_animation")),
          getDoc(doc(db, "settings", "google_reviews")),
          getDoc(doc(db, "settings", "auth")),
        ]);

        if (galleryDoc.exists()) {
          setGalleryEnabled(galleryDoc.data().enabled !== false);
        }
        if (reviewsDoc.exists()) {
          setReviewsEnabled(reviewsDoc.data().enabled !== false);
        }
        if (authDoc.exists()) {
          setGoogleAuthEnabled(Boolean(authDoc.data()?.googleAuthEnabled));
        }
      } catch (e) {
        console.warn("Could not load section visibility states in SettingsTab:", e);
      }
    }

    loadSectionStates();
  }, [settings]);

  const handleSaveAll = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      // 1. Save UI Settings if callback provided
      if (onSave) {
        onSave(localSettings);
      }

      // 2. Save Gallery setting
      await setDoc(doc(db, "settings", "gallery_animation"), { enabled: galleryEnabled, updatedAt: new Date().toISOString() }, { merge: true });
      await setDoc(doc(db, "siteSettings", "galleryAnimation"), { enabled: galleryEnabled, updatedAt: new Date().toISOString() }, { merge: true });

      // 3. Save Reviews setting
      await setDoc(doc(db, "settings", "google_reviews"), { enabled: reviewsEnabled }, { merge: true });

      // 4. Save Google Auth toggle setting
      await setDoc(doc(db, "settings", "auth"), { googleAuthEnabled, updatedAt: new Date().toISOString() }, { merge: true });
      await setDoc(doc(db, "siteSettings", "auth"), { googleAuthEnabled, updatedAt: new Date().toISOString() }, { merge: true });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error("Error saving settings:", e);
      alert("Failed to save settings. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1: Master Homepage & Launch Visibility Center ── */}
      <div className={`border rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs ${
        isLight ? "bg-white border-[#E2E8F0]" : "bg-[#0E141D] border-white/[0.08]"
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
          isLight ? "border-slate-100" : "border-white/[0.08]"
        }`}>
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              Storefront &amp; Auth Control Center (ON / OFF)
            </h3>
            <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Master control switches to turn authentication methods and homepage sections ON or OFF.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto active:scale-[0.99]"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving..." : savedSuccess ? "Settings Saved!" : "Save All Settings"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Switch: Google 1-Tap Authentication */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            googleAuthEnabled
              ? isLight
                ? "bg-blue-50/70 border-blue-200"
                : "bg-sky-950/20 border-sky-500/30"
              : isLight
              ? "bg-[#F8FAFC] border-slate-200 opacity-80"
              : "bg-white/[0.02] border-white/[0.08] opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-blue-600 dark:text-sky-400">G</span>
                <span className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                  Continue with Google (One-Tap Sign-In)
                </span>
              </div>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {googleAuthEnabled ? "ENABLED • Google sign-in button is visible" : "DISABLED (Hidden) • Users sign in with Email/Password"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={googleAuthEnabled}
                onChange={(e) => setGoogleAuthEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                isLight ? "bg-slate-300 peer-checked:bg-blue-600" : "bg-slate-800 peer-checked:bg-blue-600"
              } peer-checked:after:translate-x-full peer-checked:after:border-white shadow-inner`} />
            </label>
          </div>

          {/* Switch 2: Store Photo Gallery */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            galleryEnabled
              ? isLight
                ? "bg-emerald-50/70 border-emerald-200"
                : "bg-emerald-950/20 border-emerald-500/30"
              : isLight
              ? "bg-[#F8FAFC] border-slate-200 opacity-80"
              : "bg-white/[0.02] border-white/[0.08] opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ImageIcon className={`w-4 h-4 ${galleryEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                <span className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                  Store Photo Gallery Section
                </span>
              </div>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {galleryEnabled ? "ENABLED • Visible on homepage" : "DISABLED • Hidden from homepage"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={galleryEnabled}
                onChange={(e) => setGalleryEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                isLight ? "bg-slate-300 peer-checked:bg-emerald-600" : "bg-slate-800 peer-checked:bg-emerald-600"
              } peer-checked:after:translate-x-full peer-checked:after:border-white shadow-inner`} />
            </label>
          </div>

          {/* Switch 3: Customer Reviews */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            reviewsEnabled
              ? isLight
                ? "bg-amber-50/70 border-amber-200"
                : "bg-amber-950/20 border-amber-500/30"
              : isLight
              ? "bg-[#F8FAFC] border-slate-200 opacity-80"
              : "bg-white/[0.02] border-white/[0.08] opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${reviewsEnabled ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                <span className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                  Google Customer Reviews
                </span>
              </div>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {reviewsEnabled ? "ENABLED • Visible on homepage" : "DISABLED • Hidden from homepage"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={reviewsEnabled}
                onChange={(e) => setReviewsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                isLight ? "bg-slate-300 peer-checked:bg-amber-500" : "bg-slate-800 peer-checked:bg-amber-500"
              } peer-checked:after:translate-x-full peer-checked:after:border-white shadow-inner`} />
            </label>
          </div>

          {/* Switch 4: Gallery Particle Snow Effect */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            localSettings.snowEffectEnabled
              ? isLight
                ? "bg-blue-50/70 border-blue-200"
                : "bg-blue-950/20 border-blue-500/30"
              : isLight
              ? "bg-[#F8FAFC] border-slate-200 opacity-80"
              : "bg-white/[0.02] border-white/[0.08] opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${localSettings.snowEffectEnabled ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                <span className={`font-semibold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                  Gallery Particle Snow Effect
                </span>
              </div>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Realistic particle snow effect on the gallery section background
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={localSettings.snowEffectEnabled || false}
                onChange={(e) => setLocalSettings({ ...localSettings, snowEffectEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                isLight ? "bg-slate-300 peer-checked:bg-blue-600" : "bg-slate-800 peer-checked:bg-blue-600"
              } peer-checked:after:translate-x-full peer-checked:after:border-white shadow-inner`} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

