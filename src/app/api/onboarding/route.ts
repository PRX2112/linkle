import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { OnboardingApplySchema } from "@/lib/validation";
import { applyTemplate, skipOnboarding } from "@/lib/templates/apply";
import { TEMPLATE_LIST } from "@/lib/templates/definitions";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      onboardingCompleted: true,
      selectedTemplate: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    onboardingCompleted: user.onboardingCompleted,
    selectedTemplate: user.selectedTemplate,
    templates: TEMPLATE_LIST,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = OnboardingApplySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { action, templateId, ...rest } = validation.data;

    if (action === "skip" || templateId === "scratch") {
      const user = await skipOnboarding(session.user.id);
      return NextResponse.json({
        success: true,
        message: "Onboarding completed without prefilled templates",
        user,
      });
    }

    const user = await applyTemplate(session.user.id, {
      templateId,
      ...rest,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully configured profile with ${templateId} template`,
      user,
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process onboarding" },
      { status: 500 }
    );
  }
}
