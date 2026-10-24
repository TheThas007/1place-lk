"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const banners = [
  {
    id: "promo-electronics",
    title: "Latest Electronics",
    subtitle: "Up to 40% OFF",
    cta: "Shop Now",
    href: "/products?category=electronics",
    bgClass: "bg-gradient-to-br from-[#1A1A1A] via-[#111111] to-[#2B0E17]",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
    accentColor: "text-[#FF4B72]",
  },
  {
    id: "promo-fashion",
    title: "Trendy Fashion",
    subtitle: "New Collections",
    cta: "Shop Now",
    href: "/products?category=fashion",
    bgClass: "bg-gradient-to-br from-[#64152F] via-[#4A0E21] to-[#22050D]",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop",
    accentColor: "text-[#FFB5C5]",
  },
  {
    id: "promo-beauty",
    title: "Beauty & Skincare",
    subtitle: "Glow Everyday",
    cta: "Shop Now",
    href: "/products?category=beauty-skincare",
    bgClass: "bg-gradient-to-br from-[#531828] via-[#7D293E] to-[#400F1C]",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600&auto=format&fit=crop",
    accentColor: "text-[#FFE4E9]",
  },
];

export default function CategoryPromoBanners() {
  return (
    <section
      aria-label="Featured Department Promotions"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 select-none font-sans"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.href}
            className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white min-h-[170px] sm:min-h-[200px] flex items-center justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${banner.bgClass}`}
          >
            {/* Content Left */}
            <div className="relative z-10 max-w-[60%] flex flex-col justify-center">
              <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider mb-1 ${banner.accentColor}`}>
                {banner.subtitle}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight mb-3">
                {banner.title}
              </h3>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black font-bold text-xs shadow-md group-hover:bg-[#F7F7F7] active:scale-95 transition-all self-start">
                <span>{banner.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Image Right */}
            <div className="relative w-[130px] sm:w-[150px] h-[130px] sm:h-[150px] shrink-0 ml-2">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 150px, 200px"
                className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 shadow-md"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
