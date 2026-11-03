import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

async function generateInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    const existing = await prisma.studyGroup.findUnique({ where: { inviteCode: code } });
    if (!existing) return code;
  }
  throw new Error('Could not generate a unique invite code');
}

// GET /api/groups — the logged-in student's groups (as owner or member).
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to view study groups' }, { status: 401 });
    }

    const memberships = await prisma.studyGroupMember.findMany({
      where: { userId: user.id },
      orderBy: { joinedAt: 'desc' },
      include: {
        group: {
          include: {
            owner: { select: { name: true } },
            _count: { select: { members: true, sharedQuizzes: true } },
          },
        },
      },
    });

    const groups = memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      description: m.group.description,
      inviteCode: m.group.inviteCode,
      ownerId: m.group.ownerId,
      ownerName: m.group.owner.name,
      memberCount: m.group._count.members,
      sharedCount: m.group._count.sharedQuizzes,
      myRole: m.role,
      joinedAt: m.joinedAt,
      createdAt: m.group.createdAt,
    }));

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json({ error: 'Failed to load study groups' }, { status: 500 });
  }
}

// POST /api/groups — create a new study group; the creator becomes its OWNER.
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to create a study group' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 200) : '';
    if (name.length < 3 || name.length > 60) {
      return NextResponse.json({ error: 'Group name must be 3 to 60 characters' }, { status: 400 });
    }

    const inviteCode = await generateInviteCode();
    const group = await prisma.studyGroup.create({
      data: {
        name,
        description,
        inviteCode,
        ownerId: user.id,
        members: { create: { userId: user.id, role: 'OWNER' } },
      },
    });

    return NextResponse.json({ success: true, group: { id: group.id, name: group.name, inviteCode: group.inviteCode } });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'Failed to create study group' }, { status: 500 });
  }
}
