"use client";

import React from "react";
import { Globe, Compass } from "lucide-react";
import { TrafficSourceItem } from "@/lib/analytics/events";

interface TrafficSourcesListProps {
  sources: TrafficSourceItem[];
}

export function TrafficSourcesList({ sources }: TrafficSourcesListProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3.5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Traffic Sources
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Channels and platforms driving visitors
          </p>
        </div>
      </div>

      {sources.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center">
          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 mb-2">
            <Compass className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium text-gray-700 dark:text-zinc-300">
            No referrer traffic detected
          </p>
          <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
            Direct visits or unknown referrers.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sources.map((source) => (
            <div key={source.name} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {source.name}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                    {source.count.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500 w-10 text-right tabular-nums">
                    ({source.pct}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-300"
                  style={{ width: `${Math.max(source.pct, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
