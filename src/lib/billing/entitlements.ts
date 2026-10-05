import { prisma } from "../db";
import { normalizePlanTier, PlanTier } from "./plans";

export interface EntitlementMatrix {
  maxLinks: number;
  advancedAnalytics: boolean;
  removeBranding: boolean;
  advancedLeads: boolean;
  premiumCustomization: boolean;
  analyticsExport: boolean;
  customDomains: boolean;
}

export const ENTITLEMENTS: Record<PlanTier, EntitlementMatrix> = {
  STARTER: {
    maxLinks: 5,
    advancedAnalytics: false,
    removeBranding: false,
    advancedLeads: false,
    premiumCustomization: false,
    analyticsExport: false,
    customDomains: false,
  },
  PRO: {
    maxLinks: Infinity,
    advancedAnalytics: true,
    removeBranding: true,
    advancedLeads: true,
    premiumCustomization: true,
    analyticsExport: false,
    customDomains: true,
  },
  ENTERPRISE: {
    maxLinks: Infinity,
    advancedAnalytics: true,
    removeBranding: true,
    advancedLeads: true,
    premiumCustomization: true,
    analyticsExport: true,
    customDomains: true,
  },
};

/**
 * Returns the full entitlement matrix for a given plan tier.
 */
export function getPlanEntitlements(rawPlan?: string | null): EntitlementMatrix {
  const tier = normalizePlanTier(rawPlan);
  return ENTITLEMENTS[tier] || ENTITLEMENTS.STARTER;
}

/**
 * Synchronous check whether a plan tier possesses a boolean entitlement.
 */
export function hasEntitlement(
  rawPlan: string | null | undefined,
  feature: keyof Omit<EntitlementMatrix, "maxLinks">
): boolean {
  const entitlements = getPlanEntitlements(rawPlan);
  return Boolean(entitlements[feature]);
}

/**
 * Resolves the authenticated user's actual active plan from the database,
 * considering subscription status (e.g. active, trialing vs canceled/unpaid).
 */
export async function getEffectiveUserPlan(userId: string): Promise<{
  plan: PlanTier;
  status: string;
  isPaidActive: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      subscription: {
        select: {
          plan: true,
          status: true,
          currentPeriodEnd: true,
        },
      },
    },
  });

  if (!user) {
    return { plan: "STARTER", status: "none", isPaidActive: false };
  }

  const sub = user.subscription;
  if (!sub) {
    const fallbackTier = normalizePlanTier(user.plan);
    return {
      plan: fallbackTier,
      status: fallbackTier === "STARTER" ? "free" : "active",
      isPaidActive: fallbackTier !== "STARTER",
    };
  }

  const isPeriodValid =
    !sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > new Date();
  const isActive =
    (sub.status === "active" || sub.status === "trialing") && isPeriodValid;

  if (isActive) {
    const tier = normalizePlanTier(sub.plan);
    return { plan: tier, status: sub.status, isPaidActive: tier !== "STARTER" };
  }

  // Grace period for past_due
  if (sub.status === "past_due" && isPeriodValid) {
    const tier = normalizePlanTier(sub.plan);
    return { plan: tier, status: "past_due", isPaidActive: true };
  }

  // Downgrade to Starter if cancelled, unpaid, or expired
  return { plan: "STARTER", status: sub.status, isPaidActive: false };
}

/**
 * Server-side asynchronous entitlement verification.
 * Always inspects the database to prevent client-side bypasses.
 */
export async function verifyUserEntitlement(
  userId: string,
  feature: keyof Omit<EntitlementMatrix, "maxLinks">
): Promise<{ allowed: boolean; plan: PlanTier }> {
  const effective = await getEffectiveUserPlan(userId);
  const allowed = hasEntitlement(effective.plan, feature);
  return { allowed, plan: effective.plan };
}

/**
 * Server-side check for link quantity allowance.
 */
export async function verifyLinkLimit(
  userId: string
): Promise<{ allowed: boolean; currentCount: number; maxAllowed: number }> {
  const effective = await getEffectiveUserPlan(userId);
  const entitlements = ENTITLEMENTS[effective.plan];

  if (entitlements.maxLinks === Infinity) {
    return { allowed: true, currentCount: 0, maxAllowed: Infinity };
  }

  const [socialCount, businessCount] = await Promise.all([
    prisma.socialLink.count({ where: { userId } }),
    prisma.businessLink.count({ where: { userId } }),
  ]);

  const currentCount = socialCount + businessCount;
  return {
    allowed: currentCount < entitlements.maxLinks,
    currentCount,
    maxAllowed: entitlements.maxLinks,
  };
}
