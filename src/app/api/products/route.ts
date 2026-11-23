import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ProductCreateSchema } from "@/lib/validation";
import { revalidateProfile } from "@/lib/cache";
import { verifyProductLimit } from "@/lib/billing/entitlements";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { sales: true } },
    },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const limitCheck = await verifyProductLimit(session.user.id);
    if (!limitCheck.allowed) {
      const planName = limitCheck.plan === "PRO" ? "Pro" : "Free";
      return NextResponse.json(
        {
          error: `${planName} plan product limit reached (${limitCheck.maxAllowed} active ${
            limitCheck.maxAllowed === 1 ? "product" : "products"
          }). Upgrade your plan to unlock more active products.`,
          upgradeRequired: true,
          maxAllowed: limitCheck.maxAllowed,
          currentActive: limitCheck.currentActive,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = ProductCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, priceInCents, currency, type, fileUrl, isActive } =
      validation.data;

    const count = await prisma.product.count({
      where: { userId: session.user.id },
    });

    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        title,
        description: description || null,
        priceInCents,
        currency: (currency || "USD").toUpperCase(),
        type,
        fileUrl: fileUrl || null,
        isActive: isActive ?? true,
        order: count,
      },
    });

    if (session.user.username) {
      revalidateProfile(session.user.username);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error creating product" },
      { status: 500 }
    );
  }
}

