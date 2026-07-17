import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { SocialLinkUpdateSchema } from "@/lib/validation";
import { revalidateProfile } from "@/lib/cache";

export const dynamic = "force-dynamic";


export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const link = await prisma.socialLink.findUnique({ where: { id } });
  if (!link || link.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.socialLink.delete({ where: { id } });

  revalidateProfile(session.user.username);

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const link = await prisma.socialLink.findUnique({ where: { id } });
  if (!link || link.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const validation = SocialLinkUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { platform, url, label, startDate, endDate, featured } = validation.data;

    const updatedLink = await prisma.socialLink.update({
      where: { id },
      data: {
        platform: platform !== undefined ? platform : undefined,
        url: url !== undefined ? url : undefined,
        label: label !== undefined ? label : undefined,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        featured: featured !== undefined ? featured : undefined,
      },
    });

    revalidateProfile(session.user.username);

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error("Failed to update social link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


