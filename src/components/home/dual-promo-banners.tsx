"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function DualPromoBanners() {
  return (
    <section
      aria-label="Promotional Highlights"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 select-none font-sans"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* Banner 1: Upgrade Your Tech */}
        <Link
          href="/products?category=smartphones"
          className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#111111] via-[#2A0812] to-[#111111] text-white flex items-center justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-h-[190px] sm:min-h-[220px]"
        >
          <div className="relative z-10 max-w-[62%] flex flex-col justify-center">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-1">
              Upgrade Your Tech
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[#FF4B72] mb-4">
              Smarter Living
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-bold text-xs sm:text-sm shadow-md group-hover:bg-[#F7F7F7] active:scale-95 transition-all self-start">
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="relative w-[140px] sm:w-[180px] h-[130px] sm:h-[160px] shrink-0 ml-2">
            <Image
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop"
              alt="Upgrade Your Tech"
              fill
              sizes="(max-width: 768px) 160px, 220px"
              className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 shadow-md"
            />
          </div>
        </Link>

        {/* Banner 2: Style Your Way */}
        <Link
          href="/products?category=fashion"
          className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#64152F] via-[#4A0E21] to-[#2B0813] text-white flex items-center justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-h-[190px] sm:min-h-[220px]"
        >
          <div className="relative z-10 max-w-[62%] flex flex-col justify-center">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-1">
              Style Your Way
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[#FFB5C5] mb-4">
              Fashion for Every Mood
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-bold text-xs sm:text-sm shadow-md group-hover:bg-[#F7F7F7] active:scale-95 transition-all self-start">
              <span>Add to Cart</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="relative w-[140px] sm:w-[180px] h-[130px] sm:h-[160px] shrink-0 ml-2">
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop"
              alt="Style Your Way"
              fill
              sizes="(max-width: 768px) 160px, 220px"
              className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 shadow-md"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
