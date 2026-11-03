import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/groups/[id]/leave — a member leaves the group. The owner cannot
// leave their own group (they can delete it instead).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
    }

    const membership = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: params.id, userId: user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });
    }
    if (membership.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Group owner group leave nahi kar sakta — owner group delete kar sakta hai.' },
        { status: 400 }
      );
    }

    await prisma.studyGroupMember.delete({ where: { id: membership.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leave group error:', error);
    return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 });
  }
}
