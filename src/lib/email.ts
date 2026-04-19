type PasswordResetEmailInput = {
  email: string;
  name?: string | null;
  resetUrl: string;
};

function getAppName() {
  return "HanziBit";
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: PasswordResetEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;

  if (!resendApiKey || !from) {
    console.info("[auth] Password reset requested", {
      email,
      resetUrl,
    });
    return;
  }

  const subject = `Reset your ${getAppName()} password`;
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi,";
  const text = `${greeting}

We received a request to reset your password.

Reset it here: ${resetUrl}

If you did not request this, you can ignore this email.`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <p>${greeting}</p>
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;background:#d97706;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px">
          Reset password
        </a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    console.error("[auth] Failed to send password reset email", {
      status: response.status,
    });
  }
}
