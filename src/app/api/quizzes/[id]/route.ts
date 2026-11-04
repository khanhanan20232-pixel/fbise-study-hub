import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { canStudentAccessQuiz } from '@/lib/quiz-access';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Phase E (teacher audit): students may only open their own class's
    // quizzes (exception: a quiz shared into one of their study groups).
    // The check runs on a cheap meta-only lookup first so a blocked student
    // never receives the question set at all.
    const currentUser = await getSessionUser(req);
    const meta = await prisma.quiz.findUnique({
      where: { id: params.id },
      select: { classGrade: true },
    });
    if (!meta) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }
    if (
      currentUser &&
      !(await canStudentAccessQuiz(currentUser, params.id, meta.classGrade))
    ) {
      return NextResponse.json(
        {
          error: `This quiz is for Class ${meta.classGrade} students. Your account is Class ${currentUser.className}, so you can only take Class ${currentUser.className} quizzes.`,
          quizClass: meta.classGrade,
          userClass: currentUser.className,
        },
        { status: 403 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Full Book / Half Book quizzes hold the subject's whole question pool.
    // Every attempt gets a RANDOM subset, so the questions change each time:
    // Full Book = 50 random MCQs, Half Book = 25 random MCQs.
    const chapterLower = (quiz.chapter || '').toLowerCase();
    let sampleSize = 0;
    if (chapterLower.startsWith('full book')) sampleSize = 50;
    else if (chapterLower.startsWith('half book')) sampleSize = 25;

    const questionSelect = {
      id: true,
      question: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      marks: true,
      // Explanation & correct answer returned for client review
      correctOption: true,
      explanation: true,
    } as const;

    let questions: any[];
    let poolSize: number;
    if (sampleSize > 0) {
      // Phase E speed: previously the ENTIRE pool (100+ full question rows
      // with options + explanations) was loaded just to serve 50/25 of them.
      // Now only the ids are loaded for sampling; full rows are fetched for
      // the sampled subset only, then restored to the shuffled order.
      const idRows = await prisma.quizQuestion.findMany({
        where: { quizId: params.id },
        select: { id: true },
      });
      poolSize = idRows.length;
      if (poolSize > sampleSize) {
        const ids = idRows.map((r) => r.id);
        for (let i = ids.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [ids[i], ids[j]] = [ids[j], ids[i]];
        }
        const picked = ids.slice(0, sampleSize);
        const rows = await prisma.quizQuestion.findMany({
          where: { id: { in: picked } },
          select: questionSelect,
        });
        const byId = new Map(rows.map((r) => [r.id, r]));
        questions = picked
          .map((id) => byId.get(id))
          .filter((r): r is NonNullable<typeof r> => Boolean(r));
      } else {
        questions = await prisma.quizQuestion.findMany({
          where: { quizId: params.id },
          select: questionSelect,
        });
      }
    } else {
      questions = await prisma.quizQuestion.findMany({
        where: { quizId: params.id },
        select: questionSelect,
      });
      poolSize = questions.length;
    }

    return NextResponse.json({ quiz: { ...quiz, questions, poolSize } });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.quiz.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
  }
}
