import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { BillingCheckoutSchema } from "@/lib/validation";
import { normalizePlanTier, PLANS } from "@/lib/billing/plans";
import { getOrCreateStripeCustomer } from "@/lib/billing/subscription";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = BillingCheckoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { plan: rawPlan, interval } = validation.data;
    const plan = normalizePlanTier(rawPlan);

    if (plan === "STARTER") {
      return NextResponse.json(
        { error: "Starter is a free plan; no checkout needed." },
        { status: 400 }
      );
    }

    const planConfig = PLANS[plan];
    const customerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email || "",
      session.user.name
    );

    // Compute base application URL
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const origin = `${protocol}://${host}`;

    // Line items configuration:
    // If a custom Stripe Price ID is configured in environment, use it.
    // Otherwise, generate an on-the-fly recurring price_data object.
    const customPriceId =
      interval === "yearly"
        ? planConfig.priceIds.yearly
        : planConfig.priceIds.monthly;

    const isRealPriceId =
      customPriceId &&
      customPriceId.startsWith("price_") &&
      !customPriceId.includes("mock") &&
      !customPriceId.includes("free");

    let lineItems: any[];

    if (isRealPriceId) {
      lineItems = [{ price: customPriceId, quantity: 1 }];
    } else {
      const amountInCents =
        (interval === "yearly"
          ? planConfig.price.yearly
          : planConfig.price.monthly) * 100;

      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Linkle ${planConfig.displayName} (${interval === "yearly" ? "Annual" : "Monthly"})`,
              description: planConfig.description,
            },
            unit_amount: amountInCents,
            recurring: {
              interval: interval === "yearly" ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ];
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: session.user.id,
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        userId: session.user.id,
        plan: planConfig.displayName,
        interval,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan: planConfig.displayName,
          interval,
        },
      },
      success_url: `${origin}/dashboard/monetization?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/monetization?canceled=true`,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error: any) {
    console.error("Stripe checkout session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
