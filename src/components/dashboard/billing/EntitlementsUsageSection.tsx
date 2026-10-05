"use client";

import { Check, Lock, Layers, BarChart2 } from "lucide-react";
import { EntitlementMatrix } from "@/lib/billing/entitlements";

interface EntitlementsUsageSectionProps {
  plan: string;
  entitlements: EntitlementMatrix;
  usage?: {
    links: {
      used: number;
      maxAllowed: number;
    };
  };
  onUpgradeClick?: () => void;
}

export function EntitlementsUsageSection({
  plan,
  entitlements,
  usage,
  onUpgradeClick,
}: EntitlementsUsageSectionProps) {
  const isStarter = plan.toUpperCase() === "STARTER";
  const linksUsed = usage?.links?.used ?? 0;
  const maxLinks = usage?.links?.maxAllowed ?? (isStarter ? 5 : Infinity);
  const isUnlimitedLinks = maxLinks === Infinity;

  const usagePercent = isUnlimitedLinks
    ? 0
    : Math.min(100, Math.round((linksUsed / maxLinks) * 100));

  // Feature items mapped directly to backend entitlement matrix
  const featureList = [
    {
      name: "Links & Social Blocks",
      description: isUnlimitedLinks ? "Unlimited blocks" : `Up to ${maxLinks} active blocks`,
      active: true,
    },
    {
      name: "Custom Themes & Styling",
      description: "Bio styling, backgrounds, and custom button designs",
      active: true,
    },
    {
      name: "Deep Analytics & CTR Tracking",
      description: "14d, 30d, 90d periods, click-through rates, and device metrics",
      active: Boolean(entitlements.advancedAnalytics),
    },
    {
      name: "Remove Linkle Branding",
      description: "Hide the Linkle watermark badge on your public profile",
      active: Boolean(entitlements.removeBranding),
    },
    {
      name: "Lead & Email Capture",
      description: "Collect audience subscriber emails directly on your page",
      active: Boolean(entitlements.advancedLeads),
    },
    {
      name: "Custom Domains",
      description: "Route your custom apex domain or subdomain to Linkle",
      active: Boolean(entitlements.customDomains),
    },
    {
      name: "Raw Analytics Log Export",
      description: "Download detailed CSVs of raw click and view events",
      active: Boolean(entitlements.analyticsExport),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Usage Overview Card */}
      <div className="md:col-span-1 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            Resource Usage
          </h3>

          <div className="space-y-5">
            {/* Link Count Usage */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  Active Links
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {isUnlimitedLinks ? `${linksUsed} (Unlimited)` : `${linksUsed} / ${maxLinks}`}
                </span>
              </div>
              {!isUnlimitedLinks ? (
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercent >= 100
                        ? "bg-amber-500"
                        : usagePercent >= 80
                        ? "bg-amber-400"
                        : "bg-indigo-600"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              ) : null}
            </div>

            {/* Analytics Retention */}
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-gray-400" />
                  Analytics Window
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {entitlements.advancedAnalytics ? "90 Days" : "7 Days"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isStarter && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onUpgradeClick}
              className="w-full py-2 px-3 rounded-lg border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors"
            >
              Need more links? Upgrade
            </button>
          </div>
        )}
      </div>

      {/* Feature Entitlements Card */}
      <div className="md:col-span-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
          Plan Features & Entitlements
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {featureList.map((item) => (
            <div
              key={item.name}
              className={`p-3 rounded-lg border transition-all ${
                item.active
                  ? "border-gray-200 dark:border-zinc-800 bg-gray-50/40 dark:bg-zinc-800/30"
                  : "border-dashed border-gray-200 dark:border-zinc-800 bg-transparent opacity-60"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`p-1 rounded-md shrink-0 mt-0.5 ${
                    item.active
                      ? "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-400"
                  }`}
                >
                  {item.active ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                    {item.name}
                    {!item.active && (
                      <span className="text-[10px] font-normal text-indigo-600 dark:text-indigo-400">
                        (Pro)
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
