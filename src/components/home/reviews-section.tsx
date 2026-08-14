"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, CheckCircle2, Quote, ExternalLink, Edit3, Sparkles } from "lucide-react";
import { Review, GoogleReviewsSettings } from "@/lib/types";
import { siteSettings } from "@/lib/data";

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
    google_url: "https://www.google.com/maps/place/Street+Mobile+Vavuniya",
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
    google_url: "https://www.google.com/maps/place/Street+Mobile+Vavuniya",
  },
  {
    id: "g-rev-3",
    author_name: "Diluxan S.",
    author_photo: "",
    rating: 5,
    text: "Purchased Apple AirPods and a fast charger. Genuine products guaranteed. Smooth experience and quick response on WhatsApp inquiries.",
    review_date: "2026-01-15",
    visible: true,
    google_url: "https://www.google.com/maps/place/Street+Mobile+Vavuniya",
  },
  {
    id: "g-rev-4",
    author_name: "Niroshan T.",
    author_photo: "",
    rating: 5,
    text: "Excellent service and quick repair work. They replaced my phone battery in no time with genuine battery and warranty. 10/10 service in town!",
    review_date: "2025-12-20",
    visible: true,
    google_url: "https://www.google.com/maps/place/Street+Mobile+Vavuniya",
  },
  {
    id: "g-rev-5",
    author_name: "Prashanth M.",
    author_photo: "",
    rating: 5,
    text: "Great collection of accessories and smartphones. The staff guided me very well to select the best phone within my budget.",
    review_date: "2025-12-05",
    visible: true,
    google_url: "https://www.google.com/maps/place/Street+Mobile+Vavuniya",
  },
];

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
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
  if (!url || typeof url !== "string") return fallbackUrl || siteSettings.google_maps_link;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url;
    }
  } catch {}
  return fallbackUrl || siteSettings.google_maps_link;
};

export default function ReviewsSection({
  reviews,
  settings,
}: {
  reviews: Review[];
  settings?: GoogleReviewsSettings;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const mainViewAllUrl = validateUrl(settings?.view_all_reviews_url, siteSettings.google_maps_link);
  const mainWriteReviewUrl = validateUrl(settings?.write_review_url, siteSettings.google_maps_link);
  const overallRating = settings?.overall_rating || 4.9;
  const totalReviewsCount = settings?.total_reviews_count || 250;

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
    if (cards[index]) {
      const card = cards[index] as HTMLElement;
      container.scrollTo({
        left: card.offsetLeft - (window.innerWidth < 640 ? 16 : 0),
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  }, []);

  const handlePrev = () => {
    const nextIdx = activeIndex === 0 ? totalReviews - 1 : activeIndex - 1;
    scrollToCard(nextIdx);
  };

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % totalReviews;
    scrollToCard(nextIdx);
  }, [activeIndex, totalReviews, scrollToCard]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 300;
    const newIdx = Math.round(scrollPosition / cardWidth);
    if (newIdx >= 0 && newIdx < totalReviews && newIdx !== activeIndex) {
      setActiveIndex(newIdx);
    }
  };

  useEffect(() => {
    if (isPaused || totalReviews <= 1) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, handleNext, totalReviews]);

  return (
    <section
      className="py-12 sm:py-16 bg-black text-white overflow-hidden border-t border-white/10 relative"
      aria-label="Google Customer Reviews Section"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Section Header ── */}
        <div className="text-center mb-8 sm:mb-12">
          {/* Official Google Branding Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 mb-4 shadow-sm">
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/90">
              REVIEWS FROM GOOGLE
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
            Loved by Customers Across Sri Lanka
          </h2>

          {/* Overall Rating Line */}
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-white/80 mb-6">
            <span className="text-[#FFB800] font-black text-xl">{overallRating.toFixed(1)} ★</span>
            <span className="text-white/40">•</span>
            <span>Based on {totalReviewsCount}+ Verified Google Reviews</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={mainViewAllUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white hover:text-black text-white text-xs sm:text-sm font-semibold transition-all duration-300 shadow-md active:scale-95 group"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>View All Google Reviews</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <a
              href={mainWriteReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#FFB800]/40 bg-[#FFB800]/10 hover:bg-[#FFB800] hover:text-black text-[#FFB800] text-xs sm:text-sm font-semibold transition-all duration-300 shadow-md active:scale-95 group"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </a>
          </div>
        </div>

        {/* ── Review Carousel Track ── */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none py-2 px-1"
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
                  className="w-[88%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start bg-[#090909] border border-[#242424] hover:border-amber-400/50 rounded-[28px] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_40px_rgba(255,184,0,0.1)] hover:-translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between group relative overflow-hidden min-h-[290px] sm:min-h-[310px] cursor-pointer"
                >
                  {/* Top: Stars + Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(safeRating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {review.featured && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Featured
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Google Review</span>
                        </span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <div className="relative mb-3">
                      <Quote className="w-4 h-4 text-[#FFB800]/20 absolute -top-1 -left-1 rotate-180" />
                      <p className={`text-white/90 text-sm leading-[1.65] font-normal pl-3 ${!isExpanded && isLongText ? "line-clamp-4" : ""}`}>
                        &ldquo;{review.text}&rdquo;
                      </p>
                      {isLongText && (
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(review.id, e)}
                          className="mt-2 text-xs font-semibold text-[#FFB800] hover:underline focus:outline-none"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Reviewer Profile + Google Icon + Link indicator */}
                  <div className="pt-4 mt-4 border-t border-[#242424] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                        {review.author_photo ? (
                          <img
                            src={review.author_photo}
                            alt={review.author_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-xs text-white">
                            {review.author_name ? review.author_name.charAt(0).toUpperCase() : "G"}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                            {review.author_name}
                          </h3>
                          <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <p className="text-xs text-white/50">{displayDate}</p>
                      </div>
                    </div>

                    <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-amber-400 transition-colors shrink-0" />
                  </div>
                </a>
              );
            })}
          </div>

          {/* ── Carousel Controls ── */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous review"
                className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white hover:text-black text-white transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next review"
                className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white hover:text-black text-white transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Review pagination">
              {displayReviews.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToCard(idx)}
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-7 bg-[#FFB800]"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
