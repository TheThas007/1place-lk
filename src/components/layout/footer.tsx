"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin, MessageCircle, ArrowRight, ShieldCheck, Truck, ChevronRight } from "lucide-react";
import { siteSettings } from "@/lib/data";

const footerLinks = {
  shop: [
    { href: "/products", label: "All Products" },
    { href: "/products?category=smartphones", label: "Apple iPhones" },
    { href: "/products?brand=samsung", label: "Samsung Galaxy" },
    { href: "/products?category=laptops", label: "Laptops & MacBooks" },
    { href: "/products?category=earbuds", label: "Earbuds & Audio" },
    { href: "/products?category=chargers-adapters", label: "Chargers & Power" },
    { href: "/products?category=mobile-accessories", label: "Mobile Accessories" },
  ],
  services: [
    { href: "/contact", label: "Screen Replacement" },
    { href: "/contact", label: "Battery Replacement" },
    { href: "/contact", label: "Express Mobile Repairs" },
    { href: "/contact", label: "Genuine Warranty" },
    { href: "/contact", label: "Software & OS Support" },
    { href: "/contact", label: "Islandwide Delivery" },
  ],
  company: [
    { href: "/", label: "Home" },
    { href: "/gallery", label: "Store Gallery" },
    { href: "/reviews", label: "Customer Reviews" },
    { href: "/contact", label: "Store Location" },
    { href: "/contact", label: "Contact Us" },
    { href: "https://wa.me/94774141118", label: "WhatsApp Hotline", isExternal: true },
  ],
  policies: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/return-policy", label: "Return & Refund Policy" },
    { href: "/terms-and-conditions", label: "Terms & Conditions" },
    { href: "/checkout", label: "Cash on Delivery" },
    { href: "/checkout", label: "PayHere Online Payments" },
  ],
};

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide footer on Shop All page (/products) and admin pages
  if (pathname === "/products" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#050505] border-t border-neutral-800/80 text-neutral-400 pb-20 lg:pb-0 relative overflow-hidden text-xs">
      
      {/* ── Compact Top Support Strip ────────────────────────────────── */}
      <div className="border-b border-neutral-800/60 bg-[#090909]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
          
          <div className="flex items-center gap-2.5 text-center md:text-left">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white tracking-tight">
                Need help choosing the right device?
              </h4>
              <p className="text-[11px] text-neutral-400">
                Our mobile specialists in Vavuniya are ready to assist you.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://wa.me/94774141118?text=Hello%20Street%20Mobile,%20I%20need%20help%20choosing%20a%20device"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-black text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-black" />
              <span>Chat on WhatsApp</span>
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-700 hover:border-neutral-400 hover:bg-white/5 text-white font-bold text-xs transition-all active:scale-95"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Compact 5-Column Grid ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-7 items-start">
          
          {/* Column 1: Brand Info (Aligned level with top column headings) */}
          <div className="flex flex-col items-start space-y-2">
            <Link href="/" className="inline-block group cursor-pointer">
              <img 
                src="/logo.png" 
                alt="STREET MOBILE Vavuniya" 
                className="footer-brand-logo w-[180px] sm:w-[210px] lg:w-[240px] h-auto max-w-none object-contain object-left brightness-0 invert transition-transform duration-300 group-hover:opacity-95"
              />
            </Link>

            <p className="text-neutral-400 text-[11px] sm:text-xs leading-relaxed max-w-xs pt-0.5">
              Vavuniya&apos;s premier destination for genuine Apple, Samsung, Xiaomi smartphones, certified accessories and professional repair services.
            </p>

            {/* Contact Info */}
            <div className="space-y-1.5 pt-0.5 w-full text-[11px] sm:text-xs">
              <a
                href="tel:+94774141118"
                className="flex items-center gap-2 text-neutral-300 hover:text-emerald-400 transition-colors group"
              >
                <div className="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors shrink-0">
                  <Phone className="w-3 h-3 text-neutral-400 group-hover:text-emerald-400" />
                </div>
                <span className="font-mono font-medium">077 414 1118 / 024 222 8118</span>
              </a>

              <a 
                href={`mailto:${siteSettings.email}`}
                className="flex items-center gap-2 text-neutral-300 hover:text-emerald-400 transition-colors group"
              >
                <div className="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors shrink-0">
                  <Mail className="w-3 h-3 text-neutral-400 group-hover:text-emerald-400" />
                </div>
                <span className="font-medium truncate">{siteSettings.email}</span>
              </a>

              <div className="flex items-start gap-2 text-neutral-300">
                <div className="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                </div>
                <span className="leading-snug text-neutral-400">163, Kandaswamy Kovil Road, Rambaikulam, Vavuniya Town, Sri Lanka</span>
              </div>
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div className="space-y-2">
            <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
              Shop
            </h4>
            <ul className="space-y-1.5 text-[11px] sm:text-xs">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-all inline-flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    <span className="group-hover:text-emerald-400 transition-colors">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services Links */}
          <div className="space-y-2">
            <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
              Services
            </h4>
            <ul className="space-y-1.5 text-[11px] sm:text-xs">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-all inline-flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    <span className="group-hover:text-emerald-400 transition-colors">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company Links */}
          <div className="space-y-2">
            <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-1.5 text-[11px] sm:text-xs">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  {link.isExternal ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-white transition-all inline-flex items-center gap-1.5 group"
                    >
                      <ChevronRight className="w-3 h-3 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      <span className="group-hover:text-emerald-400 transition-colors">{link.label}</span>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-neutral-400 hover:text-white transition-all inline-flex items-center gap-1.5 group"
                    >
                      <ChevronRight className="w-3 h-3 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      <span className="group-hover:text-emerald-400 transition-colors">{link.label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Policies Links */}
          <div className="space-y-2">
            <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
              Policies
            </h4>
            <ul className="space-y-1.5 text-[11px] sm:text-xs">
              {footerLinks.policies.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-all inline-flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    <span className="group-hover:text-emerald-400 transition-colors">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Original Payment Badges & Warranty Bar ──────────────────── */}
        <div className="mt-4 pt-3 border-t border-neutral-800/50 flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Payment Badges (Original Official Logos) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 mr-0.5">
              Payment Methods:
            </span>

            {/* Official Visa Badge */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center shadow-xs">
              <svg className="h-3 w-auto" viewBox="0 0 48 16" fill="none">
                <path d="M19.123 0.38L12.518 15.617H8.204L5.006 3.633C4.814 2.879 4.646 2.607 4.048 2.274C3.067 1.737 1.455 1.233 0 0.908L0.098 0.38H7.135C8.031 0.38 8.834 0.975 9.031 1.996L10.748 11.137L15.011 0.38H19.123ZM36.035 10.635C36.052 6.643 30.404 6.422 30.438 4.606C30.453 4.053 30.985 3.457 32.148 3.308C32.724 3.234 34.309 3.174 36.082 3.99L36.786 0.771C35.823 0.422 34.582 0.08 33.02 0.08C29.006 0.08 26.166 2.164 26.143 5.148C26.115 7.361 28.164 8.598 29.703 9.336C31.281 10.094 31.814 10.574 31.805 11.258C31.789 12.307 30.518 12.77 29.344 12.787C27.318 12.816 26.145 12.246 25.203 11.811L24.475 15.137C25.438 15.57 27.219 15.953 29.057 15.973C33.314 15.973 36.014 13.926 36.035 10.635ZM46.602 15.617H50.395L47.086 0.38H43.578C42.793 0.38 42.131 0.832 41.838 1.531L35.738 15.617H39.957L40.799 13.318H45.957L46.602 15.617ZM41.961 10.158L44.117 4.316L45.355 10.158H41.961ZM25.045 0.38L21.727 15.617H17.701L21.018 0.38H25.045Z" fill="#1A1F71"/>
              </svg>
            </div>

            {/* Official Mastercard Badge */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center shadow-xs">
              <svg className="h-3.5 w-auto" viewBox="0 0 32 20" fill="none">
                <circle cx="11" cy="10" r="7" fill="#EB001B"/>
                <circle cx="21" cy="10" r="7" fill="#F79E1B"/>
                <path d="M16 4.885A6.974 6.974 0 0013.784 10c0 2.012.85 3.826 2.216 5.115A6.974 6.974 0 0018.216 10 6.974 6.974 0 0016 4.885z" fill="#FF5F00"/>
              </svg>
            </div>

            {/* Official PayHere Badge */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center gap-1 shadow-xs">
              <svg className="h-3 w-auto" viewBox="0 0 100 24" fill="none">
                <path d="M14.5 3H4v18h4.5v-6H14.5c4.1 0 7.5-3 7.5-6s-3.4-6-7.5-6zm0 7.5H8.5V7.5h6c1.6 0 3 1.1 3 2.25s-1.4 2.25-3 2.25z" fill="#004B87" />
                <path d="M28 10.5h4v1.5c.8-1.1 2.2-1.7 3.5-1.7 3 0 5 2 5 5v5.7h-4v-5.2c0-1.5-.8-2.3-2.2-2.3-1.3 0-2.3.9-2.3 2.4V21h-4V10.5z" fill="#004B87" />
                <path d="M49.5 10.5l-3.2 8-3.2-8h-4.3l5.5 12.2-2.2 4.8h4.3l8.2-17h-5.1z" fill="#004B87" />
                <path d="M63 3h4.5v6.5c.9-1.1 2.3-1.7 3.7-1.7 3.1 0 5.3 2.1 5.3 5.2V21H72v-7.5c0-1.5-.9-2.3-2.3-2.3-1.4 0-2.4.9-2.4 2.4V21H63V3z" fill="#00A3E0" />
                <path d="M84 15.8c.2 2 1.8 3.2 3.8 3.2 1.4 0 2.6-.5 3.3-1.3l2.8 2.2c-1.5 1.7-3.7 2.6-6.3 2.6-4.5 0-7.8-3.2-7.8-7.7 0-4.4 3.2-7.8 7.7-7.8 4.6 0 7.5 3.4 7.5 7.7v1.1H84zm7.2-2.5c-.2-1.8-1.5-3-3.4-3-1.9 0-3.3 1.2-3.6 3h7z" fill="#00A3E0" />
              </svg>
            </div>

            {/* Cash on Delivery Badge */}
            <div className="h-6 px-2 bg-neutral-900 border border-neutral-700/80 rounded flex items-center justify-center gap-1.5 shadow-xs">
              <Truck className="w-3 h-3 text-emerald-400" />
              <span className="font-bold text-white text-[10px]">Cash on Delivery</span>
            </div>
          </div>

          {/* Genuine Warranty Guarantee */}
          <div className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Genuine Products &amp; Warranty</span>
          </div>
        </div>
      </div>

      {/* ── Compact Bottom Bar ────────────────────────────────────────── */}
      <div className="border-t border-neutral-800/60 bg-[#030303]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          
          {/* Copyright text */}
          <p className="text-[11px] text-neutral-500">
            © {currentYear} <span className="font-bold text-neutral-300">STREET MOBILE</span>. All rights reserved.
          </p>
          
          {/* Social Icons in compact dark containers */}
          <div className="flex items-center gap-1.5">
            <a
              href={siteSettings.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-all hover:scale-105"
              aria-label="Facebook"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 011-1h3v-4h-3a5 5 0 00-5 5v2.01h-2l-.396 3.98h2.396v8.01z" />
              </svg>
            </a>

            <a
              href={siteSettings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-all hover:scale-105"
              aria-label="Instagram"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </a>

            <a
              href={siteSettings.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-all hover:scale-105"
              aria-label="TikTok"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.34-2.82 5.76-1.68 1.43-4.04 2.05-6.2 1.57-2.14-.49-3.95-1.93-4.9-3.85-.92-1.89-.98-4.2-.1-6.14.9-1.99 2.66-3.44 4.74-3.96 1.4-.33 2.88-.2 4.21.28v4.06c-1.57-.46-3.34-.1-4.62 1.05-1.28 1.15-1.74 3.12-.99 4.67.75 1.54 2.5 2.56 4.23 2.39 1.74-.16 3.19-1.39 3.73-3.03.11-.31.18-.63.19-.95.06-2.58.04-5.16.05-7.75.01-4.96.01-9.93.01-14.89h.01z" />
              </svg>
            </a>
          </div>

        </div>
      </div>

    </footer>
  );
}
