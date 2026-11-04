import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classGrade = searchParams.get('classGrade');
    const subject = searchParams.get('subject');

    const currentUser = await getSessionUser(req);

    const where: any = {};
    if (classGrade && classGrade !== 'ALL') {
      where.classGrade = classGrade;
    }
    // Phase E (teacher audit): a logged-in STUDENT only ever sees their own
    // class's quizzes — any ?classGrade= for another class is overridden
    // server-side, so cross-class lists cannot be reached via URL or menu.
    // Admins and guests keep the requested filter unchanged.
    if (currentUser && currentUser.role === 'STUDENT') {
      where.classGrade = currentUser.className;
    }
    if (subject && subject !== 'ALL') {
      where.subject = subject;
    }

    // Phase E speed: `select` only the fields the list consumers actually
    // render (quizzes page, class pages, admin table, group share picker).
    // Previously `include` returned every Quiz column (incl. scheduledDate /
    // updatedAt) plus a duplicate raw `attempts` array and `_count` object on
    // every row; the formatted fields below are the only extras consumers use.
    const quizzes = await prisma.quiz.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        classGrade: true,
        subject: true,
        chapter: true,
        timeLimit: true,
        isDaily: true,
        createdAt: true,
        _count: {
          select: { questions: true, attempts: true },
        },
        attempts: currentUser
          ? {
              where: { userId: currentUser.id },
              orderBy: { completedAt: 'desc' },
              take: 1,
              select: {
                id: true,
                score: true,
                totalQuestions: true,
                percentage: true,
                completedAt: true,
              },
            }
          : false,
      },
    });

    const formatted = quizzes.map((q) => {
      const { _count, attempts, ...fields } = q as any;
      return {
        ...fields,
        questionCount: _count.questions,
        totalAttemptsCount: _count.attempts,
        userLatestAttempt: attempts && attempts.length > 0 ? attempts[0] : null,
      };
    });

    return NextResponse.json({ quizzes: formatted });
  } catch (err: any) {
    console.error('Error fetching quizzes:', err);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await req.json();
    const { title, classGrade, subject, chapter, timeLimit, isDaily, questions } = body;

    if (!title || !classGrade || !subject || !chapter || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing required quiz fields or questions' }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: title.trim(),
        classGrade: String(classGrade),
        subject,
        chapter: chapter.trim(),
        timeLimit: parseInt(timeLimit) || 600,
        isDaily: Boolean(isDaily),
        questions: {
          create: questions.map((q: any) => ({
            question: q.question.trim(),
            optionA: q.optionA.trim(),
            optionB: q.optionB.trim(),
            optionC: q.optionC.trim(),
            optionD: q.optionD.trim(),
            correctOption: q.correctOption.toUpperCase(),
            explanation: (q.explanation || 'Based on standard FBISE syllabus').trim(),
            marks: parseInt(q.marks) || 1,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({ success: true, quiz });
  } catch (err: any) {
    console.error('Error creating quiz:', err);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}
