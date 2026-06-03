import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";


export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    displayName, bio, avatarUrl, bannerUrl,
    themePrimaryColor, themeButtonStyle,
    locationAddress, locationGoogleMapsEmbedUrl, locationIsVisible,
    emailCaptureEnabled, emailCaptureTitle, emailCapturePlaceholder,
  } = body;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName, bio, avatarUrl, bannerUrl,
      themePrimaryColor, themeButtonStyle,
      locationAddress, locationGoogleMapsEmbedUrl, locationIsVisible,
      emailCaptureEnabled: emailCaptureEnabled !== undefined ? emailCaptureEnabled : undefined,
      emailCaptureTitle: emailCaptureTitle !== undefined ? emailCaptureTitle : undefined,
      emailCapturePlaceholder: emailCapturePlaceholder !== undefined ? emailCapturePlaceholder : undefined,
    },
  });

  return NextResponse.json(user);
}
