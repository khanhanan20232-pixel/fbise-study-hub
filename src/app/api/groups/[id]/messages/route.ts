import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireMembership(req: NextRequest, groupId: string) {
  const user = await getSessionUser(req);
  if (!user) return { error: NextResponse.json({ error: 'Please sign in' }, { status: 401 }) };
  const membership = await prisma.studyGroupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!membership) {
    return { error: NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 }) };
  }
  return { user };
}

// GET /api/groups/[id]/messages?after=<iso> — latest group chat messages
// (or only those after the given timestamp, for polling).
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireMembership(req, params.id);
    if (auth.error) return auth.error;
    const user = auth.user!;

    const { searchParams } = new URL(req.url);
    const after = searchParams.get('after');
    const afterDate = after ? new Date(after) : null;

    const validAfter = afterDate && !isNaN(afterDate.getTime()) ? afterDate : null;
    const messages = validAfter
      ? await prisma.groupMessage.findMany({
          where: { groupId: params.id, createdAt: { gt: validAfter } },
          orderBy: { createdAt: 'asc' },
          take: 100,
          include: { user: { select: { name: true } } },
        })
      : (
          await prisma.groupMessage.findMany({
            where: { groupId: params.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { user: { select: { name: true } } },
          })
        ).reverse();

    const list = messages;

    return NextResponse.json({
      messages: list.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        text: m.text,
        createdAt: m.createdAt,
        mine: m.userId === user.id,
      })),
    });
  } catch (error) {
    console.error('Get group messages error:', error);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}

// POST /api/groups/[id]/messages { text } — post a chat message to the group.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireMembership(req, params.id);
    if (auth.error) return auth.error;
    const user = auth.user!;

    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text || text.length > 1000) {
      return NextResponse.json({ error: 'Message must be 1 to 1000 characters' }, { status: 400 });
    }

    const message = await prisma.groupMessage.create({
      data: { groupId: params.id, userId: user.id, text },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        userId: message.userId,
        name: message.user.name,
        text: message.text,
        createdAt: message.createdAt,
        mine: true,
      },
    });
  } catch (error) {
    console.error('Post group message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
