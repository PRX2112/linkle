import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { getOrCreateStripeCustomer } from "@/lib/billing/subscription";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const customerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email || "",
      session.user.name
    );

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const origin = `${protocol}://${host}`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/monetization`,
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error: any) {
    console.error("Customer billing portal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create customer portal session" },
      { status: 500 }
    );
  }
}
