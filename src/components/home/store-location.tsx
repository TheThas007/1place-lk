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
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-gray-100 to-transparent rounded-full blur-3xl -z-10 opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
  );
}
