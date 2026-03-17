import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { links } = await req.json();
    if (!links || !Array.isArray(links)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Wrap in a transaction
    const updates = links.map((link: { id: string; order: number }) =>
      prisma.socialLink.update({
        where: { id: link.id, userId: session.user.id },
        data: { order: link.order },
      })
    );

    await prisma.$transaction(updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
