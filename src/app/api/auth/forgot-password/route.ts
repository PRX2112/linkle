import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendMail } from "@/lib/mail";
import { ForgotPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = ForgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Generic success response to prevent account enumeration
    const genericResponse = {
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    };

    if (!user) {
      // Perform pseudo-hash to mitigate timing attack enumeration
      crypto.createHash("sha256").update(normalizedEmail + Date.now()).digest("hex");
      return NextResponse.json(genericResponse);
    }

    // Rate-limit consecutive reset emails for the same address (2 minute throttle)
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        expires: { gt: new Date(Date.now() + 58 * 60 * 1000) }, // created in last 2 mins of 60 min lifetime
      },
    });

    if (recentToken) {
      return NextResponse.json(genericResponse);
    }

    // Generate cryptographically secure random token (32 bytes = 64 hex characters)
    const rawToken = crypto.randomBytes(32).toString("hex");
    // Compute SHA-256 hash to store in the database so plaintext tokens are never stored
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiration

    // Purge any stale reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Store only the hashed token
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token: hashedToken,
        expires,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - Linkle</title>
        <style>
          body {
            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0b0f19;
            color: #f3f4f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 32px;
            background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
            background-color: #111827;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(to right, #a855f7, #6366f1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
            margin: 0;
            letter-spacing: -0.025em;
          }
          .content {
            font-size: 16px;
            line-height: 1.6;
            color: #d1d5db;
          }
          .title {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff;
            margin-top: 0;
            margin-bottom: 16px;
          }
          .btn-container {
            text-align: center;
            margin: 32px 0;
          }
          .btn {
            background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 9999px;
            display: inline-block;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
            transition: all 0.2s ease;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 24px;
          }
          .link-fallback {
            word-break: break-all;
            color: #a855f7;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Linkle</h1>
          </div>
          <div class="content">
            <h2 class="title">Reset Your Password</h2>
            <p>Hello,</p>
            <p>We received a request to reset the password for your Linkle account. Click the button below to choose a new password. This link will expire in <strong>1 hour</strong>.</p>
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
            </div>
            <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
            <p><a href="${resetUrl}" class="link-fallback">${resetUrl}</a></p>
            <br>
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Linkle. All rights reserved.</p>
            <p>Premium aesthetics for modern bios.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendMail({
        to: normalizedEmail,
        subject: "Reset your Linkle password",
        html: htmlContent,
        text: `Hello,\n\nWe received a request to reset your Linkle password. Please visit this link to set a new password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
      });
    } catch (mailError: any) {
      console.error("[AUTH] Failed to dispatch password reset email:", mailError?.message || "Delivery error");
      // Still return generic success to avoid enumeration and panic, but delete token so user can retry later
      await prisma.passwordResetToken.deleteMany({
        where: { email: normalizedEmail },
      });
      return NextResponse.json({
        error: "Unable to send password reset email at this time. Please try again later.",
      }, { status: 500 });
    }

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error("[AUTH] Unexpected error in forgot-password handler");
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}


