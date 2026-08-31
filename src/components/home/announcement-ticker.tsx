"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Truck, Lock, MapPin, Smartphone, Star, Zap, Gift, Heart, Award } from "lucide-react";
import { getTickerSettings } from "@/lib/firestore-client";
import { TickerSettings, TickerMessage } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  Truck,
  Lock,
  MapPin,
  Smartphone,
  Star,
  Zap,
  Gift,
  Heart,
  Award,
};

const SPEED_DURATION: Record<string, number> = {
  slow: 45,
  normal: 30,
  fast: 18,
};

export default function AnnouncementTicker() {
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    async function load() {
      try {
        const data = await getTickerSettings();
        setSettings(data);
      } catch {
        // Silent fallback — ticker won't show
      }
    }
    load();
  }, []);

  // ResizeObserver: dynamically update --ticker-height
  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      document.documentElement.style.setProperty("--ticker-height", `${h}px`);
    });
    observer.observe(el);
    const initialH = el.getBoundingClientRect().height;
    if (initialH > 0) {
      document.documentElement.style.setProperty("--ticker-height", `${initialH}px`);
    }
    return () => observer.disconnect();
  }, [settings]);

  // Set ticker height to 0 when not rendering
  useEffect(() => {
    if (!settings || !settings.enabled) {
      document.documentElement.style.setProperty("--ticker-height", "0px");
    }
  }, [settings]);

  if (!settings || !settings.enabled) return null;

  const activeMessages = settings.messages
    .filter((m) => m.active)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  if (activeMessages.length === 0) return null;

  const duration = SPEED_DURATION[settings.speed] || 30;
  const isRtl = settings.direction !== "ltr";

  // Build the message items JSX
  const renderMessages = (msgs: TickerMessage[]) =>
    msgs.map((msg, i) => {
      const IconComp = msg.icon ? ICON_MAP[msg.icon] : null;
      return (
        <span key={`${msg.id}-${i}`} className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap">
          {IconComp && <IconComp className="w-3.5 h-3.5 opacity-70 shrink-0" />}
          <span>{msg.text}</span>
          <span className="text-white/30 mx-3 text-[10px] select-none" aria-hidden="true">•</span>
        </span>
      );
    });

  return (
    <div
      ref={tickerRef}
      data-announcement-ticker
      className="w-full overflow-hidden border-none m-0 p-0 select-none"
      style={{
        backgroundColor: settings.bg_color || "#000000",
        color: settings.text_color || "#FFFFFF",
        fontFamily: "var(--font-manrope), Manrope, Inter, Arial, sans-serif",
      }}
      onMouseEnter={() => settings.pause_on_hover && setIsPaused(true)}
      onMouseLeave={() => settings.pause_on_hover && setIsPaused(false)}
      onTouchStart={() => settings.pause_on_hover && setIsPaused(true)}
      onTouchEnd={() => settings.pause_on_hover && setIsPaused(false)}
    >
      <div className="h-[36px] sm:h-[40px] md:h-[44px] flex items-center overflow-hidden">
        {prefersReducedMotion.current ? (
          /* Static horizontally scrollable row for reduced-motion users */
          <div className="flex items-center gap-0 overflow-x-auto text-[11px] sm:text-[13px] font-semibold px-3 sm:px-4 w-full scrollbar-none">
            {renderMessages(activeMessages)}
          </div>
        ) : (
          /* Seamless infinite marquee */
          <div
            className="flex items-center gap-0 text-[11px] sm:text-[13px] md:text-[14px] font-semibold ticker-marquee"
            style={{
              animationDuration: `${duration}s`,
              animationDirection: isRtl ? "normal" : "reverse",
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {/* Duplicate message group for seamless loop */}
            <div className="flex items-center gap-0 shrink-0">
              {renderMessages(activeMessages)}
            </div>
            <div className="flex items-center gap-0 shrink-0" aria-hidden="true">
              {renderMessages(activeMessages)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
