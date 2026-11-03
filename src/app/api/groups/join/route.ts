import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/groups/join { code } — join a study group with its invite code.
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to join a study group' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    if (!code) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }

    const group = await prisma.studyGroup.findUnique({ where: { inviteCode: code } });
    if (!group) {
      return NextResponse.json({ error: 'Is invite code se koi group nahi mila. Code check karke dobara try karein.' }, { status: 404 });
    }

    const existing = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ success: true, alreadyMember: true, group: { id: group.id, name: group.name } });
    }

    await prisma.studyGroupMember.create({
      data: { groupId: group.id, userId: user.id, role: 'MEMBER' },
    });

    return NextResponse.json({ success: true, alreadyMember: false, group: { id: group.id, name: group.name } });
  } catch (error) {
    console.error('Join group error:', error);
    return NextResponse.json({ error: 'Failed to join study group' }, { status: 500 });
  }
}
