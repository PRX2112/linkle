import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { SubscribeSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = SubscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username, email } = validation.data;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // Check if already subscribed for this user
    const existing = await prisma.capturedEmail.findFirst({
      where: {
        userId: user.id,
        email,
      }
    });

    if (existing) {
      return NextResponse.json({ error: "This email is already subscribed!" }, { status: 400 });
    }

    const subscription = await prisma.capturedEmail.create({
      data: {
        userId: user.id,
        email,
      }
    });

    return NextResponse.json({ success: true, subscription }, { status: 201 });
  } catch (error) {
    console.error("Failed to subscribe email:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

