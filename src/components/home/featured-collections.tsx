"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { FeaturedCollectionsSettings, FeaturedCollectionCard } from "@/lib/types";
import { DEFAULT_FEATURED_COLLECTIONS } from "@/lib/data";
import { getFeaturedCollections } from "@/lib/firestore-client";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { normalizeImageUrl } from "@/lib/utils";

interface FeaturedCollectionsProps {
  settings?: FeaturedCollectionsSettings | null;
}

function resolveDestinationUrl(card: FeaturedCollectionCard, defaultUrl = "/products"): string {
  if (card.card_link_url && card.card_link_url.trim()) {
    return card.card_link_url.trim();
  }
  if (card.primary_cta_url && card.primary_cta_url.trim()) {
    return card.primary_cta_url.trim();
  }
  if (card.link_type === "category" && card.link_destination) {
    return `/products?category=${encodeURIComponent(card.link_destination)}`;
  }
  if (card.link_type === "brand" && card.link_destination) {
    return `/products?brand=${encodeURIComponent(card.link_destination)}`;
  }
  if (card.link_type === "product" && card.link_destination) {
    return `/products/${encodeURIComponent(card.link_destination)}`;
  }
  if (card.link_type === "custom" && card.link_destination) {
    return card.link_destination;
  }
  return defaultUrl;
}

function getFocalPositionStyle(card: FeaturedCollectionCard): string {
  if (card.focal_position === "custom" && card.custom_focal_position?.trim()) {
    return card.custom_focal_position.trim();
  }
  if (card.focal_position) {
    return card.focal_position;
  }
  return "center";
}

function isCardDarkTextTheme(card: FeaturedCollectionCard): boolean {
  if (card.text_color === "black" || card.text_color === "dark") {
    return true;
  }
  if (card.text_color === "white" || card.text_color === "light") {
    return false;
  }
  return card.theme === "light";
}

function CollectionCard({ card }: { card: FeaturedCollectionCard; index: number }) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const isDarkText = isCardDarkTextTheme(card);
  const cardDestination = resolveDestinationUrl(card);
  const primaryUrl = card.primary_cta_url?.trim() || cardDestination;
  const secondaryUrl = card.secondary_cta_url?.trim() || cardDestination;
  const isExternal = cardDestination.startsWith("http://") || cardDestination.startsWith("https://");

  const imageSource = normalizeImageUrl(card.desktop_image_url || card.mobile_image_url || "/placeholder-phone.webp");
  const focalPosition = getFocalPositionStyle(card);

  // Vertical content position (defaults to top for editorial clean aesthetic)
  const contentPosition = card.content_position || "top";
  const contentJustifyClass =
    contentPosition === "bottom"
      ? "justify-end"
      : contentPosition === "center"
      ? "justify-center"
      : "justify-start";

  // Horizontal text alignment
  const textAlign = card.text_align || "center";
  const textAlignItemsClass =
    textAlign === "left"
      ? "items-start text-left"
      : textAlign === "right"
      ? "items-end text-right"
      : "items-center text-center";

  // Directional readability gradient overlay (subtle 10-18% opacity)
  const overlayEnabled = card.overlay_enabled !== false;
  const rawStrength = typeof card.overlay_strength === "number" ? card.overlay_strength : 15;
  const clampedStrength = Math.max(0, Math.min(25, rawStrength));
  const alphaDecimal = (clampedStrength / 100).toFixed(2);

  let overlayGradient = "none";
  if (overlayEnabled && clampedStrength > 0) {
    const baseColor = isDarkText ? "255, 255, 255" : "0, 0, 0";
    if (contentPosition === "top") {
      overlayGradient = `linear-gradient(to bottom, rgba(${baseColor}, ${alphaDecimal}) 0%, rgba(${baseColor}, 0) 65%)`;
    } else if (contentPosition === "bottom") {
      overlayGradient = `linear-gradient(to top, rgba(${baseColor}, ${alphaDecimal}) 0%, rgba(${baseColor}, 0) 65%)`;
    } else {
      overlayGradient = `radial-gradient(circle at center, rgba(${baseColor}, ${alphaDecimal}) 0%, rgba(${baseColor}, 0) 80%)`;
    }
  }

  // Apple-inspired Typography & Text Contrast Colors
  const textColor = isDarkText ? "text-[#090909]" : "text-[#FFFFFF]";
  const subtitleColor = isDarkText ? "text-[#090909]/80" : "text-[#FFFFFF]/85";
  const eyebrowColor = isDarkText ? "text-[#090909]/70" : "text-[#FFFFFF]/75";

  // CTA styles
  const primaryBtnClass = isDarkText
    ? "bg-[#090909] text-white hover:bg-neutral-800"
    : "bg-white text-[#090909] hover:bg-neutral-100";

  const secondaryLinkClass = isDarkText
    ? "text-[#090909] hover:opacity-75"
    : "text-white hover:opacity-75";

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) {
      return;
    }

    if (isExternal || card.open_in_new_tab) {
      window.open(cardDestination, card.open_in_new_tab ? "_blank" : "_self");
    } else {
      router.push(cardDestination);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isExternal || card.open_in_new_tab) {
        window.open(cardDestination, card.open_in_new_tab ? "_blank" : "_self");
      } else {
        router.push(cardDestination);
      }
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${card.title} collection`}
      className="group relative w-full h-full min-h-[460px] sm:min-h-[480px] lg:min-h-0 overflow-hidden select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all duration-300 rounded-none"
      style={{ borderRadius: 0, backgroundColor: card.bg_color || (isDarkText ? "#F5F5F7" : "#000000") }}
    >
      {/* ── 1. Full-Frame Absolute Edge-to-Edge Image (Covers 100% of card) ── */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden p-0 m-0 z-0 rounded-none pointer-events-none"
        style={{ borderRadius: 0 }}
      >
        {!imgError ? (
          <>
            {card.mobile_image_url && card.desktop_image_url && card.mobile_image_url !== card.desktop_image_url ? (
              <>
                <Image
                  src={normalizeImageUrl(card.mobile_image_url)}
                  alt={card.image_alt || card.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 0px"
                  className="sm:hidden object-cover block p-0 m-0 rounded-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.018] motion-reduce:transform-none"
                  style={{ objectPosition: focalPosition, borderRadius: 0 }}
                  onError={() => setImgError(true)}
                />
                <Image
                  src={normalizeImageUrl(card.desktop_image_url)}
                  alt={card.image_alt || card.title}
                  fill
                  sizes="(max-width: 640px) 0px, 50vw"
                  className="hidden sm:block object-cover p-0 m-0 rounded-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.018] motion-reduce:transform-none"
                  style={{ objectPosition: focalPosition, borderRadius: 0 }}
                  onError={() => setImgError(true)}
                />
              </>
            ) : (
              <Image
                src={imageSource}
                alt={card.image_alt || card.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover block p-0 m-0 rounded-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.018] motion-reduce:transform-none"
                style={{ objectPosition: focalPosition, borderRadius: 0 }}
                onError={() => setImgError(true)}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-400 font-mono text-xs rounded-none">
            Street Mobile Collection
          </div>
        )}
      </div>

      {/* ── 2. Subtle Readability Directional Overlay (10-18% fade) ── */}
      {overlayEnabled && clampedStrength > 0 && (
        <div
          className="absolute inset-0 z-5 pointer-events-none rounded-none"
          style={{ background: overlayGradient, borderRadius: 0 }}
          aria-hidden="true"
        />
      )}

      {/* ── 3. Editorial Typography Overlay on clean negative space ── */}
      <div
        className={`absolute inset-0 z-10 p-6 sm:p-7 lg:p-8 flex flex-col ${contentJustifyClass} pointer-events-none rounded-none`}
        style={{ borderRadius: 0 }}
      >
        <div className={`flex flex-col ${textAlignItemsClass} max-w-[520px] mx-auto pointer-events-auto`}>
          {/* Subtle Eyebrow Badge (10px, 600 weight, 0.08em tracking) */}
          {card.eyebrow && (
            <span
              className={`text-[10px] font-semibold tracking-[0.08em] uppercase mb-1 inline-block ${eyebrowColor}`}
            >
              {card.eyebrow}
            </span>
          )}

          {/* Editorial Title: clamp(28px, 2.2vw, 44px), 600 weight, -0.04em tracking, 1.05 line-height */}
          <h3
            className={`text-[clamp(28px,2.2vw,44px)] font-semibold tracking-[-0.04em] leading-[1.05] line-clamp-2 ${textColor}`}
          >
            {card.title}
          </h3>

          {/* Editorial Subtitle: 15–17px, 400 weight, 1.4 line-height */}
          {card.subtitle && (
            <p
              className={`text-[15px] sm:text-[16px] font-normal leading-[1.4] mt-2 max-w-[420px] line-clamp-2 ${subtitleColor}`}
            >
              {card.subtitle}
            </p>
          )}

          {/* Refined CTA System: [ Shop ]   Learn more › */}
          <div className="flex items-center justify-center gap-[18px] mt-4 sm:mt-5 shrink-0">
            {/* Primary CTA (Compact filled button, 38-42px height, 18-22px padding, rounded-full) */}
            <Link
              href={primaryUrl}
              target={card.open_in_new_tab && (primaryUrl.startsWith("http://") || primaryUrl.startsWith("https://")) ? "_blank" : undefined}
              rel={card.open_in_new_tab ? "noopener noreferrer" : undefined}
              onClick={(e) => e.stopPropagation()}
              className={`h-[40px] px-5 rounded-full text-[14px] font-medium transition-all duration-200 active:scale-95 inline-flex items-center justify-center shadow-xs ${primaryBtnClass}`}
            >
              <span>{card.primary_cta_text || "Shop"}</span>
            </Link>

            {/* Secondary CTA (Clean text link with chevron right) */}
            {card.secondary_cta_text !== "" && (
              <Link
                href={secondaryUrl}
                target={card.open_in_new_tab && (secondaryUrl.startsWith("http://") || secondaryUrl.startsWith("https://")) ? "_blank" : undefined}
                rel={card.open_in_new_tab ? "noopener noreferrer" : undefined}
                onClick={(e) => e.stopPropagation()}
                className={`text-[14px] font-medium inline-flex items-center gap-1 transition-opacity duration-200 group/cta ${secondaryLinkClass}`}
              >
                <span>{card.secondary_cta_text || "Learn more"}</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-[3px]" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedCollections({ settings }: FeaturedCollectionsProps) {
  const [liveSettings, setLiveSettings] = useState<FeaturedCollectionsSettings>(
    settings || DEFAULT_FEATURED_COLLECTIONS
  );

  useEffect(() => {
    if (settings) {
      setLiveSettings(settings);
    } else {
      getFeaturedCollections().then((data) => {
        if (data && data.cards && data.cards.length > 0) {
          setLiveSettings(data);
        }
      }).catch(() => {});
    }
  }, [settings]);

  // Filter active and non-expired cards
  const activeCards = useMemo(() => {
    const cardsList = liveSettings?.cards && liveSettings.cards.length > 0
      ? liveSettings.cards
      : DEFAULT_FEATURED_COLLECTIONS.cards;
    
    const now = new Date().getTime();

    return cardsList
      .filter((card) => card.active !== false)
      .filter((card) => {
        if (card.start_date) {
          const startTime = new Date(card.start_date).getTime();
          if (!isNaN(startTime) && startTime > now) return false;
        }
        if (card.expiry_date) {
          const expiryTime = new Date(card.expiry_date).getTime();
          if (!isNaN(expiryTime) && expiryTime < now) return false;
        }
        return true;
      })
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [liveSettings]);

  // If explicitly disabled or no active cards, don't render (unconditional hook execution preserved)
  if (liveSettings && liveSettings.enabled === false) {
    return null;
  }

  if (activeCards.length === 0) {
    return null;
  }

  // Show 4 cards in the strict 2x2 grid
  const displayCards = activeCards.slice(0, 4);

  const firstCard = displayCards[0];
  const lifestyleImage =
    firstCard?.mobile_image_url ||
    firstCard?.desktop_image_url ||
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800";

  return (
    <>
      {/* ── Mobile Layout (< 768px): Standardized 16:9 Lifestyle Banner ── */}
      <div className="md:hidden w-full bg-white px-3 sm:px-4 py-2.5 select-none">
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-xs text-white border border-neutral-800/20 p-3.5 sm:p-5 flex flex-col justify-between">
          {/* Full-Frame Edge-to-Edge Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src={lifestyleImage}
              alt={firstCard?.title || "Featured Collection"}
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Subtle dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 via-60% to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
          </div>

          {/* Left Text & CTA Content Overlay */}
          <div className="relative z-20 max-w-[68%] sm:max-w-[62%] flex flex-col justify-center my-auto">
            {firstCard?.eyebrow && (
              <span className="inline-block self-start px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white mb-1 shadow-xs shrink-0">
                {firstCard.eyebrow}
              </span>
            )}
            <h3 className="text-[16px] sm:text-[19px] font-black text-white leading-tight tracking-tight mb-1 drop-shadow-md">
              {firstCard?.title || "Welcome to Street Mobile!"}
            </h3>
            <p className="text-white/80 text-[10px] sm:text-[11px] leading-snug line-clamp-2 mb-2.5 font-medium drop-shadow-xs">
              {firstCard?.subtitle || "Your trusted destination for the latest tech."}
            </p>
            <div>
              <Link
                href={resolveDestinationUrl(firstCard || ({} as any))}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-neutral-100 text-black font-bold text-[11px] sm:text-xs rounded-full shadow-xs transition-transform active:scale-95 cursor-pointer self-start shrink-0"
              >
                <span>{firstCard?.primary_cta_text || "Explore Collection"}</span>
                <ChevronRight className="w-3 h-3 text-black" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden md:block">
        <ScrollReveal
          as="section"
          id="featured-collections"
          stagger={0.07}
          yOffset={20}
          className="w-full bg-white flex flex-col justify-start overflow-hidden rounded-none font-sans"
        >
          {/* ── Compact Editorial Section Header ── */}
          <div data-reveal-item className="w-full text-center pt-10 pb-5 sm:pt-12 sm:pb-6 px-4 shrink-0">
            <h2 className="text-[clamp(28px,2.4vw,42px)] font-semibold text-[#090909] tracking-[-0.035em] leading-tight">
              {liveSettings.title || "Featured Collections"}
            </h2>
            <p className="text-[14px] sm:text-[16px] font-normal text-neutral-500 max-w-xl mx-auto leading-normal mt-1.5">
              {liveSettings.subtitle || "Discover technology selected for the way you live, work and connect."}
            </p>
          </div>

          {/* ── Desktop Full-Width 2×2 Grid (All 4 visible in 1 screen, 8px gap, square edges) ── */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 lg:grid-rows-2 gap-2 px-2 pb-2 lg:h-[calc(100svh-var(--navbar-height,68px)-110px)] lg:min-h-[580px] lg:max-h-[820px]">
            {displayCards.map((card, index) => (
              <div key={card.id || index} data-reveal-item className="w-full h-full">
                <CollectionCard card={card} index={index} />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </>
  );
}
