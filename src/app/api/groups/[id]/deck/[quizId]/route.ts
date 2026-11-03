import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/groups/[id]/deck/[quizId] — flip-card deck for a quiz shared in
// this group. Members only, and the quiz must actually be shared here.
// Unlike the quiz player, the deck shows the correct answer + explanation
// on the back of each card: it is for studying together, not for testing.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; quizId: string } }
) {
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

    const shared = await prisma.groupSharedQuiz.findUnique({
      where: { groupId_quizId: { groupId: params.id, quizId: params.quizId } },
      include: {
        quiz: {
          include: { questions: true },
        },
      },
    });
    if (!shared) {
      return NextResponse.json({ error: 'Ye quiz is group mein shared nahi hai.' }, { status: 404 });
    }

    return NextResponse.json({
      quiz: {
        id: shared.quiz.id,
        title: shared.quiz.title,
        subject: shared.quiz.subject,
        chapter: shared.quiz.chapter,
        classGrade: shared.quiz.classGrade,
      },
      cards: shared.quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
        correctOption: q.correctOption,
        explanation: q.explanation,
      })),
    });
  } catch (error) {
    console.error('Get group deck error:', error);
    return NextResponse.json({ error: 'Failed to load deck' }, { status: 500 });
  }
}
