"use client";

import React from "react";
import { Layers, Mail, Smartphone, Share2, PhoneCall } from "lucide-react";
import { ConversionMetrics, FunnelStage } from "@/lib/analytics/events";

interface ConversionFunnelProps {
  funnel: FunnelStage[];
  conversionMetrics: ConversionMetrics;
}

export function ConversionFunnel({
  funnel,
  conversionMetrics,
}: ConversionFunnelProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 dark:border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Visitor Engagement & Conversions
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Progression from impression to intent actions
          </p>
        </div>
      </div>

      {/* 3-Stage Visual Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {funnel.map((stage, idx) => (
          <div
            key={stage.name}
            className="p-4 rounded-lg bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-200/60 dark:border-zinc-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  Stage {idx + 1}
                </span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded shadow-subtle border border-gray-200/60 dark:border-zinc-700">
                  {stage.percentage}%
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {stage.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                {stage.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-zinc-700/50">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                  {stage.count.toLocaleString()}
                </span>
                {idx > 0 && stage.dropoffPercentage > 0 && (
                  <span className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
                    {stage.dropoffPercentage}% dropoff
                  </span>
                )}
              </div>

              <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-zinc-700 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-600 dark:bg-brand-500"
                  style={{ width: `${Math.max(stage.percentage, 2)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key High-Intent Metric Cards */}
      <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
          High-Intent Conversion Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Email capture */}
          <div className="p-3 rounded-lg border border-gray-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 text-xs mb-1">
              <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Subscribers</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {conversionMetrics.emailConversion.count.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
              {conversionMetrics.emailConversion.rate}% conversion
            </p>
          </div>

          {/* UPI actions */}
          <div className="p-3 rounded-lg border border-gray-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 text-xs mb-1">
              <Smartphone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>UPI Payments</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {conversionMetrics.upiInteractions.total.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
              {conversionMetrics.upiInteractions.opened} app opens
            </p>
          </div>

          {/* Contact / Bookings */}
          <div className="p-3 rounded-lg border border-gray-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 text-xs mb-1">
              <PhoneCall className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Contact / Book</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {conversionMetrics.contactActions.total.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
              {conversionMetrics.contactActions.saved} vCard saves
            </p>
          </div>

          {/* Profile Shares */}
          <div className="p-3 rounded-lg border border-gray-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400 text-xs mb-1">
              <Share2 className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
              <span>Profile Shares</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {conversionMetrics.profileShares.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
              Shared to others
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
