"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Product, Category, Review, GalleryImage, HeroSlide } from "@/lib/types";
import { Activity, TrendingUp, TrendingDown, Eye, Plus, Search, Edit, Trash2, Package, FolderOpen, Image as ImageIcon, Star } from "lucide-react";

/* ─── Settings Tab ─── */
function SettingsTab({
  settings,
  onSave,
}: {
  settings: any;
  onSave: (newSettings: any) => void;
}) {
  const [localSettings, setLocalSettings] = useState<any>(settings || {});
  
  // Make sure it updates if the parent state loads after mount
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
      <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-blue-400" />
        UI Options
      </h3>
      
      <div className="space-y-6 max-w-xl">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <h4 className="text-white font-medium text-sm">Inside Street Mobile Snow Effect</h4>
            <p className="text-xs text-white/50 mt-1">Enable a realistic 50k+ particle snow effect on the gallery section background.</p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={localSettings.snowEffectEnabled || false}
              onChange={(e) => setLocalSettings({...localSettings, snowEffectEnabled: e.target.checked})}
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        <button
          onClick={() => onSave(localSettings)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
