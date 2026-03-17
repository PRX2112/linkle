import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";


export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const links = await prisma.socialLink.findMany({ where: { userId: session.user.id }, orderBy: { order: "asc" } });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { platform, url, label } = await req.json();
  if (!platform || !url) return NextResponse.json({ error: "platform and url required" }, { status: 400 });

  const count = await prisma.socialLink.count({ where: { userId: session.user.id } });
  const link = await prisma.socialLink.create({ data: { userId: session.user.id, platform, url, label, order: count } });
  return NextResponse.json(link, { status: 201 });
}
