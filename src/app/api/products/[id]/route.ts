import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ProductUpdateSchema } from "@/lib/validation";
import { revalidateProfile } from "@/lib/cache";
import { verifyProductLimit } from "@/lib/billing/entitlements";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.userId !== session.user.id) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await prisma.product.delete({ where: { id } });

  if (session.user.username) {
    revalidateProfile(session.user.username);
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.userId !== session.user.id) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const validation = ProductUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, priceInCents, currency, type, fileUrl, isActive } =
      validation.data;

    // If activating a previously inactive product, verify limit
    if (isActive === true && product.isActive === false) {
      const limitCheck = await verifyProductLimit(session.user.id);
      if (!limitCheck.allowed) {
        return NextResponse.json(
          {
            error: `Product limit reached (${limitCheck.maxAllowed} active products). Upgrade your plan to activate more products.`,
            upgradeRequired: true,
          },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        priceInCents: priceInCents !== undefined ? priceInCents : undefined,
        currency: currency !== undefined ? currency.toUpperCase() : undefined,
        type: type !== undefined ? type : undefined,
        fileUrl: fileUrl !== undefined ? fileUrl : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    if (session.user.username) {
      revalidateProfile(session.user.username);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error updating product" },
      { status: 500 }
    );
  }
}

