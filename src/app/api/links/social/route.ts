import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { SocialLinkCreateSchema } from "@/lib/validation";
import { revalidateProfile } from "@/lib/cache";

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

  try {
    const body = await req.json();
    const validation = SocialLinkCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { platform, url, label } = validation.data;

    const count = await prisma.socialLink.count({ where: { userId: session.user.id } });
    const link = await prisma.socialLink.create({ data: { userId: session.user.id, platform, url, label, order: count } });

    revalidateProfile(session.user.username);

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Create social link failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

