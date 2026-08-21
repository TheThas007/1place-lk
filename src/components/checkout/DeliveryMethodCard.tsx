"use client";

import React from "react";
import { Truck, Store, Check, MapPin, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { siteSettings } from "@/lib/data";

export type DeliveryMethod = "standard" | "pickup";

interface DeliveryMethodCardProps {
  selected: DeliveryMethod;
  onChange: (method: DeliveryMethod) => void;
  deliveryFee: number;
}

export default function DeliveryMethodCard({
  selected,
  onChange,
  deliveryFee,
}: DeliveryMethodCardProps) {
  return (
    <div className="space-y-3">
      {/* Option 1: Standard Courier Delivery */}
      <div
        onClick={() => onChange("standard")}
        className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
          selected === "standard"
            ? "border-black bg-neutral-50/60 shadow-xs ring-1 ring-black"
            : "border-neutral-200/90 bg-white hover:border-neutral-400"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Custom Radio Circle */}
            <div
              className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border transition-all ${
                selected === "standard"
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 bg-white"
              }`}
            >
              {selected === "standard" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>

            {/* Icon & Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-neutral-800" />
                <span className="text-sm sm:text-base font-bold text-neutral-950">
                  Standard Courier Delivery
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">
                Island-wide door-to-door delivery within 1–3 business days.
              </p>
            </div>
          </div>

          {/* Delivery Price */}
          <div className="text-right shrink-0">
            <span className="text-sm sm:text-base font-extrabold text-neutral-950">
              {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
            </span>
          </div>
        </div>
      </div>

      {/* Option 2: Store Pickup — Vavuniya */}
      <div
        onClick={() => onChange("pickup")}
        className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
          selected === "pickup"
            ? "border-black bg-neutral-50/60 shadow-xs ring-1 ring-black"
            : "border-neutral-200/90 bg-white hover:border-neutral-400"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Custom Radio Circle */}
            <div
              className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border transition-all ${
                selected === "pickup"
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 bg-white"
              }`}
            >
              {selected === "pickup" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>

            {/* Icon & Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-neutral-800" />
                <span className="text-sm sm:text-base font-bold text-neutral-950">
                  Store Pickup — Vavuniya
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Ready Same Day
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">
                Pick up in-person directly from our flagship showroom.
              </p>
            </div>
          </div>

          {/* Free Badge */}
          <div className="text-right shrink-0">
            <span className="text-sm sm:text-base font-extrabold text-emerald-600">
              Free
            </span>
          </div>
        </div>

        {/* Store Location preview if Store Pickup is active */}
        {selected === "pickup" && (
          <div className="mt-4 pt-3.5 border-t border-neutral-200/80 grid sm:grid-cols-2 gap-3 text-xs text-neutral-700 bg-white p-3 rounded-xl">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-900 block">Showroom Address:</span>
                <span className="text-neutral-600 leading-snug">{siteSettings.address}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-900 block">Opening Hours:</span>
                <span className="text-neutral-600 leading-snug">Mon - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
