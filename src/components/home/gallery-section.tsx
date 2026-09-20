"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Images, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { GalleryImage, GalleryAnimationSettings, UiSettings } from "@/lib/types";
import { DEFAULT_GALLERY_ANIMATION_SETTINGS } from "@/lib/data";
import ScrollReveal from "@/components/ui/ScrollReveal";

async function downloadMedia(url: string, title?: string) {
  try {
    let blob: Blob;
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error("direct fetch failed");
      blob = await res.blob();
    } catch {
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("proxy fetch failed");
      blob = await res.blob();
    }
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    const cleanTitle = (title || "street-mobile")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);
    link.download = `${cleanTitle || "street-mobile-gallery"}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
  } catch {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = (title || "street-mobile-gallery").toLowerCase().replace(/[^a-z0-9]/g, "-") + ".jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

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

/* ─── Refined Editorial Gallery Card ─── */
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
    <div className="relative w-full h-full overflow-hidden bg-neutral-100 select-none rounded-[12px] sm:rounded-[14px]">
      {/* 1. Edge-to-Edge Image with Smooth Subtle Scale */}
      <Image
        src={image.image_url}
        alt={titleText}
        priority={index < 4}
        fill
        sizes="(max-width: 640px) 74vw, 300px"
        draggable={false}
        className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03] pointer-events-none select-none"
      />

      {/* 2. Top-Left Category Badge */}
      {image.category && (
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 px-2 py-0.5 rounded-[5px] text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-800 bg-white/90 backdrop-blur-md border border-neutral-200/60 shadow-2xs z-10 select-none pointer-events-none">
          {image.category}
        </div>
      )}

      {/* 3. Top-Right Social Badge */}
      {isInstagram && (
        <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 px-2 py-0.5 rounded-[5px] text-[9.5px] sm:text-[10px] font-semibold text-white bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 z-10 select-none pointer-events-none">
          <InstagramIcon className="w-3 h-3 text-pink-400" />
          <span>Instagram</span>
        </div>
      )}

      {/* 4. Bottom Transparent Gradient & Typography */}
      <div className="absolute inset-x-0 bottom-0 pt-12 sm:pt-14 pb-3 sm:pb-3.5 px-3 sm:px-3.5 pr-12 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex items-end z-10 pointer-events-none">
        <p className="text-white text-xs sm:text-[13px] font-semibold leading-snug line-clamp-2 drop-shadow-xs m-0 select-none">
          {titleText}
        </p>
      </div>

      {/* 5. Download Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          downloadMedia(image.image_url, titleText);
        }}
        aria-label={`Download image: ${titleText}`}
        title="Download photo"
        className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-black/90 active:scale-90 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-md opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-white" />
      </button>
    </div>
  );

  return (
    <div
      className="relative group aspect-[4/5] rounded-[12px] sm:rounded-[14px] overflow-hidden border border-neutral-200/80 hover:border-neutral-300 transition-all duration-300 hover:-translate-y-[2px] sm:hover:-translate-y-[3px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] shrink-0 w-[74vw] sm:w-[280px] lg:w-[298px] max-w-[310px] select-none"
    >
      {validPostUrl ? (
        <a
          href={validPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick}
          aria-label={`View on Social Media: ${titleText}`}
          className="block w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-[12px] sm:rounded-[14px]"
        >
          {CardContent}
        </a>
      ) : (
        <Link
          href="/gallery"
          onClick={onLinkClick}
          aria-label={`View Gallery: ${titleText}`}
          className="block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-[12px] sm:rounded-[14px]"
        >
          {CardContent}
        </Link>
      )}
    </div>
  );
}

/* ─── Main Gallery Section (Silky-Smooth GPU Touch Swipe & Autoplay Engine) ─── */
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
  const stepAnimRef = useRef<number | null>(null);

  // State flags for interactive pausing
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isPausedRef = useRef(false);
  const isVisibleRef = useRef(true);
  const wasDraggingRef = useRef(false);

  // Touch & Drag Physics Tracking
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const dragMovedRef = useRef(0);
  const isHorizontalGestureRef = useRef<boolean | null>(null);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const pointerVelocityRef = useRef(0);

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

  // Helper to wrap offset within [-sequenceWidth, 0]
  const normalizeOffset = useCallback((val: number) => {
    const seqWidth = sequenceWidthRef.current;
    if (seqWidth <= 0) return val;
    let n = val;
    while (n <= -seqWidth) n += seqWidth;
    while (n >= 0) n -= seqWidth;
    return n;
  }, []);

  // Main 60fps/120fps RequestAnimationFrame Loop
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
        // Calculate responsive speed
        let speed = settings.desktopSpeed ? Math.min(settings.desktopSpeed, 24) : 22;
        if (typeof window !== "undefined") {
          if (window.innerWidth < 768) {
            speed = settings.mobileSpeed ? Math.min(settings.mobileSpeed, 20) : 18;
          } else if (window.innerWidth < 1024) {
            speed = settings.tabletSpeed ? Math.min(settings.tabletSpeed, 22) : 20;
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

  // Smooth Animated Step (Prev / Next Buttons)
  const smoothStep = useCallback(
    (delta: number) => {
      if (stepAnimRef.current) cancelAnimationFrame(stepAnimRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);

      isPausedRef.current = true;
      lastTimeRef.current = null;

      const startOffset = offsetRef.current;
      const startTime = performance.now();
      const duration = 400; // ms

      const stepTick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease Out Cubic curve
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = startOffset + delta * ease;

        offsetRef.current = normalizeOffset(current);
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }

        if (progress < 1) {
          stepAnimRef.current = requestAnimationFrame(stepTick);
        } else {
          // Resume autoplay after 2.5 seconds
          if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
          resumeTimeoutRef.current = setTimeout(() => {
            isPausedRef.current = false;
            lastTimeRef.current = null;
          }, 2500);
        }
      };

      stepAnimRef.current = requestAnimationFrame(stepTick);
    },
    [normalizeOffset]
  );

  const handlePrev = useCallback(() => {
    const cardStep = typeof window !== "undefined" && window.innerWidth < 768 ? 290 : 315;
    smoothStep(cardStep);
  }, [smoothStep]);

  const handleNext = useCallback(() => {
    const cardStep = typeof window !== "undefined" && window.innerWidth < 768 ? 290 : 315;
    smoothStep(-cardStep);
  }, [smoothStep]);

  // ── Touch & Pointer Gestures for Fluid 1:1 Swiping ──
  const handlePointerDown = (e: React.PointerEvent) => {
    if (settings.dragEnabled === false || isReducedMotion || baseItems.length <= 1) return;
    if (stepAnimRef.current) cancelAnimationFrame(stepAnimRef.current);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);

    isDraggingRef.current = true;
    isPausedRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartOffsetRef.current = offsetRef.current;
    dragMovedRef.current = 0;
    isHorizontalGestureRef.current = null;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    pointerVelocityRef.current = 0;
    lastTimeRef.current = null;

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartXRef.current;
    const dy = e.clientY - dragStartYRef.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Detect gesture direction on initial movement
    if (isHorizontalGestureRef.current === null) {
      if (absDx > 6 || absDy > 6) {
        if (absDy > absDx) {
          // Vertical scroll - release drag
          isHorizontalGestureRef.current = false;
          isDraggingRef.current = false;
          isPausedRef.current = false;
          return;
        } else {
          isHorizontalGestureRef.current = true;
        }
      }
    }

    if (isHorizontalGestureRef.current === false) return;

    dragMovedRef.current = absDx;

    // Track velocity
    const now = performance.now();
    const dt = now - lastPointerTimeRef.current;
    if (dt > 0) {
      pointerVelocityRef.current = (e.clientX - lastPointerXRef.current) / dt;
      lastPointerXRef.current = e.clientX;
      lastPointerTimeRef.current = now;
    }

    // Direct 1:1 hardware transform
    const newOffset = normalizeOffset(dragStartOffsetRef.current + dx);
    offsetRef.current = newOffset;

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${newOffset}px, 0, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    lastTimeRef.current = null;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // Suppress card link clicks if user dragged
    if (dragMovedRef.current > 6) {
      wasDraggingRef.current = true;
      setTimeout(() => {
        wasDraggingRef.current = false;
      }, 200);
    }

    // Inertial fling momentum if flicked
    const velocity = pointerVelocityRef.current;
    if (Math.abs(velocity) > 0.35) {
      const flingDistance = velocity * 180;
      smoothStep(flingDistance);
    } else {
      // Resume autoplay after brief delay
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        isPausedRef.current = false;
        lastTimeRef.current = null;
      }, settings.resumeDelay || 1800);
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
    <ScrollReveal
      as="section"
      id="gallery-section"
      stagger={0.06}
      yOffset={20}
      className="relative py-8 sm:py-14 lg:py-[72px] bg-[#F2F2F2] border-y border-neutral-200/80 overflow-hidden font-sans select-none"
    >
      {/* ── Content Header Container (Responsive 1320px Max-Width) ── */}
      <div className="relative max-w-[1320px] w-[calc(100%-32px)] sm:w-[calc(100%-48px)] mx-auto">
        {/* Mobile Header (< 768px) */}
        <div data-reveal-item className="md:hidden flex flex-col items-start mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-neutral-800 text-[10px] font-bold uppercase tracking-wider mb-2 shadow-2xs select-none">
            <Images className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Store Highlights</span>
          </div>

          <div className="w-full flex items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-tight m-0">
              Life at Street Mobile
            </h2>

            {/* Mobile Actions: View all + Prev/Next Touch Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-white border border-neutral-300 text-neutral-800 hover:text-black shrink-0 active:scale-95 transition-transform"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-7 h-7 rounded-full bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100 flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-500 font-normal mt-1.5 max-w-xs leading-relaxed m-0">
            Moments from our showroom, repair lab, and customer deliveries.
          </p>
        </div>

        {/* Desktop Header (>= 768px) */}
        <div
          data-reveal-item
          className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-10"
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
              style={{ fontSize: "clamp(34px, 3vw, 50px)" }}
            >
              Life at Street Mobile
            </h2>

            {/* Supporting Description */}
            <p className="text-[15px] sm:text-[16px] leading-[1.55] text-neutral-600 mt-2 max-w-[560px] font-normal m-0">
              Explore recent moments from our Vavuniya showroom, repair lab, and customer deliveries.
            </p>
          </div>

          {/* Action Buttons & Manual Controls */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <Link
              href="/gallery"
              className="group inline-flex items-center justify-center gap-2 h-[44px] sm:h-[46px] px-5 sm:px-6 rounded-[8px] bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              <span>View Complete Gallery</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]" />
            </Link>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100 flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Moving Gallery Viewport Rail (Hardware Accelerated 60fps) ── */}
      <div
        ref={sectionRef as React.RefObject<HTMLDivElement>}
        data-reveal-item
        className="relative w-full overflow-hidden select-none"
        style={{ touchAction: "pan-y" }}
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
                width: `${settings.edgeFadeWidth || 60}px`,
                background: `linear-gradient(to right, ${settings.edgeFadeColor || "#F2F2F2"}, transparent)`,
              }}
              className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none hidden sm:block"
            />
            <div
              style={{
                width: `${settings.edgeFadeWidth || 60}px`,
                background: `linear-gradient(to left, ${settings.edgeFadeColor || "#F2F2F2"}, transparent)`,
              }}
              className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none hidden sm:block"
            />
          </>
        )}

        {isContinuous ? (
          /* Continuous Endless Moving Track with 1:1 Pointer & Touch Drag */
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex items-center gap-3.5 sm:gap-5 cursor-grab active:cursor-grabbing will-change-transform touch-pan-y pl-4 sm:pl-6"
            style={{ width: "max-content", touchAction: "pan-y" }}
          >
            {/* Sequence A (Primary) */}
            <div ref={singleSeqRef} className="flex items-center gap-3.5 sm:gap-5 shrink-0">
              {baseItems.map((img, idx) => (
                <GalleryCard
                  key={`seq-a-${img.id || idx}-${idx}`}
                  image={img}
                  index={idx}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </div>

            {/* Sequence B (Identical clone for seamless infinite loop) */}
            <div className="flex items-center gap-3.5 sm:gap-5 shrink-0" aria-hidden="true">
              {baseItems.map((img, idx) => (
                <GalleryCard
                  key={`seq-b-${img.id || idx}-${idx}`}
                  image={img}
                  index={idx}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Fallback Static / Manual Scroll Rail */
          <div className="max-w-[1320px] w-[calc(100%-32px)] sm:w-[calc(100%-48px)] mx-auto">
            <div className="flex overflow-x-auto gap-3.5 sm:gap-5 pb-2 no-scrollbar scroll-smooth">
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
  );
}
