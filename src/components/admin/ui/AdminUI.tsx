"use client";

import React, { forwardRef } from "react";
import { useAdminTheme } from "@/app/admin/dashboard/layout";
import { TrendingUp, TrendingDown } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   1. ADMIN BUTTON SYSTEM
════════════════════════════════════════════════════════════════════ */
export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "icon" | "success";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  tooltip?: string;
  loading?: boolean;
}

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(function AdminButton(
  {
    children,
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "left",
    tooltip,
    loading = false,
    className = "",
    disabled,
    ...props
  },
  ref
) {
  const { isLight } = useAdminTheme();

  // Size definitions
  const sizeClasses =
    variant === "icon"
      ? size === "sm"
        ? "w-7 h-7 p-1 text-xs"
        : size === "lg"
        ? "w-10 h-10 p-2 text-sm"
        : "w-8.5 h-8.5 p-1.5 text-xs"
      : size === "sm"
      ? "px-2.5 py-1.5 text-xs gap-1.5"
      : size === "lg"
      ? "px-5 py-2.5 text-sm gap-2"
      : "px-3.5 py-2 text-xs gap-2";

  // Variant definitions
  let variantClasses = "";
  if (variant === "primary") {
    variantClasses =
      "bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold shadow-xs hover:shadow-sm hover:-translate-y-px active:translate-y-0";
  } else if (variant === "secondary") {
    variantClasses = isLight
      ? "bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs"
      : "bg-[#121A25] hover:bg-[#16212F] text-[#F8FAFC] border border-white/[0.08] hover:border-white/[0.14] shadow-xs";
  } else if (variant === "danger") {
    variantClasses = isLight
      ? "bg-[#FEF2F2] hover:bg-red-100 text-[#EF4444] border border-red-200 shadow-xs"
      : "bg-red-500/10 hover:bg-red-500/20 text-[#EF4444] border border-red-500/20 shadow-xs";
  } else if (variant === "success") {
    variantClasses =
      "bg-[#10B981] hover:bg-emerald-600 text-white font-semibold shadow-xs hover:shadow-sm hover:-translate-y-px active:translate-y-0";
  } else if (variant === "ghost") {
    variantClasses = isLight
      ? "bg-transparent hover:bg-slate-100 text-[#475569] hover:text-[#0F172A]"
      : "bg-transparent hover:bg-white/5 text-[#94A3B8] hover:text-white";
  } else if (variant === "icon") {
    variantClasses = isLight
      ? "bg-white hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1]"
      : "bg-[#0E141D] hover:bg-[#121A25] text-[#94A3B8] hover:text-white border border-white/[0.08] shadow-xs hover:border-white/[0.14]";
  }

  return (
    <button
      ref={ref}
      title={tooltip}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-[10px] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
});

/* ════════════════════════════════════════════════════════════════════
   2. ADMIN STATUS TAG / BADGE SYSTEM
════════════════════════════════════════════════════════════════════ */
export type BadgeSemanticType =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "failed"
  | "refunded"
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export function AdminBadge({
  type = "neutral",
  children,
  icon,
  className = "",
}: {
  type?: BadgeSemanticType | string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  const norm = (type || "").toLowerCase().replace(/[\s-]+/g, "_");

  let colorClasses =
    "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20";

  if (norm.includes("pending") || norm === "warning" || norm.includes("low_stock")) {
    colorClasses =
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  } else if (norm.includes("confirm") || norm === "info" || norm.includes("new")) {
    colorClasses =
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
  } else if (norm.includes("process")) {
    colorClasses =
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
  } else if (norm.includes("pack") || norm.includes("out_for_delivery")) {
    colorClasses =
      "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
  } else if (norm.includes("ship")) {
    colorClasses =
      "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20";
  } else if (norm.includes("deliver") || norm === "success" || norm.includes("in_stock") || norm.includes("paid")) {
    colorClasses =
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  } else if (norm.includes("cancel") || norm.includes("fail") || norm === "danger" || norm.includes("out_of_stock")) {
    colorClasses =
      "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
  } else if (norm.includes("return")) {
    colorClasses =
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
  } else if (norm.includes("refund")) {
    colorClasses =
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg border leading-none tracking-wide shrink-0 ${colorClasses} ${className}`}
    >
      {icon && <span className="w-3 h-3 shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════════
   3. ADMIN KPI CARD SYSTEM
════════════════════════════════════════════════════════════════════ */
export interface AdminKpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive?: boolean;
    period?: string;
  };
  iconVariant?: "blue" | "amber" | "purple" | "emerald" | "red" | "cyan";
  className?: string;
}

export function AdminKpiCard({
  icon,
  label,
  value,
  trend,
  iconVariant = "blue",
  className = "",
}: AdminKpiCardProps) {
  const { isLight } = useAdminTheme();

  const iconColors: Record<string, string> = {
    blue: isLight
      ? "bg-blue-50 text-[#2563EB] border-blue-100"
      : "bg-blue-500/15 text-[#38BDF8] border-blue-500/20",
    amber: isLight
      ? "bg-amber-50 text-[#F59E0B] border-amber-100"
      : "bg-amber-500/15 text-[#F59E0B] border-amber-500/20",
    purple: isLight
      ? "bg-purple-50 text-[#8B5CF6] border-purple-100"
      : "bg-purple-500/15 text-[#A78BFA] border-purple-500/20",
    emerald: isLight
      ? "bg-emerald-50 text-[#10B981] border-emerald-100"
      : "bg-emerald-500/15 text-[#34D399] border-emerald-500/20",
    red: isLight
      ? "bg-red-50 text-[#EF4444] border-red-100"
      : "bg-red-500/15 text-[#F87171] border-red-500/20",
    cyan: isLight
      ? "bg-cyan-50 text-[#0EA5E9] border-cyan-100"
      : "bg-cyan-500/15 text-[#38BDF8] border-cyan-500/20",
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-150 flex items-center gap-3.5 ${
        isLight
          ? "bg-white border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1]"
          : "bg-[#0E141D] border-white/[0.08] hover:border-white/[0.14]"
      } ${className}`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconColors[iconVariant] || iconColors.blue}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-[11px] font-semibold uppercase tracking-wider truncate ${
            isLight ? "text-[#64748B]" : "text-[#94A3B8]"
          }`}
        >
          {label}
        </p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <h4
            className={`text-xl font-bold font-mono tracking-tight ${
              isLight ? "text-[#0F172A]" : "text-[#F8FAFC]"
            }`}
          >
            {value}
          </h4>
          {trend && (
            <span
              className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                trend.isPositive !== false ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {trend.isPositive !== false ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
              {trend.period && (
                <span className={`font-normal ml-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                  {trend.period}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   4. ADMIN CARD / SURFACE CONTAINER
════════════════════════════════════════════════════════════════════ */
export function AdminCard({
  children,
  className = "",
  padding = "p-5",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}) {
  const { isLight } = useAdminTheme();
  return (
    <div
      className={`rounded-2xl border transition-all duration-150 ${padding} ${
        isLight
          ? "bg-white border-[#E2E8F0] shadow-xs"
          : "bg-[#0E141D] border-white/[0.08]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   5. ADMIN FORM CONTROLS (Input, Search, Select)
════════════════════════════════════════════════════════════════════ */
export interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(function AdminInput(
  { icon, className = "", ...props },
  ref
) {
  const { isLight } = useAdminTheme();

  return (
    <div className="relative flex-1">
      {icon && (
        <span
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
            isLight ? "text-[#64748B]" : "text-[#94A3B8]"
          }`}
        >
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={`w-full ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2 rounded-xl text-xs font-medium outline-none border transition-all ${
          isLight
            ? "bg-white border-[#E2E8F0] text-[#0F172A] placeholder-[#64748B] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"
            : "bg-[#0B111A] border-white/[0.08] text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/30"
        } ${className}`}
        {...props}
      />
    </div>
  );
});

export interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(function AdminSelect(
  { className = "", children, ...props },
  ref
) {
  const { isLight } = useAdminTheme();

  return (
    <select
      ref={ref}
      className={`appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-semibold outline-none border cursor-pointer transition-all ${
        isLight
          ? "bg-white border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB]"
          : "bg-[#0B111A] border-white/[0.08] text-[#F8FAFC] focus:border-[#2563EB]"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

/* ════════════════════════════════════════════════════════════════════
   6. ADMIN TABLE SYSTEM
════════════════════════════════════════════════════════════════════ */
export function AdminTable({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { isLight } = useAdminTheme();

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-150 ${
        isLight ? "bg-white border-[#E2E8F0] shadow-xs" : "bg-[#0E141D] border-white/[0.08]"
      } ${className}`}
    >
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-xs text-left border-collapse">{children}</table>
      </div>
    </div>
  );
}

export function AdminThead({ children }: { children: React.ReactNode }) {
  const { isLight } = useAdminTheme();
  return (
    <thead
      className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
        isLight
          ? "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"
          : "bg-[#121A25] border-white/[0.08] text-[#94A3B8]"
      }`}
    >
      {children}
    </thead>
  );
}

export function AdminTh({
  children,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th className={`py-3 px-4 font-semibold tracking-wider ${alignClass} ${className}`}>
      {children}
    </th>
  );
}

export function AdminTbody({ children }: { children: React.ReactNode }) {
  const { isLight } = useAdminTheme();
  return (
    <tbody
      className={`divide-y ${
        isLight ? "divide-[#E2E8F0]" : "divide-white/[0.04]"
      }`}
    >
      {children}
    </tbody>
  );
}

export function AdminTr({
  children,
  isSelected = false,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const { isLight } = useAdminTheme();

  const selectedClass = isSelected
    ? isLight
      ? "bg-blue-50/70"
      : "bg-blue-600/10"
    : isLight
    ? "hover:bg-[#F8FAFC]"
    : "hover:bg-white/[0.02]";

  return (
    <tr
      onClick={onClick}
      className={`transition-colors duration-100 ${selectedClass} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function AdminTd({
  children,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return <td className={`py-3 px-4 align-middle ${alignClass} ${className}`}>{children}</td>;
}

/* ════════════════════════════════════════════════════════════════════
   7. ADMIN TABS SYSTEM
════════════════════════════════════════════════════════════════════ */
export function AdminTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = "",
}: {
  tabs: { id: T; label: string; count?: number }[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}) {
  const { isLight } = useAdminTheme();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl border text-xs font-semibold ${
        isLight ? "bg-[#F8FAFC] border-[#E2E8F0]" : "bg-[#0B111A] border-white/[0.08]"
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? "bg-[#2563EB] text-white font-bold shadow-xs"
                : isLight
                ? "text-[#475569] hover:text-[#0F172A]"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? "bg-white/20 text-white"
                    : isLight
                    ? "bg-slate-200 text-slate-700"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   8. ADMIN EMPTY STATE & SKELETON
════════════════════════════════════════════════════════════════════ */
export function AdminEmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { isLight } = useAdminTheme();

  return (
    <div
      className={`rounded-2xl border border-dashed p-12 text-center space-y-3 ${
        isLight
          ? "bg-white border-[#E2E8F0] text-[#64748B]"
          : "bg-[#0E141D] border-white/[0.08] text-[#94A3B8]"
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
        {icon}
      </div>
      <div>
        <h4 className={`text-sm font-bold ${isLight ? "text-[#0F172A]" : "text-[#F8FAFC]"}`}>
          {title}
        </h4>
        {subtitle && <p className="text-xs mt-1 max-w-sm mx-auto">{subtitle}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function AdminSkeleton({ className = "" }: { className?: string }) {
  const { isLight } = useAdminTheme();
  return (
    <div
      className={`animate-pulse rounded-xl ${
        isLight ? "bg-slate-200/80" : "bg-white/[0.06]"
      } ${className}`}
    />
  );
}
