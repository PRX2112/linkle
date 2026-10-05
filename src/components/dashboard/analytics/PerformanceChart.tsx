"use client";

import React, { useState } from "react";
import { BarChart3, Eye, MousePointerClick } from "lucide-react";

interface DailyChartItem {
  dateStr: string;
  clicks: number;
  views: number;
  conversions: number;
}

interface PerformanceChartProps {
  data: DailyChartItem[];
  rangeLabel: string;
}

export function PerformanceChart({ data, rangeLabel }: PerformanceChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute maximum value for scaling
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.views, d.clicks)),
    5
  );

  // Y-axis tick values (0, 25%, 50%, 75%, 100%)
  const yTicks = [
    maxVal,
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0,
  ];

  // Helper to thin out X-axis labels for readability based on data length
  const shouldShowLabel = (idx: number, total: number) => {
    if (total <= 7) return true;
    if (total <= 14) return idx % 2 === 0 || idx === total - 1;
    if (total <= 30) return idx % 5 === 0 || idx === total - 1;
    return idx % 15 === 0 || idx === total - 1;
  };

  const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-5">
      {/* Chart Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Profile Performance
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Daily distribution of profile impressions and link interactions ({rangeLabel})
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-zinc-400 self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-brand-600 dark:bg-brand-500" />
            <span>Profile Views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-500 dark:bg-sky-400" />
            <span>Link Clicks</span>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas with Y-Axis and Tooltip */}
      <div className="relative pt-6">
        {/* Active Tooltip Pill */}
        {hoveredItem && (
          <div className="absolute top-0 right-0 sm:left-1/2 sm:-translate-x-1/2 bg-gray-900 dark:bg-zinc-800 text-white px-3 py-1.5 rounded-lg shadow-card text-xs flex items-center gap-3 z-20 pointer-events-none animate-in fade-in duration-150">
            <span className="font-semibold text-gray-200">
              {hoveredItem.dateStr}
            </span>
            <div className="flex items-center gap-1 text-brand-300">
              <Eye className="w-3 h-3" />
              <span>{hoveredItem.views} views</span>
            </div>
            <div className="flex items-center gap-1 text-sky-300">
              <MousePointerClick className="w-3 h-3" />
              <span>{hoveredItem.clicks} clicks</span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              CTR: {hoveredItem.views > 0 ? ((hoveredItem.clicks / hoveredItem.views) * 100).toFixed(1) : 0}%
            </span>
          </div>
        )}

        {/* Grid and Bars Area */}
        <div className="flex h-48 sm:h-56">
          {/* Y-Axis scale numbers */}
          <div className="flex flex-col justify-between text-[10px] text-gray-400 dark:text-zinc-500 font-mono pr-2 select-none h-full pb-6">
            {yTicks.map((val, i) => (
              <span key={i} className="leading-none">
                {val}
              </span>
            ))}
          </div>

          {/* Grid lines and Bars Container */}
          <div className="flex-1 flex flex-col h-full relative">
            {/* Subtle horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              {yTicks.map((_, i) => (
                <div
                  key={i}
                  className="w-full border-b border-gray-100 dark:border-zinc-800/80"
                />
              ))}
            </div>

            {/* Bars */}
            <div className="flex-1 flex items-end gap-1 sm:gap-2 pb-6 z-10">
              {data.map((item, idx) => {
                const viewHeightPct = Math.round((item.views / maxVal) * 100);
                const clickHeightPct = Math.round((item.clicks / maxVal) * 100);
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="flex-1 h-full flex items-end justify-center gap-0.5 sm:gap-1 cursor-pointer group relative"
                  >
                    {/* Views Bar */}
                    <div
                      className={`w-full max-w-[14px] rounded-t-sm transition-all duration-150 ${
                        isHovered
                          ? "bg-brand-700 dark:bg-brand-400 opacity-100"
                          : "bg-brand-600 dark:bg-brand-500 hover:opacity-90"
                      }`}
                      style={{
                        height: `${Math.max(viewHeightPct, 3)}%`,
                      }}
                    />

                    {/* Clicks Bar */}
                    <div
                      className={`w-full max-w-[14px] rounded-t-sm transition-all duration-150 ${
                        isHovered
                          ? "bg-sky-600 dark:bg-sky-300 opacity-100"
                          : "bg-sky-500 dark:bg-sky-400 hover:opacity-90"
                      }`}
                      style={{
                        height: `${Math.max(clickHeightPct, 3)}%`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Date Labels */}
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between text-[10px] text-gray-400 dark:text-zinc-500 select-none pt-1 border-t border-gray-200 dark:border-zinc-800">
              {data.map((item, idx) => (
                <span
                  key={idx}
                  className={`truncate text-center ${
                    shouldShowLabel(idx, data.length) ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ width: `${100 / data.length}%` }}
                >
                  {item.dateStr}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Table for Screen Readers */}
      <table className="sr-only">
        <caption>Daily Profile Views and Clicks</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Views</th>
            <th scope="col">Clicks</th>
            <th scope="col">CTR</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.dateStr}</td>
              <td>{row.views}</td>
              <td>{row.clicks}</td>
              <td>
                {row.views > 0
                  ? ((row.clicks / row.views) * 100).toFixed(1)
                  : 0}
                %
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
