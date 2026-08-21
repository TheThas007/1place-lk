"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  yOffset?: number;
  stagger?: number;
  delay?: number;
  duration?: number;
  staggerSelector?: string;
  id?: string;
}

export default function ScrollReveal({
  children,
  className = "",
  as: Component = "div",
  yOffset = 24,
  stagger = 0.07,
  delay = 0,
  duration = 0.75,
  staggerSelector,
  id,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const { motionSettings, isReducedMotion } = useSmoothScroll();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If reduced motion is active or section reveals are disabled
    if (isReducedMotion || motionSettings.enableSectionReveals === false) {
      gsap.set(el, { opacity: 1, y: 0, clearProps: "all" });
      const items = el.querySelectorAll("[data-reveal-item], [data-stagger-item]");
      if (items.length > 0) {
        gsap.set(items, { opacity: 1, y: 0, clearProps: "all" });
      }
      return;
    }

    const isMobile = window.innerWidth < 768;
    const finalDuration = isMobile ? Math.max(0.55, duration * 0.8) : duration;
    const finalY = motionSettings.motionIntensity === "minimal" ? Math.min(16, yOffset) : yOffset;

    const ctx = gsap.context(() => {
      // Find staggered child elements if specified or if data attributes are present
      const selector = staggerSelector || "[data-reveal-item], [data-stagger-item]";
      const items = el.querySelectorAll(selector);

      if (items.length > 0) {
        // Hide container slightly or keep it transparent until trigger
        gsap.set(el, { opacity: 1, y: 0 });
        gsap.set(items, { opacity: 0, y: Math.min(20, finalY) });

        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to(Array.from(items).slice(0, 8), {
              opacity: 1,
              y: 0,
              duration: finalDuration,
              ease: "power3.out",
              stagger: isMobile ? Math.min(0.05, stagger) : stagger,
              delay: delay,
              clearProps: "willChange",
            });
          },
        });
      } else {
        // Single element reveal
        gsap.set(el, { opacity: 0, y: finalY });

        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: finalDuration,
              ease: "power3.out",
              delay: delay,
              clearProps: "willChange",
            });
          },
        });
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [yOffset, stagger, delay, duration, staggerSelector, isReducedMotion, motionSettings.enableSectionReveals, motionSettings.motionIntensity]);

  const Comp = Component as any;

  return (
    <Comp
      ref={containerRef}
      id={id}
      className={className}
      style={{ willChange: isReducedMotion ? "auto" : "opacity, transform" }}
    >
      {children}
    </Comp>
  );
}
