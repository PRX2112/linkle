import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendMail } from "@/lib/mail";
import { UserRegisterSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = UserRegisterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, username } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Check if username is taken as an active username or historical alias
    const existingUsername = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });
    const existingAlias = await prisma.usernameHistory.findUnique({
      where: { username: normalizedUsername },
    });
    if (existingUsername || existingAlias) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        username: normalizedUsername,
        displayName: name,
      },
    });

    // Generate email verification token (24 hour expiration)
    try {
      const rawVerifyToken = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Clean any existing verification tokens for this identifier
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
            <h2>Welcome to Linkle, ${name}!</h2>
            <p>Please click the button below to verify your email address. This link will expire in 24 hours.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyUrl}" class="btn" target="_blank">Verify Email Address</a>
            </div>
            <p style="font-size: 13px; color: #9ca3af;">Or visit: <a href="${verifyUrl}" style="color: #a855f7;">${verifyUrl}</a></p>
          </div>
        </body>
        </html>
      `;

      await sendMail({
        to: normalizedEmail,
        subject: "Verify your Linkle email address",
        html: htmlContent,
        text: `Welcome to Linkle! Please verify your email by visiting:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`,
      });
    } catch (mailErr: any) {
      // Non-blocking: registration succeeds even if email delivery fails or is unconfigured
      console.warn("[AUTH] Registration email verification dispatch notice:", mailErr?.message || "Delivery skipped");
    }

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("[AUTH] Registration failed");
    return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
  }
}


