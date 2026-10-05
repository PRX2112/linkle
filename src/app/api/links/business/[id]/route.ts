import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { BusinessLinkUpdateSchema } from "@/lib/validation";
import { revalidateProfile } from "@/lib/cache";

export const dynamic = "force-dynamic";


export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const link = await prisma.businessLink.findUnique({ where: { id } });
  if (!link || link.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.businessLink.delete({ where: { id } });

  revalidateProfile(session.user.username);

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const link = await prisma.businessLink.findUnique({ where: { id } });
  if (!link || link.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const validation = BusinessLinkUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, url, description, thumbnailUrl, startDate, endDate, featured, utmEnabled, utmSource, utmMedium, utmCampaign, utmContent, utmTerm } = validation.data;

    const updatedLink = await prisma.businessLink.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        url: url !== undefined ? url : undefined,
        description: description !== undefined ? description : undefined,
        thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : undefined,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        featured: featured !== undefined ? featured : undefined,
        utmEnabled: utmEnabled !== undefined ? utmEnabled : undefined,
        utmSource: utmSource !== undefined ? (utmSource || null) : undefined,
        utmMedium: utmMedium !== undefined ? (utmMedium || null) : undefined,
        utmCampaign: utmCampaign !== undefined ? (utmCampaign || null) : undefined,
        utmContent: utmContent !== undefined ? (utmContent || null) : undefined,
        utmTerm: utmTerm !== undefined ? (utmTerm || null) : undefined,
      },
    });

    revalidateProfile(session.user.username);

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error("Failed to update business link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


