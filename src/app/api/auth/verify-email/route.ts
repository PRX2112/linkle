import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { VerifyEmailSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = VerifyEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, email } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Verify token exists for identifier
    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token,
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired email verification link." },
        { status: 400 }
      );
    }

    // Check expiration
    if (record.expires < new Date()) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail },
      });
      return NextResponse.json(
        { error: "This email verification link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
    });

    // Delete token once consumed
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now access all features.",
    });
  } catch (error) {
    console.error("[AUTH] Email verification failed");
    return NextResponse.json(
      { error: "An unexpected error occurred during email verification." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const validation = VerifyEmailSchema.safeParse({ token, email });
  if (!validation.success) {
    return NextResponse.redirect(new URL("/login?error=InvalidVerificationLink", req.url));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: normalizedEmail, token },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.redirect(new URL("/verify-email?status=expired", req.url));
  }

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: normalizedEmail },
  });

  return NextResponse.redirect(new URL("/verify-email?status=success", req.url));
}
