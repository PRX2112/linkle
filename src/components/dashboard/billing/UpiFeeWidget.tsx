"use client";

import { Smartphone, Zap, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

interface UpiFeeWidgetProps {
  feeRate: string;
  feeBps: number;
  monthlyIntentsCount: number;
  isPaidActive: boolean;
  onUpgradeClick?: () => void;
}

export function UpiFeeWidget({
  feeRate,
  feeBps,
  monthlyIntentsCount,
  isPaidActive,
  onUpgradeClick,
}: UpiFeeWidgetProps) {
  const isZeroFee = feeBps === 0 || isPaidActive;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              UPI Platform Fees & Payment Activity
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Direct Linkle Pay UPI activity and your creator fee tier.
            </p>
          </div>
        </div>

        {isZeroFee ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-semibold self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span>0% Fee Tier (Pro Benefit)</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold self-start sm:self-auto">
            <span>Free Tier • 2% Fee Notice</span>
          </div>
        )}
      </div>

      {/* Two Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Platform Fee Rate */}
        <div className="p-4.5 rounded-xl bg-gray-50 dark:bg-zinc-850 border border-gray-200/70 dark:border-zinc-800 flex flex-col justify-between space-y-3 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Creator Platform Fee
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                isZeroFee
                  ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                  : "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {feeRate || (isZeroFee ? "0%" : "2.0%")}
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {isZeroFee ? "0%" : "2.0%"}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              {isZeroFee
                ? "Your Pro plan unlocks 0% platform fee. All payments go 100% to your account with zero fee notice."
                : "Visitors on Free profiles see a 2% Linkle service fee notice on the payment modal."}
            </p>
          </div>

          {!isZeroFee && onUpgradeClick && (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors self-start"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade to Pro to remove fee notice</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Card 2: Monthly Payment Intents */}
        <div className="p-4.5 rounded-xl bg-gray-50 dark:bg-zinc-850 border border-gray-200/70 dark:border-zinc-800 flex flex-col justify-between space-y-3 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Payment Intents (This Month)
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active</span>
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {monthlyIntentsCount}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              Logged UPI pay attempts and QR scans by visitors on your Linkle profile during the current calendar month.
            </p>
          </div>

          <div className="text-[11px] text-gray-400 dark:text-gray-500 pt-1">
            Logged automatically via deep link and QR usage.
          </div>
        </div>
      </div>
    </div>
  );
}

