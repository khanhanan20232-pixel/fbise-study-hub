import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/groups/[id] — group detail for members only: info, members,
// shared quizzes, and the group leaderboard. The leaderboard ranks members
// by their attempts and average score on THIS group's shared quizzes
// (falling back to overall attempts when nobody has attempted them yet).
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to view this group' }, { status: 401 });
    }

    const membership = await prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: params.id, userId: user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });
    }

    const group = await prisma.studyGroup.findUnique({
      where: { id: params.id },
      include: {
        owner: { select: { name: true } },
        members: {
          orderBy: { joinedAt: 'asc' },
          include: { user: { select: { id: true, name: true, className: true } } },
        },
        sharedQuizzes: {
          orderBy: { createdAt: 'desc' },
          include: {
            quiz: { include: { _count: { select: { questions: true } } } },
            sharedBy: { select: { name: true } },
          },
        },
      },
    });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const sharedQuizIds = group.sharedQuizzes.map((s) => s.quizId);
    const memberIds = group.members.map((m) => m.userId);

    const [sharedAttempts, totalAttempts] = await Promise.all([
      sharedQuizIds.length
        ? prisma.quizAttempt.findMany({
            where: { userId: { in: memberIds }, quizId: { in: sharedQuizIds } },
            select: { userId: true, percentage: true },
          })
        : Promise.resolve([]),
      prisma.quizAttempt.groupBy({
        by: ['userId'],
        where: { userId: { in: memberIds } },
        _count: { _all: true },
      }),
    ]);

    const totalsMap = new Map(totalAttempts.map((t) => [t.userId, t._count._all]));
    const sharedStats = new Map<string, { attempts: number; pctSum: number }>();
    for (const a of sharedAttempts) {
      const cur = sharedStats.get(a.userId) || { attempts: 0, pctSum: 0 };
      cur.attempts += 1;
      cur.pctSum += a.percentage;
      sharedStats.set(a.userId, cur);
    }

    const leaderboard = group.members
      .map((m) => {
        const s = sharedStats.get(m.userId);
        return {
          userId: m.userId,
          name: m.user.name,
          className: m.user.className,
          role: m.role,
          sharedAttempts: s ? s.attempts : 0,
          sharedAverage: s && s.attempts > 0 ? Math.round((s.pctSum / s.attempts) * 10) / 10 : 0,
          totalAttempts: totalsMap.get(m.userId) || 0,
          isMe: m.userId === user.id,
        };
      })
      .sort(
        (a, b) =>
          b.sharedAttempts - a.sharedAttempts ||
          b.sharedAverage - a.sharedAverage ||
          b.totalAttempts - a.totalAttempts
      );

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        inviteCode: group.inviteCode,
        ownerId: group.ownerId,
        ownerName: group.owner.name,
        createdAt: group.createdAt,
        myRole: membership.role,
      },
      members: group.members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        className: m.user.className,
        role: m.role,
        joinedAt: m.joinedAt,
        isMe: m.userId === user.id,
      })),
      sharedQuizzes: group.sharedQuizzes.map((s) => ({
        id: s.id,
        quizId: s.quizId,
        title: s.quiz.title,
        subject: s.quiz.subject,
        chapter: s.quiz.chapter,
        classGrade: s.quiz.classGrade,
        questionCount: s.quiz._count.questions,
        sharedById: s.sharedById,
        sharedByName: s.sharedBy.name,
        sharedAt: s.createdAt,
        canRemove: s.sharedById === user.id || membership.role === 'OWNER',
      })),
      leaderboard,
    });
  } catch (error) {
    console.error('Get group detail error:', error);
    return NextResponse.json({ error: 'Failed to load group' }, { status: 500 });
  }
}

// DELETE /api/groups/[id] — only the owner can delete the whole group.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
    }

    const group = await prisma.studyGroup.findUnique({ where: { id: params.id } });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    if (group.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only the group owner can delete this group' }, { status: 403 });
    }

    await prisma.studyGroup.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete group error:', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}
