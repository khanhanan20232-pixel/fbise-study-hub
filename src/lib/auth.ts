import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fbise-study-hub-super-secret-jwt-key-2025-khan-hanan';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  className: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(request?: NextRequest) {
  try {
    let token: string | undefined;

    if (request) {
      // Check Authorization header first
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        // Fallback to cookie
        token = request.cookies.get('fbise_token')?.value;
      }
    } else {
      // Server Component / Server Action context
      const cookieStore = cookies();
      token = cookieStore.get('fbise_token')?.value;
    }

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        className: true,
        stream: true,
        phone: true,
        streak: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    if (!user || user.isBlocked) return null;

    return user;
  } catch (err) {
    console.error('Error fetching session user:', err);
    return null;
  }
}
