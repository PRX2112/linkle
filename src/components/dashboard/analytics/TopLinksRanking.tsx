"use client";

import React from "react";
import { TrendingUp, MousePointerClick } from "lucide-react";

interface TopLinkItem {
  name: string;
  clicks: number;
  pct: number;
}

interface TopLinksRankingProps {
  links: TopLinkItem[];
}

export function TopLinksRanking({ links }: TopLinksRankingProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3.5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Top Performing Links
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Ranked by total click volume
          </p>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center">
          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 mb-2">
            <MousePointerClick className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium text-gray-700 dark:text-zinc-300">
            No link clicks recorded
          </p>
          <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
            Share your profile to start tracking link activity.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {links.map((link, idx) => (
            <div key={link.name} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-4 text-gray-400 dark:text-zinc-500 font-mono font-medium text-[11px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {link.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                    {link.clicks.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500 w-10 text-right tabular-nums">
                    ({link.pct}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-600 dark:bg-brand-500 transition-all duration-300"
                  style={{ width: `${Math.max(link.pct, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
