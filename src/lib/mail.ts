import nodemailer from "nodemailer";

interface SendMailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail({ to, subject, html, text }: SendMailArgs) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    console.warn("⚠️ GMAIL_USER or GMAIL_PASS environment variables are not configured.");
    console.log("------------------ [MOCK EMAIL] ------------------");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    console.log(`HTML: ${html}`);
    console.log("--------------------------------------------------");
    return { success: true, mock: true };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass, // This should be a Gmail App Password
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Linkle" <${gmailUser}>`,
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
