"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
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

  // Scroll-linked dynamic theme morphing: White -> Jet Black with premium fluid transition
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start 96%", "start 38%"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 24, restDelta: 0.001 });

  // Background and color morphing values
  const bgGrad = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    ["#FFFFFF", "#18181B", "#090909"]
  );
  const primaryText = useTransform(smoothProgress, [0, 1], ["#090909", "#FFFFFF"]);
  const secondaryText = useTransform(smoothProgress, [0, 1], ["#52525B", "rgba(255, 255, 255, 0.65)"]);
  const borderCol = useTransform(smoothProgress, [0, 1], ["rgba(0, 0, 0, 0.1)", "rgba(255, 255, 255, 0.14)"]);
  const socialBorderCol = useTransform(smoothProgress, [0, 1], ["rgba(0, 0, 0, 0.14)", "rgba(255, 255, 255, 0.18)"]);
  const socialIconCol = useTransform(smoothProgress, [0, 1], ["#18181B", "#FFFFFF"]);

  // Smooth logo brightness & invert transition (Black on White -> White on Black)
  const logoFilter = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    ["brightness(0) invert(0)", "brightness(0.6) invert(0.5)", "brightness(0) invert(1)"]
  );

  // Only show footer on the home page (pathname === "/")
  if (pathname !== "/") {
    return null;
  }

  if (settings.enabled === false) {
    return null;
  }

  const shopLinks = settings.shop_links && settings.shop_links.length > 0 ? settings.shop_links : DEFAULT_FOOTER_SETTINGS.shop_links;
  const helpLinks = settings.help_links && settings.help_links.length > 0 ? settings.help_links : DEFAULT_FOOTER_SETTINGS.help_links;
  const policyLinks = settings.policy_links && settings.policy_links.length > 0 ? settings.policy_links : DEFAULT_FOOTER_SETTINGS.policy_links;

  return (
    <>
      {/* ── Mobile Layout (< 768px): Scroll-linked Dynamic Transition Footer ── */}
      <motion.footer
        ref={footerRef}
        style={{ backgroundColor: bgGrad, color: primaryText }}
        className="md:hidden w-full px-4 pt-8 pb-24 border-t border-neutral-200/80 font-outfit select-none transition-colors duration-200"
      >
        <div className="flex flex-col gap-6 max-w-md mx-auto">
          {/* Logo & Description */}
          <div>
            <Link href="/" className="inline-block mb-3.5">
              <motion.img
                src={settings.logo_url || "/logo.png"}
                alt="Street Mobile"
                loading="lazy"
                style={{ filter: logoFilter }}
                className="w-[140px] max-w-[150px] h-auto object-contain object-left block opacity-100 transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
            </Link>
            <motion.p style={{ color: secondaryText }} className="text-xs leading-relaxed max-w-xs">
              {settings.description || "Your trusted destination for the latest smartphones and accessories."}
            </motion.p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-4">
              {settings.facebook_enabled !== false && settings.facebook_url && (
                <motion.a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  style={{ borderColor: socialBorderCol, color: socialIconCol }}
                  className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95"
                >
                  <FacebookIcon className="w-4 h-4" />
                </motion.a>
              )}
              {settings.instagram_enabled !== false && settings.instagram_url && (
                <motion.a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  style={{ borderColor: socialBorderCol, color: socialIconCol }}
                  className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95"
                >
                  <InstagramIcon className="w-4 h-4" />
                </motion.a>
              )}
              {settings.tiktok_enabled !== false && settings.tiktok_url && (
                <motion.a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  style={{ borderColor: socialBorderCol, color: socialIconCol }}
                  className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95"
                >
                  <TikTokIcon className="w-4 h-4" />
                </motion.a>
              )}
            </div>
          </div>

          {/* 2-Column Links: Shop & Help */}
          <motion.div style={{ borderColor: borderCol }} className="grid grid-cols-2 gap-4 text-xs pt-4 border-t">
            {/* Shop Links */}
            <div>
              <motion.span style={{ color: primaryText }} className="font-bold uppercase text-[10px] tracking-wider block mb-2.5">
                Shop
              </motion.span>
              <div className="flex flex-col space-y-2 text-[11px]">
                {shopLinks.slice(0, 5).map((l) => (
                  <motion.div key={l.id || l.href}>
                    <Link href={l.href} className="hover:text-red-500 transition-colors">
                      <motion.span style={{ color: secondaryText }} className="hover:text-red-500">
                        {l.label}
                      </motion.span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Help Links */}
            <div>
              <motion.span style={{ color: primaryText }} className="font-bold uppercase text-[10px] tracking-wider block mb-2.5">
                Help
              </motion.span>
              <div className="flex flex-col space-y-2 text-[11px]">
                {helpLinks.slice(0, 5).map((l) => (
                  <motion.div key={l.id || l.href}>
                    <Link href={l.href} className="hover:text-red-500 transition-colors">
                      <motion.span style={{ color: secondaryText }} className="hover:text-red-500">
                        {l.label}
                      </motion.span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Copyright & Dev Credit */}
          <motion.div
            style={{ borderColor: borderCol }}
            className="pt-4 border-t flex flex-col gap-1.5 text-[10px]"
          >
            <motion.p style={{ color: secondaryText }}>
              {settings.copyright_text || `© ${new Date().getFullYear()} Street Mobile. All rights reserved.`}
            </motion.p>
            <motion.p style={{ color: secondaryText }}>
              Designed &amp; Developed by{" "}
              <a
                href={settings.developer_credit_url || "https://aevonix.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
              >
                {settings.developer_credit_text.replace(/Designed & Developed by /gi, "") || "Aevonix"}
              </a>
            </motion.p>
          </motion.div>
        </div>
      </motion.footer>

      {/* ── Desktop Layout: Premium Scroll-Linked White -> Jet Black Theme Morphing Footer ── */}
      <motion.footer
        style={{ backgroundColor: bgGrad, color: primaryText }}
        className="hidden md:block w-full border-0 rounded-none shadow-none font-outfit select-none relative z-20 pb-16 lg:pb-0 transition-colors duration-300"
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
                  width:
                    settings.logo_size === "small"
                      ? "clamp(220px, 18vw, 270px)"
                      : settings.logo_size === "medium"
                      ? "clamp(280px, 24vw, 360px)"
                      : "clamp(340px, 30vw, 440px)",
                  height: "auto",
                  display: "block",
                }}
              >
                <motion.img
                  src={settings.logo_url || "/logo.png"}
                  alt="Street Mobile"
                  loading="lazy"
                  style={{ filter: logoFilter }}
                  className="w-full h-auto max-h-[110px] sm:max-h-[130px] object-contain object-left block opacity-100 group-hover:opacity-95 transition-all duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                />
              </Link>
              <motion.p
                style={{ color: secondaryText }}
                className="mt-6 text-sm leading-[1.65] font-normal"
              >
                {settings.description || "Genuine mobiles, premium accessories and trusted service—all in one place."}
              </motion.p>
            </div>

            {/* ── Column 2: Shop ── */}
            <div data-reveal-item className="flex flex-col items-start">
              <motion.h4
                style={{ color: primaryText }}
                className="text-xs font-bold uppercase tracking-[0.1em] mb-4"
              >
                Shop
              </motion.h4>
              <nav className="flex flex-col space-y-3" aria-label="Shop Navigation">
                {shopLinks.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className="group relative text-sm inline-flex items-center transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-white outline-none rounded-sm"
                  >
                    <motion.span
                      style={{ color: secondaryText }}
                      className="group-hover:text-red-500 transition-colors duration-200"
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* ── Column 3: Help ── */}
            <div data-reveal-item className="flex flex-col items-start">
              <motion.h4
                style={{ color: primaryText }}
                className="text-xs font-bold uppercase tracking-[0.1em] mb-4"
              >
                Help
              </motion.h4>
              <nav className="flex flex-col space-y-3" aria-label="Help Navigation">
                {helpLinks.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className="group relative text-sm inline-flex items-center transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-white outline-none rounded-sm"
                  >
                    <motion.span
                      style={{ color: secondaryText }}
                      className="group-hover:text-red-500 transition-colors duration-200"
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* ── Column 4: Follow Us ── */}
            <div data-reveal-item className="flex flex-col items-start">
              <motion.h4
                style={{ color: primaryText }}
                className="text-xs font-bold uppercase tracking-[0.1em] mb-4"
              >
                Follow Us
              </motion.h4>
              
              {/* Social Buttons Row */}
              <div className="flex items-center gap-3">
                {/* Instagram */}
                {settings.instagram_enabled !== false && settings.instagram_url && (
                  <motion.a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Street Mobile on Instagram"
                    style={{ borderColor: socialBorderCol, color: socialIconCol }}
                    className="w-10 h-10 rounded-[10px] border flex items-center justify-center transition-all duration-200 hover:border-[#E1306C] hover:text-[#E1306C] hover:scale-105 active:scale-95 focus-visible:ring-1 focus-visible:ring-white outline-none"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </motion.a>
                )}

                {/* TikTok */}
                {settings.tiktok_enabled !== false && settings.tiktok_url && (
                  <motion.a
                    href={settings.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Street Mobile on TikTok"
                    style={{ borderColor: socialBorderCol, color: socialIconCol }}
                    className="w-10 h-10 rounded-[10px] border flex items-center justify-center transition-all duration-200 hover:border-[#00F2FE] hover:text-[#00F2FE] hover:scale-105 active:scale-95 focus-visible:ring-1 focus-visible:ring-white outline-none"
                  >
                    <TikTokIcon className="w-5 h-5" />
                  </motion.a>
                )}

                {/* Facebook */}
                {settings.facebook_enabled !== false && settings.facebook_url && (
                  <motion.a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Street Mobile on Facebook"
                    style={{ borderColor: socialBorderCol, color: socialIconCol }}
                    className="w-10 h-10 rounded-[10px] border flex items-center justify-center transition-all duration-200 hover:border-[#1877F2] hover:text-[#1877F2] hover:scale-105 active:scale-95 focus-visible:ring-1 focus-visible:ring-white outline-none"
                  >
                    <FacebookIcon className="w-5 h-5" />
                  </motion.a>
                )}
              </div>
            </div>

          </div>
        </ScrollReveal>

        {/* ── Bottom Footer Bar with Divider ── */}
        <motion.div
          style={{ borderColor: borderCol }}
          className="w-full border-t"
        >
          <div className="max-w-[1320px] mx-auto px-6 py-7 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-normal">
            
            {/* Left: Copyright */}
            <motion.p
              style={{ color: secondaryText }}
              className="m-0 text-center md:text-left"
            >
              {settings.copyright_text || `© ${new Date().getFullYear()} Street Mobile. All rights reserved.`}
            </motion.p>

            {/* Centre / Right: Policy Links */}
            <div className="flex items-center flex-wrap justify-center gap-6">
              {policyLinks.map((item) => (
                <Link
                  key={item.id || item.href}
                  href={item.href}
                  className="transition-colors duration-200 hover:text-red-500 focus-visible:ring-1 focus-visible:ring-white outline-none rounded-sm"
                >
                  <motion.span style={{ color: secondaryText }} className="hover:text-red-500">
                    {item.label}
                  </motion.span>
                </Link>
              ))}
            </div>

            {/* Right: Developer Credit */}
            <motion.p
              style={{ color: secondaryText }}
              className="m-0 text-center md:text-right"
            >
              Designed &amp; Developed by{" "}
              <a
                href={settings.developer_credit_url || "https://aevonix.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 transition-all focus-visible:ring-1 focus-visible:ring-white outline-none rounded-sm"
              >
                {settings.developer_credit_text.replace(/Designed & Developed by /gi, "") || "Aevonix"}
              </a>
            </motion.p>

          </div>
        </motion.div>
      </motion.footer>
    </>
  );
}
