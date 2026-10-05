"use client";

import React from "react";
import { Sparkles, TrendingUp, Smartphone, Globe, CheckCircle2 } from "lucide-react";
import { PeriodComparison, TrafficSourceItem } from "@/lib/analytics/events";

interface AnalyticsInsightsProps {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  topLinks: { name: string; clicks: number; pct: number }[];
  devices: { label: string; value: number }[];
  trafficSources: TrafficSourceItem[];
  comparison?: PeriodComparison;
}

export function AnalyticsInsights({
  totalViews,
  totalClicks,
  ctr,
  topLinks,
  devices,
  trafficSources,
  comparison,
}: AnalyticsInsightsProps) {
  // If zero views or clicks, no insights to generate
  if (totalViews === 0 && totalClicks === 0) return null;

  const insights: { icon: React.ComponentType<any>; text: string }[] = [];

  // 1. Top performing link insight
  if (topLinks.length > 0 && topLinks[0].clicks > 0) {
    const top = topLinks[0];
    insights.push({
      icon: TrendingUp,
      text: `"${top.name}" is your leading link, generating ${top.clicks.toLocaleString()} clicks (${top.pct}% of total clicks).`,
    });
  }

  // 2. Primary device category insight
  const mobileDevice = devices.find((d) => d.label.toLowerCase() === "mobile");
  if (mobileDevice && mobileDevice.value >= 50) {
    insights.push({
      icon: Smartphone,
      text: `Mobile is your dominant visitor platform at ${mobileDevice.value}% of all traffic.`,
    });
  } else if (devices.length > 0) {
    const topDev = [...devices].sort((a, b) => b.value - a.value)[0];
    if (topDev && topDev.value > 0) {
      insights.push({
        icon: Smartphone,
        text: `${topDev.label} devices account for ${topDev.value}% of visitor sessions.`,
      });
    }
  }

  // 3. Traffic source insight
  if (trafficSources.length > 0 && trafficSources[0].count > 0) {
    const topSrc = trafficSources[0];
    if (topSrc.name !== "Direct / Bio Link") {
      insights.push({
        icon: Globe,
        text: `${topSrc.name} drives the highest share of external referrals (${topSrc.pct}% of visits).`,
      });
    } else if (trafficSources.length > 1 && trafficSources[1].count > 0) {
      const secondSrc = trafficSources[1];
      insights.push({
        icon: Globe,
        text: `${secondSrc.name} is your top external referral channel with ${secondSrc.pct}% of traffic.`,
      });
    }
  }

  // 4. Period comparison insight
  if (comparison?.viewsChangePct !== null && comparison?.viewsChangePct !== undefined) {
    if (comparison.viewsChangePct > 0) {
      insights.push({
        icon: CheckCircle2,
        text: `Profile views increased by ${comparison.viewsChangePct}% compared to the previous period.`,
      });
    } else if (comparison.viewsChangePct < 0) {
      insights.push({
        icon: TrendingUp,
        text: `Views are down ${Math.abs(comparison.viewsChangePct)}% vs the prior period. Try sharing fresh updates.`,
      });
    }
  } else if (ctr > 20) {
    insights.push({
      icon: CheckCircle2,
      text: `Your profile has an engagement rate of ${ctr}%, reflecting active visitor interest.`,
    });
  }

  if (insights.length === 0) return null;

  return (
    <div className="bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40 rounded-xl p-4 sm:p-4.5 shadow-subtle">
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        <h3 className="text-xs font-semibold text-brand-900 dark:text-brand-200 uppercase tracking-wider">
          Key Performance Observations
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-zinc-300">
        {insights.slice(0, 4).map((ins, i) => {
          const Icon = ins.icon;
          return (
            <div key={i} className="flex items-start gap-2">
              <Icon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{ins.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
