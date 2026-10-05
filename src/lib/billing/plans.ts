export type PlanTier = "STARTER" | "PRO" | "ENTERPRISE";
export type BillingInterval = "monthly" | "yearly";

export interface PlanConfig {
  id: PlanTier;
  displayName: string;
  badge?: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  priceIds: {
    monthly: string;
    yearly: string;
  };
  features: string[];
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  STARTER: {
    id: "STARTER",
    displayName: "Starter",
    badge: "Free Forever",
    description: "Perfect for starting your digital identity.",
    price: { monthly: 0, yearly: 0 },
    priceIds: {
      monthly: "price_starter_free",
      yearly: "price_starter_free",
    },
    features: [
      "Up to 5 social and link blocks",
      "Standard bio theme customization",
      "Basic 7-day analytics",
      "Linkle branding on profile",
    ],
  },
  PRO: {
    id: "PRO",
    displayName: "Pro",
    badge: "Most Popular",
    description: "Elevate your brand with premium tools and advanced analytics.",
    price: { monthly: 9, yearly: 79 },
    priceIds: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_pro_monthly",
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "price_pro_yearly",
    },
    features: [
      "Unlimited social & link blocks",
      "Real-time deep analytics (7d, 14d, 30d, 90d)",
      "Full UTM campaign tracking & sources",
      "Remove Linkle watermark/branding",
      "Email subscriber capture module",
      "Priority 24/7 support",
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    displayName: "Enterprise",
    badge: "Best Value",
    description: "Maximum power for large scale creators, teams and businesses.",
    price: { monthly: 29, yearly: 249 },
    priceIds: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "price_enterprise_monthly",
      yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "price_enterprise_yearly",
    },
    features: [
      "Everything in Pro plan",
      "Dedicated account strategist",
      "Exportable raw analytics logs",
      "Priority feature roadmap requests",
      "Team collaboration & enterprise SLA",
    ],
  },
};

/**
 * Normalizes any string representation (e.g. "pro", "Pro", "PRO") into standard PlanTier.
 */
export function normalizePlanTier(rawPlan?: string | null): PlanTier {
  if (!rawPlan) return "STARTER";
  const upper = rawPlan.trim().toUpperCase();
  if (upper === "PRO") return "PRO";
  if (upper === "ENTERPRISE" || upper === "BUSINESS") return "ENTERPRISE";
  return "STARTER";
}

/**
 * Maps a plan and billing interval to the configured Stripe price ID.
 */
export function getStripePriceId(plan: PlanTier, interval: BillingInterval): string {
  const p = PLANS[plan];
  if (!p) return "";
  return interval === "yearly" ? p.priceIds.yearly : p.priceIds.monthly;
}

/**
 * Reverse lookup to identify plan tier from a Stripe Price ID.
 */
export function getPlanFromPriceId(priceId?: string | null): { plan: PlanTier; interval: BillingInterval } {
  if (!priceId) return { plan: "STARTER", interval: "monthly" };

  for (const plan of Object.values(PLANS)) {
    if (plan.priceIds.yearly === priceId) {
      return { plan: plan.id, interval: "yearly" };
    }
    if (plan.priceIds.monthly === priceId) {
      return { plan: plan.id, interval: "monthly" };
    }
  }

  // Fallback heuristic based on price ID naming
  const lower = priceId.toLowerCase();
  if (lower.includes("enterprise") || lower.includes("business")) {
    return { plan: "ENTERPRISE", interval: lower.includes("year") ? "yearly" : "monthly" };
  }
  if (lower.includes("pro")) {
    return { plan: "PRO", interval: lower.includes("year") ? "yearly" : "monthly" };
  }

  return { plan: "STARTER", interval: "monthly" };
}
