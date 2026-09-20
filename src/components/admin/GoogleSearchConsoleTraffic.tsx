"use client";

import React from "react";
import {
  ExternalLink,
  Search,
  TrendingUp,
  Globe,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  ShoppingBag,
  BarChart2,
  RefreshCw,
} from "lucide-react";

interface GoogleSearchConsoleTrafficProps {
  isLight?: boolean;
}

export default function GoogleSearchConsoleTraffic({
  isLight = false,
}: GoogleSearchConsoleTrafficProps) {
  const gscUrl =
    "https://search.google.com/search-console?resource_id=https%3A%2F%2Fwww.streetmobile.lk%2F&after_verification_success=";

  return (
    <div className="space-y-4 pt-1">
      {/* Search Console Header Banner Card */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isLight
            ? "bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-[#111827]"
            : "bg-gradient-to-br from-[#101821] via-[#0E1A27] to-[#0A131E] border-[#1E2A36] text-[#F8FAFC]"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-600/30 flex items-center justify-center text-blue-500 font-bold">
                <Search className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Google Search Console Verified Property
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" /> Live
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              StreetMobile.lk Search Performance & Live Web Traffic
            </h3>
            <p className={`text-xs max-w-2xl leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Official organic search traffic, queries, impressions, and crawler indexing from Google Search. Access your verified production Search Console property in real time.
            </p>
          </div>

          {/* Direct CTA button to Google Search Console */}
          <a
            href={gscUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all shrink-0 hover:scale-[1.02] cursor-pointer"
          >
            <span>Open Google Search Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Property quick info */}
        <div className={`mt-5 pt-4 border-t flex flex-wrap items-center gap-4 text-xs font-mono ${
          isLight ? "border-slate-200/80 text-slate-600" : "border-[#1E2A36] text-slate-400"
        }`}>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Property:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">https://www.streetmobile.lk/</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Status:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Ownership Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>Sitemap:</span>
            <span className="font-bold">/sitemap.xml (Clean XML)</span>
          </div>
        </div>
      </div>

      {/* 4 Google Search Console Performance Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Clicks */}
        <div
          className={`p-4 rounded-xl border ${
            isLight
              ? "bg-white border-[#E5E7EB] text-[#111827]"
              : "bg-[#0D1722] border-[#1E2A36] text-[#F8FAFC]"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={isLight ? "text-slate-500" : "text-slate-400"}>Total Search Clicks</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold font-mono mt-1 text-blue-600 dark:text-blue-400">
            Real-Time
          </p>
          <p className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Visitors arriving directly from Google Search results.
          </p>
        </div>

        {/* Card 2: Impressions */}
        <div
          className={`p-4 rounded-xl border ${
            isLight
              ? "bg-white border-[#E5E7EB] text-[#111827]"
              : "bg-[#0D1722] border-[#1E2A36] text-[#F8FAFC]"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={isLight ? "text-slate-500" : "text-slate-400"}>Search Impressions</span>
            <BarChart2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold font-mono mt-1 text-purple-600 dark:text-purple-400">
            Real-Time
          </p>
          <p className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Total appearances in mobile & desktop Google queries.
          </p>
        </div>

        {/* Card 3: CTR */}
        <div
          className={`p-4 rounded-xl border ${
            isLight
              ? "bg-white border-[#E5E7EB] text-[#111827]"
              : "bg-[#0D1722] border-[#1E2A36] text-[#F8FAFC]"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={isLight ? "text-slate-500" : "text-slate-400"}>Average CTR</span>
            <span className="text-xs font-bold text-emerald-500">%</span>
          </div>
          <p className="text-xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
            Real-Time
          </p>
          <p className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Percentage of impressions that resulted in an online visit.
          </p>
        </div>

        {/* Card 4: Position */}
        <div
          className={`p-4 rounded-xl border ${
            isLight
              ? "bg-white border-[#E5E7EB] text-[#111827]"
              : "bg-[#0D1722] border-[#1E2A36] text-[#F8FAFC]"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={isLight ? "text-slate-500" : "text-slate-400"}>Average Position</span>
            <Globe className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold font-mono mt-1 text-amber-500">
            Sri Lanka & Global
          </p>
          <p className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Ranking for iPhone, Samsung, and phone accessories.
          </p>
        </div>
      </div>

      {/* Action Links & Feeds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Performance Report */}
        <a
          href="https://search.google.com/search-console/performance/search-result?resource_id=https%3A%2F%2Fwww.streetmobile.lk%2F"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all hover:scale-[1.01] ${
            isLight
              ? "bg-white border-[#E5E7EB] text-[#111827] hover:border-blue-400"
              : "bg-[#0D1722] border-[#1E2A36] text-[#F8FAFC] hover:border-blue-500/50"
          }`}
        >
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Performance Queries</span>
            </div>
            <div className={`text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Top search terms & page clicks
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        </a>

        {/* Index Coverage & Sitemaps */}
        <a
          href="https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fwww.streetmobile.lk%2F"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all hover:scale-[1.01] ${
            isLight
              ? "bg-white border-[#E5E7EB] text-[#111827] hover:border-emerald-400"
              : "bg-[#0D1722] border-[#1E2A36] text-[#F8FAFC] hover:border-emerald-500/50"
          }`}
        >
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Sitemaps & Indexing</span>
            </div>
            <div className={`text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Submit & inspect /sitemap.xml
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        </a>

        {/* Merchant Center Product Feed */}
        <a
          href="https://merchants.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all hover:scale-[1.01] ${
            isLight
              ? "bg-white border-[#E5E7EB] text-[#111827] hover:border-purple-400"
              : "bg-[#0D1722] border-[#1E2A36] text-[#F8FAFC] hover:border-purple-500/50"
          }`}
        >
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Merchant Center Shopping</span>
            </div>
            <div className={`text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Linked to /feed.xml
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-purple-500 shrink-0" />
        </a>
      </div>
    </div>
  );
}
