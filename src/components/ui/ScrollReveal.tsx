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
  enable3d?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  as: Component = "div",
  yOffset = 24,
  stagger = 0.06,
  delay = 0,
  duration = 0.85,
  staggerSelector,
  id,
  enable3d = true,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const { motionSettings, isReducedMotion } = useSmoothScroll();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If reduced motion is active or section reveals are disabled
    if (isReducedMotion || motionSettings.enableSectionReveals === false) {
      gsap.set(el, { opacity: 1, y: 0, scale: 1, rotateX: 0, clearProps: "all" });
      const items = el.querySelectorAll("[data-reveal-item], [data-stagger-item]");
      if (items.length > 0) {
        gsap.set(items, { opacity: 1, y: 0, scale: 1, clearProps: "all" });
      }
      return;
    }

    const isMobile = window.innerWidth < 768;
    const finalDuration = isMobile ? Math.max(0.65, duration * 0.85) : duration;
    const finalY = motionSettings.motionIntensity === "minimal" ? 14 : yOffset;

    const ctx = gsap.context(() => {
      // 3D perspective setup on the section container
      gsap.set(el, {
        opacity: 0,
        y: finalY,
      });

      const selector = staggerSelector || "[data-reveal-item], [data-stagger-item]";
      const items = el.querySelectorAll(selector);

      if (items.length > 0) {
        gsap.set(items, {
          opacity: 0,
          y: Math.min(20, finalY),
        });
      }

      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          // Animate section into view
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: finalDuration,
            ease: "power2.out",
            delay: delay,
          });

          // Animate staggered child elements
          if (items.length > 0) {
            gsap.to(Array.from(items).slice(0, 16), {
              opacity: 1,
              y: 0,
              duration: finalDuration,
              ease: "power2.out",
              stagger: isMobile ? Math.min(0.04, stagger) : stagger,
              delay: delay + 0.06,
              clearProps: "willChange",
            });
          }
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [
    yOffset,
    stagger,
    delay,
    duration,
    staggerSelector,
    isReducedMotion,
    motionSettings.enableSectionReveals,
    motionSettings.motionIntensity,
    enable3d,
  ]);

  const Comp = Component as any;

  return (
    <Comp
      ref={containerRef}
      id={id}
      className={className}
      style={{
        willChange: isReducedMotion ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Comp>
  );
}
