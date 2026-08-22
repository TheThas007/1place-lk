"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";

export default function WeAreNearYouMarquee({
  speed = 45,
  direction = "left",
}: {
  speed?: number;
  direction?: "left" | "right";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const singleSeqRef = useRef<HTMLDivElement>(null);

  const offsetRef = useRef<number>(0);
  const sequenceWidthRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const isHoveredRef = useRef(false);
  const isVisibleRef = useRef(true);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);

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
  }, [measureSequence]);

  // Viewport visibility culling
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          lastTimeRef.current = null;
        }
      },
      { threshold: 0.02 }
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

  // Continuous 60fps RequestAnimationFrame Loop
  useEffect(() => {
    if (isReducedMotion) {
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

      const shouldPause = !isVisibleRef.current || isDraggingRef.current || isHoveredRef.current;

      if (!shouldPause && seqWidth > 0 && dt > 0 && dt < 0.25) {
        const dirMult = direction === "right" ? 1 : -1;
        offsetRef.current += speed * dt * dirMult;

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
  }, [speed, direction, isReducedMotion]);

  // Pointer drag & touch swipe handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isReducedMotion) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    lastTimeRef.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
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
  };

  // Phrases for the sequence
  const phrases = useMemo(
    () => [
      "WE ARE NEAR YOU",
      "STREET MOBILE VAVUNIYA",
      "WE ARE NEAR YOU",
      "VISIT OUR SHOWROOM",
      "WE ARE NEAR YOU",
      "PREMIUM TECH & REPAIRS",
    ],
    []
  );

  const renderPhraseSequence = (keyPrefix: string) => (
    <div className="flex items-center gap-8 sm:gap-14 shrink-0 select-none py-2">
      {phrases.map((phrase, idx) => (
        <div key={`${keyPrefix}-${idx}`} className="flex items-center gap-8 sm:gap-14 shrink-0 group/item">
          <span
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-[0.14em] sm:tracking-[0.18em] transition-all duration-300 select-none cursor-default font-sans leading-none whitespace-nowrap drop-shadow-2xs group-hover/item:opacity-80"
            style={{
              WebkitTextFillColor: "transparent",
              WebkitTextStrokeWidth: "1.5px",
              WebkitTextStrokeColor: "rgba(0, 0, 0, 0.16)",
              letterSpacing: "0.16em",
            }}
          >
            {phrase}
          </span>
          <span
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-neutral-400/40 bg-neutral-300/30 shrink-0 select-none"
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  );

  return (
    <section
      ref={containerRef}
      aria-label="We Are Near You Banner"
      className="relative w-full py-4 sm:py-6 overflow-hidden bg-transparent select-none z-10 -my-3 sm:-my-4"
    >
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
      >
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex items-center gap-8 sm:gap-14 cursor-grab active:cursor-grabbing will-change-transform touch-pan-y"
          style={{ width: "max-content" }}
        >
          {/* Sequence 1 */}
          <div ref={singleSeqRef} className="flex items-center gap-8 sm:gap-14 shrink-0">
            {renderPhraseSequence("seq1")}
          </div>

          {/* Sequence 2 (Identical clone for seamless continuous endless loop) */}
          <div className="flex items-center gap-8 sm:gap-14 shrink-0" aria-hidden="true">
            {renderPhraseSequence("seq2")}
          </div>
        </div>
      </div>
    </section>
  );
}
