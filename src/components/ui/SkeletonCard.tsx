"use client";

import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export default function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5 animate-pulse",
        className
      )}
    >
      {/* Image placeholder */}
      <div className="aspect-square bg-zinc-800/80 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
      </div>
      {/* Text placeholders */}
      <div className="p-4 space-y-3">
        <div className="h-2.5 bg-zinc-800 rounded-full w-1/3" />
        <div className="h-3.5 bg-zinc-800 rounded-full w-3/4" />
        <div className="flex items-center gap-2">
          <div className="h-4 bg-zinc-800 rounded-full w-1/4" />
          <div className="h-3 bg-zinc-800/50 rounded-full w-1/5" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
