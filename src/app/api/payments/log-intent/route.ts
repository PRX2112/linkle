import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePlanTier } from "@/lib/billing/plans";
import { checkRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting (same sliding window configuration as /api/subscribe)
    const ip =
      req.headers.get("x-real-ip")?.trim() ||
      req.headers.get("cf-connecting-ip")?.trim() ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      (req as any).ip ||
      "127.0.0.1";

    const rateLimit = await checkRateLimit(ip, "subscribe");
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many payment intent attempts. Please slow down." },
        { status: 429 }
      );
    }

    // 2. Parse and Validate Request Payload
    const body = await req.json().catch(() => ({}));
    const { userId, amount } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid userId" },
        { status: 400 }
      );
    }

    // 3. Lookup User Profile and Current Plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Calculate Fee Basis Points: Free tier = 200 bps (2%), Pro/Business = 0 bps (0%)
    const normalized = normalizePlanTier(user.plan);
    const isSubActive =
      user.subscription &&
      (user.subscription.status === "active" || user.subscription.status === "trialing") &&
      (!user.subscription.currentPeriodEnd || new Date(user.subscription.currentPeriodEnd) > new Date()) &&
      normalizePlanTier(user.subscription.plan) !== "STARTER";

    const isPaid = isSubActive || normalized === "PRO" || normalized === "ENTERPRISE";
    const feeBps = isPaid ? 0 : 200;

    const parsedAmount =
      typeof amount === "number" && !isNaN(amount) && amount > 0
        ? amount
        : null;

    // 5. Persist PaymentEvent
    const paymentEvent = await prisma.paymentEvent.create({
      data: {
        userId: user.id,
        amount: parsedAmount,
        feeBps,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: paymentEvent.id,
        feeBps,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error logging payment intent:", error);
    return NextResponse.json(
      { error: "Failed to record payment intent" },
      { status: 500 }
    );
  }
}
