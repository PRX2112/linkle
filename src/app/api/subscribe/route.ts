import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, email } = await req.json();
    if (!username || !email) {
      return NextResponse.json({ error: "Username and email are required." }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // Check if already subscribed for this user
    const existing = await prisma.capturedEmail.findFirst({
      where: {
        userId: user.id,
        email: trimmedEmail,
      }
    });

    if (existing) {
      return NextResponse.json({ error: "This email is already subscribed!" }, { status: 400 });
    }

    const subscription = await prisma.capturedEmail.create({
      data: {
        userId: user.id,
        email: trimmedEmail,
      }
    });

    return NextResponse.json({ success: true, subscription }, { status: 201 });
  } catch (error) {
    console.error("Failed to subscribe email:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
