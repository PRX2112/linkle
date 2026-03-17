import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const { isVisible } = await req.json();

    const link = await prisma.socialLink.update({
      where: { id, userId: session.user.id },
      data: { isVisible },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error("Toggle failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
