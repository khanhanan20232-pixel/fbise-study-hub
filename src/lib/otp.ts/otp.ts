import crypto from 'crypto';

// Hashing for password-reset OTP codes. A 6-digit code has only 1M possible
// values, so the stored hash is peppered with the server-side JWT secret:
// a database leak alone is not enough to brute-force codes offline, and the
// raw code is never stored. Verification compares in constant time.
export function hashOtpCode(email: string, code: string): string {
  const pepper = process.env.JWT_SECRET || '';
  return crypto
    .createHash('sha256')
    .update(`${pepper}:${email.toLowerCase().trim()}:${code}`)
    .digest('hex');
}

export function verifyOtpCode(email: string, code: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashOtpCode(email, code), 'utf8');
  const stored = Buffer.from(storedHash, 'utf8');
  if (candidate.length !== stored.length) return false;
  return crypto.timingSafeEqual(candidate, stored);
}

export function generateOtpCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}
