"use client";

import React, { useMemo } from "react";
import { SpinSegment } from "@/lib/types";

interface SpinWheelProps {
  segments: SpinSegment[];
  rotation: number;
  isSpinning: boolean;
  onSpinEnd?: () => void;
  onWheelClick?: () => void;
  size?: number;
}

export default function SpinWheel({
  segments,
  rotation,
  isSpinning,
  onSpinEnd,
  onWheelClick,
  size = 300,
}: SpinWheelProps) {
  const numSegments = segments.length || 6;
  const sliceAngle = 360 / numSegments;
  const radius = 140;
  const center = 150;

  // Generate SVG path for a circular pie slice
  const getSlicePath = (index: number) => {
    const startAngle = (index * sliceAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * sliceAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  // Generate outer illuminated bulbs
  const bulbs = useMemo(() => {
    const count = 24;
    const bulbRadius = 145;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i * (360 / count) - 90) * (Math.PI / 180);
      const x = center + bulbRadius * Math.cos(angle);
      const y = center + bulbRadius * Math.sin(angle);
      return { x, y, id: i };
    });
  }, []);

  return (
    <div
      onClick={() => {
        if (!isSpinning && onWheelClick) onWheelClick();
      }}
      className={`relative flex items-center justify-center select-none ${!isSpinning ? "cursor-pointer group" : "cursor-default"}`}
      style={{ width: size, height: size }}
      title={!isSpinning ? "Click or tap to spin the wheel!" : "Spinning..."}
    >
      {/* Outer Glow Halo */}
      <div className="absolute inset-[-10px] rounded-full bg-gradient-to-r from-amber-500/25 via-rose-500/20 to-amber-500/25 blur-xl pointer-events-none animate-pulse" />

      {/* Top Fixed Gold Pointer */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
          <path
            d="M17 40L4 6C3 4 4.5 1 7 1H27C29.5 1 31 4 30 6L17 40Z"
            fill="url(#goldPointerGrad)"
            stroke="#FFE57F"
            strokeWidth="1.5"
          />
          <circle cx="17" cy="12" r="5" fill="#64152F" stroke="#FFE57F" strokeWidth="1" />
          <defs>
            <linearGradient id="goldPointerGrad" x1="4" y1="1" x2="30" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF275" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Rotating Wheel Container */}
      <div
        className="w-full h-full relative"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? "transform 6.5s cubic-bezier(0.12, 0.85, 0.2, 1)"
            : "transform 0.4s ease-out",
        }}
        onTransitionEnd={onSpinEnd}
      >
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)]"
        >
          <defs>
            {/* Outer Gold Rim Gradient */}
            <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF099" />
              <stop offset="30%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#D97706" />
              <stop offset="85%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#FFF099" />
            </linearGradient>

            {/* Inner Center Hub Gradient */}
            <radialGradient id="centerHubGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8A1C3E" />
              <stop offset="70%" stopColor="#64152F" />
              <stop offset="100%" stopColor="#350713" />
            </radialGradient>
          </defs>

          {/* Outer Metallic Ring */}
          <circle cx={center} cy={center} r="148" fill="url(#goldRimGrad)" stroke="#FFE875" strokeWidth="2" />
          <circle cx={center} cy={center} r="141" fill="#1A1A1A" stroke="#4A1020" strokeWidth="1" />

          {/* Wheel Slices */}
          {segments.map((segment, index) => {
            const midAngle = (index * sliceAngle + sliceAngle / 2) - 90;
            const textRadius = radius * 0.65;
            const textAngleRad = midAngle * (Math.PI / 180);
            const textX = center + textRadius * Math.cos(textAngleRad);
            const textY = center + textRadius * Math.sin(textAngleRad);

            return (
              <g key={segment.id || index}>
                {/* Slice Wedge */}
                <path
                  d={getSlicePath(index)}
                  fill={segment.color || (index % 2 === 0 ? "#64152F" : "#FFFFFF")}
                  stroke="#E8B923"
                  strokeWidth="1.2"
                />

                {/* Slice Label & Icon */}
                <g transform={`translate(${textX}, ${textY}) rotate(${midAngle + 90})`}>
                  {/* Emoji / Icon */}
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="13"
                  >
                    {segment.type === "free_shipping"
                      ? "🚚"
                      : segment.icon === "headphones"
                      ? "🎧"
                      : segment.icon === "zap"
                      ? "⚡"
                      : segment.icon === "tag"
                      ? "🏷️"
                      : "🎁"}
                  </text>
                  {/* Text Label */}
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={segment.textColor || "#FFFFFF"}
                    fontSize="8.5"
                    fontWeight="800"
                    letterSpacing="0.03em"
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      textShadow: segment.textColor === "#111111" ? "none" : "0 1px 2px rgba(0,0,0,0.8)",
                    }}
                  >
                    {segment.label.length > 14
                      ? segment.label.slice(0, 13) + "…"
                      : segment.label}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Decorative Outer Bulbs */}
          {bulbs.map((bulb, i) => (
            <circle
              key={bulb.id}
              cx={bulb.x}
              cy={bulb.y}
              r={i % 2 === 0 ? 2.8 : 2.2}
              fill={i % 2 === 0 ? "#FFF9D2" : "#F59E0B"}
              filter="drop-shadow(0 0 2px #FDE047)"
            />
          ))}

          {/* Center Hub Outer Gold Ring */}
          <circle cx={center} cy={center} r="34" fill="url(#goldRimGrad)" stroke="#FFE57F" strokeWidth="2" />
          {/* Center Hub Dome */}
          <circle cx={center} cy={center} r="28" fill="url(#centerHubGrad)" stroke="#4A1020" strokeWidth="1.5" />

          {/* Center 3D Gift Box Graphic */}
          <g transform={`translate(${center - 13}, ${center - 13}) scale(0.95)`}>
            {/* Box Body */}
            <rect x="2" y="9" width="24" height="18" rx="2" fill="#D90429" stroke="#9E021B" strokeWidth="0.8" />
            {/* Lid */}
            <rect x="0" y="5" width="28" height="5" rx="1.5" fill="#EF233C" stroke="#B0041E" strokeWidth="0.8" />
            {/* Vertical Gold Ribbon */}
            <rect x="11.5" y="5" width="5" height="22" fill="#F59E0B" />
            <rect x="12.5" y="5" width="3" height="22" fill="#FDE047" />
            {/* Horizontal Gold Ribbon */}
            <rect x="2" y="15" width="24" height="4" fill="#F59E0B" />
            <rect x="2" y="16" width="24" height="2" fill="#FDE047" />
            {/* Bow Left */}
            <ellipse cx="10" cy="4" rx="4" ry="2.5" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(-20, 10, 4)" />
            {/* Bow Right */}
            <ellipse cx="18" cy="4" rx="4" ry="2.5" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" transform="rotate(20, 18, 4)" />
            {/* Center knot */}
            <circle cx="14" cy="5" r="2.2" fill="#F59E0B" stroke="#B45309" strokeWidth="0.6" />
          </g>
        </svg>
      </div>
    </div>
  );
}
