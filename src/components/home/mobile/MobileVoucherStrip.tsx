"use client";

import React, { useState, useEffect } from "react";
import { Tag, Check, Copy } from "lucide-react";
import { getOfferBanners } from "@/lib/firestore-client";
import { OfferBanner } from "@/lib/types";
import { useToast } from "@/components/ui/ToastProvider";

export default function MobileVoucherStrip() {
  const [vouchers, setVouchers] = useState<OfferBanner[]>([]);
  const [collectedCodes, setCollectedCodes] = useState<string[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    let isSubscribed = true;

    getOfferBanners()
      .then((banners) => {
        if (!isSubscribed) return;
        const activeVouchers = (banners || []).filter(
          (b) => b.couponCode && b.couponCode.trim().length > 0
        );
        setVouchers(activeVouchers);
      })
      .catch((err) => {
        console.warn("Voucher load error:", err);
        if (isSubscribed) setVouchers([]);
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Auto-hide when no active vouchers exist in Firestore
  if (!vouchers || vouchers.length === 0) {
    return null;
  }

  const handleCopyVoucher = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    if (!collectedCodes.includes(code)) {
      setCollectedCodes((prev) => [...prev, code]);
    }
    showToast(`Voucher '${code}' collected! Auto-applied at checkout.`, "success");
    try {
      localStorage.setItem("sm_active_coupon", code);
    } catch {}
  };

  const handleCollectAll = () => {
    const allCodes = vouchers.map((v) => v.couponCode!).filter(Boolean);
    if (allCodes.length === 0) return;

    setCollectedCodes(allCodes);
    navigator.clipboard.writeText(allCodes[0]);
    try {
      localStorage.setItem("sm_active_coupon", allCodes[0]);
    } catch {}
    showToast(`Collected ${allCodes.length} vouchers! Code '${allCodes[0]}' ready at checkout.`, "success");
  };

  return (
    <section className="md:hidden w-full bg-[#FAFAFC] border-b border-neutral-200/70 py-3 px-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-black" />
          <h3 className="text-xs font-black uppercase tracking-tight text-neutral-900">
            Claim Vouchers & Save
          </h3>
        </div>
        <button
          type="button"
          onClick={handleCollectAll}
          className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-black text-white active:scale-95 transition-transform"
        >
          Collect All
        </button>
      </div>

      {/* Voucher Cards Carousel */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-3 px-3">
        {vouchers.map((v) => {
          const code = v.couponCode!;
          const isCollected = collectedCodes.includes(code);

          return (
            <div
              key={v.id}
              onClick={() => handleCopyVoucher(code)}
              className="flex items-center justify-between min-w-[200px] max-w-[240px] p-2 rounded-xl bg-white border border-neutral-200 shadow-2xs shrink-0 cursor-pointer active:scale-98 transition-all"
            >
              <div className="min-w-0 pr-2">
                <p className="text-[11px] font-black text-neutral-900 truncate">
                  {v.headline || v.promoLabel || "Exclusive Voucher"}
                </p>
                <p className="text-[10px] font-bold text-neutral-500 font-mono">
                  {code}
                </p>
              </div>

              <button
                type="button"
                className={`px-2 py-1 rounded-md text-[10px] font-black shrink-0 flex items-center gap-1 transition-colors ${
                  isCollected
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-neutral-100 hover:bg-black hover:text-white text-neutral-800"
                }`}
              >
                {isCollected ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>Claimed</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Claim</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
