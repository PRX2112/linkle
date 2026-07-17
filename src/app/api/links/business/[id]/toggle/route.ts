import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { LinkToggleSchema } from "@/lib/validation";
import { revalidateProfile } from "@/lib/cache";

export const dynamic = "force-dynamic";


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const validation = LinkToggleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { isVisible } = validation.data;

    const link = await prisma.businessLink.update({
      where: { id, userId: session.user.id },
      data: { isVisible },
    });

    revalidateProfile(session.user.username);

    return NextResponse.json(link);
  } catch (error) {
    console.error("Toggle failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


