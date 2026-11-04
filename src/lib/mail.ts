// Transactional email via the Resend HTTP API (plain fetch — no SDK).
// Requires RESEND_API_KEY in the environment. RESEND_FROM can override the
// sender once a custom domain is verified in Resend; until then the default
// onboarding@resend.dev sender can only deliver to the Resend account
// owner's own email address (Resend's sandbox restriction).

const RESEND_API_URL = 'https://api.resend.com/emails';

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured; cannot send OTP email');
  }

  const from = process.env.RESEND_FROM || 'FBISE Study Hub <onboarding@resend.dev>';

  const text = [
    'FBISE Study Hub — Password Reset',
    '',
    `Your password reset verification code is: ${code}`,
    '',
    'This code is valid for 10 minutes. Enter it on the password reset page to set a new password.',
    '',
    'If you did not request a password reset, you can safely ignore this email — your password will not change.',
    '',
    'FBISE Study Hub — SSC & HSSC Preparation Portal',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #0f172a;">
      <h1 style="font-size: 20px; margin: 0 0 8px;">FBISE Study Hub</h1>
      <p style="font-size: 14px; color: #475569; margin: 0 0 20px;">Password Reset Verification Code</p>
      <p style="font-size: 14px; margin: 0 0 12px;">Use the following 6-digit code to reset your password:</p>
      <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; text-align: center; padding: 16px; background: #f1f5f9; border-radius: 12px; margin: 0 0 16px;">${code}</div>
      <p style="font-size: 13px; color: #475569; margin: 0 0 8px;">This code is <strong>valid for 10 minutes</strong>.</p>
      <p style="font-size: 13px; color: #475569; margin: 0;">If you did not request a password reset, you can safely ignore this email — your password will not change.</p>
    </div>
  `.trim();

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Your FBISE Study Hub password reset code',
      text,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend API error (${res.status}): ${detail.slice(0, 300)}`);
  }
}
