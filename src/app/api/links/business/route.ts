import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";


export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const links = await prisma.businessLink.findMany({ where: { userId: session.user.id }, orderBy: { order: "asc" } });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, url, description, thumbnailUrl } = await req.json();
  if (!title || !url) return NextResponse.json({ error: "title and url required" }, { status: 400 });

  const count = await prisma.businessLink.count({ where: { userId: session.user.id } });
  const link = await prisma.businessLink.create({ data: { userId: session.user.id, title, url, description, thumbnailUrl, order: count } });
  return NextResponse.json(link, { status: 201 });
}
