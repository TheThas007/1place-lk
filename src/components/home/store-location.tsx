"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Phone, Clock, ArrowRight, ExternalLink } from "lucide-react";
import { siteSettings } from "@/lib/data";
import { SiteSettings } from "@/lib/types";
import { getSiteSettings } from "@/lib/firestore-client";
import { BUSINESS_INFO } from "@/lib/business-info";
import { motion } from "framer-motion";

export default function StoreLocation() {
  const [settings, setSettings] = useState<SiteSettings>(siteSettings);
  const [loadMap, setLoadMap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data) {
        setSettings((prev) => ({
          ...prev,
          ...data,
          business_hours: {
            ...prev.business_hours,
            ...(data.business_hours || {}),
          },
        }));
      }
    }).catch(() => {});
  }, []);

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
      { rootMargin: "250px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const storeAddress = settings.address || BUSINESS_INFO.address;
  const storePhone = settings.phone || BUSINESS_INFO.phonePrimary;
  const storeMobile = settings.secondary_phone || BUSINESS_INFO.phoneMobile;
  const weekdaysHours = settings.business_hours?.weekdays || BUSINESS_INFO.hours.weekdays;
  const sundayHours = settings.business_hours?.sunday || BUSINESS_INFO.hours.sunday;
  const mapsEmbedUrl = settings.google_maps_embed || BUSINESS_INFO.maps.embed;
  const mapsLinkUrl = settings.google_maps_link || BUSINESS_INFO.maps.link;

  return (
    <section
      id="store-location"
      aria-label="Store Location & Contact"
      className="w-full bg-background relative overflow-hidden py-6 sm:py-10 md:py-20 lg:py-28 select-none"
    >
      {/* Decorative gradient orb (desktop) */}
      <div className="hidden md:block absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-gray-100 to-transparent rounded-full blur-3xl -z-10 opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white md:bg-white/60 md:backdrop-blur-[24px] md:saturate-[180%] rounded-2xl md:rounded-[32px] overflow-hidden shadow-xs md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/90 md:border-white/80"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
            {/* Map Area - Single lazy-loaded iframe for both mobile & desktop */}
            <div className="h-[220px] sm:h-[300px] md:h-auto min-h-[220px] md:min-h-[380px] bg-neutral-900 relative overflow-hidden flex items-center justify-center order-1 md:order-1">
              {loadMap ? (
                <iframe
                  title="1PLACE.LK Flagship Store Google Maps Location"
                  src={mapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full block absolute inset-0 grayscale-0 opacity-100 transition-opacity duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-white/50 text-xs">
                  <MapPin className="w-6 h-6 animate-bounce text-neutral-400" />
                  <span>Loading 1place.lk Map...</span>
                </div>
              )}
            </div>

            {/* Store Information Area */}
            <div className="p-4 sm:p-6 md:p-10 lg:p-14 flex flex-col justify-center order-2 md:order-2">
              {/* Header Badge & Rating/Logo */}
              <div className="flex items-center justify-between gap-3 mb-3 md:mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Flagship Store</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-xs font-bold text-neutral-900 flex items-center gap-1">
                    ★ 4.9 <span className="text-neutral-400 font-normal">(500+ Verified Reviews)</span>
                  </span>
                  <img
                    src="/logo.png"
                    alt="ONEPLACE"
                    className="hidden lg:block h-6 w-auto object-contain shrink-0 ml-2"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 mb-1.5 md:mb-3">
                Visit Our Colombo Flagship
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-5 md:mb-8 leading-relaxed">
                Experience the latest smartphones, premium electronics, authentic accessories, and certified warranty support.
              </p>

              {/* Info Details List */}
              <div className="space-y-3.5 md:space-y-5">
                {/* Address */}
                <div className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-neutral-900" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 block text-xs sm:text-sm mb-0.5">
                      Address
                    </span>
                    <p className="text-neutral-600 leading-relaxed text-xs sm:text-sm max-w-sm">
                      {storeAddress}
                    </p>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-neutral-900" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 block text-xs sm:text-sm mb-0.5">
                      Business Hours
                    </span>
                    <p className="text-neutral-600 text-xs sm:text-sm">
                      <span className="font-medium text-neutral-800">Mon - Sat:</span> {weekdaysHours}
                    </p>
                    <p className="text-neutral-600 text-xs sm:text-sm">
                      <span className="font-medium text-neutral-800">Sunday:</span> {sundayHours}
                    </p>
                  </div>
                </div>

                {/* Phone & Helpline */}
                <div className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-neutral-900" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 block text-xs sm:text-sm mb-0.5">
                      Direct Helpline &amp; WhatsApp
                    </span>
                    <a
                      href={`tel:${storePhone.replace(/[^0-9+]/g, "")}`}
                      className="text-neutral-900 font-bold hover:underline block text-xs sm:text-sm"
                    >
                      {storePhone}
                    </a>
                    {storeMobile && (
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        Mobile: {storeMobile}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-neutral-100 flex flex-row items-center gap-2.5 sm:gap-3">
                <a
                  href={mapsLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center py-2.5 sm:py-3.5 px-4 sm:px-6 bg-neutral-900 hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl md:rounded-2xl shadow-xs transition-all duration-200 active:scale-[0.98]"
                >
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" />
                  <span>Get Directions</span>
                </a>

                <a
                  href={`tel:${storePhone.replace(/[^0-9+]/g, "")}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center py-2.5 sm:py-3.5 px-4 sm:px-6 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 font-bold text-xs sm:text-sm rounded-xl md:rounded-2xl shadow-xs transition-all duration-200 active:scale-[0.98]"
                >
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" />
                  <span>Call Store</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
