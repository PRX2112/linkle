import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";


export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const link = await prisma.businessLink.findUnique({ where: { id } });
  if (!link || link.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.businessLink.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const link = await prisma.businessLink.findUnique({ where: { id } });
  if (!link || link.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const { title, url, description, thumbnailUrl, startDate, endDate, featured } = await req.json();

    const updatedLink = await prisma.businessLink.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        url: url !== undefined ? url : undefined,
        description: description !== undefined ? description : undefined,
        thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : undefined,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        featured: featured !== undefined ? featured : undefined,
      },
    });

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error("Failed to update business link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
