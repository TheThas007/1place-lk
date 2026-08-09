import React from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Clock } from "lucide-react";
import PolicyTableOfContents, { TocItem } from "./PolicyTableOfContents";
import PolicyContactCard from "./PolicyContactCard";
import { businessPolicyConfig } from "@/config/business-policy";

interface PolicyPageLayoutProps {
  title: string;
  subtitle: string;
  badge: string;
  tocItems: TocItem[];
  children: React.ReactNode;
}

export default function PolicyPageLayout({
  title,
  subtitle,
  badge,
  tocItems,
  children,
}: PolicyPageLayoutProps) {
  return (
    <div className="bg-white min-h-screen pt-[100px] pb-24 text-black font-sans">
      
      {/* ── 1. Top Breadcrumbs ── */}
      <div className="border-b border-[#EAEAEA] bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium overflow-x-auto no-scrollbar">
            <Link href="/" className="hover:text-black transition-colors shrink-0">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-black font-semibold truncate">{title}</span>
          </div>
        </div>
      </div>

      {/* ── 2. Hero Header Section ── */}
      <header className="border-b border-[#EAEAEA] bg-[#FAFAFA] py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="max-w-3xl space-y-4">
            
            {/* Category / Compliance Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-[#EAEAEA] px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>{badge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight leading-tight">
              {title}
            </h1>

            <p className="text-xs sm:text-base text-gray-600 leading-relaxed font-normal">
              {subtitle}
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs text-gray-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Last Updated: {businessPolicyConfig.lastUpdated}
              </span>
              <span>•</span>
              <span>Official Policy of {businessPolicyConfig.tradingName}</span>
            </div>

          </div>
        </div>
      </header>

      {/* ── 3. Main Policy Content Layout ── */}
      <main className="max-w-6xl mx-auto px-4 lg:px-6 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Sticky Sidebar: Table of Contents */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <PolicyTableOfContents items={tocItems} />
          </aside>

          {/* Main Content Area (Max readable width ~ 900px) */}
          <article className="lg:col-span-8 order-1 lg:order-2 space-y-2 max-w-[900px]">
            {children}
            <PolicyContactCard />
          </article>

        </div>
      </main>

    </div>
  );
}
