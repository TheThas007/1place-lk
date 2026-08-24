"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import { siteSettings } from "@/lib/data";
import { motion } from "framer-motion";

export default function StoreLocation() {
  const [loadMap, setLoadMap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ── Mobile Layout (< 768px): Google Maps & Store Details Card ── */}
      <section
        className="md:hidden w-full bg-white px-3 sm:px-4 py-4 select-none"
        aria-label="Store Location & Contact"
      >
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm overflow-hidden">
          {/* Header Badge & Title */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-neutral-900 animate-pulse" />
              <span>Store Location</span>
            </div>
            <span className="text-[11px] font-bold text-neutral-900 flex items-center gap-1">
              ★ 4.9 <span className="text-neutral-400 font-normal">(285+ Reviews)</span>
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black text-neutral-900 tracking-tight leading-tight">
              Visit Our Store in Vavuniya
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Experience the latest smartphones and professional repair services.
            </p>
          </div>

          {/* Google Maps Live Frame */}
          <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-200/80 shadow-xs">
            {loadMap ? (
              <iframe
                title="STREET MOBILE Google Maps Location Mobile"
                src={siteSettings.google_maps_embed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full block"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-white p-4 text-center">
                <MapPin className="w-6 h-6 text-white/80 mb-1.5 animate-bounce" />
                <p className="text-xs text-neutral-300 font-medium mb-2">Street Mobile — Vavuniya</p>
                <button
                  type="button"
                  onClick={() => setLoadMap(true)}
                  className="px-3.5 py-1 rounded-full bg-white text-black text-[11px] font-bold shadow-xs active:scale-95 transition-transform"
                >
                  Load Google Map
                </button>
              </div>
            )}
          </div>

          {/* Store Details List */}
          <div className="space-y-2.5 pt-1">
            {/* Address */}
            <div className="flex items-start gap-2.5 text-xs text-neutral-700 font-medium">
              <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-900" />
              </div>
              <div>
                <span className="font-bold text-neutral-900 block text-xs">Address</span>
                <span className="text-neutral-600 text-[11px] leading-relaxed">
                  {siteSettings.address || "No. 125, 2nd Cross Street, Vavuniya, Sri Lanka"}
                </span>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="flex items-start gap-2.5 text-xs text-neutral-700 font-medium">
              <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-neutral-900" />
              </div>
              <div>
                <span className="font-bold text-neutral-900 block text-xs">Business Hours</span>
                <span className="text-neutral-600 text-[11px] leading-relaxed block">
                  Mon - Sat: {siteSettings.business_hours?.weekdays || "9:00 AM - 8:30 PM"}
                </span>
                <span className="text-neutral-600 text-[11px] leading-relaxed block">
                  Sun: {siteSettings.business_hours?.sunday || "9:00 AM - 3:00 PM"}
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-2.5 text-xs text-neutral-700 font-medium">
              <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-neutral-900" />
              </div>
              <div>
                <span className="font-bold text-neutral-900 block text-xs">Direct Call & WhatsApp</span>
                <a
                  href={`tel:${siteSettings.phone || "+94774141118"}`}
                  className="text-neutral-900 font-bold text-xs hover:underline block"
                >
                  {siteSettings.phone || "+94 77 414 1118"}
                </a>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={siteSettings.google_maps_link || "https://maps.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer text-center"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Get Directions</span>
            </a>

            <a
              href={`tel:${siteSettings.phone || "+94774141118"}`}
              className="py-2.5 px-3 bg-white hover:bg-neutral-100 text-black border border-neutral-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer text-center"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>Call Store</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Desktop Layout ── */}
      <div className="hidden md:block">
        <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
          {/* Decorative gradient orb */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-gray-100 to-transparent rounded-full blur-3xl -z-10 opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/60 backdrop-blur-[24px] saturate-[180%] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80"
            >
          <div className="grid lg:grid-cols-2">
            {/* Map Area */}
            <div className="h-[400px] lg:h-auto bg-gray-900 relative overflow-hidden min-h-[350px] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/5 mix-blend-multiply z-10 pointer-events-none" />
              {loadMap ? (
                <iframe
                  title="STREET MOBILE Google Maps Location"
                  src={siteSettings.google_maps_embed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 grayscale contrast-125 opacity-90 hover:grayscale-0 transition-all duration-1000 z-0"
                />
              ) : (
                <div className="text-center p-6 z-0">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">Click below or scroll to load Google Maps</p>
                  <button
                    onClick={() => setLoadMap(true)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all"
                  >
                    Load Map
                  </button>
                </div>
              )}
            </div>

            {/* Info Area */}
            <div className="p-8 lg:p-16 flex flex-col justify-center">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-xs font-semibold w-fit">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Store Location
                </div>
                <img
                  src="/logo.png"
                  alt="STREET MOBILE Logo"
                  className="h-10 lg:h-14 w-auto object-contain shrink-0"
                />
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-8 text-foreground">
                Visit Our Store in <br />Vavuniya
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Address</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                      {siteSettings.address}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Business Hours</h3>
                    <p className="text-muted-foreground text-sm">Mon-Sat: {siteSettings.business_hours.weekdays}</p>
                    <p className="text-muted-foreground text-sm">Sun: {siteSettings.business_hours.sunday}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Contact</h3>
                    <p className="text-muted-foreground text-sm">{siteSettings.phone}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-gray-100/80">
                <a
                  href={siteSettings.google_maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-black/90 transition-all duration-300 active:scale-[0.98]"
                >
                  Get Directions
                  <MapPin className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    </div>
  </>
  );
}
