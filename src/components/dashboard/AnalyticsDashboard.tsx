"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  RotateCw,
  ExternalLink,
  AlertCircle,
  Share2,
  Sparkles,
} from "lucide-react";
import {
  AnalyticsDateRange,
  ConversionMetrics,
  FunnelStage,
  PeriodComparison,
  TrafficSourceItem,
  UtmAnalyticsReport,
} from "@/lib/analytics/events";
import { AnalyticsKpiRow } from "./analytics/AnalyticsKpiRow";
import { PerformanceChart } from "./analytics/PerformanceChart";
import { TopLinksRanking } from "./analytics/TopLinksRanking";
import { TrafficSourcesList } from "./analytics/TrafficSourcesList";
import { DeviceLocationBreakdown } from "./analytics/DeviceLocationBreakdown";
import { ConversionFunnel } from "./analytics/ConversionFunnel";
import { AnalyticsInsights } from "./analytics/AnalyticsInsights";
import { UtmPerformanceSection } from "./analytics/UtmPerformanceSection";

interface CountryItem {
  name: string;
  pct: number;
}

interface DeviceItem {
  label: string;
  value: number;
}

interface TopLinkItem {
  name: string;
  clicks: number;
  pct: number;
}

interface DailyChartItem {
  dateStr: string;
  clicks: number;
  views: number;
  conversions: number;
}

interface AnalyticsData {
  range: AnalyticsDateRange;
  uniqueVisitors?: number;
  conversionMetrics: ConversionMetrics;
  funnel: FunnelStage[];
  trafficSources: TrafficSourceItem[];
  utmReport?: UtmAnalyticsReport;
  topLinks: TopLinkItem[];
  devices: DeviceItem[];
  countries: CountryItem[];
  dailyChart: DailyChartItem[];
  comparison?: PeriodComparison;
}

const DATE_RANGES: { id: AnalyticsDateRange; label: string; days: number }[] = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "14d", label: "14 days", days: 14 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
];

export default function AnalyticsDashboard() {
  const { data: session } = useSession();
  const [selectedRange, setSelectedRange] = useState<AnalyticsDateRange>("14d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchAnalytics = useCallback(
    async (range: AnalyticsDateRange, isInitial = false) => {
      if (isInitial) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const res = await fetch(`/api/analytics?range=${range}`);
        if (!res.ok) {
          throw new Error("Analytics could not be loaded");
        }
        const json = await res.json();
        setData(json);
        setLastUpdated("just now");
      } catch (err: any) {
        setError(err.message || "Failed to load performance metrics");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAnalytics(selectedRange, true);
  }, [fetchAnalytics, selectedRange]);

  const activeRangeConfig = useMemo(
    () => DATE_RANGES.find((d) => d.id === selectedRange) || DATE_RANGES[1],
    [selectedRange]
  );

  // Loading Skeleton matching final layout
  if (loading) {
    return (
      <div className="max-w-5xl space-y-6 pb-20 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 dark:border-zinc-800 pb-5">
          <div className="space-y-2">
            <div className="h-7 w-36 bg-gray-200 dark:bg-zinc-800 rounded-md" />
            <div className="h-4 w-64 bg-gray-100 dark:bg-zinc-850 rounded" />
          </div>
          <div className="h-8 w-60 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
        </div>

        {/* KPI Skeleton Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-4 space-y-3"
            >
              <div className="h-4 w-24 bg-gray-100 dark:bg-zinc-800 rounded" />
              <div className="h-8 w-20 bg-gray-200 dark:bg-zinc-700 rounded" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="h-64 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-6" />

        {/* 2-Column Section Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800" />
          <div className="h-56 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800" />
        </div>
      </div>
    );
  }

  // Error State with Actionable Recovery
  if (error || !data) {
    return (
      <div className="max-w-md mx-auto min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Analytics couldn&apos;t be loaded
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-xs">
            {error || "An error occurred while retrieving your visitor performance metrics."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchAnalytics(selectedRange, true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 dark:bg-zinc-100 text-white dark:text-gray-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-all shadow-subtle"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Try again</span>
        </button>
      </div>
    );
  }

  const {
    conversionMetrics,
    funnel,
    trafficSources,
    utmReport,
    topLinks,
    devices,
    countries,
    dailyChart,
    comparison,
  } = data;

  const isNoActivity = conversionMetrics.profileViews === 0 && conversionMetrics.totalClicks === 0;

  return (
    <div className="max-w-5xl space-y-6 pb-20">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Understand how people interact with your Linkle profile.
          </p>
        </div>

        {/* Header Controls: Range Selector + Refresh + Profile Link */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Segmented Date Range Selector */}
          <div
            className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-800/70 border border-gray-200/80 dark:border-zinc-800 rounded-lg text-xs"
            role="radiogroup"
            aria-label="Date range selector"
          >
            {DATE_RANGES.map((opt) => {
              const isSelected = selectedRange === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={refreshing}
                  onClick={() => setSelectedRange(opt.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all select-none ${
                    isSelected
                      ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-subtle font-semibold"
                      : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => fetchAnalytics(selectedRange, false)}
            disabled={refreshing}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors shadow-subtle"
            title="Refresh analytics data"
            aria-label="Refresh analytics data"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-brand-600" : ""}`}
            />
          </button>

          {/* External Profile Link */}
          {session?.user?.username && (
            <a
              href={`/p/${session.user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-zinc-700/60 transition-colors shadow-subtle"
            >
              <span>View live</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          )}
        </div>
      </div>

      {/* Subtle update status banner */}
      {lastUpdated && !refreshing && (
        <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-500 -mt-2 px-0.5">
          <span>Reporting window: {activeRangeConfig.label}</span>
          <span>Updated {lastUpdated}</span>
        </div>
      )}

      {/* 2. Empty State for New / Inactive Profiles */}
      {isNoActivity ? (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-subtle">
          <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-md">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              No activity yet
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              No visitor sessions were detected during this {activeRangeConfig.label} window.
              Share your Linkle URL across your bio, social platforms, or messaging apps to begin collecting verified analytics.
            </p>
          </div>
          {session?.user?.username && (
            <a
              href={`/p/${session.user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-subtle transition-all"
            >
              <span>View public profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      ) : (
        <>
          {/* 3. Actionable Insights */}
          <AnalyticsInsights
            totalViews={conversionMetrics.profileViews}
            totalClicks={conversionMetrics.totalClicks}
            ctr={conversionMetrics.ctr}
            topLinks={topLinks}
            devices={devices}
            trafficSources={trafficSources}
            comparison={comparison}
          />

          {/* 4. Primary KPI Row */}
          <AnalyticsKpiRow
            totalViews={conversionMetrics.profileViews}
            totalClicks={conversionMetrics.totalClicks}
            ctr={conversionMetrics.ctr}
            uniqueVisitors={data.uniqueVisitors ?? 0}
            comparison={comparison}
            rangeLabel={activeRangeConfig.label}
          />

          {/* 5. Performance Chart */}
          <PerformanceChart
            data={dailyChart}
            rangeLabel={activeRangeConfig.label}
          />

          {/* 6. Middle Grid: Top Links & Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopLinksRanking links={topLinks} />
            <TrafficSourcesList sources={trafficSources} />
          </div>

          {/* 7. Bottom Grid: Devices & Locations */}
          <DeviceLocationBreakdown
            devices={devices}
            countries={countries}
          />

          {/* 8. Funnel & Conversions */}
          <ConversionFunnel
            funnel={funnel}
            conversionMetrics={conversionMetrics}
          />

          {/* 9. Campaign UTM Performance */}
          <UtmPerformanceSection report={utmReport} />
        </>
      )}
    </div>
  );
}
