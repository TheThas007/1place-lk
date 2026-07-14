"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface CylinderCarouselProps {
  images: string[];
  onImageClick?: (index: number) => void;
}

export function CylinderCarousel({ images, onImageClick }: CylinderCarouselProps) {
  const faceWidth = 250;
  const faceHeight = 350;
  const numFaces = Math.max(images.length, 3); // Ensure at least 3 for math

  const radius = useMemo(
    () => Math.max(300, Math.round(faceWidth / 2 / Math.tan(Math.PI / numFaces)) + 50),
    [numFaces]
  );

  return (
    <div 
      className="relative flex items-center justify-center w-full h-[500px] md:h-[600px] overflow-hidden" 
      style={{ perspective: "1200px" }}
    >
      {/* Dark fade edges to blend cylinder smoothly */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: faceWidth, height: faceHeight, transformStyle: "preserve-3d" }}
        animate={{ rotateY: [0, -360] }}
        transition={{
          duration: Math.max(20, images.length * 3), // Scale rotation speed with image count
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {images.map((src, i) => {
          const rotateY = i * (360 / numFaces);
          return (
            <div
              key={i}
              onClick={() => onImageClick?.(i)}
              className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer hover:border-white/40 transition-colors"
              style={{
                transform: `rotateY(${rotateY}deg) translateZ(${radius}px)`,
                backfaceVisibility: "hidden"
              }}
            >
              <img src={src} alt="Carousel" className="w-full h-full object-cover pointer-events-none" />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/0 transition-colors" />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
