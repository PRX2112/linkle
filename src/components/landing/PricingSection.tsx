"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { PLANS, PlanTier, BillingInterval } from "@/lib/billing/plans";

export default function PricingSection() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-gray-50/70 dark:bg-zinc-900/40 border-t border-gray-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-4">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Simple, Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Start free. Upgrade when you need more.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            No credit card required to get started. Zero platform fees on your peer-to-peer UPI payments forever.
          </p>

          {/* Billing Interval Toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="p-1 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 inline-flex items-center gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setInterval("monthly")}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  interval === "monthly"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInterval("yearly")}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  interval === "yearly"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>Yearly</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                  Save ~27%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {PLANS.STARTER.displayName}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                  {PLANS.STARTER.badge}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                {PLANS.STARTER.description}
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$0</span>
                <span className="text-xs text-gray-500">/ forever</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800/80 mb-8">
                {PLANS.STARTER.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-3 rounded-xl border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900 font-semibold text-xs text-center text-gray-900 dark:text-white transition-colors block"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-brand-500 shadow-lg relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>{PLANS.PRO.badge}</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {PLANS.PRO.displayName}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                {PLANS.PRO.description}
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  ${interval === "yearly" ? PLANS.PRO.price.yearly : PLANS.PRO.price.monthly}
                </span>
                <span className="text-xs text-gray-500">
                  {interval === "yearly" ? "/ year" : "/ month"}
                </span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800/80 mb-8">
                {PLANS.PRO.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs text-center transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Get Started with Pro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {PLANS.ENTERPRISE.displayName}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                  {PLANS.ENTERPRISE.badge}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                {PLANS.ENTERPRISE.description}
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  ${interval === "yearly" ? PLANS.ENTERPRISE.price.yearly : PLANS.ENTERPRISE.price.monthly}
                </span>
                <span className="text-xs text-gray-500">
                  {interval === "yearly" ? "/ year" : "/ month"}
                </span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800/80 mb-8">
                {PLANS.ENTERPRISE.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-3 rounded-xl border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900 font-semibold text-xs text-center text-gray-900 dark:text-white transition-colors block"
            >
              Get Enterprise
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
