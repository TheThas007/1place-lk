"use client";

import { useState } from "react";

export default function ProductGallery({ images, name, discount = 0 }: { images: string[]; name: string, discount?: number }) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Fallback if no images are provided
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-foreground/5 border border-border/50 flex items-center justify-center">
        <span className="text-muted-foreground">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-foreground/5 border border-border/50 group">
        <img 
          src={images[activeIdx]} 
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-6 left-6 bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg z-10">
            {discount}% OFF
          </div>
        )}
      </div>
      
      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {images.map((img, i) => (
            <div 
              key={i} 
              onClick={() => setActiveIdx(i)}
              className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-colors ${i === activeIdx ? 'border-foreground' : 'border-transparent hover:border-border'} bg-foreground/5`}
            >
              <img src={img} alt={`${name} thumbnail ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
