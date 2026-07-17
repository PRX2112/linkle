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

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't leak whether the user exists or not, just return success
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Delete existing tokens for this email to prevent spam/duplicates
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

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

    await sendMail({
      to: email,
      subject: "Reset your Linkle password",
      html: htmlContent,
      text: `Hello,\n\nWe received a request to reset your Linkle password. Please visit this link to set a new password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

