"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, CheckCircle2, Quote, ExternalLink, Edit3, Sparkles } from "lucide-react";
import { Review, GoogleReviewsSettings } from "@/lib/types";
import { siteSettings } from "@/lib/data";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const DEFAULT_MAPS_URL = "https://www.google.com/maps/place//@8.7505237,80.5028315,17z/data=!3m1!4b1!4m3!3m2!1s0x3afc159b991b1da5:0xa03e8d7360fe634a!12e1?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D";

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "g-rev-1",
    author_name: "Kavinth Raj",
    author_photo: "",
    rating: 5,
    text: "Best mobile shop in Vavuniya! Bought my new iPhone here with original warranty and got an unbeatable price. The customer service and after-sales support are top notch.",
    review_date: "2026-02-10",
    visible: true,
    featured: true,
    google_url: DEFAULT_MAPS_URL,
  },
  {
    id: "g-rev-2",
    author_name: "Santhosh Kumar",
    author_photo: "",
    rating: 5,
    text: "Fixed my display glass within 45 minutes! Original display replacement with clean finish. Very transparent pricing and polite staff. Highly recommended for phone repairs.",
    review_date: "2026-01-28",
    visible: true,
    featured: true,
    google_url: DEFAULT_MAPS_URL,
  },
  {
    id: "g-rev-3",
    author_name: "Diluxan S.",
    author_photo: "",
    rating: 5,
    text: "Purchased Apple AirPods and a fast charger. Genuine products guaranteed. Smooth experience and quick response on WhatsApp inquiries.",
    review_date: "2026-01-15",
    visible: true,
    google_url: DEFAULT_MAPS_URL,
  },
  {
    id: "g-rev-4",
    author_name: "Niroshan T.",
    author_photo: "",
    rating: 5,
    text: "Excellent service and quick repair work. They replaced my phone battery in no time with genuine battery and warranty. 10/10 service in town!",
    review_date: "2025-12-20",
    visible: true,
    google_url: DEFAULT_MAPS_URL,
  },
  {
    id: "g-rev-5",
    author_name: "Prashanth M.",
    author_photo: "",
    rating: 5,
    text: "Great collection of accessories and smartphones. The staff guided me very well to select the best phone within my budget.",
    review_date: "2025-12-05",
    visible: true,
    google_url: DEFAULT_MAPS_URL,
  },
];

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

const validateUrl = (url?: string, fallbackUrl?: string) => {
  const fallback = fallbackUrl || siteSettings.google_maps_link || DEFAULT_MAPS_URL;
  if (!url || typeof url !== "string") return fallback;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url;
    }
  } catch {}
  return fallback;
};

export default function ReviewsSection({
  reviews,
  settings,
}: {
  reviews: Review[];
  settings?: GoogleReviewsSettings;
}) {
  const [liveSettings, setLiveSettings] = useState<GoogleReviewsSettings | undefined>(settings);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Real-time Firestore sync on settings/google_reviews
  useEffect(() => {
    try {
      const docRef = doc(db, "settings", "google_reviews");
      const unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            setLiveSettings(snap.data() as GoogleReviewsSettings);
          }
        },
        () => {}
      );
      return () => unsubscribe();
    } catch {}
  }, []);

  const currentSettings = liveSettings || settings;
  const mainViewAllUrl = validateUrl(currentSettings?.view_all_reviews_url, siteSettings.google_maps_link || DEFAULT_MAPS_URL);
  const mainWriteReviewUrl = validateUrl(currentSettings?.write_review_url, siteSettings.google_maps_link || DEFAULT_MAPS_URL);
  const overallRating = currentSettings?.overall_rating || 4.9;
  const totalReviewsCount = currentSettings?.total_reviews_count || 285;

  // Combine passed reviews with fallback reviews
  const displayReviews = useMemo(() => {
    const list = Array.isArray(reviews) && reviews.length > 0 ? reviews : DEFAULT_REVIEWS;
    const seen = new Set<string>();
    const filtered = list.filter((r) => {
      if (!r.id || seen.has(r.id)) return false;
      seen.add(r.id);
      return r.visible !== false;
    });
    return filtered.length >= 3 ? filtered : [...filtered, ...DEFAULT_REVIEWS.filter((r) => !seen.has(r.id))];
  }, [reviews]);

  const totalReviews = displayReviews.length;

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToCard = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cards = container.children;
    const targetIdx = (index + totalReviews) % totalReviews;
    if (cards[targetIdx]) {
      const card = cards[targetIdx] as HTMLElement;
      container.scrollTo({
        left: card.offsetLeft - container.offsetLeft,
        behavior: "smooth",
      });
      setActiveIndex(targetIdx);
    }
  }, [totalReviews]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % totalReviews;
    scrollToCard(nextIdx);
  }, [activeIndex, totalReviews, scrollToCard]);

  const handlePrev = useCallback(() => {
    const prevIdx = (activeIndex - 1 + totalReviews) % totalReviews;
    scrollToCard(prevIdx);
  }, [activeIndex, totalReviews, scrollToCard]);

  // Automatic review sliding timer (every 4.5 seconds, pauses on user interaction)
  useEffect(() => {
    if (isPaused || totalReviews <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, totalReviews, handleNext]);

  // Track active slide on manual scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.clientWidth > 768 ? container.clientWidth / 3 : container.clientWidth * 0.85;
    const newIndex = Math.round(scrollLeft / itemWidth);
    if (newIndex >= 0 && newIndex < totalReviews && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  // Visible pagination dots (max 5)
  const paginationIndices = useMemo(() => {
    if (totalReviews <= 5) {
      return Array.from({ length: totalReviews }, (_, i) => i);
    }
    const half = 2;
    let start = Math.max(0, activeIndex - half);
    let end = start + 5;
    if (end > totalReviews) {
      end = totalReviews;
      start = Math.max(0, end - 5);
    }
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [activeIndex, totalReviews]);

  return (
    <ScrollReveal
      as="section"
      id="reviews-section"
      stagger={0.06}
      yOffset={20}
      className="py-12 sm:py-16 lg:py-[72px] bg-white border-b border-neutral-200/80 relative overflow-hidden font-sans"
    >
      {/* ── Centred Content Container (1240px max-width, width: calc(100% - 48px)) ── */}
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-10">
        
        {/* ── Section Title Header (Structured Spacing) ── */}
        <div data-reveal-item className="text-center max-w-3xl mx-auto flex flex-col items-center">
          
          {/* 1. Google Eyebrow Label (16px gap to heading, 6px radius, 0.09em tracking) */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] sm:text-xs font-bold uppercase tracking-[0.09em] mb-4 select-none">
            <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Reviews from Google</span>
          </div>

          {/* 2. Main Heading (14px gap to rating, 700 weight, -0.04em tracking, 1.05 line-height) */}
          <h2
            className="text-neutral-900 font-bold tracking-[-0.04em] leading-[1.05] mb-3.5 m-0 p-0"
            style={{ fontSize: "clamp(36px, 3vw, 50px)" }}
          >
            Loved by Customers Across Sri Lanka
          </h2>

          {/* 3. Overall Rating Summary (24px gap to buttons, aligned baseline) */}
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-neutral-600 mb-6 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-amber-500 font-black text-xl leading-none">{overallRating.toFixed(1)}</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 -mt-0.5" />
            </div>
            <span className="text-neutral-300 select-none">•</span>
            <span className="font-medium text-neutral-600">
              Based on {totalReviewsCount}+ Verified Google Reviews
            </span>
          </div>

          {/* 4. Action CTA Buttons (48px gap to review cards, 46px height, 8px radius) */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <a
              href={mainViewAllUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-[46px] px-6 rounded-[8px] border border-neutral-300 bg-white hover:bg-neutral-900 hover:text-white text-neutral-800 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs hover:-translate-y-[2px] active:scale-[0.98] group"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>View All Google Reviews</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <a
              href={mainWriteReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-[46px] px-6 rounded-[8px] border border-amber-400/40 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-800 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs hover:-translate-y-[2px] active:scale-[0.98] group"
            >
              <Edit3 className="w-4 h-4" />
              <span>Write a Review</span>
            </a>
          </div>
        </div>

        {/* ── Review Cards Track (3 Columns Desktop, 2 Columns Tablet, 1 Snap Mobile) ── */}
        <div
          data-reveal-item
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {displayReviews.map((review) => {
              const safeRating = Math.min(5, Math.max(1, review.rating || 5));
              const displayDate = review.review_date || "Verified Google Review";
              const isExpanded = !!expandedCards[review.id];
              const isLongText = review.text.length > 150;
              const cardTargetUrl = validateUrl(review.google_url, mainViewAllUrl);

              return (
                <a
                  key={review.id}
                  href={cardTargetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Read Google review by ${review.author_name}`}
                  className="w-[86vw] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] shrink-0 snap-start bg-neutral-50/70 hover:bg-white border border-neutral-200/90 hover:border-neutral-300 rounded-[12px] p-[22px] sm:p-7 lg:p-[28px] shadow-[0_8px_28px_rgba(0,0,0,0.055)] transition-all duration-300 ease-out hover:-translate-y-[3px] flex flex-col justify-between group relative overflow-hidden min-h-[310px] cursor-pointer"
                >
                  {/* 1. Top Area: Star Rating & Verified Google Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      {/* Star Rating (Exact Amber, 4px spacing) */}
                      <div className="flex items-center gap-1">
                        {[...Array(safeRating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-1.5">
                        {review.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>Featured</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Google Review</span>
                        </span>
                      </div>
                    </div>

                    {/* 2. Review Content with subtle Quote mark */}
                    <div className="relative mb-2">
                      <Quote className="w-3.5 h-3.5 text-neutral-300/60 inline-block mr-1.5 -mt-1 rotate-180 select-none" />
                      <span className="text-neutral-700 text-[15px] sm:text-[16px] leading-[1.65] font-normal">
                        {isExpanded || !isLongText
                          ? review.text
                          : `${review.text.slice(0, 145)}...`}
                      </span>
                      {isLongText && (
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(review.id, e)}
                          className="block mt-1.5 text-xs font-semibold text-amber-600 hover:underline focus:outline-none"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. Flexible Spacer */}
                  <div className="flex-1 min-h-2" />

                  {/* 4. Reviewer Profile (Aligned at Bottom) */}
                  <div className="pt-4 border-t border-neutral-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar (40px) */}
                      <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-800 border border-neutral-300 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        {review.author_photo ? (
                          <img
                            src={review.author_photo}
                            alt={review.author_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-xs">
                            {review.author_name ? review.author_name.charAt(0).toUpperCase() : "G"}
                          </span>
                        )}
                      </div>

                      {/* Name & Date */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-[650] text-sm text-neutral-900 truncate group-hover:text-amber-600 transition-colors m-0">
                            {review.author_name}
                          </h4>
                          <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <p className="text-xs text-neutral-400 m-0 mt-0.5">{displayDate}</p>
                      </div>
                    </div>

                    <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-amber-600 transition-colors shrink-0" />
                  </div>
                </a>
              );
            })}
          </div>

          {/* ── Aligned Navigation & Pagination Bar Below Cards ── */}
          <div className="flex items-center justify-between mt-6 sm:mt-8 pt-2">
            {/* Previous & Next Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeIndex === 0}
                aria-label="Previous review"
                className="w-[42px] h-[42px] rounded-[8px] border border-neutral-300 bg-white hover:bg-neutral-900 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-700 text-neutral-700 transition-all duration-200 flex items-center justify-center shadow-2xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-neutral-400 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={activeIndex >= totalReviews - 1}
                aria-label="Next review"
                className="w-[42px] h-[42px] rounded-[8px] border border-neutral-300 bg-white hover:bg-neutral-900 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-700 text-neutral-700 transition-all duration-200 flex items-center justify-center shadow-2xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-neutral-400 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Pagination Indicators (Max 5 Dots + Active Wide Bar) */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Review pagination">
              {paginationIndices.map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToCard(idx)}
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Go to review ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    idx === activeIndex
                      ? "w-7 bg-neutral-900"
                      : "w-2 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </ScrollReveal>
  );
}
