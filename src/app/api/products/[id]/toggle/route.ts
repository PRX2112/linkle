import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ProductToggleSchema } from "@/lib/validation";
import { revalidateProfile } from "@/lib/cache";
import { verifyProductLimit } from "@/lib/billing/entitlements";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product || product.userId !== session.user.id) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const validation = ProductToggleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { isActive } = validation.data;

    // Check limit if turning on
    if (isActive && !product.isActive) {
      const limitCheck = await verifyProductLimit(session.user.id);
      if (!limitCheck.allowed) {
        return NextResponse.json(
          {
            error: `Active product limit reached (${limitCheck.maxAllowed} products). Upgrade your plan to activate this product.`,
            upgradeRequired: true,
          },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.product.update({
      where: { id, userId: session.user.id },
      data: { isActive },
    });

    if (session.user.username) {
      revalidateProfile(session.user.username);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error toggling product status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

