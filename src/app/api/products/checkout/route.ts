import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { normalizePlanTier } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { productId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            name: true,
            plan: true,
            subscription: {
              select: {
                plan: true,
                status: true,
                currentPeriodEnd: true,
              },
            },
          },
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Product is not available for purchase" },
        { status: 404 }
      );
    }

    // Determine platform fee basis points (Free = 200 bps / 2%, Pro/Business = 0 bps)
    const normalizedPlan = normalizePlanTier(product.user.plan);
    const isSubActive =
      product.user.subscription &&
      (product.user.subscription.status === "active" ||
        product.user.subscription.status === "trialing") &&
      (!product.user.subscription.currentPeriodEnd ||
        new Date(product.user.subscription.currentPeriodEnd) > new Date()) &&
      normalizePlanTier(product.user.subscription.plan) !== "STARTER";

    const isPaid = isSubActive || normalizedPlan === "PRO" || normalizedPlan === "ENTERPRISE";
    const feeBps = isPaid ? 0 : 200;
    const feeAmount = Math.round((product.priceInCents * feeBps) / 10000);

    const sellerName =
      product.user.displayName ||
      product.user.name ||
      product.user.username ||
      "Creator";

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const origin = `${protocol}://${host}`;

    // TODO: When full Stripe Connect onboarding is implemented, use application_fee_amount on destination charges
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            unit_amount: product.priceInCents,
            product_data: {
              name: product.title,
              description: product.description
                ? `${product.description} • Sold by ${sellerName}`
                : `Sold by ${sellerName}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        productId: product.id,
        userId: product.user.id,
        feeBps: feeBps.toString(),
        feeAmount: feeAmount.toString(),
        type: product.type,
      },
      success_url: `${origin}/p/${product.user.username}?purchased=true&productId=${product.id}`,
      cancel_url: `${origin}/p/${product.user.username}?canceled=true`,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Error creating product checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize checkout" },
      { status: 500 }
    );
  }
}

