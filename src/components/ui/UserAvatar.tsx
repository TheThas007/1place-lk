"use client";

import React from "react";

interface UserAvatarProps {
  gender?: "male" | "female" | "other" | string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showBadge?: boolean;
}

export function MaleIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="18" cy="18" r="18" fill="#18181B" />
      {/* Short Stylish Male Hair & Head */}
      <path
        d="M11 15C11 10.5817 14.134 7 18 7C21.866 7 25 10.5817 25 15C25 18.5 22.5 21 18 21C13.5 21 11 18.5 11 15Z"
        fill="#E4E4E7"
      />
      {/* Male Hairstyle Top Contour */}
      <path
        d="M11 13.5C11.5 9 14.5 7 18 7C22 7 25 9.5 25 13C23.5 10 20.5 9 17 9.5C14 10 12 11.5 11 13.5Z"
        fill="#27272A"
      />
      {/* Broad Shoulders & Collared Jacket */}
      <path
        d="M6 31C6 26.0294 10.0294 22 15 22H21C25.9706 22 30 26.0294 30 31V34C30 35.1046 29.1046 36 28 36H8C6.89543 36 6 35.1046 6 34V31Z"
        fill="#3F3F46"
      />
      {/* Tie / V-Neck Center Accent */}
      <path
        d="M18 22L16 26H20L18 22Z"
        fill="#A1A1AA"
      />
    </svg>
  );
}

export function FemaleIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="18" cy="18" r="18" fill="#18181B" />
      {/* Female Head & Face */}
      <path
        d="M12 15.5C12 11.3579 14.6863 8 18 8C21.3137 8 24 11.3579 24 15.5C24 19 21.5 21.5 18 21.5C14.5 21.5 12 19 12 15.5Z"
        fill="#F4E8DF"
      />
      {/* Female Flowing Hair */}
      <path
        d="M10 16C10 10 13.5 6.5 18 6.5C22.5 6.5 26 10 26 16C26 21 24.5 23 24 23.5C23.5 20 23.5 14 18 14C12.5 14 12.5 20 12 23.5C11.5 23 10 21 10 16Z"
        fill="#27272A"
      />
      {/* Female Torso / Blouse */}
      <path
        d="M7 31C7 26.5817 10.5817 23 15 23H21C25.4183 23 29 26.5817 29 31V34C29 35.1046 28.1046 36 27 36H9C7.89543 36 7 35.1046 7 34V31Z"
        fill="#52525B"
      />
      {/* Elegant V-Neckline Accent */}
      <path
        d="M18 25.5L15.5 23H20.5L18 25.5Z"
        fill="#F4E8DF"
      />
    </svg>
  );
}

export default function UserAvatar({
  gender = "male",
  name = "",
  size = "md",
  className = "",
  showBadge = false,
}: UserAvatarProps) {
  const isFemale = gender === "female";

  const sizeClasses = {
    xs: "w-5 h-5 min-w-[20px]",
    sm: "w-7 h-7 min-w-[28px]",
    md: "w-8 h-8 min-w-[32px]",
    lg: "w-10 h-10 min-w-[40px]",
    xl: "w-14 h-14 min-w-[56px]",
  };

  const badgeSizeClasses = {
    xs: "w-2 h-2 text-[6px]",
    sm: "w-3 h-3 text-[8px]",
    md: "w-3.5 h-3.5 text-[9px]",
    lg: "w-4 h-4 text-[10px]",
    xl: "w-5 h-5 text-xs",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-white/20 shadow-xs transition-transform active:scale-95 select-none ${sizeClasses[size]} ${className}`}
      title={name ? `${name} (${isFemale ? "Female" : "Male"})` : isFemale ? "Female User" : "Male User"}
    >
      {isFemale ? (
        <FemaleIcon className="w-full h-full" />
      ) : (
        <MaleIcon className="w-full h-full" />
      )}

      {showBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center font-bold ${
            isFemale ? "bg-pink-500 text-white" : "bg-blue-500 text-white"
          } ${badgeSizeClasses[size]}`}
        >
          {isFemale ? "♀" : "♂"}
        </span>
      )}
    </div>
  );
}
