import nodemailer from 'nodemailer';

interface SendResetEmailOptions {
  to: string;
  resetUrl: string;
  fullName?: string;
}

export function getMailerTransport() {
  const user =
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    '';
  const pass =
    process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_APP_PASS ||
    process.env.EMAIL_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.SMTP_PASSWORD ||
    '';

  if (!user || !pass) {
    return null;
  }

  // Clean any spaces often copied into Google App Passwords (e.g. "abcd efgh ijkl mnop")
  const cleanPass = pass.replace(/\s+/g, '');

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL/TLS on port 465
    auth: {
      user: user.trim(),
      pass: cleanPass.trim(),
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  fullName,
}: SendResetEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const senderEmail =
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    'ershad@guitart.com';

  const recipientName = fullName ? fullName : 'Musician';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Guitart Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #09090b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f4f4f5;
    }
    .wrapper {
      width: 100%;
      background-color: #09090b;
      padding: 40px 15px;
      box-sizing: border-box;
    }
    .card {
      max-width: 540px;
      margin: 0 auto;
      background-color: #18181b;
      border: 1px solid #27272a;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .header {
      background: linear-gradient(135deg, #18181b 0%, #09090b 100%);
      padding: 32px 30px 24px;
      text-align: center;
      border-bottom: 1px solid #27272a;
    }
    .logo-badge {
      display: inline-block;
      width: 48px;
      height: 48px;
      line-height: 48px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #09090b;
      font-weight: 900;
      font-size: 24px;
      border-radius: 14px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #ffffff;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 11px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #a1a1aa;
      margin-top: 4px;
    }
    .body {
      padding: 32px 32px 28px;
    }
    .greeting {
      font-size: 17px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 14px;
    }
    .text {
      font-size: 14px;
      line-height: 1.6;
      color: #d4d4d8;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #09090b !important;
      font-weight: 800;
      font-size: 15px;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 10px 20px rgba(245, 158, 11, 0.25);
    }
    .info-box {
      background-color: #09090b;
      border: 1px solid #27272a;
      border-radius: 14px;
      padding: 16px;
      font-size: 12px;
      color: #a1a1aa;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .info-box strong {
      color: #f59e0b;
    }
    .fallback-url {
      word-break: break-all;
      color: #f59e0b;
      font-size: 11px;
      text-decoration: underline;
    }
    .footer {
      background-color: #09090b;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid #27272a;
      font-size: 11px;
      color: #71717a;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo-badge">🎸</div>
        <h1 class="brand-title">GUITART<span style="color:#f59e0b;">.</span></h1>
        <div class="brand-subtitle">Ershad Zaman Academy</div>
      </div>
      <div class="body">
        <div class="greeting">Hello ${recipientName},</div>
        <p class="text">
          We received a request to reset the password for your Guitart Academy account (<strong>${to}</strong>).
        </p>
        <p class="text">
          Click the secure button below to choose a new password and regain immediate access to your courses and dashboard:
        </p>
        <div class="btn-container">
          <a href="${resetUrl}" class="btn" target="_blank">Reset Your Password &rarr;</a>
        </div>
        <div class="info-box">
          ⏱️ <strong>Security Notice:</strong> This single-use password reset link will expire in <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email — your account remains completely secure.
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Guitart Academy • Ershad Zaman Masterclass Portal<br>
        Banani, Dhaka-1213, Bangladesh • Secured by Guitart Auth
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Hello ${recipientName},

We received a request to reset your password for your Guitart Academy account (${to}).

Please click the secure "Reset Your Password" button in this email to choose your new password.

This link is valid for 10 minutes and can only be used once. If you did not request this, please ignore this email.

Best regards,
Ershad Zaman Academy Team
Guitart — The Art of Guitar
  `.trim();

  const transporter = getMailerTransport();

  if (!transporter) {
    console.warn(
      '⚠️ [Mailer Notice] GMAIL_USER or GMAIL_APP_PASSWORD is not configured in .env.local. Simulated email link generated:',
      resetUrl
    );
    return {
      success: true,
      messageId: 'simulated-local-mode',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Guitart Academy" <${senderEmail}>`,
      to,
      subject: 'Reset Your Guitart Academy Password',
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Password reset email dispatched via Gmail SMTP to:', to, 'ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('❌ Failed to dispatch email via Gmail SMTP:', err);
    return {
      success: false,
      error: err?.message || 'Failed to dispatch password reset email via Gmail SMTP.',
    };
  }
}
