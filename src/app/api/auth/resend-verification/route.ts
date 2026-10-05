import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendMail } from "@/lib/mail";
import { ResendVerificationSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ResendVerificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();

    const genericResponse = {
      success: true,
      message: "If an unverified account exists with this email, a verification link has been sent.",
    };

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.emailVerified) {
      return NextResponse.json(genericResponse);
    }

    // Rate-limit throttle (prevent sending more than once every 2 minutes)
    const recent = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        expires: { gt: new Date(Date.now() + 23 * 60 * 60 * 1000 + 58 * 60 * 1000) },
      },
    });

    if (recent) {
      return NextResponse.json(genericResponse);
    }

    const rawVerifyToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: rawVerifyToken,
        expires,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/verify-email?token=${rawVerifyToken}&email=${encodeURIComponent(normalizedEmail)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email - Linkle</title>
        <style>
          body {
            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #0b0f19;
            color: #f3f4f6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 32px;
            background-color: #111827;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.08);
          }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 28px; font-weight: 800; color: #a855f7; }
          .btn {
            background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 9999px;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Linkle</h1>
          </div>
          <h2>Verify Your Email</h2>
          <p>Please click the button below to verify your email address. This link will expire in 24 hours.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}" class="btn" target="_blank">Verify Email Address</a>
          </div>
          <p style="font-size: 13px; color: #9ca3af;">Or visit: <a href="${verifyUrl}" style="color: #a855f7;">${verifyUrl}</a></p>
        </div>
      </body>
      </html>
    `;

    try {
      await sendMail({
        to: normalizedEmail,
        subject: "Verify your Linkle email address",
        html: htmlContent,
        text: `Please verify your email address:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`,
      });
    } catch (mailErr: any) {
      console.warn("[AUTH] Resend verification email dispatch skipped/failed:", mailErr?.message);
    }

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error("[AUTH] Failed to resend verification email");
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
