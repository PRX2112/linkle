import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getPlanFromPriceId, normalizePlanTier, PlanTier } from "./plans";

/**
 * Retrieves existing Stripe Customer ID or creates a new one in Stripe and saves it.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
      subscription: { select: { stripeCustomerId: true } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const existingCustomerId =
    user.stripeCustomerId || user.subscription?.stripeCustomerId;

  if (existingCustomerId) {
    return existingCustomerId;
  }

  // Create new customer in Stripe
  const customer = await stripe.customers.create({
    email: email || user.email || undefined,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  // Persist customer ID to user and subscription table
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    }),
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: customer.id,
        status: "incomplete",
        plan: "STARTER",
      },
      update: {
        stripeCustomerId: customer.id,
      },
    }),
  ]);

  return customer.id;
}

/**
 * Synchronizes a Stripe Subscription object with the local database.
 */
export async function syncStripeSubscription(
  subscriptionOrId: string | any
): Promise<any> {
  let sub = subscriptionOrId;
  if (typeof subscriptionOrId === "string") {
    sub = await stripe.subscriptions.retrieve(subscriptionOrId);
  }

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const subscriptionId = sub.id;
  const status = sub.status; // active, trialing, past_due, canceled, unpaid, incomplete, etc.
  const priceId = sub.items?.data?.[0]?.price?.id || null;

  // Determine plan and interval
  const metaPlan = sub.metadata?.plan ? normalizePlanTier(sub.metadata.plan) : null;
  const resolved = getPlanFromPriceId(priceId);
  const planTier: PlanTier = metaPlan || resolved.plan;
  const interval = sub.items?.data?.[0]?.price?.recurring?.interval || resolved.interval;

  const currentPeriodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : null;
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : null;
  const cancelAtPeriodEnd = Boolean(sub.cancel_at_period_end);
  const canceledAt = sub.canceled_at ? new Date(sub.canceled_at * 1000) : null;
  const trialStart = sub.trial_start ? new Date(sub.trial_start * 1000) : null;
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

  // Locate the user
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { stripeCustomerId: customerId },
        { stripeSubscriptionId: subscriptionId },
        { id: sub.metadata?.userId },
      ],
    },
    select: { id: true, plan: true },
  });

  if (!user) {
    console.warn(`⚠️ syncStripeSubscription: No matching user found for customer ${customerId}`);
    return null;
  }

  const userId = user.id;

  // Status mapping: determine effective plan
  const isInactive = ["canceled", "unpaid", "incomplete_expired"].includes(status);
  const effectivePlanName = isInactive
    ? "Starter"
    : planTier === "ENTERPRISE"
    ? "Enterprise"
    : "Pro";

  // Upsert subscription record and synchronize User model
  const [updatedSub] = await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        status,
        plan: isInactive ? "STARTER" : planTier,
        interval,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        canceledAt,
        trialStart,
        trialEnd,
      },
      update: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        status,
        plan: isInactive ? "STARTER" : planTier,
        interval,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        canceledAt,
        trialStart,
        trialEnd,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        plan: effectivePlanName,
        stripeCustomerId: customerId,
        stripeSubscriptionId: isInactive ? null : subscriptionId,
        stripePriceId: isInactive ? null : priceId,
        stripeCurrentPeriodEnd: isInactive ? null : currentPeriodEnd,
      },
    }),
  ]);

  return updatedSub;
}

/**
 * Handles subscription deletion/cancellation in Stripe.
 */
export async function handleSubscriptionDeleted(subscriptionId: string, customerId?: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId: subscriptionId },
        ...(customerId ? [{ stripeCustomerId: customerId }] : []),
      ],
    },
    select: { id: true },
  });

  if (!user) return null;

  await prisma.$transaction([
    prisma.subscription.updateMany({
      where: { userId: user.id },
      data: {
        status: "canceled",
        plan: "STARTER",
        cancelAtPeriodEnd: false,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "Starter",
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      },
    }),
  ]);
}
