"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { CurrentPlanHero } from "@/components/dashboard/billing/CurrentPlanHero";
import { EntitlementsUsageSection } from "@/components/dashboard/billing/EntitlementsUsageSection";
import { PaymentMethodSection } from "@/components/dashboard/billing/PaymentMethodSection";
import { BillingHistorySection } from "@/components/dashboard/billing/BillingHistorySection";
import { UpgradePlansSection } from "@/components/dashboard/billing/UpgradePlansSection";
import { EntitlementMatrix, ENTITLEMENTS } from "@/lib/billing/entitlements";
import { BillingInterval } from "@/lib/billing/plans";

interface SubscriptionPayload {
  plan: string;
  rawPlan: string;
  status: string;
  isPaidActive: boolean;
  interval: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasSubscription: boolean;
  entitlements: EntitlementMatrix;
  usage?: {
    links: {
      used: number;
      maxAllowed: number;
    };
  };
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  invoices?: Array<{
    id: string;
    number: string | null;
    amount: number;
    currency: string;
    status: string | null;
    date: string;
    pdfUrl: string | null;
    hostedUrl: string | null;
  }>;
}

export default function MonetizationPage() {
  const searchParams = useSearchParams();
  const upgradeSectionRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subData, setSubData] = useState<SubscriptionPayload | null>(null);

  const [portalLoading, setPortalLoading] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const isSuccess = searchParams?.get("success") === "true";
  const isCanceled = searchParams?.get("canceled") === "true";

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/billing/subscription");
      if (!res.ok) {
        throw new Error("Unable to retrieve subscription information.");
      }
      const data: SubscriptionPayload = await res.json();
      setSubData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load billing status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    setActionError("");

    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "We couldn't open subscription management.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Missing portal redirect link.");
      }
    } catch (err: any) {
      setActionError(err.message || "Unable to launch Customer Portal. Please try again.");
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async (planName: string, interval: BillingInterval) => {
    setUpgradingPlan(planName);
    setActionError("");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planName,
          interval,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize checkout.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Missing checkout destination URL.");
      }
    } catch (err: any) {
      setActionError(err.message || "Checkout could not be initialized.");
      setUpgradingPlan(null);
    }
  };

  const scrollToUpgrade = () => {
    upgradeSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Billing & Plans
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your subscription, entitlements, and payment details.
        </p>
      </div>

      {/* Return from Stripe Checkout feedback banners */}
      {isSuccess && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Subscription updated successfully! Your premium features and elevated limits are now active.
          </span>
        </div>
      )}

      {isCanceled && (
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-gray-500" />
          <span>Checkout was canceled. No charges were made to your account.</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-44 rounded-xl bg-gray-100 dark:bg-zinc-800" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 rounded-xl bg-gray-100 dark:bg-zinc-800" />
            <div className="md:col-span-2 h-48 rounded-xl bg-gray-100 dark:bg-zinc-800" />
          </div>
          <div className="h-64 rounded-xl bg-gray-100 dark:bg-zinc-800" />
        </div>
      ) : error ? (
        /* Error State */
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchSubscription}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </button>
        </div>
      ) : subData ? (
        <>
          {/* Current Plan Hero */}
          <section aria-labelledby="current-plan-heading">
            <CurrentPlanHero
              plan={subData.plan}
              status={subData.status}
              isPaidActive={subData.isPaidActive}
              interval={subData.interval}
              currentPeriodEnd={subData.currentPeriodEnd}
              cancelAtPeriodEnd={subData.cancelAtPeriodEnd}
              onManagePortal={handleOpenPortal}
              portalLoading={portalLoading}
              onUpgradeClick={scrollToUpgrade}
            />
          </section>

          {/* Usage & Entitlements Section */}
          <section aria-labelledby="entitlements-heading">
            <EntitlementsUsageSection
              plan={subData.plan}
              entitlements={subData.entitlements || ENTITLEMENTS.STARTER}
              usage={subData.usage}
              onUpgradeClick={scrollToUpgrade}
            />
          </section>

          {/* Payment Method (rendered only if real card data is available) */}
          {subData.paymentMethod && (
            <section aria-labelledby="payment-method-heading">
              <PaymentMethodSection
                paymentMethod={subData.paymentMethod}
                onManagePortal={handleOpenPortal}
                portalLoading={portalLoading}
              />
            </section>
          )}

          {/* Billing History / Invoices */}
          {(subData.isPaidActive || (subData.invoices && subData.invoices.length > 0)) && (
            <section aria-labelledby="invoices-heading">
              <BillingHistorySection invoices={subData.invoices || []} />
            </section>
          )}

          {/* Upgrade & Plan Comparison Section */}
          <section ref={upgradeSectionRef} aria-labelledby="plans-heading" className="pt-2">
            <UpgradePlansSection
              currentPlan={subData.plan}
              isPaidActive={subData.isPaidActive}
              onUpgrade={handleUpgrade}
              upgradingPlan={upgradingPlan}
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
