"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { DEFAULT_FOOTER_SETTINGS } from "@/lib/data";
import { FooterSettings } from "@/lib/types";
import ScrollReveal from "@/components/ui/ScrollReveal";

/* ─── SVG Platform Icons ─── */
function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.45 6.27 6.27 0 0 0 1.89-4.49V8.62a8.28 8.28 0 0 0 4.84 1.54V6.71a4.86 4.86 0 0 1-1-.02z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function Footer() {
  const pathname = usePathname();

  // Only show footer on the home page (pathname === "/")
  if (pathname !== "/") {
    return null;
  }

  return <HomePageFooter />;
}

function HomePageFooter() {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const docRef = doc(db, "settings", "footer");
      const unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            setSettings({ ...DEFAULT_FOOTER_SETTINGS, ...snap.data() } as FooterSettings);
          }
        },
        () => {
          setSettings(DEFAULT_FOOTER_SETTINGS);
        }
      );
      return () => unsubscribe();
    } catch {
      setSettings(DEFAULT_FOOTER_SETTINGS);
    }
  }, []);

  if (settings.enabled === false) {
    return null;
  }

  const shopLinks = settings.shop_links && settings.shop_links.length > 0 ? settings.shop_links : DEFAULT_FOOTER_SETTINGS.shop_links;
  const helpLinks = settings.help_links && settings.help_links.length > 0 ? settings.help_links : DEFAULT_FOOTER_SETTINGS.help_links;
  const policyLinks = settings.policy_links && settings.policy_links.length > 0 ? settings.policy_links : DEFAULT_FOOTER_SETTINGS.policy_links;

  const desktopLogoWidth =
    settings.logo_size === "small"
      ? "150px"
      : settings.logo_size === "medium"
      ? "175px"
      : "200px";

  return (
    <>
      {/* ── Mobile Layout (< 768px): Solid Dark Theme Footer ── */}
      <footer
        ref={footerRef}
        className="md:hidden w-full bg-[#090909] text-white px-4 pt-8 pb-24 border-t border-white/10 font-outfit select-none"
      >
        <div className="flex flex-col gap-6 max-w-md mx-auto">
          {/* Logo & Description */}
          <div>
            <Link href="/" className="inline-block mb-3.5 group">
              <img
                src={settings.logo_url || "/logo.png"}
                alt="Street Mobile"
                loading="lazy"
                className="w-[140px] max-w-[150px] h-auto max-h-[50px] object-contain object-left block opacity-100 group-hover:opacity-90 transition-opacity duration-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
            </Link>
            <p className="text-white/65 text-xs leading-relaxed max-w-xs">
              {settings.description || "Your trusted destination for the latest smartphones and accessories."}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-4">
              {settings.facebook_enabled !== false && settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-xl border border-white/15 bg-white/5 text-white flex items-center justify-center transition-all duration-200 hover:bg-white/10 active:scale-95"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {settings.instagram_enabled !== false && settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-xl border border-white/15 bg-white/5 text-white flex items-center justify-center transition-all duration-200 hover:bg-white/10 active:scale-95"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {settings.tiktok_enabled !== false && settings.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-xl border border-white/15 bg-white/5 text-white flex items-center justify-center transition-all duration-200 hover:bg-white/10 active:scale-95"
                >
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* 2-Column Links: Shop & Help */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-white/10">
            {/* Shop Links */}
            <div>
              <span className="font-bold uppercase text-[10px] tracking-wider block mb-2.5 text-white">
                Shop
              </span>
              <div className="flex flex-col space-y-2 text-[11px]">
                {shopLinks.slice(0, 5).map((l) => (
                  <div key={l.id || l.href}>
                    <Link href={l.href} className="text-white/65 hover:text-red-500 transition-colors">
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Links */}
            <div>
              <span className="font-bold uppercase text-[10px] tracking-wider block mb-2.5 text-white">
                Help
              </span>
              <div className="flex flex-col space-y-2 text-[11px]">
                {helpLinks.slice(0, 5).map((l) => (
                  <div key={l.id || l.href}>
                    <Link href={l.href} className="text-white/65 hover:text-red-500 transition-colors">
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright & Dev Credit */}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-1.5 text-[10px] text-white/60">
            <p>
              {settings.copyright_text || `© ${new Date().getFullYear()} Street Mobile. All rights reserved.`}
            </p>
            <p>
              Designed &amp; Developed by{" "}
              <a
                href={
                  settings.developer_credit_url && settings.developer_credit_url !== "https://aevonix.com"
                    ? settings.developer_credit_url
                    : "https://www.thasz.dev/"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline text-white"
              >
                {settings.developer_credit_text.replace(/Designed & Developed by /gi, "") || "Aevonix"}
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* ── Desktop Layout: Premium Solid Jet Black Footer ── */}
      <footer
        className="hidden md:block w-full bg-[#090909] text-white border-t border-white/10 rounded-none shadow-none font-outfit select-none relative z-20 pb-16 lg:pb-0"
        role="contentinfo"
      >
        {/* ── Main Footer Container (max-w: 1320px, 4-Column Layout with Subtle Stagger) ── */}
        <ScrollReveal yOffset={14} stagger={0.06} className="max-w-[1320px] mx-auto px-6 pt-16 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14 items-start">
            
            {/* ── Column 1: Brand ── */}
            <div data-reveal-item className="flex flex-col items-start max-w-[380px]">
              <Link
                href="/"
                className="inline-block group focus-visible:ring-1 focus-visible:ring-white outline-none rounded-sm select-none"
                style={{
                  width: desktopLogoWidth,
                  height: "auto",
                  display: "block",
                }}
              >
                <img
                  src={settings.logo_url || "/logo.png"}
                  alt="Street Mobile"
                  loading="lazy"
                  className="w-full h-auto max-h-[64px] object-contain object-left block opacity-100 group-hover:opacity-90 transition-opacity duration-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                />
              </Link>
              <p className="mt-6 text-sm leading-[1.65] font-normal text-white/65">
                {settings.description || "Genuine mobiles, premium accessories and trusted service—all in one place."}
              </p>
            </div>

            {/* ── Column 2: Shop ── */}
            <div data-reveal-item className="flex flex-col items-start">
              <h4 className="text-xs font-bold uppercase tracking-[0.1em] mb-4 text-white">
                Shop
              </h4>
              <nav className="flex flex-col space-y-3" aria-label="Shop Navigation">
                {shopLinks.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className="group relative text-sm inline-flex items-center text-white/65 hover:text-red-500 transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-white outline-none rounded-sm"
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* ── Column 3: Help ── */}
            <div data-reveal-item className="flex flex-col items-start">
              <h4 className="text-xs font-bold uppercase tracking-[0.1em] mb-4 text-white">
                Help
              </h4>
              <nav className="flex flex-col space-y-3" aria-label="Help Navigation">
                {helpLinks.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className="group relative text-sm inline-flex items-center text-white/65 hover:text-red-500 transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-white outline-none rounded-sm"
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* ── Column 4: Follow Us ── */}
            <div data-reveal-item className="flex flex-col items-start">
              <h4 className="text-xs font-bold uppercase tracking-[0.1em] mb-4 text-white">
                Follow Us
              </h4>
              
              {/* Social Buttons Row */}
              <div className="flex items-center gap-3">
                {/* Instagram */}
                {settings.instagram_enabled !== false && settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Street Mobile on Instagram"
                    className="w-10 h-10 rounded-[10px] border border-white/15 bg-white/5 text-white flex items-center justify-center transition-all duration-200 hover:border-[#E1306C] hover:text-[#E1306C] hover:scale-105 active:scale-95 focus-visible:ring-1 focus-visible:ring-white outline-none"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                )}

                {/* TikTok */}
                {settings.tiktok_enabled !== false && settings.tiktok_url && (
                  <a
                    href={settings.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Street Mobile on TikTok"
                    className="w-10 h-10 rounded-[10px] border border-white/15 bg-white/5 text-white flex items-center justify-center transition-all duration-200 hover:border-[#00F2FE] hover:text-[#00F2FE] hover:scale-105 active:scale-95 focus-visible:ring-1 focus-visible:ring-white outline-none"
                  >
                    <TikTokIcon className="w-5 h-5" />
                  </a>
                )}

                {/* Facebook */}
                {settings.facebook_enabled !== false && settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Street Mobile on Facebook"
                    className="w-10 h-10 rounded-[10px] border border-white/15 bg-white/5 text-white flex items-center justify-center transition-all duration-200 hover:border-[#1877F2] hover:text-[#1877F2] hover:scale-105 active:scale-95 focus-visible:ring-1 focus-visible:ring-white outline-none"
                  >
                    <FacebookIcon className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

          </div>
        </ScrollReveal>

        {/* ── Bottom Footer Bar with Divider ── */}
        <div className="w-full border-t border-white/10">
          <div className="max-w-[1320px] mx-auto px-6 py-7 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-normal text-white/60">
            
            {/* Left: Copyright */}
            <p className="m-0 text-center md:text-left">
              {settings.copyright_text || `© ${new Date().getFullYear()} Street Mobile. All rights reserved.`}
            </p>

            {/* Centre / Right: Policy Links */}
            <div className="flex items-center flex-wrap justify-center gap-6">
              {policyLinks.map((item) => (
                <Link
                  key={item.id || item.href}
                  href={item.href}
                  className="text-white/60 transition-colors duration-200 hover:text-red-500 focus-visible:ring-1 focus-visible:ring-white outline-none rounded-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right: Developer Credit */}
            <p className="m-0 text-center md:text-right">
              Designed &amp; Developed by{" "}
              <a
                href={
                  settings.developer_credit_url && settings.developer_credit_url !== "https://aevonix.com"
                    ? settings.developer_credit_url
                    : "https://www.thasz.dev/"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 text-white/80 hover:text-white transition-all focus-visible:ring-1 focus-visible:ring-white outline-none rounded-sm"
              >
                {settings.developer_credit_text.replace(/Designed & Developed by /gi, "") || "Aevonix"}
              </a>
            </p>

          </div>
        </div>
      </footer>
    </>
  );
}
