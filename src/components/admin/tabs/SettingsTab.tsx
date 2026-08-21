"use client";

import React, { useState, useEffect } from "react";
import { Settings, Sliders, Check } from "lucide-react";
import { DEFAULT_MOTION_SETTINGS } from "@/lib/data";
import { MotionSettings } from "@/lib/types";

/* ─── Settings Tab ─── */
export default function SettingsTab({
  settings,
  onSave,
}: {
  settings: any;
  onSave: (newSettings: any) => void;
}) {
  const [localSettings, setLocalSettings] = useState<any>(settings || {});
  const [motionSettings, setMotionSettings] = useState<MotionSettings>(
    settings?.motion || DEFAULT_MOTION_SETTINGS
  );
  
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      if (settings.motion) setMotionSettings(settings.motion);
    }
  }, [settings]);

  const handleSave = () => {
    onSave({
      ...localSettings,
      motion: motionSettings,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* UI Options Card */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Homepage & UI Options
        </h3>
        
        <div className="space-y-4">
          {/* New Arrivals Section Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="pr-4">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-white font-medium text-sm">Show New Arrivals on Homepage</h4>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  localSettings.showNewArrivals !== false
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-white/10 text-white/50 border-white/10"
                }`}>
                  {localSettings.showNewArrivals !== false ? "Visible" : "Hidden"}
                </span>
              </div>
              <p className="text-xs text-white/50">Turn this off to hide the complete New Arrivals section from the homepage.</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={localSettings.showNewArrivals !== false}
                onChange={(e) => setLocalSettings({...localSettings, showNewArrivals: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 cursor-pointer" />
            </label>
          </div>

          {/* Featured Products Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="pr-4">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-white font-medium text-sm">Show Featured Products on Homepage</h4>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  localSettings.showFeaturedProducts !== false
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-white/10 text-white/50 border-white/10"
                }`}>
                  {localSettings.showFeaturedProducts !== false ? "Visible" : "Hidden"}
                </span>
              </div>
              <p className="text-xs text-white/50">Turn this off to hide the complete Featured Products section from the homepage.</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={localSettings.showFeaturedProducts !== false}
                onChange={(e) => setLocalSettings({...localSettings, showFeaturedProducts: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 cursor-pointer" />
            </label>
          </div>

          {/* Snow Effect Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <h4 className="text-white font-medium text-sm">Inside Street Mobile Snow Effect</h4>
              <p className="text-xs text-white/50 mt-1">Enable a realistic 50k+ particle snow effect on the gallery section background.</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={localSettings.snowEffectEnabled || false}
                onChange={(e) => setLocalSettings({...localSettings, snowEffectEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500" />
            </label>
          </div>
        </div>
      </div>

      {/* Motion Settings Card */}
      <div className="bg-slate-900/50 border border-indigo-500/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Motion & Smooth Scrolling
          </h3>
          <button
            type="button"
            onClick={() => setMotionSettings(DEFAULT_MOTION_SETTINGS)}
            className="text-xs text-white/60 hover:text-white hover:underline"
          >
            Reset Defaults
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Smooth Scroll */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <h4 className="text-white font-medium text-sm">Lenis Smooth Scrolling</h4>
              <p className="text-xs text-white/50 mt-0.5">Momentum-based buttery smooth scrolling on public pages.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={motionSettings.enableSmoothScroll !== false}
                onChange={(e) => setMotionSettings({ ...motionSettings, enableSmoothScroll: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 cursor-pointer" />
            </label>
          </div>

          {/* Section Reveals */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <h4 className="text-white font-medium text-sm">GSAP Section Scroll Reveals</h4>
              <p className="text-xs text-white/50 mt-0.5">Editorial scroll-triggered calm fade and translateY reveals.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={motionSettings.enableSectionReveals !== false}
                onChange={(e) => setMotionSettings({ ...motionSettings, enableSectionReveals: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 cursor-pointer" />
            </label>
          </div>

          {/* Hero Parallax */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <h4 className="text-white font-medium text-sm">Hero Scroll Parallax</h4>
              <p className="text-xs text-white/50 mt-0.5">Subtle 1.03 scale and translation on hero background.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={motionSettings.enableHeroParallax !== false}
                onChange={(e) => setMotionSettings({ ...motionSettings, enableHeroParallax: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 cursor-pointer" />
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] cursor-pointer"
      >
        Save All Settings
      </button>
    </div>
  );
}
