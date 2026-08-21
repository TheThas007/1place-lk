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
    luxury_dark: "bg-zinc-950 border-white/15 text-white",
    gold_glow: "bg-gradient-to-b from-zinc-950 via-zinc-900 to-amber-950/60 border-amber-500/40 text-white",
    clean_white: "bg-white border-neutral-200 text-black shadow-2xl",
    deep_purple: "bg-gradient-to-b from-zinc-950 via-slate-950 to-purple-950/70 border-purple-500/40 text-white",
  };

  const isLight = popup.colorTheme === "clean_white";

  return (
    <AnimatePresence>
      {/* ── Backdrop (full-screen) ── */}
      <div
        className="fixed inset-0 z-[150] flex flex-col justify-end md:justify-center md:items-center md:p-4 bg-black/80 backdrop-blur-md overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        {/* Mobile Bottom Sheet / Desktop Modal */}
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className={`relative w-full md:max-w-lg border md:rounded-3xl rounded-t-3xl overflow-y-auto overflow-x-hidden shadow-2xl p-6 sm:p-8 max-h-[92vh] md:max-h-[88vh] pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-8 ${
            themeStyles[popup.colorTheme || "luxury_dark"]
          }`}
        >
          {/* Prominent Close Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close popup"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Graphic Image */}
          {popup.imageUrl && (
            <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden mb-6 bg-black border border-white/10 relative shadow-inner">
              <img
                src={popup.imageUrl}
                alt={popup.headline || "Promotional Campaign"}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          )}

          {/* Badge & Discount Tag */}
          <div className="flex items-center gap-2 mb-3">
            {popup.badgeText && (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse ${
                  isLight ? "bg-black text-white" : "bg-amber-400 text-black"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {popup.badgeText}
              </span>
            )}

            {popup.discountText && (
              <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                {popup.discountText}
              </span>
            )}
          </div>

          {/* Headline */}
          <h3 className={`text-xl sm:text-2xl font-black tracking-tight leading-snug ${isLight ? "text-black" : "text-white"}`}>
            {popup.headline}{" "}
            {popup.highlightText && (
              <span className={isLight ? "text-amber-600" : "text-amber-400"}>
                {popup.highlightText}
              </span>
            )}
          </h3>

          {/* Description */}
          {popup.description && (
            <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isLight ? "text-neutral-600" : "text-neutral-300"}`}>
              {popup.description}
            </p>
          )}

          {/* Coupon Code 1-Click Copy Box */}
          {popup.couponCode && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => handleCopyCoupon(popup.couponCode!)}
                className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border text-xs font-mono font-bold transition-all shadow-sm ${
                  isLight
                    ? "bg-neutral-100 border-neutral-300 text-black hover:bg-neutral-200"
                    : "bg-white/10 border-white/20 text-amber-400 hover:bg-white/15"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>COUPON CODE: <span className="font-extrabold uppercase text-white">{popup.couponCode}</span></span>
                </div>
                {copied ? (
                  <span className="text-emerald-400 text-[11px] font-sans font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </span>
                ) : (
                  <span className="text-[10px] text-white/60 font-sans">Tap to copy</span>
                )}
              </button>
            </div>
          )}

          {/* CTA Button */}
          {popup.buttonText && (
            <div className="mt-5">
              <Link
                href={popup.buttonUrl || "/products"}
                onClick={handleClose}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-xl hover:scale-[1.02] active:scale-95 ${
                  isLight
                    ? "bg-black text-white hover:bg-neutral-800"
                    : "bg-white text-black hover:bg-amber-400 hover:text-black"
                }`}
              >
                <span>{popup.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
