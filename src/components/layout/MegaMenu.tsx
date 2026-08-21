"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Category, MegaMenuSettings, Subcategory, MegaMenuExploreLink } from "@/lib/types";
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
}

export default function MegaMenu({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
  categories,
  initialSettings,
}: MegaMenuProps) {
  const [settings, setSettings] = useState<MegaMenuSettings>(
    initialSettings || DEFAULT_MEGA_MENU_SETTINGS
  );

  // Real-time Firestore Listener for Mega Menu Settings
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, "settings", "mega_menu"), (snap) => {
        if (snap.exists()) {
          const data = snap.data() as MegaMenuSettings;
          setSettings((prev) => ({
            ...prev,
            ...data,
            explore_links: data.explore_links || prev.explore_links,
          }));
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Realtime mega menu sync unavailable:", e);
    }
  }, []);

  // Filter Active Main Categories for Column 1
  const column1Categories = useMemo(() => {
    const activeCats = categories.filter((c) => {
      if (c.status === "inactive") return false;
      if (c.show_in_menu === false) return false;
      if (c.parent_id) return false; // Filter out subcategories
      return true;
    });

    if (settings.selected_category_ids && settings.selected_category_ids.length > 0) {
      const filtered = activeCats.filter((c) => settings.selected_category_ids!.includes(c.id));
      if (filtered.length > 0) return filtered;
    }

    return activeCats.slice(0, 10);
  }, [categories, settings.selected_category_ids]);

  // Derive Subcategories for Column 2
  const column2Subcategories = useMemo(() => {
    // Collect from category subcategories field or children
    const subList: { name: string; url: string; id: string }[] = [];

    categories.forEach((cat) => {
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories.forEach((sub) => {
          if (sub.status !== "inactive") {
            subList.push({
              id: sub.id,
              name: sub.name,
              url: sub.destination_url || `/products?category=${cat.slug}&subcategory=${sub.slug}`,
            });
          }
        });
      }
    });

    // If no custom subcategories exist in DB, dynamically create popular filter pairings
    if (subList.length === 0) {
      return [
        { id: "sub-iphone", name: "iPhones & Apple Care", url: "/products?category=smartphones&brand=apple" },
        { id: "sub-galaxy", name: "Samsung Galaxy Flagships", url: "/products?category=smartphones&brand=samsung" },
        { id: "sub-fast-charge", name: "20W & 35W Fast Adapters", url: "/products?category=chargers-adapters" },
        { id: "sub-buds", name: "AirPods & Wireless Earbuds", url: "/products?category=earbuds" },
        { id: "sub-watches", name: "Apple Watch & Galaxy Watch", url: "/products?category=smart-watches" },
        { id: "sub-cables", name: "Braided Fast Charging Cables", url: "/products?category=charging-cables" },
        { id: "sub-magsafe", name: "MagSafe Battery Packs", url: "/products?category=power-banks" },
        { id: "sub-cases", name: "Protective Cases & Display Guards", url: "/products?category=phone-cases" },
      ];
    }

    if (settings.selected_subcategory_ids && settings.selected_subcategory_ids.length > 0) {
      const filtered = subList.filter((s) => settings.selected_subcategory_ids!.includes(s.id));
      if (filtered.length > 0) return filtered;
    }

    return subList.slice(0, 10);
  }, [categories, settings.selected_subcategory_ids]);

  // Column 3 Supporting Explore Links
  const column3Links = useMemo(() => {
    const links = (settings.explore_links || DEFAULT_MEGA_MENU_SETTINGS.explore_links).filter(
      (l) => l.status !== "inactive"
    );
    return links.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [settings.explore_links]);

  if (!settings.enabled) return null;

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
            className="fixed left-0 right-0 top-[var(--navbar-height,72px)] w-full bg-[#FFFFFF] border-b border-[#E5E5E7] shadow-[0_24px_60px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
          >
            {/* Centered Content Container */}
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 lg:py-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
                
                {/* ── COLUMN 1: SHOP BY CATEGORY (Large Bold Typography) ── */}
                <div className="md:col-span-5 lg:col-span-5 flex flex-col space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] mb-3 block select-none">
                    {settings.column1_heading || "Shop by Category"}
                  </span>

                  {/* Primary Link: Shop All Products */}
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold text-[#090909] hover:text-[#6E6E73] transition-colors duration-150 leading-tight block py-1"
                  >
                    Shop All Products
                  </Link>

                  {/* Main Category List */}
                  {column1Categories.map((cat) => (
                    <Link
                      key={`mega-col1-${cat.id}`}
                      href={cat.destination_url || `/products?category=${cat.slug}`}
                      onClick={onClose}
                      className="text-[20px] sm:text-[22px] lg:text-[24px] font-bold text-[#090909] hover:text-[#6E6E73] transition-colors duration-150 leading-tight block py-1"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>

                {/* ── COLUMN 2: POPULAR SUBCATEGORIES (Refined Clean Text) ── */}
                <div className="md:col-span-4 lg:col-span-4 flex flex-col space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] mb-3 block select-none">
                    {settings.column2_heading || "Popular Subcategories"}
                  </span>

                  {column2Subcategories.map((sub) => (
                    <Link
                      key={`mega-col2-${sub.id}`}
                      href={sub.url}
                      onClick={onClose}
                      className="text-[14px] sm:text-[15px] font-medium text-[#090909] hover:text-[#6E6E73] transition-colors duration-150 block py-1.5 leading-snug"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>

                {/* ── COLUMN 3: MORE TO EXPLORE (Supporting Direct Links) ── */}
                <div className="md:col-span-3 lg:col-span-3 flex flex-col space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] mb-3 block select-none">
                    {settings.column3_heading || "More to Explore"}
                  </span>

                  {column3Links.map((link) => (
                    <Link
                      key={`mega-col3-${link.id}`}
                      href={link.url}
                      onClick={onClose}
                      className={`text-[14px] sm:text-[15px] font-medium transition-colors duration-150 block py-1.5 leading-snug ${
                        link.is_highlighted
                          ? "text-[#090909] font-semibold hover:text-[#6E6E73]"
                          : "text-[#090909] hover:text-[#6E6E73]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
