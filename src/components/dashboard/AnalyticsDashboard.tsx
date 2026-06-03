"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Users,
  Globe,
  Smartphone,
  Laptop,
  ArrowUpRight,
  Loader2,
  Share2
} from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  icon: string;
}

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
}

interface AnalyticsData {
  stats: StatItem[];
  countries: CountryItem[];
  devices: DeviceItem[];
  topLinks: TopLinkItem[];
  dailyChart: DailyChartItem[];
}

const statIcons: Record<string, React.ComponentType<any>> = {
  click: MousePointerClick,
  visitor: Users,
  view: TrendingUp,
  globe: Globe,
};

const deviceIcons: Record<string, React.ComponentType<any>> = {
  Mobile: Smartphone,
  Desktop: Laptop,
  Tablet: Smartphone,
  Other: Globe,
};

export default function AnalyticsDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<"clicks" | "views">("clicks");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">
          Analyzing your visitor traffic in real time...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <Globe className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Failed to load analytics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
          There was an error loading your performance metrics. Please try reloading the page.
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            window.location.reload();
          }}
          className="mt-4 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // Check if there is absolutely no views or clicks yet
  const totalViewsNum = data.stats.find(s => s.icon === "view")?.value || "0";
  const totalClicksNum = data.stats.find(s => s.icon === "click")?.value || "0";
  const isNoData = parseInt(totalViewsNum.replace(/,/g, "")) === 0 && parseInt(totalClicksNum.replace(/,/g, "")) === 0;

  const maxClickVal = Math.max(...data.dailyChart.map((d) => d[chartMetric]), 1);

  return (
    <div className="max-w-4xl">
      {/* Title */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track how your Linkle page is performing</p>
        </div>
        <span className="self-start px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-200 dark:border-green-800 flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Live Event Tracking Connected
        </span>
      </div>

      {/* Onboarding State for fresh accounts */}
      {isNoData && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Share2 className="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Your analytics engine is active!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add links and share your Linkle public profile on Instagram, Twitter, or TikTok bios to start tracking click events, device breakdowns, and top countries in real time.
            </p>
          </div>
          {session?.user?.username && (
            <a
              href={`/p/${session.user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              View My Profile
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {data.stats.map((stat) => {
          const Icon = statIcons[stat.icon] || MousePointerClick;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-zinc-700">
                  Real
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Clicks & Views Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              Daily Performance (Last 14 Days)
            </h2>
            
            {/* Chart Toggle */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg shrink-0">
              <button
                onClick={() => setChartMetric("clicks")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  chartMetric === "clicks"
                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Clicks
              </button>
              <button
                onClick={() => setChartMetric("views")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  chartMetric === "views"
                    ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Views
              </button>
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-28 mt-6">
            {data.dailyChart.map((item, i) => {
              const val = item[chartMetric];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-t-md transition-all group-hover:opacity-80"
                    style={{
                      height: `${Math.round((val / maxClickVal) * 100)}%`,
                      background: "linear-gradient(to top, #6366f1, #a855f7)",
                      minHeight: 4,
                    }}
                  />
                  {/* Floating tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-zinc-950 text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                    <span className="font-semibold">{item.dateStr}:</span> {val} {chartMetric}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <span className="text-[10px] text-gray-400 font-medium">
              {data.dailyChart[0]?.dateStr || "14 days ago"}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              {data.dailyChart[data.dailyChart.length - 1]?.dateStr || "Today"}
            </span>
          </div>
        </div>

        {/* Top Links */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" /> Top Links
          </h2>
          
          {data.topLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[140px]">
              <TrendingUp className="w-8 h-8 text-gray-300 dark:text-zinc-700 mb-2" />
              <p className="text-xs text-gray-400 font-medium">No links have been clicked yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.topLinks.map((link, i) => (
                <div key={link.name} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-gray-400 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {link.name}
                      </span>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-2 shrink-0">
                        {link.clicks} clicks
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${link.pct}%`,
                          background: "linear-gradient(to right, #6366f1, #a855f7)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-500" /> Devices
          </h2>
          
          {data.devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[160px]">
              <Smartphone className="w-8 h-8 text-gray-300 dark:text-zinc-700 mb-2" />
              <p className="text-xs text-gray-400 font-medium">No device data collected yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.devices.map((d) => {
                const Icon = deviceIcons[d.label] || Globe;
                return (
                  <div key={d.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{d.label}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{d.value}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${d.value}%`,
                            background: "linear-gradient(to right, #6366f1, #a855f7)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Country Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-500" /> Top Countries
          </h2>
          
          {data.countries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[160px]">
              <Globe className="w-8 h-8 text-gray-300 dark:text-zinc-700 mb-2" />
              <p className="text-xs text-gray-400 font-medium">No geographical data collected yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {data.countries.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate font-medium">
                    {c.name}
                  </span>
                  <div className="w-24 h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden ml-3 mr-3 shrink-0">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.pct}%`,
                        background: "linear-gradient(to right, #6366f1, #a855f7)",
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-8 text-right shrink-0">
                    {c.pct}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
