"use client";

import React, { useState, useEffect } from "react";
import { Settings, Sparkles, Rocket, Star, Image as ImageIcon, Bot, Save, Check } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SettingsTab({
  settings,
  onSave,
}: {
  settings: any;
  onSave: (newSettings: any) => void;
}) {
  const [localSettings, setLocalSettings] = useState<any>(settings || {});
  const [galleryEnabled, setGalleryEnabled] = useState<boolean>(true);
  const [reviewsEnabled, setReviewsEnabled] = useState<boolean>(true);
  const [launchEnabled, setLaunchEnabled] = useState<boolean>(true);
  const [assistantEnabled, setAssistantEnabled] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }

    // Load independent section states from Firestore
    async function loadSectionStates() {
      try {
        const [launchDoc, galleryDoc, reviewsDoc] = await Promise.all([
          getDoc(doc(db, "settings", "pre_launch")),
          getDoc(doc(db, "settings", "gallery_animation")),
          getDoc(doc(db, "settings", "google_reviews")),
        ]);

        if (launchDoc.exists()) {
          setLaunchEnabled(launchDoc.data().enabled !== false);
        }
        if (galleryDoc.exists()) {
          setGalleryEnabled(galleryDoc.data().enabled !== false);
        }
        if (reviewsDoc.exists()) {
          setReviewsEnabled(reviewsDoc.data().enabled !== false);
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
      // 1. Save UI Settings
      onSave(localSettings);

      // 2. Save Launch setting
      await setDoc(doc(db, "settings", "pre_launch"), { enabled: launchEnabled }, { merge: true });
      await setDoc(doc(db, "siteSettings", "launch"), { enabled: launchEnabled }, { merge: true });

      // 3. Save Gallery setting
      await setDoc(doc(db, "settings", "gallery_animation"), { enabled: galleryEnabled, updatedAt: new Date().toISOString() }, { merge: true });
      await setDoc(doc(db, "siteSettings", "galleryAnimation"), { enabled: galleryEnabled, updatedAt: new Date().toISOString() }, { merge: true });

      // 4. Save Reviews setting
      await setDoc(doc(db, "settings", "google_reviews"), { enabled: reviewsEnabled }, { merge: true });

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
    <div className="space-y-6 text-white font-outfit">
      
      {/* ── Section 1: Master Homepage & Launch Visibility Center ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Homepage &amp; Launch Visibility Center (ON / OFF)
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Master control switches to turn key storefront and experience sections ON or OFF across the website.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving..." : savedSuccess ? "Settings Saved!" : "Save All Settings"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Switch 1: Launch Countdown Gate */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            launchEnabled ? "bg-purple-950/30 border-purple-500/40 shadow-lg shadow-purple-500/5" : "bg-white/5 border-white/10 opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Rocket className={`w-4 h-4 ${launchEnabled ? "text-purple-400" : "text-white/40"}`} />
                <span className="font-extrabold text-sm text-white">Pre-Launch Countdown Gate</span>
              </div>
              <p className="text-xs text-white/50">
                {launchEnabled ? "ENABLED • Visitors see 30s launch assistant" : "DISABLED • Visitors enter website directly"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={launchEnabled}
                onChange={(e) => setLaunchEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
            </label>
          </div>

          {/* Switch 2: Store Photo Gallery */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            galleryEnabled ? "bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-500/5" : "bg-white/5 border-white/10 opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ImageIcon className={`w-4 h-4 ${galleryEnabled ? "text-emerald-400" : "text-white/40"}`} />
                <span className="font-extrabold text-sm text-white">Store Photo Gallery Section</span>
              </div>
              <p className="text-xs text-white/50">
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
              <div className="w-12 h-6.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
            </label>
          </div>

          {/* Switch 3: Customer Reviews */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            reviewsEnabled ? "bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-500/5" : "bg-white/5 border-white/10 opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${reviewsEnabled ? "text-amber-400" : "text-white/40"}`} />
                <span className="font-extrabold text-sm text-white">Google Customer Reviews</span>
              </div>
              <p className="text-xs text-white/50">
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
              <div className="w-12 h-6.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
            </label>
          </div>

          {/* Switch 4: Gallery Particle Snow Effect */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            localSettings.snowEffectEnabled ? "bg-blue-950/30 border-blue-500/40 shadow-lg shadow-blue-500/5" : "bg-white/5 border-white/10 opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${localSettings.snowEffectEnabled ? "text-blue-400" : "text-white/40"}`} />
                <span className="font-extrabold text-sm text-white">Gallery Particle Snow Effect</span>
              </div>
              <p className="text-xs text-white/50">
                Realistic 50k+ particle snow effect on the gallery section background
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={localSettings.snowEffectEnabled || false}
                onChange={(e) => setLocalSettings({ ...localSettings, snowEffectEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
            </label>
          </div>

        </div>
      </div>

    </div>
  );
}
