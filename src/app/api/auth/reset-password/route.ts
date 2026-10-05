import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ResetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = ResetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Hash the incoming raw token to compare against the stored SHA-256 hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Look up token by hash (with fallback to raw token for any legacy records)
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        OR: [
          { token: hashedToken },
          { token: token },
        ],
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "This password reset link is invalid or has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    // Check expiration
    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.deleteMany({
        where: { email: resetToken.email },
      });
      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password using bcrypt cost factor 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    const user = await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
      select: { id: true, email: true },
    });

    // Invalidate/delete all reset tokens for this email (ensures single-use consumption)
    await prisma.passwordResetToken.deleteMany({
      where: { email: resetToken.email },
    });

    // Invalidate active database sessions for this user
    if (user?.id) {
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. Please sign in with your new password.",
    });
  } catch (error) {
    console.error("[AUTH] Error occurred during password reset");
    return NextResponse.json(
      { error: "An unexpected error occurred while resetting your password. Please try again." },
      { status: 500 }
    );
  }
}

