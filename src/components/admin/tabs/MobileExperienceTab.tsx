"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, Save, Check } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MobileExperienceTab() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enableCampaignPopup: true,
    campaignPopupDelay: 3000,
    searchAliases: "fona:iphone\nmac:macbook\niwatch:apple watch",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const snap = await getDoc(doc(db, "settings", "mobile_experience"));
        if (snap.exists()) {
          setSettings(snap.data() as any);
        }
      } catch (e) {
        console.error("Failed to load mobile experience settings", e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "mobile_experience"), settings, { merge: true });
      showToast("Mobile experience settings saved successfully", "success");
    } catch (e) {
      console.error("Failed to save mobile experience settings", e);
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          Mobile Experience Configuration
        </h3>

        <div className="space-y-6">
          {/* Campaign Popup Config */}
          <div className="space-y-3">
            <h4 className="text-white font-medium text-sm">Campaign Popup (Bottom Sheet)</h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={settings.enableCampaignPopup}
                onChange={(e) => setSettings({ ...settings, enableCampaignPopup: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-800 border-white/10 text-emerald-500 focus:ring-emerald-500/20"
              />
              <span className="text-sm text-white/70">Enable sliding campaign popup on mobile</span>
            </label>
            <div className="mt-2">
              <label className="text-xs text-white/50 mb-1 block">Popup Delay (ms)</label>
              <input
                type="number"
                value={settings.campaignPopupDelay}
                onChange={(e) => setSettings({ ...settings, campaignPopupDelay: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Search Aliases Config */}
          <div className="space-y-3">
            <div>
              <h4 className="text-white font-medium text-sm">Fuzzy Search Aliases</h4>
              <p className="text-xs text-white/50 mt-1">Map common typos or slang to correct search terms. Format: <code>wrong_term:correct_term</code> (one per line).</p>
            </div>
            <textarea
              value={settings.searchAliases}
              onChange={(e) => setSettings({ ...settings, searchAliases: e.target.value })}
              rows={4}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
              placeholder="fona:iphone&#10;mac:macbook"
            />
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-white/90 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
              {saving ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
