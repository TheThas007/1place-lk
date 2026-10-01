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
  yOffset = 14,
  stagger = 0.04,
  delay = 0,
  duration = 0.55,
  staggerSelector,
  id,
  enable3d = false,
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
    const finalDuration = isMobile ? Math.min(0.48, duration * 0.9) : duration;
    const finalY = motionSettings.motionIntensity === "minimal" ? 8 : (isMobile ? Math.min(12, yOffset) : yOffset);

    const ctx = gsap.context(() => {
      gsap.set(el, {
        opacity: 0,
        y: finalY,
      });

      const selector = staggerSelector || "[data-reveal-item], [data-stagger-item]";
      const items = el.querySelectorAll(selector);

      if (items.length > 0) {
        gsap.set(items, {
          opacity: 0,
          y: Math.min(10, finalY),
        });
      }

      ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        once: true,
        onEnter: () => {
          // Animate section into view
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: finalDuration,
            ease: "power2.out",
            delay: delay,
            onComplete: () => {
              gsap.set(el, { clearProps: "transform,willChange" });
            },
          });

          // Animate staggered child elements
          if (items.length > 0) {
            gsap.to(Array.from(items).slice(0, 16), {
              opacity: 1,
              y: 0,
              duration: finalDuration,
              ease: "power2.out",
              stagger: isMobile ? Math.min(0.025, stagger) : stagger,
              delay: delay + 0.04,
              onComplete: () => {
                gsap.set(items, { clearProps: "transform,willChange" });
              },
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
    >
      {children}
    </Comp>
  );
}
