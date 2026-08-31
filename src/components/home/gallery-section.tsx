"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";
import { GalleryImage, GalleryAnimationSettings, UiSettings } from "@/lib/types";
import { DEFAULT_GALLERY_ANIMATION_SETTINGS } from "@/lib/data";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";

function InstagramIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function validateUrl(url?: string): string | null {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url.trim();
    }
  } catch {}
  return null;
}

/* ─── Refined Editorial Gallery Card (Exact 4:5 Aspect Ratio & Dimensions) ─── */
interface GalleryCardProps {
  image: GalleryImage;
  index: number;
  onLinkClick?: (e: React.MouseEvent) => void;
}

function GalleryCard({ image, index, onLinkClick }: GalleryCardProps) {
  const validPostUrl = validateUrl(image.post_url);
  const isInstagram =
    image.platform === "instagram" ||
    (validPostUrl && validPostUrl.includes("instagram.com"));
  const titleText = image.caption || image.title || "Life at Street Mobile";

  const CardContent = (
    <div className="relative w-full h-full overflow-hidden bg-neutral-100 select-none">
      {/* 1. Edge-to-Edge Image with Smooth Subtle Scale */}
      <img
        src={image.image_url}
        alt={titleText}
        loading={index < 4 ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.025] pointer-events-none select-none"
      />

      {/* 2. Top-Left Category Badge (12px offset, compact 5px radius) */}
      {image.category && (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider text-neutral-800 bg-white/90 backdrop-blur-md border border-neutral-200/60 shadow-2xs z-10 select-none pointer-events-none">
          {image.category}
        </div>
      )}

      {/* 3. Top-Right Social Badge (Compact indicator) */}
      {isInstagram && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-[5px] text-[10px] font-semibold text-white bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 z-10 select-none pointer-events-none">
          <InstagramIcon className="w-3 h-3 text-pink-400" />
          <span>Instagram</span>
        </div>
      )}

      {/* 4. Compact Bottom Gradient Overlay & Typography */}
      <div className="absolute inset-x-0 bottom-0 pt-12 pb-3.5 px-3.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end z-10 pointer-events-none">
        <p className="text-white text-xs sm:text-[13px] font-semibold leading-snug line-clamp-2 drop-shadow-xs m-0 select-none">
          {titleText}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="relative group aspect-[4/5] rounded-[11px] overflow-hidden border border-neutral-200/80 hover:border-neutral-300 transition-all duration-300 hover:-translate-y-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] shrink-0 w-[78vw] sm:w-[280px] lg:w-[298px] select-none"
    >
      {validPostUrl ? (
        <a
          href={validPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick}
          aria-label={`View on Social Media: ${titleText}`}
          className="block w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-[11px]"
        >
          {CardContent}
        </a>
      ) : (
        <Link
          href="/gallery"
          onClick={onLinkClick}
          aria-label={`View Gallery: ${titleText}`}
          className="block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-[11px]"
        >
          {CardContent}
        </Link>
      )}
    </div>
  );
}

/* ─── Main Gallery Section (Continuous Endless Marquee Engine) ─── */
export default function GallerySection({
  images,
  animationSettings,
  uiSettings,
}: {
  images: GalleryImage[];
  animationSettings?: GalleryAnimationSettings;
  uiSettings?: UiSettings;
}) {
  const settings = {
    ...DEFAULT_GALLERY_ANIMATION_SETTINGS,
    ...animationSettings,
  };

  const visibleImages = useMemo(() => {
    return images.filter((img) => img.visible !== false);
  }, [images]);

  // Expand sequence to ensure seamless loop without gaps
  const baseItems = useMemo(() => {
    if (visibleImages.length === 0) return [];
    if (visibleImages.length >= 6) return visibleImages;
    // Repeat items so single sequence is wide enough
    const repeated: GalleryImage[] = [];
    while (repeated.length < 6) {
      repeated.push(...visibleImages);
    }
    return repeated;
  }, [visibleImages]);

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
  const sectionRef = useRef<HTMLElement>(null);
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

  // Measure sequence width dynamically with ResizeObserver
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
    const enabled =
      settings.endlessScrollEnabled &&
      settings.autoplayEnabled &&
      !isReducedMotion &&
      baseItems.length > 1;

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
        (settings.pauseOnHover && isHoveredRef.current) ||
        (settings.pauseOnFocus && isFocusedRef.current) ||
        isPausedRef.current;

      if (!shouldPause && seqWidth > 0 && dt > 0 && dt < 0.25) {
        // Calculate responsive slow speed
        let speed = settings.desktopSpeed ? Math.min(settings.desktopSpeed, 24) : 22;
        if (typeof window !== "undefined") {
          if (window.innerWidth < 768) {
            speed = settings.mobileSpeed ? Math.min(settings.mobileSpeed, 18) : 16;
          } else if (window.innerWidth < 1024) {
            speed = settings.tabletSpeed ? Math.min(settings.tabletSpeed, 20) : 18;
          }
        }

        const dirMult = settings.direction === "right" ? 1 : -1;
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
  }, [settings, isReducedMotion, baseItems]);

  // Mobile Continuous Auto-Scroll + Touch/Finger Swipe Engine
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [isMobileInteracting, setIsMobileInteracting] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const mobileResumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingMobileRef = useRef(false);
  const mobileDragStartXRef = useRef(0);
  const mobileDragMovedRef = useRef(0);

  const mobileGalleryItems = useMemo(() => {
    if (visibleImages.length === 0) return [];
    if (visibleImages.length >= 4) return visibleImages;
    const rep: GalleryImage[] = [];
    while (rep.length < 4) {
      rep.push(...visibleImages);
    }
    return rep;
  }, [visibleImages]);

  // Tripled list for seamless infinite loop
  const mobileTripledGallery = useMemo(() => {
    if (mobileGalleryItems.length === 0) return [];
    return [...mobileGalleryItems, ...mobileGalleryItems, ...mobileGalleryItems];
  }, [mobileGalleryItems]);

  // Set initial scroll to center set for bidirectional seamless swiping
  useEffect(() => {
    if (mobileScrollRef.current) {
      const container = mobileScrollRef.current;
      const singleSetWidth = container.scrollWidth / 3;
      if (singleSetWidth > 0 && container.scrollLeft === 0) {
        container.scrollLeft = singleSetWidth;
      }
    }
  }, [mobileTripledGallery]);

  // Mobile IntersectionObserver
  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);

    const handleVisibility = () => {
      setIsInViewport(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // ── Mobile Auto-Scroll Loop (requestAnimationFrame) ──
  useEffect(() => {
    if (isReducedMotion || mobileTripledGallery.length <= 1) return;

    let animId: number;

    const tick = () => {
      if (mobileScrollRef.current && !isMobileInteracting && isInViewport) {
        const container = mobileScrollRef.current;
        // Direction: moving right or left
        const speed = settings.direction === "right" ? -0.85 : 0.85;
        container.scrollLeft += speed;

        const singleSetWidth = container.scrollWidth / 3;
        if (singleSetWidth > 0) {
          if (container.scrollLeft >= singleSetWidth * 2) {
            container.scrollLeft -= singleSetWidth;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += singleSetWidth;
          }
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isMobileInteracting, isInViewport, isReducedMotion, mobileTripledGallery.length, settings.direction]);

  // Touch handlers for mobile gallery
  const handleMobileTouchStart = (e: React.TouchEvent) => {
    setIsMobileInteracting(true);
    mobileDragStartXRef.current = e.touches[0].clientX;
    mobileDragMovedRef.current = 0;
    if (mobileResumeTimerRef.current) clearTimeout(mobileResumeTimerRef.current);
  };

  const handleMobileTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - mobileDragStartXRef.current);
    mobileDragMovedRef.current = dx;
  };

  const handleMobileTouchEnd = () => {
    if (mobileDragMovedRef.current > 8) {
      isDraggingMobileRef.current = true;
      setTimeout(() => {
        isDraggingMobileRef.current = false;
      }, 250);
    }
    // Resume auto-scroll smoothly after 2 seconds
    if (mobileResumeTimerRef.current) clearTimeout(mobileResumeTimerRef.current);
    mobileResumeTimerRef.current = setTimeout(() => {
      setIsMobileInteracting(false);
    }, 2000);
  };

  const handleMobileCardClick = (e: React.MouseEvent) => {
    if (isDraggingMobileRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Pointer drag & touch swipe handlers for desktop
  const handlePointerDown = (e: React.PointerEvent) => {
    if (settings.dragEnabled === false || isReducedMotion || baseItems.length <= 1) return;
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
      }, 100);
    }

    if (settings.pauseOnInteraction) {
      isPausedRef.current = true;
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        isPausedRef.current = false;
        lastTimeRef.current = null;
      }, settings.resumeDelay || 1500);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (wasDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const isContinuous =
    settings.endlessScrollEnabled &&
    settings.autoplayEnabled &&
    !isReducedMotion &&
    baseItems.length > 1;

  if (visibleImages.length === 0) {
    return null;
  }

  return (
    <>
      {/* ── Mobile Layout (< 768px): Continuous Auto-Scroll + Touch/Finger Swipe Gallery ── */}
      <section
        className="md:hidden w-full bg-[#F2F2F2] py-6 select-none overflow-hidden border-y border-neutral-200/80"
        aria-label="Life at Street Mobile Mobile Gallery"
      >
        {/* Mobile Header Row */}
        <motion.div
          initial={{ opacity: 0, y: isReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="px-4 mb-4 flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-800 text-[10px] font-bold uppercase tracking-wider mb-1.5 shadow-2xs select-none">
            <Images className="w-3 h-3 text-neutral-900 shrink-0" />
            <span>Store Highlights</span>
          </div>

          <div className="w-full flex items-baseline justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-tight">
              Life at Street Mobile
            </h2>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800 hover:text-black shrink-0 active:scale-95 transition-transform"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <p className="text-xs text-neutral-500 font-normal mt-1 max-w-xs leading-relaxed">
            Moments from our showroom, repair lab, and customer deliveries.
          </p>
        </motion.div>

        {/* Interactive Scroll & Touch Swipe Container */}
        <div
          ref={mobileScrollRef}
          onTouchStart={handleMobileTouchStart}
          onTouchMove={handleMobileTouchMove}
          onTouchEnd={handleMobileTouchEnd}
          onTouchCancel={handleMobileTouchEnd}
          onPointerDown={() => setIsMobileInteracting(true)}
          onPointerUp={handleMobileTouchEnd}
          className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none px-4 py-2 touch-pan-y cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        >
          {mobileTripledGallery.map((image, idx) => {
            const titleText = image.caption || image.title || "Life at Street Mobile";
            const validPostUrl = validateUrl(image.post_url) || "/gallery";
            const isInstagram =
              image.platform === "instagram" ||
              (validPostUrl && validPostUrl.includes("instagram.com"));

            return (
              <div
                key={`mob-gal-${image.id || idx}-${idx}`}
                className="w-[76vw] sm:w-[80vw] max-w-[310px] shrink-0 aspect-[4/5] rounded-2xl overflow-hidden relative shadow-sm border border-neutral-200/80 bg-neutral-900"
              >
                <a
                  href={validPostUrl}
                  target={validPostUrl.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  onClick={handleMobileCardClick}
                  aria-label={`Gallery photo: ${titleText}`}
                  className="block w-full h-full relative select-none"
                >
                  {/* 1. Full-Card Image */}
                  <img
                    src={image.image_url}
                    alt={titleText}
                    loading={idx < 3 ? "eager" : "lazy"}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.03]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-phone.webp";
                    }}
                  />

                  {/* 2. Top-Left Category Badge */}
                  {image.category && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-neutral-800 bg-white/90 backdrop-blur-md border border-neutral-200/60 shadow-2xs z-10 select-none">
                      {image.category}
                    </div>
                  )}

                  {/* 3. Top-Right Social Badge */}
                  {isInstagram && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 z-10 select-none">
                      <InstagramIcon className="w-2.5 h-2.5 text-white/90" />
                      <span>Instagram</span>
                    </div>
                  )}

                  {/* 4. Bottom Transparent Gradient & Caption */}
                  <div className="absolute inset-x-0 bottom-0 pt-16 pb-4 px-4 bg-gradient-to-t from-black/90 via-black/40 via-60% to-transparent flex items-end z-10">
                    <p className="text-white text-xs sm:text-sm font-bold leading-snug line-clamp-2 drop-shadow-xs m-0">
                      {titleText}
                    </p>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Desktop Layout ── */}
      <div className="hidden md:block">
        <ScrollReveal
          as="section"
          id="gallery-section"
          stagger={0.06}
          yOffset={20}
          className="relative py-12 sm:py-16 lg:py-[72px] bg-[#F2F2F2] border-y border-neutral-200/80 overflow-hidden font-sans select-none"
        >
      {/* ── Content Container (1320px Max-Width, Width: calc(100% - 48px)) ── */}
      <div className="relative max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* ── Header Row (2-Column Alignment with Action Button) ── */}
        <div
          data-reveal-item
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-10"
        >
          <div className="flex flex-col items-start text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white border border-neutral-200/80 text-neutral-800 text-[11px] font-bold uppercase tracking-[0.08em] shadow-2xs mb-2.5 select-none">
              <Images className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>STORE HIGHLIGHTS &amp; SOCIAL MEDIA</span>
            </div>

            {/* Main Heading */}
            <h2
              className="text-neutral-900 font-bold tracking-[-0.035em] leading-[1.0] m-0 p-0"
              style={{ fontSize: "clamp(38px, 3vw, 52px)" }}
            >
              Life at Street Mobile
            </h2>

            {/* Supporting Description */}
            <p className="text-[15px] sm:text-[17px] leading-[1.55] text-neutral-600 mt-2 max-w-[560px] font-normal m-0">
              Explore recent moments from our Vavuniya showroom, repair lab, and customer deliveries.
            </p>
          </div>

          {/* Action Button */}
          <Link
            href="/gallery"
            className="group inline-flex items-center justify-center gap-2 h-[46px] sm:h-[48px] px-6 rounded-[8px] bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold transition-all shrink-0 self-start md:self-auto shadow-sm active:scale-[0.98]"
          >
            <span>View Complete Gallery</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]" />
          </Link>
        </div>
      </div>

      {/* ── Moving Gallery Viewport Rail ── */}
      <div
        ref={sectionRef as React.RefObject<HTMLDivElement>}
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
        {/* Optional Edge Fade Gradients */}
        {settings.edgeFadeEnabled && (
          <>
            <div
              style={{
                width: `${settings.edgeFadeWidth}px`,
                background: `linear-gradient(to right, ${settings.edgeFadeColor || "#F2F2F2"}, transparent)`,
              }}
              className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none"
            />
            <div
              style={{
                width: `${settings.edgeFadeWidth}px`,
                background: `linear-gradient(to left, ${settings.edgeFadeColor || "#F2F2F2"}, transparent)`,
              }}
              className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none"
            />
          </>
        )}

        {isContinuous ? (
          /* Continuous Endless Moving Track with Pointer Drag */
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex items-center gap-4 sm:gap-5 cursor-grab active:cursor-grabbing will-change-transform touch-pan-y"
            style={{ width: "max-content" }}
          >
            {/* Sequence A (Primary) */}
            <div ref={singleSeqRef} className="flex items-center gap-4 sm:gap-5 shrink-0">
              {baseItems.map((img, idx) => (
                <GalleryCard
                  key={`seq-a-${img.id || idx}`}
                  image={img}
                  index={idx}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </div>

            {/* Sequence B (Identical clone for seamless loop) */}
            <div className="flex items-center gap-4 sm:gap-5 shrink-0" aria-hidden="true">
              {baseItems.map((img, idx) => (
                <GalleryCard
                  key={`seq-b-${img.id || idx}`}
                  image={img}
                  index={idx}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Fallback Static / Manual Scroll Rail (1 Item or Reduced Motion) */
          <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
            <div className="flex overflow-x-auto gap-4 sm:gap-5 pb-2 no-scrollbar scroll-smooth">
              {visibleImages.map((img, idx) => (
                <GalleryCard
                  key={`static-${img.id || idx}`}
                  image={img}
                  index={idx}
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
