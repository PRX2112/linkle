"use client";

import { useState } from "react";
import { CircleDollarSign, Check, ExternalLink, Zap, Flame, Crown } from "lucide-react";

export default function MonetizationPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [successUpgrade, setSuccessUpgrade] = useState(false);

  const plans = [
    {
      name: "Starter",
      badge: "Free Forever",
      icon: <Zap className="w-5 h-5 text-purple-500" />,
      desc: "Perfect for starting your digital identity.",
      price: { monthly: 0, yearly: 0 },
      features: [
        "Up to 5 social and link blocks",
        "Standard bio theme customization",
        "Basic static page analytics",
        "Linkle branding on profile",
      ],
      cta: "Current Plan",
      featured: false,
    },
    {
      name: "Pro",
      badge: "Most Popular",
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      desc: "Elevate your brand with premium tools.",
      price: { monthly: 9, yearly: 79 },
      features: [
        "Unlimited social & link blocks",
        "Real-time geolocation analytics",
        "Google & custom domain support",
        "Remove Linkle watermark/branding",
        "Stripe & payment gateway access",
        "Priority 24/7 support",
      ],
      cta: "Upgrade to Pro",
      featured: true,
    },
    {
      name: "Enterprise",
      badge: "Best Value",
      icon: <Crown className="w-5 h-5 text-indigo-500" />,
      desc: "Maximum power for large scale creators.",
      price: { monthly: 29, yearly: 249 },
      features: [
        "Everything in Pro plan",
        "Unlimited custom domains",
        "Custom branding & white labeling",
        "Dedicated account strategist",
        "API access & custom analytics logs",
      ],
      cta: "Contact Sales",
      featured: false,
    },
  ];

  const handleUpgrade = (planName: string) => {
    if (planName === "Starter") return;
    setUpgradingPlan(planName);
    setTimeout(() => {
      setUpgradingPlan(null);
      setSuccessUpgrade(true);
      setTimeout(() => setSuccessUpgrade(false), 5000);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
          Empower Your Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg mt-3 max-w-xl mx-auto">
          Unlock premium branding, custom domains, and real-time deep-dive analytics to scale your audience.
        </p>

        {/* Billing Period Toggle */}
        <div className="mt-8 flex justify-center items-center gap-3">
          <span className={`text-sm font-medium ${billingPeriod === "monthly" ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>Monthly</span>
          <button
            onClick={() => setBillingPeriod(p => p === "monthly" ? "yearly" : "monthly")}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors focus:outline-none"
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingPeriod === "yearly" ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          <span className={`text-sm font-medium flex items-center gap-1.5 ${billingPeriod === "yearly" ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
            Yearly
            <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
              Save 25%
            </span>
          </span>
        </div>
      </div>

      {successUpgrade && (
        <div className="mb-8 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm text-center animate-in fade-in zoom-in duration-300">
          🎉 <strong>Upgrade Successful!</strong> Thank you for scaling with Linkle. Your pro features are now active.
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col justify-between p-8 rounded-3xl border transition-all ${
              p.featured
                ? "bg-gradient-to-b from-purple-500/5 to-indigo-500/5 dark:from-purple-900/10 dark:to-indigo-900/10 border-purple-500 dark:border-purple-600 shadow-xl scale-[1.03] md:-translate-y-2"
                : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:border-gray-200 dark:hover:border-zinc-700"
            }`}
          >
            {p.featured && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-bg text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                {p.badge}
              </span>
            )}

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-zinc-800/80 shadow-inner`}>
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{p.name}</h3>
                  {!p.featured && <span className="text-[10px] text-gray-400 font-semibold uppercase">{p.badge}</span>}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{p.desc}</p>

              <div className="my-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  ${billingPeriod === "monthly" ? p.price.monthly : Math.round(p.price.yearly / 12)}
                </span>
                <span className="text-gray-400 text-sm"> / month</span>
                {billingPeriod === "yearly" && p.price.yearly > 0 && (
                  <p className="text-xs text-green-500 font-semibold mt-1">Billed annually (${p.price.yearly})</p>
                )}
              </div>

              <ul className="space-y-3.5 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade(p.name)}
              disabled={p.name === "Starter" || upgradingPlan !== null}
              className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${
                p.name === "Starter"
                  ? "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 cursor-default"
                  : p.featured
                  ? "gradient-bg text-white hover:opacity-90 hover:scale-[1.02] shadow-glow"
                  : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 hover:scale-[1.02]"
              }`}
            >
              {upgradingPlan === p.name ? "Processing..." : p.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Stripe Notice */}
      <div className="mt-16 text-center text-xs text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <CircleDollarSign className="w-4 h-4 text-purple-500" />
          <span>Transactions secured by <strong>Stripe Checkout</strong></span>
        </div>
        <p className="max-w-md">Payments are made securely under SSL. Cancel subscription at any time instantly from Settings.</p>
      </div>
    </div>
  );
}
