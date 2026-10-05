import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getEffectiveUserPlan,
  getPlanEntitlements,
} from "@/lib/billing/entitlements";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [effective, user, socialCount, businessCount] = await Promise.all([
    getEffectiveUserPlan(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        subscription: true,
      },
    }),
    prisma.socialLink.count({ where: { userId: session.user.id } }),
    prisma.businessLink.count({ where: { userId: session.user.id } }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const entitlements = getPlanEntitlements(effective.plan);
  const totalLinks = socialCount + businessCount;

  // Safe payment method & invoice history retrieval if customer exists and keys are present
  let invoices: Array<{
    id: string;
    number: string | null;
    amount: number;
    currency: string;
    status: string | null;
    date: string;
    pdfUrl: string | null;
    hostedUrl: string | null;
  }> = [];

  let paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null = null;

  const customerId = user.stripeCustomerId || user.subscription?.stripeCustomerId;
  const isStripeConfigured =
    Boolean(process.env.STRIPE_SECRET_KEY) &&
    !process.env.STRIPE_SECRET_KEY?.includes("mock") &&
    Boolean(customerId) &&
    !customerId?.includes("mock");

  if (isStripeConfigured && customerId) {
    try {
      const [invoiceList, pmList] = await Promise.all([
        stripe.invoices.list({ customer: customerId, limit: 5 }),
        stripe.paymentMethods.list({ customer: customerId, type: "card" }),
      ]);

      if (invoiceList.data && invoiceList.data.length > 0) {
        invoices = invoiceList.data.map((inv) => ({
          id: inv.id,
          number: inv.number || null,
          amount: (inv.amount_paid || inv.total || 0) / 100,
          currency: (inv.currency || "USD").toUpperCase(),
          status: inv.status || "paid",
          date: new Date(inv.created * 1000).toISOString(),
          pdfUrl: inv.invoice_pdf || null,
          hostedUrl: inv.hosted_invoice_url || null,
        }));
      }

      if (pmList.data && pmList.data[0]?.card) {
        const card = pmList.data[0].card;
        paymentMethod = {
          brand: card.brand,
          last4: card.last4,
          expMonth: card.exp_month,
          expYear: card.exp_year,
        };
      }
    } catch (stripeErr) {
      // Gracefully continue without throwing 500
      console.warn("[BILLING_SUBSCRIPTION] Stripe lookup notice:", stripeErr);
    }
  }

  return NextResponse.json({
    plan: effective.plan,
    rawPlan: user.plan,
    status: effective.status,
    isPaidActive: effective.isPaidActive,
    interval: user.subscription?.interval || "monthly",
    currentPeriodEnd:
      user.subscription?.currentPeriodEnd || user.stripeCurrentPeriodEnd,
    cancelAtPeriodEnd: user.subscription?.cancelAtPeriodEnd || false,
    hasSubscription: Boolean(user.subscription || user.stripeSubscriptionId),
    entitlements,
    usage: {
      links: {
        used: totalLinks,
        maxAllowed: entitlements.maxLinks,
      },
    },
    paymentMethod,
    invoices,
  });
}
