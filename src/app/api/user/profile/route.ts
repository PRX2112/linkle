import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { UserProfileSchema } from "@/lib/validation";
import { revalidateProfile } from "@/lib/cache";

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

  try {
    const body = await req.json();
    const validation = UserProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      displayName, bio, avatarUrl, bannerUrl,
      themePrimaryColor, themeButtonStyle,
      locationAddress, locationGoogleMapsEmbedUrl, locationIsVisible,
      emailCaptureEnabled, emailCaptureTitle, emailCapturePlaceholder,
    } = validation.data;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName, bio, avatarUrl, bannerUrl,
        themePrimaryColor, themeButtonStyle,
        locationAddress, locationGoogleMapsEmbedUrl, locationIsVisible,
        emailCaptureEnabled,
        emailCaptureTitle,
        emailCapturePlaceholder,
      },
    });

    revalidateProfile(user.username);

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


