"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Star, CheckCircle2, Quote, ExternalLink, Edit3, Sparkles } from "lucide-react";
import { Review, GoogleReviewsSettings } from "@/lib/types";
import { siteSettings } from "@/lib/data";
import { DEFAULT_GOOGLE_REVIEWS_SETTINGS } from "@/lib/firestore-client";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const DEFAULT_MAPS_URL =
  "https://www.google.com/maps/place//@8.7505237,80.5028315,17z/data=!3m1!4b1!4m3!3m2!1s0x3afc159b991b1da5:0xa03e8d7360fe634a!12e1?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D";

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

/* ─── Refined Google Review Card ─── */
interface ReviewCardProps {
  review: Review;
  mainViewAllUrl: string;
  onLinkClick?: (e: React.MouseEvent) => void;
}

function ReviewCard({ review, mainViewAllUrl, onLinkClick }: ReviewCardProps) {
  const safeRating = Math.min(5, Math.max(1, review.rating || 5));
  const displayDate = review.review_date || "Verified Google Review";
  const cardTargetUrl = validateUrl(review.google_url, mainViewAllUrl);

  return (
    <a
      href={cardTargetUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onLinkClick}
      aria-label={`Read Google review by ${review.author_name}`}
      className="w-[86vw] sm:w-[380px] lg:w-[410px] shrink-0 min-h-[290px] bg-neutral-50/80 hover:bg-white border border-neutral-200/90 hover:border-neutral-300 rounded-[12px] p-6 sm:p-7 shadow-[0_8px_28px_rgba(0,0,0,0.055)] transition-all duration-300 ease-out hover:-translate-y-[3px] flex flex-col justify-between group relative overflow-hidden cursor-pointer select-none"
    >
      {/* 1. Top Area: Star Rating & Verified Google Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5 pointer-events-none">
          {/* Star Rating */}
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

        {/* 2. Review Content */}
        <div className="relative mb-2 pointer-events-none">
          <Quote className="w-3.5 h-3.5 text-neutral-300/80 inline-block mr-1.5 -mt-1 rotate-180 select-none" />
          <span className="text-neutral-700 text-[14px] sm:text-[15px] leading-[1.65] font-normal line-clamp-4">
            {review.text}
          </span>
        </div>
      </div>

      {/* 3. Flexible Spacer */}
      <div className="flex-1 min-h-2 pointer-events-none" />

      {/* 4. Reviewer Profile (Aligned at Bottom) */}
      <div className="pt-4 border-t border-neutral-200/80 flex items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-200 text-neutral-800 border border-neutral-300 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs font-bold text-xs">
            {review.author_photo ? (
              <img
                src={review.author_photo}
                alt={review.author_name}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <span>{review.author_name ? review.author_name.charAt(0).toUpperCase() : "G"}</span>
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
}

/* ─── Main Reviews Section with Continuous Endless Opposite Scrolling Rail ─── */
export default function ReviewsSection({
  reviews,
  settings,
  galleryDirection = "left",
}: {
  reviews: Review[];
  settings?: GoogleReviewsSettings;
  galleryDirection?: "left" | "right";
}) {
  const [liveSettings, setLiveSettings] = useState<GoogleReviewsSettings | undefined>(settings);

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

  const currentSettings: GoogleReviewsSettings = {
    ...DEFAULT_GOOGLE_REVIEWS_SETTINGS,
    ...(liveSettings || settings || {}),
  };

  const mainViewAllUrl = validateUrl(
    currentSettings.view_all_reviews_url,
    siteSettings.google_maps_link || DEFAULT_MAPS_URL
  );
  const mainWriteReviewUrl = validateUrl(
    currentSettings.write_review_url,
    siteSettings.google_maps_link || DEFAULT_MAPS_URL
  );
  const overallRating = currentSettings.overall_rating || 4.9;
  const totalReviewsCount = currentSettings.total_reviews_count || 285;

  // Determine counter-scrolling direction:
  // If gallery moves 'left', reviews moves 'right'. If gallery moves 'right', reviews moves 'left'.
  const effectiveDirection: "left" | "right" = useMemo(() => {
    if (currentSettings.direction === "left") return "left";
    if (currentSettings.direction === "right") return "right";
    return galleryDirection === "right" ? "left" : "right";
  }, [currentSettings.direction, galleryDirection]);

  // Combine passed reviews with fallback reviews
  const displayReviews = useMemo(() => {
    const list = Array.isArray(reviews) && reviews.length > 0 ? reviews : DEFAULT_REVIEWS;
    const seen = new Set<string>();
    const filtered = list.filter((r) => {
      if (!r.id || seen.has(r.id)) return false;
      seen.add(r.id);
      return r.visible !== false;
    });
    return filtered.length >= 3
      ? filtered
      : [...filtered, ...DEFAULT_REVIEWS.filter((r) => !seen.has(r.id))];
  }, [reviews]);

  // Expand sequence to ensure seamless loop without gaps
  const baseItems = useMemo(() => {
    if (displayReviews.length === 0) return [];
    if (displayReviews.length >= 6) return displayReviews;
    const repeated: Review[] = [];
    while (repeated.length < 6) {
      repeated.push(...displayReviews);
    }
    return repeated;
  }, [displayReviews]);

  // Reduced motion preference
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Animation Engine Refs
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const singleSeqRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<number>(0);
  const sequenceWidthRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State flags for interactive pausing
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isPausedRef = useRef(false);
  const isVisibleRef = useRef(true);
  const wasDraggingRef = useRef(false);

  // Drag physics tracking
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const dragMovedRef = useRef(0);

  // Measure sequence width dynamically
  const measureSequence = useCallback(() => {
    if (singleSeqRef.current) {
      const width = singleSeqRef.current.offsetWidth;
      if (width > 0) {
        sequenceWidthRef.current = width;
      }
    }
  }, []);

  useEffect(() => {
    measureSequence();
    const el = singleSeqRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => measureSequence());
    observer.observe(el);
    window.addEventListener("resize", measureSequence);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureSequence);
    };
  }, [measureSequence, baseItems]);

  // IntersectionObserver to pause RAF when section is offscreen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          lastTimeRef.current = null;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Tab visibility listener
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
      } else {
        isVisibleRef.current = true;
        lastTimeRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Main 60fps RequestAnimationFrame Loop
  useEffect(() => {
    const endlessEnabled = currentSettings.endlessScrollEnabled !== false;
    const autoplayEnabled = currentSettings.autoplayEnabled !== false;
    const enabled = endlessEnabled && autoplayEnabled && !isReducedMotion && baseItems.length > 1;

    if (!enabled) {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    const animate = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const seqWidth = sequenceWidthRef.current;

      const shouldPause =
        !isVisibleRef.current ||
        isDraggingRef.current ||
        (currentSettings.pauseOnHover !== false && isHoveredRef.current) ||
        (currentSettings.pauseOnFocus !== false && isFocusedRef.current) ||
        isPausedRef.current;

      if (!shouldPause && seqWidth > 0 && dt > 0 && dt < 0.25) {
        // Responsive gentle slow speed
        let speed = currentSettings.desktopSpeed ? Math.min(currentSettings.desktopSpeed, 24) : 22;
        if (typeof window !== "undefined") {
          if (window.innerWidth < 768) {
            speed = currentSettings.mobileSpeed ? Math.min(currentSettings.mobileSpeed, 18) : 16;
          } else if (window.innerWidth < 1024) {
            speed = currentSettings.tabletSpeed ? Math.min(currentSettings.tabletSpeed, 20) : 18;
          }
        }

        // Direction: opposite movement
        const dirMult = effectiveDirection === "right" ? 1 : -1;
        offsetRef.current += speed * dt * dirMult;

        // Wrap around seamlessly
        if (offsetRef.current <= -seqWidth) {
          offsetRef.current += seqWidth;
        } else if (offsetRef.current >= 0) {
          offsetRef.current -= seqWidth;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [currentSettings, effectiveDirection, isReducedMotion, baseItems]);

  const mobileReviewsRef = useRef<HTMLDivElement>(null);
  const isInteractingReviewsRef = useRef(false);
  const resumeTimerReviewsRef = useRef<NodeJS.Timeout | null>(null);
  const isReviewsSectionVisibleRef = useRef(false);

  // Step-based Horizontal Autoplay (Mobile: 5.5s per review card, pause/resume on interaction)
  useEffect(() => {
    if (isReducedMotion || displayReviews.length <= 1) return;

    const el = mobileReviewsRef.current;
    if (!el) return;

    // Viewport visibility check
    const observer = new IntersectionObserver(
      ([entry]) => {
        isReviewsSectionVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.15 }
    );
    observer.observe(el);

    // Tab visibility
    const handleVisibility = () => {
      if (document.hidden) {
        isReviewsSectionVisibleRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const timer = setInterval(() => {
      if (!isReviewsSectionVisibleRef.current || isInteractingReviewsRef.current || document.hidden) {
        return;
      }

      if (el) {
        const children = el.children;
        if (children.length <= 1) return;

        const firstChild = children[0] as HTMLElement;
        const secondChild = children[1] as HTMLElement;
        const step = secondChild
          ? secondChild.offsetLeft - firstChild.offsetLeft
          : firstChild.offsetWidth + 14;

        const maxScroll = el.scrollWidth - el.clientWidth;
        const currentScroll = el.scrollLeft;

        if (currentScroll >= maxScroll - 16) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Advance exactly one card step
          const targetIndex = Math.floor((currentScroll + 10) / step) + 1;
          if (targetIndex < children.length) {
            const targetChild = children[targetIndex] as HTMLElement;
            const targetLeft = targetChild.offsetLeft - firstChild.offsetLeft;
            el.scrollTo({ left: Math.min(targetLeft, maxScroll), behavior: "smooth" });
          } else {
            el.scrollTo({ left: maxScroll, behavior: "smooth" });
          }
        }
      }
    }, 5500);

    return () => {
      clearInterval(timer);
      if (resumeTimerReviewsRef.current) clearTimeout(resumeTimerReviewsRef.current);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isReducedMotion, displayReviews.length]);

  const handleReviewsInteractionStart = () => {
    isInteractingReviewsRef.current = true;
    if (resumeTimerReviewsRef.current) clearTimeout(resumeTimerReviewsRef.current);
  };

  const handleReviewsInteractionEnd = () => {
    if (resumeTimerReviewsRef.current) clearTimeout(resumeTimerReviewsRef.current);
    resumeTimerReviewsRef.current = setTimeout(() => {
      isInteractingReviewsRef.current = false;
    }, 4000);
  };

  const handleReviewsScroll = () => {
    isInteractingReviewsRef.current = true;
    if (resumeTimerReviewsRef.current) clearTimeout(resumeTimerReviewsRef.current);
    resumeTimerReviewsRef.current = setTimeout(() => {
      isInteractingReviewsRef.current = false;
    }, 4000);
  };

  // Pointer drag & touch swipe handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (currentSettings.dragEnabled === false || isReducedMotion || baseItems.length <= 1) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    dragMovedRef.current = 0;
    lastTimeRef.current = null;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    dragMovedRef.current = Math.abs(dx);

    const seqWidth = sequenceWidthRef.current || 1;
    let newOffset = dragStartOffsetRef.current + dx;

    while (newOffset <= -seqWidth) newOffset += seqWidth;
    while (newOffset >= 0) newOffset -= seqWidth;

    offsetRef.current = newOffset;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${newOffset}px, 0, 0)`;
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    lastTimeRef.current = null;

    if (dragMovedRef.current > 6) {
      wasDraggingRef.current = true;
      setTimeout(() => {
        wasDraggingRef.current = false;
      }, 250);
    }

    if (currentSettings.pauseOnInteraction !== false) {
      isPausedRef.current = true;
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        isPausedRef.current = false;
        lastTimeRef.current = null;
      }, currentSettings.resumeDelay || 1500);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (wasDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const isContinuous =
    currentSettings.endlessScrollEnabled !== false && !isReducedMotion && baseItems.length > 1;

  return (
    <>
      {/* ── Mobile Layout (< 768px): Apple-Inspired Swipeable Reviews Rail ── */}
      <section
        className="md:hidden w-full bg-white py-6 select-none overflow-hidden"
        aria-label="Customer Reviews"
      >
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: isReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center px-4 mb-5 max-w-sm mx-auto flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-[10px] font-bold uppercase tracking-wider mb-2 select-none">
            <GoogleIcon className="w-3 h-3 shrink-0" />
            <span>Google Reviews</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-tight mb-2">
            Loved by Customers Across Sri Lanka
          </h2>

          <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 font-bold mb-3 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-amber-500 font-black text-base leading-none">
                {overallRating.toFixed(1)}
              </span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <span className="text-neutral-300">•</span>
            <span className="font-medium text-neutral-500">
              Based on {totalReviewsCount}+ Verified Reviews
            </span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <a
              href={mainViewAllUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold bg-neutral-900 text-white active:scale-95 shadow-xs transition-transform"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={mainWriteReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium border border-neutral-300 text-neutral-800 active:scale-95 transition-transform"
            >
              <Edit3 className="w-3 h-3" />
              <span>Write Review</span>
            </a>
          </div>
        </motion.div>

        {/* Horizontal Swipeable Card Rail (Slow Auto-Glide, Snap Centered, 8-12% Peeks on Sides) */}
        <div
          ref={mobileReviewsRef}
          onTouchStart={handleReviewsInteractionStart}
          onTouchEnd={handleReviewsInteractionEnd}
          onPointerDown={handleReviewsInteractionStart}
          onPointerUp={handleReviewsInteractionEnd}
          onMouseEnter={handleReviewsInteractionStart}
          onMouseLeave={handleReviewsInteractionEnd}
          onFocus={handleReviewsInteractionStart}
          onBlur={handleReviewsInteractionEnd}
          onScroll={handleReviewsScroll}
          className="w-full flex gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory px-[8vw] sm:px-[7vw] py-2 scroll-smooth"
        >
          {displayReviews.map((rev, idx) => {
            const safeRating = Math.min(5, Math.max(1, rev.rating || 5));
            const authorInitial = (rev.author_name || "G").charAt(0).toUpperCase();
            const cardTargetUrl = validateUrl(rev.google_url, mainViewAllUrl);

            return (
              <motion.a
                key={`mob-rev-${rev.id || idx}`}
                href={cardTargetUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Google review by ${rev.author_name}`}
                initial={{
                  opacity: 0,
                  y: isReducedMotion ? 0 : 20,
                  scale: isReducedMotion ? 1 : 0.97,
                }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: idx < 4 ? idx * 0.08 : 0,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="w-[84vw] sm:w-[86vw] max-w-[340px] shrink-0 bg-neutral-50/90 hover:bg-white border border-neutral-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-xs snap-center transition-all duration-200 cursor-pointer select-none"
              >
                {/* 1. Top Badges & Stars */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(safeRating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      {rev.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          <span>Featured</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[9px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>

                  {/* 2. Review Text Body */}
                  <div className="relative mb-2">
                    <Quote className="w-3 h-3 text-neutral-300 inline-block mr-1 -mt-1 rotate-180 select-none" />
                    <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed font-normal inline">
                      {rev.text}
                    </p>
                  </div>
                </div>

                {/* 3. Reviewer Profile (Bottom Aligned) */}
                <div className="pt-3.5 mt-3 border-t border-neutral-200/80 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-800 border border-neutral-300 flex items-center justify-center shrink-0 overflow-hidden font-bold text-xs">
                      {rev.author_photo ? (
                        <img
                          src={rev.author_photo}
                          alt={rev.author_name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <span>{authorInitial}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate m-0">
                          {rev.author_name}
                        </h4>
                        <GoogleIcon className="w-3 h-3 shrink-0" />
                      </div>
                      <p className="text-[10px] text-neutral-400 m-0">
                        {rev.review_date || "Verified Google Review"}
                      </p>
                    </div>
                  </div>

                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </section>

      {/* ── Desktop Layout ── */}
      <div className="hidden md:block">
        <ScrollReveal
          as="section"
          id="reviews-section"
          stagger={0.06}
          yOffset={20}
          className="py-12 sm:py-16 lg:py-[72px] bg-white border-b border-neutral-200/80 relative overflow-hidden font-sans select-none"
        >
      {/* ── Centred Content Container (1240px max-width, width: calc(100% - 48px)) ── */}
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto relative z-10">
        {/* ── Section Title Header ── */}
        <div data-reveal-item className="text-center max-w-3xl mx-auto flex flex-col items-center">
          {/* 1. Google Eyebrow Label */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] sm:text-xs font-bold uppercase tracking-[0.09em] mb-4 select-none">
            <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Reviews from Google</span>
          </div>

          {/* 2. Main Heading */}
          <h2
            className="text-neutral-900 font-bold tracking-[-0.04em] leading-[1.05] mb-3.5 m-0 p-0"
            style={{ fontSize: "clamp(36px, 3vw, 50px)" }}
          >
            Loved by Customers Across Sri Lanka
          </h2>

          {/* 3. Overall Rating Summary */}
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-neutral-600 mb-6 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-amber-500 font-black text-xl leading-none">
                {overallRating.toFixed(1)}
              </span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 -mt-0.5" />
            </div>
            <span className="text-neutral-300 select-none">•</span>
            <span className="font-medium text-neutral-600">
              Based on {totalReviewsCount}+ Verified Google Reviews
            </span>
          </div>

          {/* 4. Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10 sm:mb-12">
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
      </div>

      {/* ── Continuous Endless Reviews Rail (Moving in Opposite Direction) ── */}
      <div
        ref={sectionRef}
        data-reveal-item
        className="relative w-full overflow-hidden"
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
        }}
      >
        {/* Soft Edge Fade Masks */}
        {currentSettings.edgeFadeEnabled !== false && (
          <>
            <div
              style={{
                width: `${currentSettings.edgeFadeWidth || 60}px`,
                background: `linear-gradient(to right, ${currentSettings.edgeFadeColor || "#FFFFFF"}, transparent)`,
              }}
              className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none"
            />
            <div
              style={{
                width: `${currentSettings.edgeFadeWidth || 60}px`,
                background: `linear-gradient(to left, ${currentSettings.edgeFadeColor || "#FFFFFF"}, transparent)`,
              }}
              className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none"
            />
          </>
        )}

        {isContinuous ? (
          /* Moving Endless Track */
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex items-center gap-5 cursor-grab active:cursor-grabbing will-change-transform touch-pan-y py-2"
            style={{ width: "max-content" }}
          >
            {/* Sequence A (Primary) */}
            <div ref={singleSeqRef} className="flex items-center gap-5 shrink-0">
              {baseItems.map((rev, idx) => (
                <ReviewCard
                  key={`rev-a-${rev.id}-${idx}`}
                  review={rev}
                  mainViewAllUrl={mainViewAllUrl}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </div>

            {/* Sequence B (Clone for seamless continuous loop) */}
            <div className="flex items-center gap-5 shrink-0" aria-hidden="true">
              {baseItems.map((rev, idx) => (
                <ReviewCard
                  key={`rev-b-${rev.id}-${idx}`}
                  review={rev}
                  mainViewAllUrl={mainViewAllUrl}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Manual Scrollable Fallback */
          <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto">
            <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {displayReviews.map((rev) => (
                <ReviewCard
                  key={`static-${rev.id}`}
                  review={rev}
                  mainViewAllUrl={mainViewAllUrl}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollReveal>
    </div>
  </>
  );
}
