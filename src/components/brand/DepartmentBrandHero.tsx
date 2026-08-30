"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DepartmentBrandPageConfig, Brand, Department } from "@/lib/types";
import { BRAND_DEFAULT_CAMPAIGN_BANNERS } from "@/lib/data";

interface DepartmentBrandHeroProps {
  config: DepartmentBrandPageConfig;
  brand: Brand;
  department: Department;
}

export default function DepartmentBrandHero({
  config,
  brand,
  department,
}: DepartmentBrandHeroProps) {
  const [imgError, setImgError] = useState(false);

  // If banner is explicitly disabled in admin, hide completely
  if (config.bannerEnabled === false) {
    return null;
  }

  const brandSlug = (brand.slug || "").toLowerCase();
  const deptSlug = (department.slug || "").toLowerCase();

  // Fallback priority:
  // 1. Department-specific banner
  // 2. Default brand banner
  // 3. Brand category fallbacks
  const fallbackCampaignBanner =
    BRAND_DEFAULT_CAMPAIGN_BANNERS[brandSlug]?.[deptSlug] ||
    BRAND_DEFAULT_CAMPAIGN_BANNERS[brandSlug]?.default ||
    BRAND_DEFAULT_CAMPAIGN_BANNERS[brandSlug]?.accessories ||
    BRAND_DEFAULT_CAMPAIGN_BANNERS[brandSlug]?.phones ||
    "";

  // 1. Resolve Desktop Banner
  const rawDesktop = config.desktop?.imageUrl || config.desktopBannerUrl || "";
  const resolvedDesktopBanner = rawDesktop.trim() ? rawDesktop.trim() : fallbackCampaignBanner;

  // 2. Resolve Tablet Banner (Check toggle useDesktopForTablet)
  const rawTablet = config.tablet?.imageUrl || config.tabletBannerUrl || "";
  const resolvedTabletBanner =
    config.useDesktopForTablet !== false && !rawTablet.trim()
      ? resolvedDesktopBanner
      : rawTablet.trim() || resolvedDesktopBanner;

  // 3. Resolve Mobile Banner (Check toggles useDesktopForMobile / useTabletForMobile)
  const rawMobile = config.mobile?.imageUrl || config.mobileBannerUrl || "";
  let resolvedMobileBanner = rawMobile.trim();
  if (!resolvedMobileBanner) {
    if (config.useTabletForMobile && resolvedTabletBanner) {
      resolvedMobileBanner = resolvedTabletBanner;
    } else {
      resolvedMobileBanner = resolvedDesktopBanner;
    }
  }

  // If no banner is available or image failed, hide banner section with 0 empty space
  if (!resolvedDesktopBanner || imgError) {
    return null;
  }

  const isDecorative = Boolean(config.decorative);
  const altText = isDecorative
    ? ""
    : config.bannerAlt ||
    `${brand.name} ${department.name} Official Promotional Banner`;

  const desktopFocal = config.desktop?.focalPosition || config.desktopFocalPosition || "center";
  const tabletFocal = config.tablet?.focalPosition || config.tabletFocalPosition || desktopFocal;
  const mobileFocal = config.mobile?.focalPosition || config.mobileFocalPosition || "center";

  // Optional Link Destination
  let destinationUrl = "";
  if (config.linkEnabled) {
    if (config.destinationType === "custom" && config.destinationUrl) {
      destinationUrl = config.destinationUrl;
    } else if (config.destinationType === "category" && config.destinationId) {
      destinationUrl = `/shop-by-brand/${department.slug}/${brand.slug}?category=${config.destinationId}`;
    } else if (config.destinationType === "product" && config.destinationId) {
      destinationUrl = `/products/${config.destinationId}`;
    } else if (config.destinationUrl) {
      destinationUrl = config.destinationUrl;
    }
  }

  const isExternalLink =
    destinationUrl.startsWith("http://") || destinationUrl.startsWith("https://");

  const ariaLabel =
    config.linkAriaLabel ||
    `Shop ${brand.name} ${department.name} collection`;

  const ratio = config.bannerSizeRatio || (config as any).banner_size_ratio || "860x270";
  const frameBg = config.bannerBackgroundColor || "#F4F5F7";
  const isBlurEnabled = config.bannerBlurEnabled !== false;
  const blurStrength =
    config.bannerBlurStrength === "ultra"
      ? "70px"
      : config.bannerBlurStrength === "high"
      ? "45px"
      : config.bannerBlurStrength === "low"
      ? "16px"
      : config.bannerBlurStrength === "none"
      ? "0px"
      : "30px";

  const blendMode = config.bannerBlendMode || "normal";

  const bannerContent = (
    <div
      className="relative w-full overflow-hidden select-none rounded-none border-0 sm:border sm:border-neutral-200/80 shadow-none sm:shadow-2xs flex items-center justify-center p-0 m-0 transition-all bg-white aspect-[1440/360] max-h-[360px]"
      style={{
        backgroundColor: frameBg || "#FFFFFF",
        borderRadius: 0,
        aspectRatio: "1440 / 360",
        maxHeight: "360px",
      }}
    >
      <picture className="w-full h-full block">
        {resolvedMobileBanner && (
          <source
            media="(max-width: 767px)"
            srcSet={resolvedMobileBanner}
          />
        )}
        {resolvedTabletBanner && (
          <source
            media="(max-width: 1023px)"
            srcSet={resolvedTabletBanner}
          />
        )}
        <img
          src={resolvedDesktopBanner}
          alt={altText}
          aria-hidden={isDecorative ? "true" : undefined}
          loading="eager"
          decoding="async"
          width={1440}
          height={360}
          onError={() => setImgError(true)}
          style={{
            borderRadius: 0,
          }}
          className="w-full h-full object-cover rounded-none block"
        />
      </picture>
    </div>
  );

  return (
    <section aria-label={`${brand.name} ${department.name} Banner`} className="relative w-full overflow-hidden p-0 m-0 border-none rounded-none mb-4 sm:mb-6">
      {destinationUrl ? (
        isExternalLink ? (
          <a
            href={destinationUrl}
            target={config.openInNewTab ? "_blank" : "_self"}
            rel={config.openInNewTab ? "noopener noreferrer" : undefined}
            aria-label={ariaLabel}
            className="block focus:outline-none rounded-none overflow-hidden group w-full"
          >
            {bannerContent}
          </a>
        ) : (
          <Link
            href={destinationUrl}
            target={config.openInNewTab ? "_blank" : "_self"}
            aria-label={ariaLabel}
            className="block focus:outline-none rounded-none overflow-hidden group w-full"
          >
            {bannerContent}
          </Link>
        )
      ) : (
        bannerContent
      )}
    </section>
  );
}
