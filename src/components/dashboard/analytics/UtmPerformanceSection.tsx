"use client";

import React, { useState } from "react";
import { Tag, Globe, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { UtmAnalyticsReport } from "@/lib/analytics/events";

interface UtmPerformanceSectionProps {
  report?: UtmAnalyticsReport;
}

export function UtmPerformanceSection({ report }: UtmPerformanceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!report || report.totalCampaignClicks === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 p-5 text-center">
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 mx-auto mb-2">
          <Tag className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
          No UTM Campaign Clicks Recorded
        </h3>
        <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 max-w-sm mx-auto">
          Add UTM tags to links in My Links to analyze incoming traffic from specific newsletters, social bios, and promotions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3.5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Campaign Performance (UTM)
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Clicks attributed to specific marketing campaigns and referral mediums
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-md border border-brand-200/60 dark:border-brand-800/60">
            {report.totalCampaignClicks.toLocaleString()} total clicks
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors"
            aria-label={isExpanded ? "Collapse UTM section" : "Expand UTM section"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
          {/* Top Campaigns */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Campaigns
            </h3>
            <div className="space-y-2.5">
              {report.campaigns.slice(0, 5).map((c) => (
                <div key={c.campaign} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {c.campaign}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                      {c.clicks} ({c.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-600 dark:bg-brand-500"
                      style={{ width: `${Math.max(c.pct, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              UTM Sources
            </h3>
            <div className="space-y-2.5">
              {report.sources.slice(0, 5).map((s) => (
                <div key={s.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate capitalize">
                      {s.name}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                      {s.clicks} ({s.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-500 dark:bg-sky-400"
                      style={{ width: `${Math.max(s.pct, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mediums */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              UTM Mediums
            </h3>
            <div className="space-y-2.5">
              {report.mediums.slice(0, 5).map((m) => (
                <div key={m.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate capitalize">
                      {m.name}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                      {m.clicks} ({m.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500 dark:bg-purple-400"
                      style={{ width: `${Math.max(m.pct, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
