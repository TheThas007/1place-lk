"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  Smartphone,
  Star,
  Zap,
  Gift,
  Heart,
  Award,
  Lock,
} from "lucide-react";
import { getTickerSettings } from "@/lib/firestore-client";
import { TickerSettings, TickerMessage } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  MapPin,
  Star,
  Zap,
  Gift,
  Heart,
  Award,
};

const DEFAULT_MESSAGES: TickerMessage[] = [
  {
    id: "def-1",
    text: "Latest Smartphones & Accessories",
    icon: "Smartphone",
    active: true,
    sort_order: 1,
  },
  {
    id: "def-2",
    text: "Genuine Products with Warranty",
    icon: "ShieldCheck",
    active: true,
    sort_order: 2,
  },
  {
    id: "def-3",
    text: "Islandwide Delivery Available",
    icon: "Truck",
    active: true,
    sort_order: 3,
  },
  {
    id: "def-4",
    text: "Secure Online Payments",
    icon: "CreditCard",
    active: true,
    sort_order: 4,
  },
  {
    id: "def-5",
    text: "Visit 1place.lk Flagship Store — Colombo",
    icon: "MapPin",
    active: true,
    sort_order: 5,
  },
];

export default function AnnouncementTicker() {
  const [settings, setSettings] = useState<TickerSettings | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }

    async function load() {
      try {
        const data = await getTickerSettings();
        if (data && data.enabled !== false && data.messages && data.messages.length > 0) {
          setSettings(data);
        } else {
          setSettings({
            enabled: true,
            bg_color: "#111111",
            text_color: "#FFFFFF",
            speed: "normal",
            direction: "rtl",
            pause_on_hover: true,
            messages: DEFAULT_MESSAGES,
          });
        }
      } catch {
        setSettings({
          enabled: true,
          bg_color: "#111111",
          text_color: "#FFFFFF",
          speed: "normal",
          direction: "rtl",
          pause_on_hover: true,
          messages: DEFAULT_MESSAGES,
        });
      }
    }
    load();
  }, []);

  // Determine active messages
  const activeMessages = (settings?.messages || DEFAULT_MESSAGES)
    .filter((m) => m.active !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const messagesToDisplay = activeMessages.length > 0 ? activeMessages : DEFAULT_MESSAGES;

  const speedDuration =
    settings?.speed === "fast" ? 22 : settings?.speed === "slow" ? 45 : 32;

  const renderMessageGroup = (keyPrefix: string) => (
    <div key={keyPrefix} className="flex items-center shrink-0">
      {messagesToDisplay.map((msg, i) => {
        const IconComp = msg.icon ? ICON_MAP[msg.icon] || Smartphone : Smartphone;
        return (
          <span
            key={`${keyPrefix}-${msg.id || i}`}
            className="inline-flex items-center gap-2.5 shrink-0 whitespace-nowrap"
          >
            <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8C2042] shrink-0" />
            <span className="text-[12px] sm:text-[13px] font-semibold tracking-wide text-neutral-200 hover:text-white transition-colors">
              {msg.text}
            </span>
            <span
              className="text-neutral-700 mx-5 sm:mx-8 font-light select-none text-xs"
              aria-hidden="true"
            >
              |
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <div
      ref={tickerRef}
      data-announcement-ticker
      aria-label="Store Announcements"
      className="w-full overflow-hidden border-y border-neutral-900 select-none bg-[#111111] text-white py-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="h-[28px] sm:h-[32px] flex items-center overflow-hidden">
        {prefersReducedMotion ? (
          /* Accessible static scrollable fallback */
          <div className="flex items-center overflow-x-auto text-xs font-semibold px-4 w-full scrollbar-none">
            {renderMessageGroup("static")}
          </div>
        ) : (
          /* Seamless 0-jump infinite marquee */
          <div
            className="flex items-center shrink-0 ticker-marquee"
            style={{
              animationDuration: `${speedDuration}s`,
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {renderMessageGroup("set1")}
            {renderMessageGroup("set2")}
          </div>
        )}
      </div>
    </div>
  );
}
