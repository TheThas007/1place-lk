"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Package,
  FolderOpen,
  FolderTree,
  Tag,
  LayoutGrid,
  Sparkles,
  Flame,
  ShoppingBag,
  Wrench,
  DollarSign,
  ShieldCheck,
  Users,
  Images,
  ImageIcon,
  Globe,
  HardDrive,
  CreditCard,
  Star,
  BarChart3,
  Bot,
  Smartphone,
  Settings,
  Clock,
  Plus,
  ArrowRight,
  X,
  Command,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddProduct?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: any;
  href?: string;
  action?: () => void;
  shortcut?: string;
}

export default function CommandPalette({ isOpen, onClose, onOpenAddProduct }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = useMemo(() => [
    // Quick Actions
    {
      id: "act-add-product",
      title: "Add New Product",
      category: "Quick Actions",
      icon: Plus,
      action: () => {
        onClose();
        if (onOpenAddProduct) {
          onOpenAddProduct();
        } else {
          window.dispatchEvent(new CustomEvent("open-add-product-modal"));
        }
      },
      shortcut: "P",
    },
    {
      id: "act-today-deal",
      title: "Configure Today's Deal",
      category: "Quick Actions",
      icon: Flame,
      href: "/admin/dashboard?tab=today-deal",
    },
    {
      id: "act-update-stock",
      title: "Audit Inventory & Stock",
      category: "Quick Actions",
      icon: HardDrive,
      href: "/admin/dashboard?tab=inventory",
    },
    {
      id: "act-book-repair",
      title: "Book Device Repair Ticket",
      category: "Quick Actions",
      icon: Wrench,
      href: "/admin/dashboard?tab=repairs",
    },
    {
      id: "act-add-cashflow",
      title: "Log Cash Flow Transaction",
      category: "Quick Actions",
      icon: DollarSign,
      href: "/admin/dashboard?tab=cashflow",
    },

    // Navigation Pages
    { id: "nav-overview", title: "Overview Dashboard", category: "Navigation", icon: LayoutDashboard, href: "/admin/dashboard?tab=overview" },
    { id: "nav-products", title: "Product Catalog", category: "Navigation", icon: Package, href: "/admin/dashboard?tab=products" },
    { id: "nav-orders", title: "Orders Management", category: "Navigation", icon: ShoppingBag, href: "/admin/dashboard?tab=orders" },
    { id: "nav-categories", title: "Shop Categories", category: "Navigation", icon: FolderOpen, href: "/admin/dashboard?tab=categories" },
    { id: "nav-mega-menu", title: "Category Mega Menu", category: "Navigation", icon: FolderTree, href: "/admin/dashboard?tab=mega-menu" },
    { id: "nav-brands", title: "Shop by Brand", category: "Navigation", icon: Tag, href: "/admin/dashboard?tab=brands" },
    { id: "nav-collections", title: "Featured Collections", category: "Navigation", icon: LayoutGrid, href: "/admin/dashboard?tab=collections" },
    { id: "nav-showcase", title: "Visual Showcase", category: "Navigation", icon: Sparkles, href: "/admin/dashboard?tab=showcase" },
    { id: "nav-today-deal", title: "Today's Deal Flash Sale", category: "Navigation", icon: Flame, href: "/admin/dashboard?tab=today-deal" },
    { id: "nav-coupons", title: "Promo Codes & Coupons", category: "Navigation", icon: Tag, href: "/admin/dashboard?tab=coupons" },
    { id: "nav-payments", title: "Payments & Gateway Settings", category: "Navigation", icon: CreditCard, href: "/admin/dashboard?tab=payments" },
    { id: "nav-analytics", title: "Analytics & Reports", category: "Navigation", icon: BarChart3, href: "/admin/dashboard?tab=analytics" },
    { id: "nav-inventory", title: "Warehouse Inventory Levels", category: "Navigation", icon: HardDrive, href: "/admin/dashboard?tab=inventory" },
    { id: "nav-repairs", title: "Mobile Device Repairs", category: "Navigation", icon: Wrench, href: "/admin/dashboard?tab=repairs" },
    { id: "nav-cashflow", title: "Cash Flow & Daily Accounts", category: "Navigation", icon: DollarSign, href: "/admin/dashboard?tab=cashflow" },
    { id: "nav-warranties", title: "Warranty Claims & Serials", category: "Navigation", icon: ShieldCheck, href: "/admin/dashboard?tab=warranties" },
    { id: "nav-users", title: "Customers Directory", category: "Navigation", icon: Users, href: "/admin/dashboard?tab=users" },
    { id: "nav-gallery", title: "Store Gallery Wall", category: "Navigation", icon: Images, href: "/admin/dashboard?tab=gallery" },
    { id: "nav-hero", title: "Homepage Hero Slider", category: "Navigation", icon: Sparkles, href: "/admin/dashboard?tab=hero" },
    { id: "nav-banners", title: "Offers & Promotional Banners", category: "Navigation", icon: ImageIcon, href: "/admin/dashboard?tab=banners" },
    { id: "nav-reviews", title: "Google Customer Reviews", category: "Navigation", icon: Star, href: "/admin/dashboard?tab=reviews" },
    { id: "nav-footer", title: "Footer & Legal Configuration", category: "Navigation", icon: Globe, href: "/admin/dashboard?tab=footer" },
    { id: "nav-assistant", title: "Streetla AI Assistant", category: "Navigation", icon: Bot, href: "/admin/dashboard?tab=assistant" },
    { id: "nav-mobile", title: "Mobile Experience Settings", category: "Navigation", icon: Smartphone, href: "/admin/dashboard?tab=mobile" },
    { id: "nav-settings", title: "Store & Auth Credentials", category: "Navigation", icon: Settings, href: "/admin/dashboard?tab=settings" },
    { id: "nav-contact", title: "Contact Details & Store Hours", category: "Navigation", icon: Clock, href: "/admin/dashboard?tab=contact-settings" },
  ], [onClose, onOpenAddProduct]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = (item: CommandItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to page..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-white rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No matching pages or actions found for "{query}".
            </div>
          ) : (
            filteredCommands.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => executeCommand(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-white/5 text-slate-400 border border-white/5"
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2 bg-[#090D14]/80 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">↑</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">↵</kbd> to select
            </span>
          </div>
          <span className="flex items-center gap-1 font-medium">
            <Command className="w-3 h-3" /> Quick Switcher
          </span>
        </div>
      </div>
    </div>
  );
}
