"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { siteSettings as defaultSiteSettings } from "@/lib/data";
import { SiteSettings } from "@/lib/types";
import {
  Phone,
  Clock,
  MapPin,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe,
  RotateCcw,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Building2,
  Navigation,
  Share2,
  Calendar,
  Layers,
  Smartphone,
  ShieldCheck,
  Eye,
} from "lucide-react";

export default function ContactSettingsTab({ onRefresh }: { onRefresh?: () => void }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load live settings from Firestore doc `settings/site`
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const docRef = doc(db, "settings", "site");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<SiteSettings>;
          setSettings({
            ...defaultSiteSettings,
            ...data,
            business_hours: {
              ...defaultSiteSettings.business_hours,
              ...(data.business_hours || {}),
            },
          });
        } else {
          setSettings(defaultSiteSettings);
        }
      } catch (err: any) {
        console.warn("Failed to load site contact settings:", err);
        setSettings(defaultSiteSettings);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Save Settings to Firestore
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setErrorMessage("");
      setSavedSuccess(false);

      const payload = {
        ...settings,
        updated_at: new Date().toISOString(),
      };

      // Save to `settings/site` and also update `settings/store`
      await setDoc(doc(db, "settings", "site"), payload, { merge: true });
      await setDoc(
        doc(db, "settings", "store"),
        {
          store_name: settings.store_name,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          email: settings.email,
          address: settings.address,
          business_hours: settings.business_hours,
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);

      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Error saving contact settings:", err);
      setErrorMessage(`Failed to save settings: ${err?.message || "Please check connection"}`);
    } finally {
      setSaving(false);
    }
  };

  // Restore Default Settings
  const handleResetToDefaults = () => {
    if (confirm("Reset contact details and store hours to default values?")) {
      setSettings(defaultSiteSettings);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-12 text-center text-white/50 space-y-3 font-outfit">
        <Clock className="w-8 h-8 mx-auto animate-spin text-blue-400" />
        <p className="text-sm font-bold text-white">Loading Store Contact &amp; Working Hours...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-outfit text-white pb-20">
      
      {/* ── TOP HEADER & SAVE BAR ── */}
      <div className="bg-slate-900/80 border border-white/10 p-5 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Store Contact Details &amp; Working Hours
              </h2>
              <p className="text-xs text-white/50">
                Update phone numbers, WhatsApp, physical address, business times &amp; Google Map location across the entire store
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
            title="Reset to original defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            {saving ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>✓ Contact details, working hours, and store location updated successfully in Firestore!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-xs font-bold text-red-300 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── MAIN 2-COLUMN SETTINGS FORM ── */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CONTACT DETAILS & WORKING HOURS (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">

          {/* ════════════════════════════════════════════════════════════════
             CARD 1: STORE IDENTITY & GENERAL INFORMATION
          ════════════════════════════════════════════════════════════════ */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-blue-400 flex items-center gap-2 border-b border-white/10 pb-3">
              <Building2 className="w-4 h-4" /> 1. Store Identity &amp; Slogan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Official Store Name *
                </label>
                <input
                  type="text"
                  value={settings.store_name}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                  placeholder="e.g. STREET MOBILE"
                  required
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white font-black text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Store Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={settings.tagline || ""}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  placeholder="e.g. Genuine Apple, Flagships & Premium Accessories"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
             CARD 2: PHONE NUMBERS, WHATSAPP & SUPPORT EMAIL
          ════════════════════════════════════════════════════════════════ */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-white/10 pb-3">
              <Phone className="w-4 h-4" /> 2. Phone Numbers &amp; Communication Channels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Primary Phone Hotline *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="024 222 8118 / +94 77 414 1118"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono font-bold outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-white/40 mt-1">Displayed in website header, footer &amp; contact card</p>
              </div>

              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Secondary Hotline / Mobile
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={settings.secondary_phone || ""}
                    onChange={(e) => setSettings({ ...settings, secondary_phone: e.target.value })}
                    placeholder="075 454 1118"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono font-bold outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-white/40 mt-1">Backup customer helpline number</p>
              </div>

              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  WhatsApp Hotline Number *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="text"
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    placeholder="94774141118"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-emerald-300 font-mono font-bold outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-white/40 mt-1">
                  Format with country code (e.g. <code>94774141118</code> for Sri Lanka)
                </p>
              </div>

              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Customer Support Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="streetmobilevavuniya@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-white/40 mt-1">For receiving customer order queries &amp; receipts</p>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
             CARD 3: BUSINESS WORKING HOURS & OPENING TIMES
          ════════════════════════════════════════════════════════════════ */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-white/10 pb-3">
              <Clock className="w-4 h-4" /> 3. Store Opening Hours &amp; Working Times
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Weekdays (Mon – Fri / Sat) *
                </label>
                <input
                  type="text"
                  value={settings.business_hours.weekdays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business_hours: { ...settings.business_hours, weekdays: e.target.value },
                    })
                  }
                  placeholder="9:00 AM - 9:00 PM"
                  required
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-amber-300 font-bold outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Saturday Working Hours *
                </label>
                <input
                  type="text"
                  value={settings.business_hours.saturday}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business_hours: { ...settings.business_hours, saturday: e.target.value },
                    })
                  }
                  placeholder="9:00 AM - 9:00 PM"
                  required
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-amber-300 font-bold outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Sunday Working Hours *
                </label>
                <input
                  type="text"
                  value={settings.business_hours.sunday}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business_hours: { ...settings.business_hours, sunday: e.target.value },
                    })
                  }
                  placeholder="10:00 AM - 6:00 PM"
                  required
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-amber-300 font-bold outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Online Support &amp; Delivery Schedule
                </label>
                <input
                  type="text"
                  value={settings.business_hours.online_support || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business_hours: { ...settings.business_hours, online_support: e.target.value },
                    })
                  }
                  placeholder="24/7 WhatsApp & Online Order Support"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-amber-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Holiday / Poya Day Note
                </label>
                <input
                  type="text"
                  value={settings.business_hours.holiday_note || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business_hours: { ...settings.business_hours, holiday_note: e.target.value },
                    })
                  }
                  placeholder="Open on all Poya days & Public Holidays"
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white outline-none focus:border-amber-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
             CARD 4: PHYSICAL STORE ADDRESS & GOOGLE MAPS
          ════════════════════════════════════════════════════════════════ */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-purple-400 flex items-center gap-2 border-b border-white/10 pb-3">
              <MapPin className="w-4 h-4" /> 4. Physical Store Address &amp; Google Map Location
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Complete Physical Address *
                </label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="163, Kandaswamy Kovil Road, Rambaikulam, Vavuniya Town, Sri Lanka"
                  required
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white font-medium outline-none focus:border-purple-500 transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                    Google Maps Share / Direction Link *
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <input
                      type="url"
                      value={settings.google_maps_link}
                      onChange={(e) => setSettings({ ...settings, google_maps_link: e.target.value })}
                      placeholder="https://maps.app.goo.gl/..."
                      required
                      className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-[11px] outline-none focus:border-purple-500 transition-all"
                    />
                    {settings.google_maps_link && (
                      <a
                        href={settings.google_maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        title="Test Maps Link in New Tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                    Google Maps Iframe Embed URL *
                  </label>
                  <input
                    type="text"
                    value={settings.google_maps_embed}
                    onChange={(e) => setSettings({ ...settings, google_maps_embed: e.target.value })}
                    placeholder="https://maps.google.com/maps?q=...&output=embed"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-[11px] outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
             CARD 5: SOCIAL MEDIA PROFILES
          ════════════════════════════════════════════════════════════════ */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-pink-400 flex items-center gap-2 border-b border-white/10 pb-3">
              <Share2 className="w-4 h-4" /> 5. Social Media &amp; Online Channels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={settings.facebook || ""}
                  onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white font-mono text-[11px] outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={settings.instagram || ""}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white font-mono text-[11px] outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold uppercase tracking-wider mb-1.5">
                  TikTok Profile URL
                </label>
                <input
                  type="url"
                  value={settings.tiktok || ""}
                  onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@..."
                  className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white font-mono text-[11px] outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE REALTIME PREVIEW CARD (4 COLS) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" /> Live Website Store Preview
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                LIVE
              </span>
            </div>

            {/* Simulated Store Location Card */}
            <div className="bg-slate-950 border border-white/10 rounded-2xl p-5 space-y-4 shadow-inner text-xs">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                  {settings.store_name || "STREET MOBILE"}
                </span>
                <p className="text-sm font-black text-white mt-0.5">
                  Visit Our Store in Vavuniya
                </p>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {settings.tagline || "Experience genuine devices & repair services"}
                </p>
              </div>

              {/* Mini Map Embed Preview */}
              <div className="w-full h-32 rounded-xl overflow-hidden bg-black border border-white/10 relative">
                {settings.google_maps_embed ? (
                  <iframe
                    src={settings.google_maps_embed}
                    width="100%"
                    height="100%"
                    loading="lazy"
                    title="Map Preview"
                    className="border-0 opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                    Map Embed Preview
                  </div>
                )}
              </div>

              {/* Address Preview */}
              <div className="flex items-start gap-2 text-white/80">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-snug">{settings.address}</span>
              </div>

              {/* Working Hours Preview */}
              <div className="flex items-start gap-2 text-white/80">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] space-y-0.5">
                  <p><strong className="text-white">Mon–Sat:</strong> {settings.business_hours.weekdays}</p>
                  <p><strong className="text-white">Sunday:</strong> {settings.business_hours.sunday}</p>
                  {settings.business_hours.online_support && (
                    <p className="text-emerald-400 text-[10px] font-bold">✓ {settings.business_hours.online_support}</p>
                  )}
                </div>
              </div>

              {/* Phone Preview */}
              <div className="flex items-center gap-2 text-white/80">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-mono font-bold text-white">{settings.phone}</span>
              </div>

              {/* Direct Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-center text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </a>

                {settings.google_maps_link && (
                  <a
                    href={settings.google_maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-center text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Get Directions
                  </a>
                )}
              </div>
            </div>

            {/* Bottom Save CTA in Preview Card */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              {saving ? "Saving Changes..." : "Save Store Configuration"}
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
