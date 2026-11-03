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
  return { user, membership };
}

// POST /api/groups/[id]/share { quizId } — share a quiz into the group so
// members can take it or study it as a deck.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireMembership(req, params.id);
    if (auth.error) return auth.error;
    const user = auth.user!;

    const body = await req.json().catch(() => ({}));
    const quizId = typeof body.quizId === 'string' ? body.quizId : '';
    if (!quizId) {
      return NextResponse.json({ error: 'quizId is required' }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const existing = await prisma.groupSharedQuiz.findUnique({
      where: { groupId_quizId: { groupId: params.id, quizId } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Ye quiz pehle se group mein shared hai.' }, { status: 409 });
    }

    const shared = await prisma.groupSharedQuiz.create({
      data: { groupId: params.id, quizId, sharedById: user.id },
    });

    return NextResponse.json({ success: true, sharedId: shared.id });
  } catch (error) {
    console.error('Share quiz error:', error);
    return NextResponse.json({ error: 'Failed to share quiz' }, { status: 500 });
  }
}

// DELETE /api/groups/[id]/share?quizId=... — remove a shared quiz
// (only the member who shared it, or the group owner).
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireMembership(req, params.id);
    if (auth.error) return auth.error;
    const user = auth.user!;
    const membership = auth.membership!;

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId') || '';
    if (!quizId) {
      return NextResponse.json({ error: 'quizId is required' }, { status: 400 });
    }

    const shared = await prisma.groupSharedQuiz.findUnique({
      where: { groupId_quizId: { groupId: params.id, quizId } },
    });
    if (!shared) {
      return NextResponse.json({ error: 'Shared quiz not found' }, { status: 404 });
    }
    if (shared.sharedById !== user.id && membership.role !== 'OWNER') {
      return NextResponse.json({ error: 'Sirf share karne wala ya group owner ise hata sakta hai.' }, { status: 403 });
    }

    await prisma.groupSharedQuiz.delete({ where: { id: shared.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unshare quiz error:', error);
    return NextResponse.json({ error: 'Failed to remove shared quiz' }, { status: 500 });
  }
}
