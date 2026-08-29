"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Tag, ArrowRight, Check } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/ToastProvider";

export interface CampaignPopupSettings {
  enabled: boolean;
  pageTargeting: "all" | "homepage" | "products";
  frequency: "once_per_session" | "once_per_day" | "every_visit";
  delaySeconds: number;
  imageUrl?: string;
  badgeText?: string;
  headline?: string;
  highlightText?: string;
  description?: string;
  couponCode?: string;
  discountText?: string;
  buttonText?: string;
  buttonUrl?: string;
  colorTheme?: "luxury_dark" | "gold_glow" | "clean_white" | "deep_purple";
  startDate?: string;
  endDate?: string;
}

const DEFAULT_POPUP: CampaignPopupSettings = {
  enabled: false,
  pageTargeting: "all",
  frequency: "once_per_session",
  delaySeconds: 7,
  imageUrl: "https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1000&auto=format&fit=crop",
  badgeText: "SPECIAL PROMO",
  headline: "GET LKR 1,500 OFF",
  highlightText: "YOUR FIRST ORDER!",
  description: "Use coupon code STREET10 at checkout to unlock exclusive discount on genuine smartphones & accessories.",
  couponCode: "STREET10",
  discountText: "LKR 1,500 OFF",
  buttonText: "Claim Discount Now",
  buttonUrl: "/products",
  colorTheme: "luxury_dark",
};

export default function CampaignPopup() {
  const [popup, setPopup] = useState<CampaignPopupSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const { showToast } = useToast();

  // Listen to Firestore real-time settings
  useEffect(() => {
    let unsubscribe: () => void;
    try {
      const popupRef = doc(db, "settings", "campaign_popup");
      unsubscribe = onSnapshot(
        popupRef,
        (snap) => {
          if (snap.exists()) {
            setPopup(snap.data() as CampaignPopupSettings);
          } else {
            setPopup(DEFAULT_POPUP);
          }
        },
        (err) => {
          console.warn("CampaignPopup Firestore error:", err);
          setPopup(DEFAULT_POPUP);
        }
      );
    } catch (e) {
      console.warn("CampaignPopup setup error:", e);
      setPopup(DEFAULT_POPUP);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Evaluate trigger conditions when popup settings load or pathname changes
  useEffect(() => {
    if (!popup || !popup.enabled) {
      setIsOpen(false);
      return;
    }

    // 0. Exclude admin and login pages
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) {
      setIsOpen(false);
      return;
    }

    // 1. Page Targeting Check
    if (popup.pageTargeting === "homepage" && pathname !== "/") {
      setIsOpen(false);
      return;
    }
    if (popup.pageTargeting === "products" && !pathname.startsWith("/products")) {
      setIsOpen(false);
      return;
    }

    // 2. Date Range Schedule Check
    const now = new Date().getTime();
    if (popup.startDate && new Date(popup.startDate).getTime() > now) {
      setIsOpen(false);
      return;
    }
    if (popup.endDate && new Date(popup.endDate).getTime() < now) {
      setIsOpen(false);
      return;
    }

    // 3. Frequency Control Check
    const storageKey = `sm_popup_dismissed_${popup.headline || "default"}`;
    if (popup.frequency === "once_per_session") {
      if (sessionStorage.getItem(storageKey)) return;
    } else if (popup.frequency === "once_per_day") {
      const lastDismissed = localStorage.getItem(storageKey);
      if (lastDismissed && now - Number(lastDismissed) < 86400000) return;
    }

    // 4. Trigger delay timer
    const delayMs = (popup.delaySeconds || 2) * 1000;
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [popup, pathname]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (!popup) return;
    const storageKey = `sm_popup_dismissed_${popup.headline || "default"}`;
    if (popup.frequency === "once_per_session") {
      sessionStorage.setItem(storageKey, "true");
    } else if (popup.frequency === "once_per_day") {
      localStorage.setItem(storageKey, String(new Date().getTime()));
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(`Coupon code '${code}' copied!`, "success");
    setTimeout(() => setCopied(false), 3000);
  };

  if (!popup || !popup.enabled || !isOpen) return null;

  const themeStyles = {
    luxury_dark: "bg-neutral-950/95 border-white/20 text-white backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]",
    gold_glow: "bg-gradient-to-b from-neutral-950 via-zinc-950 to-amber-950/80 border-amber-500/40 text-white backdrop-blur-2xl shadow-[0_10px_40px_rgba(245,158,11,0.2)]",
    clean_white: "bg-white/95 border-neutral-200 text-black shadow-2xl backdrop-blur-xl",
    deep_purple: "bg-gradient-to-b from-neutral-950 via-slate-950 to-purple-950/80 border-purple-500/40 text-white backdrop-blur-2xl shadow-[0_10px_40px_rgba(168,85,247,0.2)]",
  };

  const isLight = popup.colorTheme === "clean_white";

  return (
    <AnimatePresence>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-hidden select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        {/* Compact, Perfectly Proportioned Mobile Card Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className={`relative w-full max-w-[325px] sm:max-w-md border rounded-2xl sm:rounded-3xl overflow-hidden p-3.5 sm:p-5 font-outfit max-h-[86vh] flex flex-col ${
            themeStyles[popup.colorTheme || "luxury_dark"]
          }`}
        >
          {/* Compact Close Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close popup"
            className="absolute top-2.5 right-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Compact Graphic Image with 16:8 sleek aspect ratio */}
          {popup.imageUrl && (
            <div className="w-full h-24 sm:h-36 rounded-xl overflow-hidden mb-3 bg-neutral-900 border border-white/10 relative shrink-0 shadow-inner">
              <img
                src={popup.imageUrl}
                alt={popup.headline || "Promotional Campaign"}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          )}

          {/* Content Area */}
          <div className="flex flex-col flex-1 overflow-y-auto pr-0.5">
            {/* Badges */}
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {popup.badgeText && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    isLight ? "bg-black text-white" : "bg-amber-400 text-black"
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {popup.badgeText}
                </span>
              )}

              {popup.discountText && (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider">
                  {popup.discountText}
                </span>
              )}
            </div>

            {/* Headline */}
            <h3 className={`text-sm sm:text-base font-black tracking-tight leading-tight ${isLight ? "text-black" : "text-white"}`}>
              {popup.headline}{" "}
              {popup.highlightText && (
                <span className={isLight ? "text-amber-600" : "text-amber-400"}>
                  {popup.highlightText}
                </span>
              )}
            </h3>

            {/* Compact Description */}
            {popup.description && (
              <p className={`text-[11px] sm:text-xs mt-1 leading-snug line-clamp-2 ${isLight ? "text-neutral-600" : "text-neutral-300"}`}>
                {popup.description}
              </p>
            )}

            {/* Compact Coupon Code 1-Click Copy Box */}
            {popup.couponCode && (
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => handleCopyCoupon(popup.couponCode!)}
                  className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg border text-[11px] font-mono font-bold transition-all ${
                    isLight
                      ? "bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200"
                      : "bg-white/10 border-white/20 text-amber-300 hover:bg-white/15"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[10px] text-neutral-400 font-sans uppercase">Code:</span>
                    <span className="font-black uppercase tracking-wider text-white truncate">{popup.couponCode}</span>
                  </div>
                  {copied ? (
                    <span className="text-emerald-400 text-[10px] font-sans font-bold flex items-center gap-1 shrink-0 ml-1">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="text-[9px] text-white/60 font-sans shrink-0 ml-1">Tap to copy</span>
                  )}
                </button>
              </div>
            )}

            {/* Compact CTA Button */}
            {popup.buttonText && (
              <div className="mt-2.5">
                <Link
                  href={popup.buttonUrl || "/products"}
                  onClick={handleClose}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold text-xs transition-all shadow-md active:scale-95 ${
                    isLight
                      ? "bg-black text-white hover:bg-neutral-800"
                      : "bg-white text-black hover:bg-amber-400"
                  }`}
                >
                  <span>{popup.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
