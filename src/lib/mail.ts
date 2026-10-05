import nodemailer from "nodemailer";

interface SendMailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Checks whether SMTP credentials or Gmail credentials are configured.
 */
export function isMailConfigured(): boolean {
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  );
  const gmailConfigured = Boolean(
    process.env.GMAIL_USER &&
    process.env.GMAIL_PASS
  );
  return smtpConfigured || gmailConfigured;
}

export async function sendMail({ to, subject, html, text }: SendMailArgs) {
  const isProd = process.env.NODE_ENV === "production";
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || `"Linkle" <noreply@linkle.vip>`;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  let transporter: nodemailer.Transporter;
  let fromAddress = smtpFrom;

  if (smtpHost && smtpUser && smtpPass) {
    // 1. General SMTP Configured (Resend, SendGrid, Postmark, AWS SES, etc.)
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for 587 / STARTTLS
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000, // 10s timeout
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  } else if (gmailUser && gmailPass) {
    // 2. Gmail Fallback
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    fromAddress = smtpFrom !== `"Linkle" <noreply@linkle.vip>` ? smtpFrom : `"Linkle" <${gmailUser}>`;
  } else {
    // 3. Fallback when SMTP is not configured
    if (isProd) {
      console.warn(`[MAIL_WARNING] Outbound SMTP transport not configured in production. Failed to deliver to: ${to.slice(0, 3)}***`);
      throw new Error("Email service is temporarily unavailable. Please try again later.");
    }

    // In local development only, log delivery without disclosing sensitive token dumps
    console.log(`[DEV_MAIL_MOCK] Simulated email to: ${to} | Subject: "${subject}"`);
    return { success: true, mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""),
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[MAIL_ERROR] Failed to send email to recipient: ${error?.message || "Unknown error"}`);
    throw error;
  }
}

