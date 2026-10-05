"use client";

import { Sparkles, Calendar, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

interface CurrentPlanHeroProps {
  plan: string; // STARTER, PRO, ENTERPRISE
  status: string;
  isPaidActive: boolean;
  interval: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  onManagePortal: () => void;
  portalLoading: boolean;
  onUpgradeClick?: () => void;
}

export function CurrentPlanHero({
  plan,
  status,
  isPaidActive,
  interval,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  onManagePortal,
  portalLoading,
  onUpgradeClick,
}: CurrentPlanHeroProps) {
  const normalizedPlan = (plan || "STARTER").toUpperCase();
  const isStarter = normalizedPlan === "STARTER";
  const isPastDue = status === "past_due";

  // Format renewal or expiration date
  const formattedDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Plan price display
  const priceDisplay = isStarter
    ? "Free forever"
    : normalizedPlan === "PRO"
    ? interval === "yearly" || interval === "year"
      ? "$79 / year"
      : "$9 / month"
    : interval === "yearly" || interval === "year"
    ? "$249 / year"
    : "$29 / month";

  // Human-readable status description
  let statusText = "Active";
  let statusBadgeStyle = "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border-green-200 dark:border-green-800";
  let descriptionText = "Your subscription is active and renews automatically.";

  if (isStarter) {
    statusText = "Free Plan";
    statusBadgeStyle = "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 border-gray-200 dark:border-zinc-700";
    descriptionText = "You are currently on the Linkle Free plan.";
  } else if (cancelAtPeriodEnd) {
    statusText = "Cancels soon";
    statusBadgeStyle = "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    descriptionText = formattedDate
      ? `Your subscription will cancel on ${formattedDate}. You retain full access until then.`
      : "Your subscription is scheduled to cancel at the end of the billing period.";
  } else if (isPastDue) {
    statusText = "Payment past due";
    statusBadgeStyle = "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800";
    descriptionText = "Your last payment was unsuccessful. Please update your payment method to maintain access.";
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-sm">
      {/* Alert banner for past_due */}
      {isPastDue && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Payment needs attention</p>
            <p>Your subscription may lose access if payment is not updated. Update your card securely in the Customer Portal.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Current Plan
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadgeStyle}`}
            >
              {statusText}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {normalizedPlan === "PRO" ? "Linkle Pro" : normalizedPlan === "ENTERPRISE" ? "Linkle Enterprise" : "Linkle Starter"}
            </h2>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {priceDisplay}
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {descriptionText}
          </p>

          {formattedDate && !isStarter && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {cancelAtPeriodEnd ? "Access ends:" : "Next billing date:"}{" "}
                <strong className="text-gray-700 dark:text-gray-200">{formattedDate}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex flex-col sm:items-end gap-2">
          {isPaidActive ? (
            <button
              type="button"
              onClick={onManagePortal}
              disabled={portalLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-750 text-xs font-semibold text-gray-800 dark:text-gray-100 shadow-sm transition-colors"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Opening portal...</span>
                </>
              ) : (
                <>
                  <span>Manage subscription</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade to Pro</span>
            </button>
          )}
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {isPaidActive ? "Invoices & billing managed in Stripe" : "Unlock unlimited links & analytics"}
          </span>
        </div>
      </div>
    </div>
  );
}
