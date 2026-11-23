import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ClaimUsernameSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.username) {
      return NextResponse.json(
        {
          error: "You have already claimed a username.",
          username: user.username,
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = ClaimUsernameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid username format" },
        { status: 400 }
      );
    }

    const normalized = parsed.data.username.trim().toLowerCase();

    // Check availability in active users
    const existingActive = await prisma.user.findUnique({
      where: { username: normalized },
      select: { id: true },
    });

    // Check availability in historical aliases
    const existingAlias = await prisma.usernameHistory.findUnique({
      where: { username: normalized },
      select: { id: true },
    });

    if (existingActive || existingAlias) {
      return NextResponse.json(
        { error: "This username is already taken. Please try another." },
        { status: 409 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: normalized,
        displayName: user.displayName || user.name || normalized,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
    });

    return NextResponse.json({
      success: true,
      username: updated.username,
    });
  } catch (error: any) {
    console.error("Error claiming username:", error);
    return NextResponse.json(
      { error: "Internal server error claiming username" },
      { status: 500 }
    );
  }
}

