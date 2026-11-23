import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { normalizePlanTier } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

function escapeCsv(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
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

    // Check plan entitlement: only Pro / Business / Enterprise allowed
    const normalizedPlan = normalizePlanTier(user.plan);
    const isSubActive =
      user.subscription &&
      (user.subscription.status === "active" || user.subscription.status === "trialing") &&
      (!user.subscription.currentPeriodEnd || new Date(user.subscription.currentPeriodEnd) > new Date()) &&
      normalizePlanTier(user.subscription.plan) !== "STARTER";

    const isProOrBusiness = isSubActive || normalizedPlan === "PRO" || normalizedPlan === "ENTERPRISE";

    if (!isProOrBusiness) {
      return NextResponse.json(
        {
          error:
            "CSV export is available on Pro and Business plans only. Please upgrade your plan to download your subscriber list.",
          upgradeUrl: "/dashboard/monetization",
        },
        { status: 403 }
      );
    }

    // Query all CapturedEmail rows for user
    const subscribers = await prisma.capturedEmail.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        email: true,
        createdAt: true,
      },
    });

    // Format RFC-4180 compliant CSV stream
    const header = "email,subscribedAt\n";
    const body = subscribers
      .map(
        (sub) =>
          `${escapeCsv(sub.email)},${escapeCsv(sub.createdAt.toISOString())}`
      )
      .join("\n");

    const csvContent = header + body;
    const safeUsername = user.username
      ? user.username.replace(/[^a-zA-Z0-9_-]/g, "_")
      : "user";
    const filename = `linkle-subscribers-${safeUsername}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Failed to export subscribers CSV:", error);
    return NextResponse.json(
      { error: "Internal server error exporting subscribers" },
      { status: 500 }
    );
  }
}

