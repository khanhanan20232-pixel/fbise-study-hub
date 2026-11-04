import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { verifyOtpCode } from '@/lib/otp';

const MAX_ATTEMPTS = 5;
const INVALID_CODE_ERROR = 'The verification code is invalid or has expired. Please request a new code.';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const otp = typeof body.otp === 'string' ? body.otp.trim() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Please provide your email address, the verification code, and a new password' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Your new password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const record = await prisma.passwordResetOtp.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json({ error: INVALID_CODE_ERROR }, { status: 400 });
    }

    // Too many failed tries: burn the code so it cannot be guessed further.
    if (record.attempts >= MAX_ATTEMPTS) {
      await prisma.passwordResetOtp.delete({ where: { id: record.id } });
      return NextResponse.json({ error: INVALID_CODE_ERROR }, { status: 400 });
    }

    const expired = record.expiresAt.getTime() < Date.now();
    const codeMatches = !expired && verifyOtpCode(email, otp, record.codeHash);

    if (!codeMatches) {
      const attempts = record.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await prisma.passwordResetOtp.delete({ where: { id: record.id } });
      } else {
        await prisma.passwordResetOtp.update({
          where: { id: record.id },
          data: { attempts },
        });
      }
      return NextResponse.json({ error: INVALID_CODE_ERROR }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await prisma.passwordResetOtp.delete({ where: { id: record.id } });
      return NextResponse.json({ error: INVALID_CODE_ERROR }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Single use: the code is consumed, and any other codes for this
    // email are cleared as well.
    await prisma.passwordResetOtp.deleteMany({ where: { email } });

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. Please sign in with your new password.',
    });
  } catch (err: any) {
    console.error('Reset password API error:', err);
    return NextResponse.json({ error: 'Server error resetting password' }, { status: 500 });
  }
}
