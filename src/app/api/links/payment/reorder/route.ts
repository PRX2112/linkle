import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { LinkReorderSchema } from "@/lib/validation";
import { revalidateProfile } from "@/lib/cache";

export const dynamic = "force-dynamic";


export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validation = LinkReorderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { links } = validation.data;

    const updates = links.map((link: { id: string; order: number }) =>
      prisma.paymentLink.update({
        where: { id: link.id, userId: session.user.id },
        data: { order: link.order },
      })
    );

    await prisma.$transaction(updates);

    revalidateProfile(session.user.username);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


