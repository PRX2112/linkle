import nodemailer from "nodemailer";

interface SendMailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail({ to, subject, html, text }: SendMailArgs) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || `"Linkle" <noreply@linkle.vip>`;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  let transporter: nodemailer.Transporter;
  let fromAddress = smtpFrom;

  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    // 1. General SMTP Configured (e.g. Resend, SendGrid, etc.)
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for port 465, false for 587 / other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } else if (gmailUser && gmailPass) {
    // 2. Gmail Fallback
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
    fromAddress = smtpFrom !== `"Linkle" <noreply@linkle.vip>` ? smtpFrom : `"Linkle" <${gmailUser}>`;
  } else {
    // 3. Graceful fallback for local development: logs email content
    console.warn("⚠️ No SMTP credentials configured. Email delivery was mocked.");
    console.log("------------------ [MOCK EMAIL] ------------------");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text || html.replace(/<[^>]*>/g, "")}`);
    console.log(`HTML: ${html}`);
    console.log("--------------------------------------------------");
    return { success: true, mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // strip html for simple text backup
      html,
    });

    console.log(`📧 Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send email via SMTP:", error);
    throw error;
  }
}

