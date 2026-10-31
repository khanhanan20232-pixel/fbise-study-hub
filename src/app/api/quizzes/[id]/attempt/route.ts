import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to submit quizzes' }, { status: 401 });
    }

    const quizId = params.id;
    const body = await req.json();
    const { userAnswers, timeTakenSeconds, questionIds } = body; // userAnswers: { [questionId: string]: string }

    if (!userAnswers) {
      return NextResponse.json({ error: 'Answers must be provided' }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // For Full/Half Book quizzes the student only saw a random subset of the
    // pool — score only the questions that were actually served.
    let questionsToScore = quiz.questions;
    if (Array.isArray(questionIds) && questionIds.length > 0) {
      const servedIds = new Set(questionIds);
      const filtered = quiz.questions.filter((q) => servedIds.has(q.id));
      if (filtered.length > 0) questionsToScore = filtered;
    }

    let score = 0;
    const totalQuestions = questionsToScore.length;
    const reviewList = [];

    for (const q of questionsToScore) {
      const selected = userAnswers[q.id];
      const isCorrect = selected && selected.toUpperCase() === q.correctOption.toUpperCase();
      if (isCorrect) {
        score += q.marks || 1;
      }
      reviewList.push({
        questionId: q.id,
        question: q.question,
        options: {
          A: q.optionA,
          B: q.optionB,
          C: q.optionC,
          D: q.optionD,
        },
        selectedOption: selected || null,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Record attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId,
        score,
        totalQuestions,
        percentage,
        answersJson: JSON.stringify(userAnswers),
        timeTakenSeconds: parseInt(timeTakenSeconds) || 0,
      },
    });

    // Increment streak if not already updated today
    const now = new Date();
    const currentDbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (currentDbUser) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastActiveDate: now,
          streak: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score,
      totalQuestions,
      percentage,
      reviewList,
    });
  } catch (err: any) {
    console.error('Quiz submission error:', err);
    return NextResponse.json({ error: 'Failed to evaluate quiz' }, { status: 500 });
  }
}
