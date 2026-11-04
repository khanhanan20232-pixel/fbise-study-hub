import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { getStreamData } from '@/data/streams';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, className, phone, stream } = body;

    if (!name || !email || !password || !className) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    // Optional study group/stream: when provided it must be one of the
    // streams defined for the student's class level (src/data/streams.ts).
    let normalizedStream: string | null = null;
    if (stream !== undefined && stream !== null && String(stream).trim() !== '') {
      const candidate = String(stream).trim();
      const validStreams = getStreamData(String(className)).streams.map((s) => s.name);
      if (!validStreams.includes(candidate)) {
        return NextResponse.json(
          { error: 'Please select a valid study group for your class.' },
          { status: 400 }
        );
      }
      normalizedStream = candidate;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        className: String(className),
        stream: normalizedStream,
        phone: phone ? phone.trim() : null,
        role: 'STUDENT',
        streak: 1,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        className: true,
        stream: true,
        phone: true,
        streak: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      className: user.className,
    });

    const response = NextResponse.json({ success: true, user });

    // Set HttpOnly cookie
    response.cookies.set('fbise_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Signup API error:', err);
    return NextResponse.json({ error: 'Server error creating user account' }, { status: 500 });
  }
}
