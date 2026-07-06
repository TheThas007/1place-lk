"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Search, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/categories", icon: Grid3X3, label: "Categories" },
  { href: "/products", icon: Search, label: "Search" },
  { href: "/products?featured=true", icon: ShoppingBag, label: "Shop" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass border-t border-border safe-bottom">
      <div className="grid grid-cols-4 items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
                isActive ? "text-foreground" : "text-muted"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-all",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={cn(isActive && "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
