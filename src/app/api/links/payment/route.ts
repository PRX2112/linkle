import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const links = await prisma.paymentLink.findMany({ where: { userId: session.user.id }, orderBy: { order: "asc" } });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { platform, value } = await req.json();
  if (!platform || !value) return NextResponse.json({ error: "platform and value required" }, { status: 400 });

  const count = await prisma.paymentLink.count({ where: { userId: session.user.id } });
  const link = await prisma.paymentLink.create({ data: { userId: session.user.id, platform, value, order: count } });
  return NextResponse.json(link, { status: 201 });
}
