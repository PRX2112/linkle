"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Percent,
  Users,
} from "lucide-react";
import { PeriodComparison } from "@/lib/analytics/events";

interface AnalyticsKpiRowProps {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  uniqueVisitors: number;
  comparison?: PeriodComparison;
  rangeLabel: string;
}

export function AnalyticsKpiRow({
  totalViews,
  totalClicks,
  ctr,
  uniqueVisitors,
  comparison,
  rangeLabel,
}: AnalyticsKpiRowProps) {
  // Helper to format numbers with commas
  const formatNumber = (num: number) => num.toLocaleString();

  // Helper to render comparison delta badge
  const renderTrendBadge = (
    pct: number | null | undefined,
    unit: "%" | "pts" = "%"
  ) => {
    if (pct === null || pct === undefined) {
      return (
        <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">
          No prior data
        </span>
      );
    }

    const isPositive = pct > 0;
    const isZero = pct === 0;

    if (isZero) {
      return (
        <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
          0.0{unit} vs prev
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
          isPositive
            ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40"
            : "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40"
        }`}
        title={`${isPositive ? "+" : ""}${pct}${unit} vs previous ${rangeLabel}`}
      >
        {isPositive ? (
          <TrendingUp className="w-3 h-3 stroke-[2.5]" />
        ) : (
          <TrendingDown className="w-3 h-3 stroke-[2.5]" />
        )}
        <span>
          {isPositive ? "+" : ""}
          {pct}
          {unit}
        </span>
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Profile Views - PRIMARY KPI */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-brand-500/30 dark:border-brand-500/40 p-5 shadow-subtle flex flex-col justify-between relative overflow-hidden">
        {/* Subtle accent line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-brand-600 dark:bg-brand-500" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Profile Views
            </span>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/50 border border-brand-200/60 dark:border-brand-800/60">
            Primary
          </span>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 tabular-nums">
              {formatNumber(totalViews)}
            </span>
            {renderTrendBadge(comparison?.viewsChangePct)}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
            Total visits to your profile
          </p>
        </div>
      </div>

      {/* 2. Total Clicks - SECONDARY */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Link Clicks
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 tabular-nums">
              {formatNumber(totalClicks)}
            </span>
            {renderTrendBadge(comparison?.clicksChangePct)}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
            Destination links, UPI & actions
          </p>
        </div>
      </div>

      {/* 3. CTR / Profile Engagement - SECONDARY */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Engagement (CTR)
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 tabular-nums">
              {ctr}%
            </span>
            {renderTrendBadge(comparison?.ctrChangePct, "pts")}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
            Clicks divided by profile views
          </p>
        </div>
      </div>

      {/* 4. Unique Visitors - SECONDARY */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Unique Visitors
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 tabular-nums">
              {formatNumber(uniqueVisitors)}
            </span>
            {renderTrendBadge(comparison?.visitorsChangePct)}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
            Distinct visitor sessions
          </p>
        </div>
      </div>
    </div>
  );
}
