"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

interface FinishingZoomWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function FinishingZoomWrapper({
  children,
  className = "",
}: FinishingZoomWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { isReducedMotion } = useSmoothScroll();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: isMounted ? containerRef : undefined,
    offset: ["start end", "end end"],
  });

  // Only keep opacity, removed scale/zoom to improve performance
  const rawOpacity = useTransform(scrollYProgress, [0, 0.3, 1], [0.88, 0.96, 1.0]);
  const rawBorderRadius = useTransform(scrollYProgress, [0, 0.8, 1], [36, 16, 0]);

  // Apply spring physics for buttery smooth responsiveness
  const opacity = useSpring(rawOpacity, { stiffness: 110, damping: 26, restDelta: 0.001 });

  if (isReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <motion.div
        style={{
          opacity,
          borderRadius: rawBorderRadius,
          transformOrigin: "center top",
        }}
        className={`w-full overflow-hidden will-change-transform ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
