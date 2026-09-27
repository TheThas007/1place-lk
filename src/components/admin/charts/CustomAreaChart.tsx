"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface ChartDataPoint {
  date: string;
  value: number;
  formattedValue?: string;
}

export interface CustomAreaChartProps {
  isLight: boolean;
  title?: string;
  allTimeValue?: string | number;
  allTimeLabel?: string;
  thisWeekValue?: string | number;
  thisWeekLabel?: string;
  thisWeekChange?: number;
  thisMonthValue?: string | number;
  thisMonthLabel?: string;
  thisMonthChange?: number;
  data: ChartDataPoint[];
  valuePrefix?: string;
  valueSuffix?: string;
  metricName?: string;
  height?: number;
  color?: string;
  gradientId?: string;
}

const CustomTooltip = ({ active, payload, label, isLight, metricName, valuePrefix, valueSuffix, color }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`px-4 py-3 rounded-xl border shadow-lg ${
          isLight
            ? "bg-white border-[#E5E7EB] text-[#111827]"
            : "bg-[#07111C] border-[#1E2A36] text-white"
        }`}
      >
        <p className={`text-xs mb-1 font-medium ${isLight ? "text-[#667085]" : "text-[#94A3B8]"}`}>
          {label}
        </p>
        <p className="text-base font-bold" style={{ color: color }}>
          {valuePrefix}{payload[0].payload.formattedValue || payload[0].value}{valueSuffix} {metricName}
        </p>
      </div>
    );
  }
  return null;
};

export default function CustomAreaChart({
  isLight,
  title,
  allTimeValue,
  allTimeLabel,
  thisWeekValue,
  thisWeekLabel,
  thisWeekChange,
  thisMonthValue,
  thisMonthLabel,
  thisMonthChange,
  data,
  valuePrefix = "",
  valueSuffix = "",
  metricName = "",
  height = 288,
  color,
  gradientId = "colorValue",
}: CustomAreaChartProps) {
  const [timeRange, setTimeRange] = useState("All");
  const [isCumulative, setIsCumulative] = useState(true);

  const ranges = ["1D", "1W", "1M", "3M", "6M", "1Y", "All"];
  const finalColor = color || (isLight ? "#F43F5E" : "#FB7185");

  return (
    <div
      className={`rounded-2xl w-full ${
        title ? "border p-6 " : ""
      } ${
        title 
          ? isLight
            ? "bg-white border-[#E2E8F0]"
            : "bg-[#0E141D] border-white/[0.08]"
          : ""
      }`}
    >
      {/* Title */}
      {title && (
        <h2
          className={`text-2xl font-bold mb-6 ${
            isLight ? "text-[#111827]" : "text-white"
          }`}
        >
          {title}
        </h2>
      )}

      {/* KPI Headers */}
      {allTimeValue !== undefined && (
        <div className="flex flex-wrap gap-8 sm:gap-16 mb-8">
          <div>
            <h3
              className={`text-4xl font-bold font-mono tracking-tight ${
                isLight ? "text-[#111827]" : "text-white"
              }`}
            >
              {valuePrefix}{allTimeValue}{valueSuffix}
            </h3>
            <p
              className={`text-sm mt-1 font-medium ${
                isLight ? "text-[#667085]" : "text-[#94A3B8]"
              }`}
            >
              {allTimeLabel}
            </p>
          </div>

          {thisWeekValue !== undefined && (
            <div>
              <div className="flex items-end gap-3">
                <h3
                  className={`text-4xl font-bold font-mono tracking-tight ${
                    isLight ? "text-[#111827]" : "text-white"
                  }`}
                >
                  {valuePrefix}{thisWeekValue}{valueSuffix}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p
                  className={`text-sm font-medium ${
                    isLight ? "text-[#667085]" : "text-[#94A3B8]"
                  }`}
                >
                  {thisWeekLabel}
                </p>
                {thisWeekChange !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      thisWeekChange >= 0
                        ? isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/20 text-emerald-400"
                        : isLight ? "bg-rose-100 text-rose-700" : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {thisWeekChange > 0 ? "+" : ""}
                    {thisWeekChange}
                  </span>
                )}
              </div>
            </div>
          )}

          {thisMonthValue !== undefined && (
            <div>
              <div className="flex items-end gap-3">
                <h3
                  className={`text-4xl font-bold font-mono tracking-tight ${
                    isLight ? "text-[#111827]" : "text-white"
                  }`}
                >
                  {valuePrefix}{thisMonthValue}{valueSuffix}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p
                  className={`text-sm font-medium ${
                    isLight ? "text-[#667085]" : "text-[#94A3B8]"
                  }`}
                >
                  {thisMonthLabel}
                </p>
                {thisMonthChange !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      thisMonthChange >= 0
                        ? isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/20 text-emerald-400"
                        : isLight ? "bg-rose-100 text-rose-700" : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {thisMonthChange > 0 ? "+" : ""}
                    {thisMonthChange}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div style={{ height: height }} className="w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={finalColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={finalColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              vertical={true} 
              horizontal={true} 
              strokeDasharray="3 3" 
              stroke={isLight ? "#E5E7EB" : "#1E2A36"} 
              verticalFill={[]} 
              horizontalFill={[]} 
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: isLight ? "#9CA3AF" : "#64748B" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: isLight ? "#9CA3AF" : "#64748B" }}
            />
            <Tooltip
              content={
                <CustomTooltip
                  isLight={isLight}
                  metricName={metricName}
                  valuePrefix={valuePrefix}
                  valueSuffix={valueSuffix}
                  color={finalColor}
                />
              }
              cursor={{ stroke: isLight ? "#E5E7EB" : "#1E2A36", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={finalColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 6, fill: finalColor, stroke: isLight ? "#FFFFFF" : "#0E141D", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Controls */}
      {title && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t ${
          isLight ? "border-[#E5E7EB]" : "border-white/[0.08]"
        }`}>
          <div className="flex items-center gap-4">
            {ranges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`text-xs font-bold transition-colors ${
                  timeRange === range
                    ? isLight
                      ? "bg-[#111827] text-white px-3 py-1 rounded-full"
                      : "bg-white text-[#0E141D] px-3 py-1 rounded-full"
                    : isLight
                      ? "text-[#9CA3AF] hover:text-[#111827]"
                      : "text-[#64748B] hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-colors ${
                isCumulative
                  ? isLight ? "bg-[#111827]" : "bg-[#F8FAFC]"
                  : isLight ? "bg-[#F3F4F6] border border-[#D1D5DB]" : "bg-[#1E2A36] border border-[#334155]"
              }`}
              onClick={() => setIsCumulative(!isCumulative)}
              >
                {isCumulative && (
                  <svg className={`w-3 h-3 ${isLight ? "text-white" : "text-[#0E141D]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-xs font-bold ${isLight ? "text-[#111827]" : "text-white"}`}>
                Cumulative
              </span>
            </label>

            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: finalColor }} />
              <span className={`text-xs font-bold capitalize ${isLight ? "text-[#111827]" : "text-white"}`}>
                {metricName}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
