import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const link = await prisma.businessLink.findUnique({ where: { id } });
  if (!link || link.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.businessLink.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
