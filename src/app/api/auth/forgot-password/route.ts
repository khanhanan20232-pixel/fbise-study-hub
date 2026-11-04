import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/mail';
import { generateOtpCode, hashOtpCode } from '@/lib/otp';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between sends per email

// The response is intentionally identical whether or not an account exists
// for the email, so this endpoint cannot be used to enumerate accounts.
const GENERIC_RESPONSE = {
  success: true,
  message: 'If an account exists for this email address, a 6-digit verification code has been sent to it.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';

    if (!email) {
      return NextResponse.json({ error: 'Please provide your email address' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Resend cooldown: if a code was created less than 60 seconds ago,
      // quietly skip sending (the response stays the same).
      const latest = await prisma.passwordResetOtp.findFirst({
        where: { email },
        orderBy: { createdAt: 'desc' },
      });

      const inCooldown = latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS;

      if (!inCooldown) {
        const code = generateOtpCode();

        // One active OTP per email: a new request replaces any previous code.
        await prisma.passwordResetOtp.deleteMany({ where: { email } });
        await prisma.passwordResetOtp.create({
          data: {
            email,
            codeHash: hashOtpCode(email, code),
            expiresAt: new Date(Date.now() + OTP_TTL_MS),
          },
        });

        try {
          await sendOtpEmail(email, code);
        } catch (mailErr) {
          // Never leak infrastructure state to the client; the generic
          // success response is returned either way.
          console.error('Failed to send password reset OTP email:', mailErr);
        }
      }
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (err: any) {
    console.error('Forgot password API error:', err);
    // Even on unexpected errors, do not reveal whether the email exists.
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
