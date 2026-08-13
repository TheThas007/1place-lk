"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryItem {
  name: string;
  slug: string;
  iconSvg: React.ReactNode;
}

const CATEGORY_ITEMS: CategoryItem[] = [
  {
    name: "Adapter",
    slug: "chargers-adapters",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "Battery",
    slug: "mobile-accessories",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "Buds",
    slug: "earbuds",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    name: "Cable",
    slug: "charging-cables",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 12h8m-8 5h8M4 6h16M4 18h16" />
      </svg>
    ),
  },
  {
    name: "DISPLAY",
    slug: "screen-protectors",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "Gimble",
    slug: "mobile-accessories",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "HEADPHONE",
    slug: "headphones",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h2a2 2 0 002-2v-3a2 2 0 00-2-2H3v5zm18 0a2 2 0 01-2 2h-2a2 2 0 01-2-2v-3a2 2 0 012-2h3v5z" />
      </svg>
    ),
  },
  {
    name: "KEYBORD",
    slug: "laptops",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    name: "MOUSE",
    slug: "laptops",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    name: "LAPTOP",
    slug: "laptops",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "TAB",
    slug: "tablets",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "OTG",
    slug: "chargers-adapters",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "Power Bank",
    slug: "power-banks",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "Projector",
    slug: "mobile-accessories",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "Studio Light",
    slug: "mobile-accessories",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    name: "ROUTER",
    slug: "mobile-accessories",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
  },
  {
    name: "SELFIE STICK",
    slug: "mobile-accessories",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      </svg>
    ),
  },
  {
    name: "SMART HOME CAMERA",
    slug: "mobile-accessories",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "Smart Watch",
    slug: "smart-watches",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "STAND",
    slug: "mobile-accessories",
    iconSvg: (
      <svg className="w-12 h-12 text-black stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function ShopByCategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth Slow Auto-Scroll Loop
  useEffect(() => {
    let animationFrameId: number;

    const autoScroll = () => {
      if (scrollRef.current && !isHovered) {
        const container = scrollRef.current;
        container.scrollLeft += 0.8; // Slow & smooth continuous gliding speed

        // Loop seamlessly back to start when reaching end
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 2) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 bg-white border-b border-neutral-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* Title Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-[#090909] tracking-tight">
            Shop by Category
          </h2>
        </div>

        {/* Carousel Container with Left/Right Chevrons */}
        <div
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-20 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-800 hover:text-black hover:border-black hover:scale-110 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2]" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-20 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-800 hover:text-black hover:border-black hover:scale-110 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 stroke-[2]" />
          </button>

          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            className="flex items-center gap-6 sm:gap-10 overflow-x-auto scrollbar-none py-4 px-2 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {CATEGORY_ITEMS.map((item, i) => (
              <Link
                key={i}
                href={`/products?search=${encodeURIComponent(item.name)}`}
                className="group shrink-0 flex flex-col items-center justify-center text-center gap-3 w-32 sm:w-40 cursor-pointer transition-transform hover:-translate-y-1 duration-300"
              >
                {/* Icon Box */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-neutral-50 border border-neutral-100 group-hover:border-black group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                  {item.iconSvg}
                </div>

                {/* Category Name Label */}
                <span className="text-xs sm:text-sm font-bold text-neutral-800 group-hover:text-black transition-colors leading-tight max-w-[130px] truncate">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
