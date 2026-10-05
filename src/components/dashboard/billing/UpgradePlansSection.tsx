"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, Shield, Zap } from "lucide-react";
import { PLANS, PlanTier, BillingInterval } from "@/lib/billing/plans";

interface UpgradePlansSectionProps {
  currentPlan: string;
  isPaidActive: boolean;
  onUpgrade: (plan: string, interval: BillingInterval) => Promise<void>;
  upgradingPlan: string | null;
}

export function UpgradePlansSection({
  currentPlan,
  isPaidActive,
  onUpgrade,
  upgradingPlan,
}: UpgradePlansSectionProps) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const normalizedCurrent = currentPlan.toUpperCase() as PlanTier;

  const planTiers: PlanTier[] = ["STARTER", "PRO", "ENTERPRISE"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Available Plans
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Choose the tier that matches your audience and brand scale.
          </p>
        </div>

        {/* Billing Interval Toggle */}
        <div className="inline-flex items-center p-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              interval === "monthly"
                ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white font-semibold shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              interval === "yearly"
                ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white font-semibold shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span>Annual</span>
            <span className="px-1.5 py-0.2 rounded bg-green-100 dark:bg-green-900/40 text-[10px] font-bold text-green-700 dark:text-green-300">
              Save ~25%
            </span>
          </button>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {planTiers.map((tier) => {
          const config = PLANS[tier];
          const isCurrent = normalizedCurrent === tier;
          const isPro = tier === "PRO";
          const isEnterprise = tier === "ENTERPRISE";

          const monthlyPrice =
            tier === "STARTER"
              ? 0
              : interval === "yearly"
              ? Math.round(config.price.yearly / 12)
              : config.price.monthly;

          const billedNote =
            interval === "yearly" && config.price.yearly > 0
              ? `Billed annually ($${config.price.yearly})`
              : "Billed monthly";

          return (
            <div
              key={tier}
              className={`rounded-xl border p-6 flex flex-col justify-between transition-all ${
                isCurrent
                  ? "border-green-300 dark:border-green-800 bg-green-50/15 dark:bg-green-950/10 shadow-xs"
                  : isPro
                  ? "border-indigo-300 dark:border-indigo-800 bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-indigo-500/20"
                  : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {tier === "STARTER" && <Zap className="w-4 h-4 text-gray-500" />}
                    {tier === "PRO" && <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    {tier === "ENTERPRISE" && <Shield className="w-4 h-4 text-gray-700 dark:text-gray-300" />}
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                      {config.displayName}
                    </h4>
                  </div>
                  {isCurrent ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300">
                      Current
                    </span>
                  ) : isPro ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                      Popular
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 min-h-[32px] leading-relaxed">
                  {config.description}
                </p>

                <div className="my-5 pb-5 border-b border-gray-100 dark:border-zinc-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      ${monthlyPrice}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      / month
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                    {tier === "STARTER" ? "Free for everyone" : billedNote}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-6 text-xs text-gray-600 dark:text-gray-300">
                  {config.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-default"
                  >
                    Active Plan
                  </button>
                ) : tier === "STARTER" ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 text-xs font-semibold text-gray-400 cursor-default"
                  >
                    Included
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onUpgrade(config.displayName, interval)}
                    disabled={upgradingPlan !== null}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 ${
                      isPro
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    {upgradingPlan === config.displayName ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Redirecting to checkout...</span>
                      </>
                    ) : (
                      <span>Upgrade to {config.displayName}</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-2 text-[11px] text-gray-400 dark:text-gray-500">
        Transactions are securely processed with 256-bit encryption by Stripe. Cancel or modify anytime.
      </div>
    </div>
  );
}
