"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DEFAULT_FOOTER_SETTINGS } from "@/lib/data";
import { FooterSettings, FooterLink } from "@/lib/types";
import { uploadImageWithFallback } from "@/lib/upload-utils";
import {
  Sparkles,
  Save,
  CheckCircle,
  Eye,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Globe,
  Upload,
  Monitor,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";

export default function FooterTab({ onRefresh }: { onRefresh?: () => void }) {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    async function loadSettings() {
      try {
        const docRef = doc(db, "settings", "footer");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings({ ...DEFAULT_FOOTER_SETTINGS, ...docSnap.data() } as FooterSettings);
        } else {
          setSettings(DEFAULT_FOOTER_SETTINGS);
        }
      } catch (err) {
        console.warn("Failed to load footer settings:", err);
        setSettings(DEFAULT_FOOTER_SETTINGS);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "settings", "footer");
      await setDoc(docRef, settings, { merge: true });
      setSavedSuccess(true);
      if (onRefresh) onRefresh();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save footer settings:", err);
      alert("Failed to save footer settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadImageWithFallback(file, "footer");
      setSettings((prev) => ({ ...prev, logo_url: url }));
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("Failed to upload logo image. Please enter a direct URL.");
    } finally {
      setUploadingLogo(false);
    }
  };

  /* Helper functions for link list management */
  const handleAddLink = (listKey: "shop_links" | "help_links" | "policy_links") => {
    const newLink: FooterLink = {
      id: `link-${Date.now()}`,
      label: "New Link",
      href: "/products",
    };
    setSettings((prev) => ({
      ...prev,
      [listKey]: [...(prev[listKey] || []), newLink],
    }));
  };

  const handleUpdateLink = (
    listKey: "shop_links" | "help_links" | "policy_links",
    index: number,
    field: keyof FooterLink,
    value: string
  ) => {
    setSettings((prev) => {
      const updated = [...(prev[listKey] || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [listKey]: updated };
    });
  };

  const handleDeleteLink = (listKey: "shop_links" | "help_links" | "policy_links", index: number) => {
    setSettings((prev) => {
      const updated = (prev[listKey] || []).filter((_, i) => i !== index);
      return { ...prev, [listKey]: updated };
    });
  };

  const handleMoveLink = (
    listKey: "shop_links" | "help_links" | "policy_links",
    index: number,
    direction: "up" | "down"
  ) => {
    setSettings((prev) => {
      const list = [...(prev[listKey] || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, [listKey]: list };
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-white/50">
        <p>Loading Footer Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-amber-400" /> Footer Settings
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Customize the minimal 4-column footer, branding, navigation links, social profiles, and legal copyright.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-black" /> Saved Successfully!
              </>
            ) : saving ? (
              "Saving Changes..."
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Footer Settings
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Side: Controls Form (col-span-7) ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Visibility & Brand Info */}
          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Enable Footer</h3>
                <p className="text-xs text-white/50">Show or hide the footer across all public pages.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled !== false}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400" />
              </label>
            </div>

            {/* Logo Upload & Configuration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-white/80">Footer Logo</label>
                <span className="text-[11px] text-amber-400/90 font-medium">
                  Transparent PNG or SVG with tightly cropped edges
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={settings.logo_url || ""}
                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                    placeholder="/logo.png or https://..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{uploadingLogo ? "Uploading..." : "Upload Logo File"}</span>
                    <input
                      type="file"
                      accept="image/png,image/svg+xml,image/webp,image/jpeg"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>
              </div>

              {/* Logo Size Selector */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-white/80 mb-2">Logo Display Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "small", label: "Small (160px)" },
                    { id: "medium", label: "Medium (180px)" },
                    { id: "large", label: "Large (200px) — Recommended" },
                  ].map((sizeOpt) => (
                    <button
                      key={sizeOpt.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, logo_size: sizeOpt.id as any })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center border ${
                        (settings.logo_size || "large") === sizeOpt.id
                          ? "bg-amber-400/15 border-amber-400 text-amber-300"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {sizeOpt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">Brand Description (Max 300px width)</label>
              <textarea
                rows={2}
                value={settings.description || ""}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Genuine mobiles, premium accessories and trusted service—all in one place."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          </div>

          {/* 2. Column 2: Shop Navigation Links */}
          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Column 2 — Shop Links</h3>
                <p className="text-xs text-white/50">Manage items displayed under the Shop column.</p>
              </div>
              <button
                type="button"
                onClick={() => handleAddLink("shop_links")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Link
              </button>
            </div>

            <div className="space-y-2.5">
              {(settings.shop_links || []).map((link, idx) => (
                <div key={link.id || idx} className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/5">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdateLink("shop_links", idx, "label", e.target.value)}
                    placeholder="Label"
                    className="w-1/3 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => handleUpdateLink("shop_links", idx, "href", e.target.value)}
                    placeholder="/products?..."
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleMoveLink("shop_links", idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 text-white/40 hover:text-white disabled:opacity-20"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveLink("shop_links", idx, "down")}
                    disabled={idx === (settings.shop_links || []).length - 1}
                    className="p-1.5 text-white/40 hover:text-white disabled:opacity-20"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLink("shop_links", idx)}
                    className="p-1.5 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Column 3: Help Links */}
          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Column 3 — Help Links</h3>
                <p className="text-xs text-white/50">Manage items displayed under the Help column.</p>
              </div>
              <button
                type="button"
                onClick={() => handleAddLink("help_links")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Link
              </button>
            </div>

            <div className="space-y-2.5">
              {(settings.help_links || []).map((link, idx) => (
                <div key={link.id || idx} className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/5">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdateLink("help_links", idx, "label", e.target.value)}
                    placeholder="Label"
                    className="w-1/3 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => handleUpdateLink("help_links", idx, "href", e.target.value)}
                    placeholder="/contact"
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleMoveLink("help_links", idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 text-white/40 hover:text-white disabled:opacity-20"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveLink("help_links", idx, "down")}
                    disabled={idx === (settings.help_links || []).length - 1}
                    className="p-1.5 text-white/40 hover:text-white disabled:opacity-20"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLink("help_links", idx)}
                    className="p-1.5 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Column 4: Social Links */}
          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">
              Column 4 — Social Profiles
            </h3>

            {/* Instagram */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/80">Instagram Profile URL</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.instagram_enabled !== false}
                    onChange={(e) => setSettings({ ...settings, instagram_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-400" />
                </label>
              </div>
              <input
                type="url"
                value={settings.instagram_url || ""}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            {/* TikTok */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/80">TikTok Profile URL</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.tiktok_enabled !== false}
                    onChange={(e) => setSettings({ ...settings, tiktok_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-400" />
                </label>
              </div>
              <input
                type="url"
                value={settings.tiktok_url || ""}
                onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                placeholder="https://tiktok.com/@..."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/80">Facebook Page URL</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.facebook_enabled !== false}
                    onChange={(e) => setSettings({ ...settings, facebook_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-400" />
                </label>
              </div>
              <input
                type="url"
                value={settings.facebook_url || ""}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Bottom Bar Legal & Aevonix Credit */}
          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">
              Bottom Bar &amp; Credits
            </h3>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">Copyright Line</label>
              <input
                type="text"
                value={settings.copyright_text || ""}
                onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })}
                placeholder="© 2026 Street Mobile. All rights reserved."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Developer Credit Text</label>
                <input
                  type="text"
                  value={settings.developer_credit_text || ""}
                  onChange={(e) => setSettings({ ...settings, developer_credit_text: e.target.value })}
                  placeholder="Designed & Developed by Aevonix"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Developer Credit URL</label>
                <input
                  type="text"
                  value={settings.developer_credit_url || ""}
                  onChange={(e) => setSettings({ ...settings, developer_credit_url: e.target.value })}
                  placeholder="https://aevonix.com"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Side: Live Simulator (col-span-5) ── */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="flex items-center justify-between bg-zinc-900/90 border border-white/10 px-4 py-3 rounded-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Live Footer Preview
            </span>
            <div className="flex items-center bg-black/50 border border-white/10 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                  previewDevice === "desktop" ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`}
              >
                <Monitor className="w-3 h-3" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                  previewDevice === "mobile" ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`}
              >
                <Smartphone className="w-3 h-3" /> Mobile
              </button>
            </div>
          </div>

          {/* Simulator Box */}
          <div
            className={`border border-white/15 bg-[#090909] text-white p-6 overflow-hidden rounded-none shadow-2xl transition-all ${
              previewDevice === "mobile" ? "max-w-[340px] mx-auto text-xs" : "w-full text-xs"
            }`}
            style={{ borderRadius: 0 }}
          >
            {/* Grid */}
            <div className={`grid gap-6 ${previewDevice === "mobile" ? "grid-cols-1" : "grid-cols-2"}`}>
              {/* Brand Column */}
              <div className="space-y-4">
                <div
                  style={{
                    width:
                      settings.logo_size === "small"
                        ? "150px"
                        : settings.logo_size === "medium"
                        ? "175px"
                        : "200px",
                  }}
                >
                  <img
                    src={settings.logo_url || "/logo.png"}
                    alt="Street Mobile"
                    className="w-full h-auto max-h-[64px] object-contain object-left block brightness-0 invert opacity-100"
                  />
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed max-w-[240px]">
                  {settings.description || "Genuine mobiles, premium accessories and trusted service—all in one place."}
                </p>
              </div>

              {/* Follow Us */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-white">Follow Us</h5>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[6px] border border-white/20 flex items-center justify-center text-white/80 text-[10px]">
                    IG
                  </div>
                  <div className="w-8 h-8 rounded-[6px] border border-white/20 flex items-center justify-center text-white/80 text-[10px]">
                    TT
                  </div>
                  <div className="w-8 h-8 rounded-[6px] border border-white/20 flex items-center justify-center text-white/80 text-[10px]">
                    FB
                  </div>
                </div>
              </div>

              {/* Shop Links */}
              <div className="space-y-1.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-white">Shop</h5>
                <div className="flex flex-col space-y-1 text-[11px] text-white/60">
                  {(settings.shop_links || []).slice(0, 4).map((l, i) => (
                    <span key={i}>{l.label}</span>
                  ))}
                </div>
              </div>

              {/* Help Links */}
              <div className="space-y-1.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-white">Help</h5>
                <div className="flex flex-col space-y-1 text-[11px] text-white/60">
                  {(settings.help_links || []).slice(0, 4).map((l, i) => (
                    <span key={i}>{l.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Bar Divider */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2 text-[10px] text-white/60">
              <p className="m-0">{settings.copyright_text || "© 2026 Street Mobile. All rights reserved."}</p>
              <p className="m-0">
                Designed &amp; Developed by <span className="text-white font-medium">Aevonix</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
