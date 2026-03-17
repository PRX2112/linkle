"use client";

import { BarChart3, TrendingUp, MousePointerClick, Users, Globe, Smartphone, Laptop, ArrowUpRight } from "lucide-react";

// Mock analytics data — real data can be wired later from a DB
const mockStats = [
  { label: "Total Clicks", value: "1,248", change: "+12%", up: true, icon: MousePointerClick },
  { label: "Unique Visitors", value: "834", change: "+8%", up: true, icon: Users },
  { label: "Link Views", value: "3,912", change: "+21%", up: true, icon: TrendingUp },
  { label: "Countries", value: "14", change: "same", up: true, icon: Globe },
];

const mockTopLinks = [
  { name: "Instagram", clicks: 412, pct: 33 },
  { name: "YouTube", clicks: 304, pct: 24 },
  { name: "My Portfolio", clicks: 238, pct: 19 },
  { name: "Design Course", clicks: 181, pct: 15 },
  { name: "PayPal", clicks: 113, pct: 9 },
];

const mockDailyClicks = [20, 35, 28, 52, 44, 61, 49, 73, 65, 88, 77, 94, 82, 108];
const maxClick = Math.max(...mockDailyClicks);

const mockDevices = [
  { label: "Mobile", value: 62, icon: Smartphone },
  { label: "Desktop", value: 30, icon: Laptop },
  { label: "Other", value: 8, icon: Globe },
];

const mockCountries = [
  { name: "India", pct: 38 },
  { name: "United States", pct: 22 },
  { name: "United Kingdom", pct: 11 },
  { name: "Canada", pct: 8 },
  { name: "Germany", pct: 6 },
  { name: "Others", pct: 15 },
];

export default function AnalyticsDashboard() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track how your Linkle page is performing</p>
        </div>
        <span className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200 dark:border-amber-800">
          📊 Demo Data — Connect real analytics soon
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {mockStats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${stat.up ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Clicks Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-500" /> Daily Clicks (Last 14 Days)
          </h2>
          <div className="flex items-end gap-1.5 h-28 mt-4">
            {mockDailyClicks.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full rounded-t-md transition-all group-hover:opacity-80"
                  style={{
                    height: `${Math.round((val / maxClick) * 100)}%`,
                    background: "linear-gradient(to top, #6366f1, #a855f7)",
                    minHeight: 4,
                  }}
                  title={`${val} clicks`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">14 days ago</span>
            <span className="text-xs text-gray-400">Today</span>
          </div>
        </div>

        {/* Top Links */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" /> Top Links
          </h2>
          <div className="space-y-3">
            {mockTopLinks.map((link, i) => (
              <div key={link.name} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-gray-400 shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{link.name}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-2 shrink-0">{link.clicks} clicks</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${link.pct}%`, background: "linear-gradient(to right, #6366f1, #a855f7)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-500" /> Devices
          </h2>
          <div className="space-y-4">
            {mockDevices.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
                  <d.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{d.label}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{d.value}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${d.value}%`, background: "linear-gradient(to right, #6366f1, #a855f7)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-500" /> Top Countries
          </h2>
          <div className="space-y-3">
            {mockCountries.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{c.name}</span>
                <div className="w-24 h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden ml-3 mr-3">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.pct}%`, background: "linear-gradient(to right, #6366f1, #a855f7)" }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-8 text-right shrink-0">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
