"use client";

import { BarChart3, TrendingUp, Users, MousePointerClick, ArrowUpRight, ShieldCheck } from "lucide-react";

export default function AnalyticsShowcase() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950 border-t border-gray-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Real-Time Analytics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Understand what drives clicks, not just views.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Privacy-first metrics that respect your audience. Track views, link conversions, referrers, and UTM campaigns without third-party tracking scripts.
          </p>
        </div>

        {/* Dashboard Preview Card (Clearly Labeled as Example Analytics) */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-gray-50/80 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
          {/* Header of Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Profile Performance Overview
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Last 30 days • Real-time aggregation
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 self-start sm:self-auto">
              Example Analytics Dashboard
            </span>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-medium">Total Views</span>
                <Users className="w-4 h-4 text-brand-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                4,820
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+18.4% vs last period</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-medium">Link Clicks</span>
                <MousePointerClick className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                2,140
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+24.1% vs last period</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-medium">Average CTR</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                44.4%
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>Above benchmark</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-medium">Unique Visitors</span>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                3,610
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                <span>74.9% return rate</span>
              </div>
            </div>
          </div>

          {/* Breakdown: Top Referrers & Top Performing Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Top Referrers */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                Top Traffic Sources
              </h4>
              <div className="space-y-2.5">
                {[
                  { source: "Instagram (Bio Link)", percentage: "48%", count: "2,314" },
                  { source: "Twitter / X", percentage: "24%", count: "1,156" },
                  { source: "LinkedIn", percentage: "16%", count: "771" },
                  { source: "Direct / QR Code", percentage: "12%", count: "579" },
                ].map((item) => (
                  <div key={item.source} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{item.source}</span>
                      <span className="font-mono text-gray-500">{item.percentage}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-600 dark:bg-brand-500"
                        style={{ width: item.percentage }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Links */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                Top Performing Links
              </h4>
              <div className="space-y-3">
                {[
                  { title: "⚡ Interactive UI Design System", clicks: "1,120", ctr: "52.3%" },
                  { title: "🎙️ The Indie Builder Podcast Ep. 42", clicks: "640", ctr: "29.9%" },
                  { title: "₹ Linkle Pay UPI Payment", clicks: "380", ctr: "17.8%" },
                ].map((link) => (
                  <div key={link.title} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/60">
                    <div className="truncate pr-2">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {link.title}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {link.clicks} clicks
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-brand-600 dark:text-brand-400 shrink-0">
                      {link.ctr}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-200/80 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Cookieless tracking • GDPR & CCPA compliant • No invasive third-party ad scripts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
