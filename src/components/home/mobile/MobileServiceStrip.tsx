"use client";

import React from "react";
import { ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";
import { siteSettings } from "@/lib/data";

export default function MobileServiceStrip() {
  // Only render if store settings exist and are active
  const hasStoreInfo = Boolean(siteSettings?.store_name);
  if (!hasStoreInfo) return null;

  const trustItems = [
    {
      id: "genuine",
      icon: Award,
      label: "100% Genuine",
    },
    {
      id: "delivery",
      icon: Truck,
      label: "Islandwide Delivery",
    },
    {
      id: "warranty",
      icon: ShieldCheck,
      label: "Official Warranty",
    },
    {
      id: "support",
      icon: RotateCcw,
      label: "Easy Return",
    },
  ];

  return (
    <div className="md:hidden w-full bg-black text-white border-y border-white/10 px-3 py-2 select-none">
      <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none text-[10px] font-semibold text-white/85">
        {trustItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.id}>
              <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <Icon className="w-3.5 h-3.5 text-white/90 shrink-0" />
                <span>{item.label}</span>
              </div>
              {idx < trustItems.length - 1 && (
                <span className="text-white/20 select-none">|</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
