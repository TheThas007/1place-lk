"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Tag, ArrowRight, Check } from "lucide-react";
import { OfferBanner } from "@/lib/types";
import { getOfferBanners } from "@/lib/firestore-client";
import { useToast } from "@/components/ui/ToastProvider";

export default function CampaignPopup() {
  const [banner, setBanner] = useState<OfferBanner | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadPopup() {
      try {
        const banners = await getOfferBanners("popup_campaign");
        if (banners.length > 0) {
          const pop = banners[0];
          setBanner(pop);
          // Check session storage frequency
          const key = `popup_shown_${pop.id}`;
          if (!sessionStorage.getItem(key)) {
            const timer = setTimeout(() => {
              setIsOpen(true);
              sessionStorage.setItem(key, "true");
            }, 3000);
            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        console.error("Failed to load popup banner:", err);
      }
    }
    loadPopup();
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(`Coupon ${code} copied!`, "success");
    setTimeout(() => setCopied(false), 3000);
  };

  if (!banner || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md bg-zinc-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6 text-white text-center"
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {banner.desktopImage && (
            <div className="w-full h-40 rounded-2xl overflow-hidden mb-5 bg-black border border-white/10">
              <img src={banner.desktopImage} alt={banner.headline} className="w-full h-full object-cover" />
            </div>
          )}

          {banner.badgeText && (
            <span className="inline-block px-3 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-extrabold uppercase mb-2">
              {banner.badgeText}
            </span>
          )}

          <h3 className="text-xl font-bold">
            {banner.headline} <span className="text-amber-400">{banner.highlightText}</span>
          </h3>

          {banner.description && (
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{banner.description}</p>
          )}

          {banner.couponCode && (
            <div className="mt-4">
              <button
                onClick={() => handleCopyCoupon(banner.couponCode!)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 border border-white/20 text-xs font-mono font-bold text-amber-400 hover:bg-white/15 transition-colors"
              >
                <Tag className="w-4 h-4" /> CODE: {banner.couponCode}
                {copied ? <Check className="w-4 h-4 text-emerald-400 ml-1" /> : <span className="text-[10px] text-white/50">(Tap to copy)</span>}
              </button>
            </div>
          )}

          {banner.primaryCtaText && (
            <div className="mt-5">
              <Link
                href={banner.primaryCtaUrl || "/products"}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors shadow-lg"
              >
                {banner.primaryCtaText} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
