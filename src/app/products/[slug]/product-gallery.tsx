"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, ChevronLeft, ChevronRight, Play } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  name: string;
  discount?: number;
  video_url?: string;
}

export default function ProductGallery({
  images,
  name,
  discount = 0,
  video_url,
}: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const displayImages = images && images.length > 0
    ? images
    : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"];

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="space-y-4">
      {/* ── Main Media Display Container ── */}
      <div className="relative aspect-square rounded-[24px] overflow-hidden bg-white p-6 border border-[#EAEAEA] flex items-center justify-center group shadow-xs">
        {/* Bottom-Left Discount Badge (Anchored on Image Bottom Edge) */}
        {discount > 0 && (
          <div className="absolute bottom-0 left-0 z-10">
            <span className="bg-red-600 text-white text-[11px] font-black px-3.5 py-1.5 rounded-tr-2xl uppercase tracking-wider shadow-sm inline-block">
              -{discount}% OFF
            </span>
          </div>
        )}

        {/* Fullscreen Zoom Trigger */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[#EAEAEA] flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm hover:scale-105"
          aria-label="Enlarge image"
        >
          <Maximize2 className="w-4 h-4 text-black" />
        </button>

        {/* Video Mode or Image Mode */}
        {showVideo && video_url ? (
          <div className="w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
            <iframe
              src={video_url.includes("youtube.com") || video_url.includes("youtu.be") 
                ? video_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
                : video_url}
              title={`${name} Video`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <img
            src={displayImages[activeIdx]}
            alt={`${name} - Image ${activeIdx + 1}`}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-105 cursor-pointer"
            onClick={() => setIsFullscreen(true)}
          />
        )}
      </div>

      {/* ── Thumbnail Row ── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {displayImages.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setActiveIdx(i);
              setShowVideo(false);
            }}
            className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-2 overflow-hidden border-2 cursor-pointer transition-all ${
              i === activeIdx && !showVideo
                ? "border-black ring-1 ring-black"
                : "border-[#EAEAEA] hover:border-black/50"
            } bg-white`}
            aria-label={`View ${name} image ${i + 1}`}
          >
            <img
              src={img}
              alt={`${name} thumbnail ${i + 1}`}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </button>
        ))}

        {/* Optional Video Thumbnail */}
        {video_url && (
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all bg-black flex flex-col items-center justify-center text-white ${
              showVideo ? "border-black ring-1 ring-black" : "border-[#EAEAEA] hover:border-black"
            }`}
          >
            <Play className="w-6 h-6 text-white mb-1 fill-white" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Video</span>
          </button>
        )}
      </div>

      {/* ── Fullscreen Image Modal ── */}
      <AnimatePresence>
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full h-[80vh] flex flex-col items-center justify-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
                aria-label="Close fullscreen"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Main Fullscreen Image */}
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={displayImages[activeIdx]}
                  alt={`${name} Fullscreen`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Nav Arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 text-xs font-semibold text-white/70 bg-black/50 px-3 py-1 rounded-full">
                {activeIdx + 1} / {displayImages.length}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
