"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  CreditCard,
  ChevronRight,
  ArrowUp,
} from "lucide-react";
import { getFooterSettings } from "@/lib/firestore-client";
import { DEFAULT_FOOTER_SETTINGS } from "@/lib/data";
import { FooterSettings } from "@/lib/types";
import { BUSINESS_INFO } from "@/lib/business-info";
import BrandLogo from "@/components/ui/BrandLogo";

/* ─── Social Media SVG Icons ─── */
function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.45 6.27 6.27 0 0 0 1.89-4.49V8.62a8.28 8.28 0 0 0 4.84 1.54V6.71a4.86 4.86 0 0 1-1-.02z" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function Footer() {
  const pathname = usePathname();

  // Exclude footer on admin backoffice and checkout flows
  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) {
    return null;
  }

  return <HomePageFooter />;
}

function HomePageFooter() {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);

  useEffect(() => {
    getFooterSettings()
      .then((res) => {
        if (res) setSettings(res);
      })
      .catch(() => {
        setSettings(DEFAULT_FOOTER_SETTINGS);
      });
  }, []);

  const shopCollections = [
    { label: "Smartphones", href: "/products?category=smartphones" },
    { label: "Wireless Earbuds", href: "/products?category=earbuds" },
    { label: "Chargers & Adapters", href: "/products?category=chargers-adapters" },
    { label: "Power Banks", href: "/products?category=power-banks" },
    { label: "All Products", href: "/products" },
  ];

  const customerCareLinks = [
    { label: "Track Your Order", href: "/orders" },
    { label: "Warranty & Return Policy", href: "/return-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Contact Support", href: "/contact" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#111111] border-t border-neutral-900 text-neutral-400 font-sans select-none relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-24 md:pb-12">
        {/* ── Main 4-Column Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 xl:gap-12 pb-12 sm:pb-14 border-b border-neutral-800/80">
          
          {/* ── COLUMN 1: BRAND ── */}
          <div className="space-y-4 sm:space-y-5">
            <BrandLogo variant="footer" href="/" />

            <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed font-normal max-w-sm">
              Sri Lanka&apos;s Premier Online Store for 100% Genuine Smartphones, Electronics, Premium Audio, Computing &amp; Lifestyle Accessories with Islandwide Express Delivery.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={BUSINESS_INFO.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="1place.lk on Facebook"
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-[#64152F] hover:border-[#64152F] flex items-center justify-center transition-all duration-200"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href={BUSINESS_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="1place.lk on Instagram"
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-[#64152F] hover:border-[#64152F] flex items-center justify-center transition-all duration-200"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={BUSINESS_INFO.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="1place.lk on TikTok"
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-[#64152F] hover:border-[#64152F] flex items-center justify-center transition-all duration-200"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="1place.lk on YouTube"
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-[#64152F] hover:border-[#64152F] flex items-center justify-center transition-all duration-200"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* ── COLUMN 2: SHOP COLLECTIONS ── */}
          <div>
            <h4 className="text-xs sm:text-[13px] font-black uppercase tracking-[0.14em] text-white mb-4 sm:mb-5">
              SHOP COLLECTIONS
            </h4>
            <ul className="space-y-3 text-xs sm:text-[13px]">
              {shopCollections.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between text-neutral-400 hover:text-white transition-colors duration-200 py-0.5"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── COLUMN 3: CUSTOMER CARE ── */}
          <div>
            <h4 className="text-xs sm:text-[13px] font-black uppercase tracking-[0.14em] text-white mb-4 sm:mb-5">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-3 text-xs sm:text-[13px]">
              {customerCareLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between text-neutral-400 hover:text-white transition-colors duration-200 py-0.5"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── COLUMN 4: SHOPPING ASSURANCE ── */}
          <div>
            <h4 className="text-xs sm:text-[13px] font-black uppercase tracking-[0.14em] text-white mb-4 sm:mb-5">
              SHOPPING ASSURANCE
            </h4>

            {/* Assurance Cards */}
            <div className="space-y-3 mb-5">
              {/* Card 1: Islandwide Delivery */}
              <div className="p-3.5 rounded-xl border border-white/10 bg-[#18181A] flex items-start gap-3 hover:border-neutral-700 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#241A1E] flex items-center justify-center shrink-0 text-[#C93B62]">
                  <Truck className="w-5 h-5 stroke-[1.9]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-white leading-tight">
                    Islandwide Delivery
                  </h5>
                  <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                    Doorstep courier service across all 25 districts in Sri Lanka.
                  </p>
                </div>
              </div>

              {/* Card 2: Verified Payments */}
              <div className="p-3.5 rounded-xl border border-white/10 bg-[#18181A] flex items-start gap-3 hover:border-neutral-700 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#241A1E] flex items-center justify-center shrink-0 text-[#C93B62]">
                  <CreditCard className="w-5 h-5 stroke-[1.9]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-white leading-tight">
                    Verified Payments
                  </h5>
                  <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                    Cash on Delivery or secure online payments with trusted partners.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Badges Matching Reference Screenshot */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {/* VISA Badge */}
              <div className="h-7 px-3 bg-[#1A1F36] rounded-md border border-neutral-700 flex items-center justify-center shadow-2xs">
                <span className="text-[12px] font-black tracking-wider text-white italic">
                  VISA
                </span>
              </div>

              {/* MasterCard Badge */}
              <div className="h-7 px-2.5 bg-[#1F1F1F] rounded-md border border-neutral-700 flex items-center justify-center gap-0.5 shadow-2xs">
                <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-95 -mr-1.5" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90" />
              </div>

              {/* AMEX Badge */}
              <div className="h-7 px-2.5 bg-[#006FCF] rounded-md border border-blue-400/40 flex items-center justify-center shadow-2xs">
                <span className="text-[10px] font-black tracking-wider text-white">
                  AMEX
                </span>
              </div>

              {/* COD Badge */}
              <div className="h-7 px-2.5 bg-white rounded-md border border-white flex items-center justify-center shadow-2xs">
                <span className="text-[11px] font-black tracking-wider text-black">
                  COD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Bottom Bar ── */}
        <div className="pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          {/* Copyright Text */}
          <div className="order-2 md:order-1 text-center md:text-left">
            <p className="m-0 text-neutral-400">
              © {new Date().getFullYear()} 1place.lk. All rights reserved.
            </p>
          </div>

          {/* Legal / Policy Links */}
          <div className="order-1 md:order-2 flex items-center gap-4 sm:gap-6 flex-wrap justify-center text-xs">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-neutral-700 select-none">|</span>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="text-neutral-700 select-none">|</span>
            <Link href="/return-policy" className="hover:text-white transition-colors">
              Warranty
            </Link>
            <span className="text-neutral-700 select-none">|</span>
            <Link href="/orders" className="hover:text-white transition-colors">
              Track Order
            </Link>
          </div>

          {/* Scroll to Top Burgundy Circle Button */}
          <div className="order-3 flex items-center justify-end">
            <button
              onClick={scrollToTop}
              type="button"
              aria-label="Scroll back to top"
              className="w-9 h-9 rounded-full bg-[#64152F] hover:bg-[#851C3E] text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-md cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
