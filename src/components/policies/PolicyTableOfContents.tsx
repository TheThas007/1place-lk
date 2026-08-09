"use client";

import React, { useEffect, useState } from "react";
import { List } from "lucide-react";

export interface TocItem {
  id: string;
  title: string;
}

export default function PolicyTableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(items[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(items[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const targetEl = document.getElementById(id);
    if (targetEl) {
      const targetPosition = targetEl.offsetTop - 120;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  return (
    <nav
      aria-label="Table of contents"
      className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-xs sticky top-28 space-y-3"
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-3">
        <List className="w-4 h-4 text-black" />
        <span>Table of Contents</span>
      </div>

      <ul className="space-y-1.5 text-xs max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
        {items.map((item, index) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleLinkClick(e, item.id)}
                className={`block py-1.5 px-2.5 rounded-lg transition-all font-medium leading-relaxed ${
                  isActive
                    ? "bg-black text-white font-bold"
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
              >
                <span className="text-[10px] opacity-60 mr-1.5 font-mono">{index + 1}.</span>
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
