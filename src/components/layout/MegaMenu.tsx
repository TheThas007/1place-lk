"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Category, MegaMenuSettings, MegaMenuColumn, MegaMenuItem } from "@/lib/types";
import { DEFAULT_MEGA_MENU_SETTINGS } from "@/lib/data";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  categories: Category[];
  initialSettings?: MegaMenuSettings;
  isPreview?: boolean;
}

export default function MegaMenu({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
  categories,
  initialSettings,
  isPreview = false,
}: MegaMenuProps) {
  const [settings, setSettings] = useState<MegaMenuSettings>(() => {
    return {
      ...DEFAULT_MEGA_MENU_SETTINGS,
      ...(initialSettings || {}),
      columns:
        initialSettings?.columns && initialSettings.columns.length > 0
          ? initialSettings.columns
          : DEFAULT_MEGA_MENU_SETTINGS.columns,
    };
  });

  // Keep state synced with parent props (useful for admin live preview)
  useEffect(() => {
    if (initialSettings) {
      setSettings((prev) => ({
        ...prev,
        ...initialSettings,
        columns:
          initialSettings.columns && initialSettings.columns.length > 0
            ? initialSettings.columns
            : prev.columns,
      }));
    }
  }, [initialSettings]);

  // Real-time Firestore Listener for Mega Menu Settings (Live Storefront only)
  useEffect(() => {
    if (isPreview) return;
    try {
      const unsub = onSnapshot(doc(db, "settings", "mega_menu"), (snap) => {
        if (snap.exists()) {
          const data = snap.data() as MegaMenuSettings;
          setSettings((prev) => ({
            ...prev,
            ...data,
            columns: data.columns && data.columns.length > 0 ? data.columns : prev.columns,
          }));
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Realtime mega menu sync unavailable:", e);
    }
  }, [isPreview]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isPreview) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, isPreview]);

  // Normalize and resolve items for each column based on sourceMode
  const resolvedColumns = useMemo(() => {
    const activeColumns = (settings.columns || DEFAULT_MEGA_MENU_SETTINGS.columns)
      .filter((c) => c.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return activeColumns.map((col) => {
      let resolvedItems: MegaMenuItem[] = [];

      // 1. Dynamic extraction from Categories
      if (col.sourceMode === "dynamic" || col.sourceMode === "mixed") {
        if (col.dynamicSource === "categories" || !col.dynamicSource) {
          // Normalize and filter categories (case-insensitive deduplication)
          const seenNames = new Set<string>();
          const dynamicList: MegaMenuItem[] = [];

          // Add Shop All as first item if Column 1 / categories
          if (col.id === "col-categories" || col.order === 1) {
            dynamicList.push({
              id: "dyn-all-products",
              enabled: true,
              label: "Shop All Products",
              destinationType: "custom",
              href: "/products",
              bold: true,
              featured: true,
              order: 0,
            });
          }

          categories.forEach((cat, idx) => {
            if (cat.status === "inactive" || cat.show_in_menu === false || cat.parent_id) return;
            const normName = cat.name.trim().toLowerCase();
            if (seenNames.has(normName)) return;
            seenNames.add(normName);

            // Check inclusions / exclusions if configured
            if (col.includedIds && col.includedIds.length > 0 && !col.includedIds.includes(cat.id)) return;
            if (col.excludedIds && col.excludedIds.length > 0 && col.excludedIds.includes(cat.id)) return;

            dynamicList.push({
              id: cat.id || `cat-${idx}`,
              enabled: true,
              label: cat.name,
              destinationType: "category",
              destinationId: cat.id,
              href: cat.destination_url || `/products?category=${cat.slug || cat.id}`,
              bold: col.id === "col-categories" || col.order === 1,
              order: idx + 1,
            });
          });

          // Sort dynamic items
          if (col.sortBy === "name-asc") {
            dynamicList.sort((a, b) => a.label.localeCompare(b.label));
          } else if (col.sortBy === "name-desc") {
            dynamicList.sort((a, b) => b.label.localeCompare(a.label));
          }

          resolvedItems = dynamicList;
        }
      }

      // 2. Custom Manual Items
      if (col.sourceMode === "manual") {
        resolvedItems = (col.items || []).filter((i) => i.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
      } else if (col.sourceMode === "mixed") {
        const manualItems = (col.items || []).filter((i) => i.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
        resolvedItems = [...resolvedItems, ...manualItems];
      }

      // Apply maximumItems limit
      const maxLimit = col.maximumItems && col.maximumItems > 0 ? col.maximumItems : 24;
      const slicedItems = resolvedItems.slice(0, maxLimit);

      return {
        ...col,
        resolvedItems: slicedItems,
      };
    });
  }, [categories, settings.columns]);

  if (!settings.enabled && !isPreview) return null;

  // Visual layout & appearance tokens
  const bgColor = settings.backgroundColor || "#FFFFFF";
  const headingColor = settings.headingColor || "#71717A";
  const primaryTextColor = settings.primaryTextColor || "#090909";
  const secondaryTextColor = settings.secondaryTextColor || "#27272A";
  const hoverTextColor = settings.hoverTextColor || "#ED0712";
  const borderColor = settings.borderColor || "#E5E5E7";
  const colCount = Math.max(1, Math.min(4, resolvedColumns.length));

  // Determine grid column distribution (12-column golden proportion)
  const getGridColsClass = () => {
    if (colCount === 2) return "md:grid-cols-2";
    if (colCount === 3) return "md:grid-cols-12";
    if (colCount === 4) return "md:grid-cols-4";
    return "md:grid-cols-12";
  };

  const getColSpanClass = (col: MegaMenuColumn, index: number) => {
    if (colCount === 3) {
      if (index === 0) return "md:col-span-6 lg:col-span-6";
      if (index === 1) return "md:col-span-3 lg:col-span-3";
      return "md:col-span-3 lg:col-span-3";
    }
    return "w-full";
  };

  const contentJSX = (
    <div
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        maxHeight: isPreview ? "auto" : "calc(88vh - var(--navbar-height, 72px))",
      }}
      className="w-full border-b shadow-[0_24px_60px_rgba(0,0,0,0.12)] overflow-y-auto custom-scrollbar select-none"
    >
      {/* Centered Content Container */}
      <div
        className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-9"
        style={{
          paddingLeft: `${settings.horizontalPadding ?? 48}px`,
          paddingRight: `${settings.horizontalPadding ?? 48}px`,
          paddingTop: `${Math.min(32, settings.verticalPadding ?? 32)}px`,
          paddingBottom: `${Math.max(36, settings.verticalPadding ?? 36)}px`,
        }}
      >
        <div
          className={`grid grid-cols-1 ${getGridColsClass()} gap-8 lg:gap-10 items-start`}
          style={{ gap: `${settings.columnGap ?? 40}px` }}
        >
          {resolvedColumns.map((col, colIdx) => {
            const isFirstCol = colIdx === 0;
            const useTwoSubCols = isFirstCol && col.resolvedItems.length > 6;

            return (
              <div
                key={col.id || `col-${colIdx}`}
                className={`${getColSpanClass(col, colIdx)} flex flex-col space-y-1`}
              >
                {/* Column Section Heading */}
                {col.heading && (
                  <span
                    style={{ color: col.headingColor || headingColor }}
                    className="text-[11px] font-bold uppercase tracking-wider mb-2.5 block select-none"
                  >
                    {col.heading}
                  </span>
                )}

                {/* Column Items: Auto multi-column grid when many categories exist */}
                <div
                  className={
                    useTwoSubCols
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-1 items-start"
                      : "flex flex-col space-y-1"
                  }
                >
                  {col.resolvedItems.map((item, itemIdx) => {
                    const isBold = item.bold ?? isFirstCol;
                    let targetHref = item.href?.trim() || "";
                    if (!targetHref || targetHref === "#") {
                      if (item.destinationType === "category" && item.destinationId) {
                        targetHref = `/products?category=${encodeURIComponent(item.destinationId)}`;
                      } else if (item.destinationType === "brand" && item.destinationId) {
                        targetHref = `/products?brand=${encodeURIComponent(item.destinationId)}`;
                      } else if (item.destinationType === "product" && item.destinationId) {
                        targetHref = `/products/${encodeURIComponent(item.destinationId)}`;
                      } else if (item.label) {
                        const s = item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                        targetHref = `/products?category=${encodeURIComponent(s)}`;
                      } else {
                        targetHref = "/products";
                      }
                    }
                    const isExternal = targetHref.startsWith("http");

                    const itemClass = `group relative inline-flex items-center justify-between gap-2.5 py-0.5 transition-all duration-150 rounded-lg outline-none ${
                      isBold
                        ? "text-[16px] sm:text-[18px] lg:text-[19px] font-extrabold tracking-tight leading-snug"
                        : "text-xs sm:text-[13px] font-semibold leading-normal py-0.5"
                    }`;

                    const itemStyle: React.CSSProperties = {
                      color: item.textColor || (isBold ? primaryTextColor : secondaryTextColor),
                    };

                    const hoverEffectHandler = (e: React.MouseEvent<HTMLElement>) => {
                      (e.currentTarget as HTMLElement).style.color = hoverTextColor;
                    };
                    const leaveEffectHandler = (e: React.MouseEvent<HTMLElement>) => {
                      (e.currentTarget as HTMLElement).style.color =
                        item.textColor || (isBold ? primaryTextColor : secondaryTextColor);
                    };

                    const badgeJSX = item.badgeEnabled && item.badgeLabel && (
                      <span
                        style={{ backgroundColor: item.badgeBackgroundColor || "#ED0712" }}
                        className="px-1.5 py-0.2 text-[8.5px] font-black text-white rounded-full uppercase tracking-wider shrink-0 shadow-xs"
                      >
                        {item.badgeLabel}
                      </span>
                    );

                    const iconJSX = item.iconUrl && (
                      <img
                        src={item.iconUrl}
                        alt=""
                        className="w-3.5 h-3.5 object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    );

                    return isExternal ? (
                      <a
                        key={item.id || `item-${colIdx}-${itemIdx}`}
                        href={targetHref}
                        target={item.openInNewTab ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        onClick={onClose}
                        onMouseEnter={hoverEffectHandler}
                        onMouseLeave={leaveEffectHandler}
                        style={itemStyle}
                        className={itemClass}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {iconJSX}
                          <span className="truncate">{item.label}</span>
                        </div>
                        {badgeJSX}
                      </a>
                    ) : (
                      <Link
                        key={item.id || `item-${colIdx}-${itemIdx}`}
                        href={targetHref}
                        target={item.openInNewTab ? "_blank" : undefined}
                        onClick={onClose}
                        onMouseEnter={hoverEffectHandler}
                        onMouseLeave={leaveEffectHandler}
                        style={itemStyle}
                        className={itemClass}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {iconJSX}
                          <span className="truncate">{item.label}</span>
                        </div>
                        {badgeJSX}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // If used for Admin Live Preview, render inline without fixed modal positioning
  if (isPreview) {
    return <div className="w-full">{contentJSX}</div>;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Soft Dark Backdrop Dim (Locks background interaction, high legibility) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 top-[var(--navbar-height,72px)] bg-black/35 backdrop-blur-[2px] z-40"
            aria-hidden="true"
          />

          {/* ── Full-Width Mega Menu Dropdown ── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="fixed left-0 right-0 top-[var(--navbar-height,72px)] w-full z-50 overflow-hidden font-outfit"
          >
            {contentJSX}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
