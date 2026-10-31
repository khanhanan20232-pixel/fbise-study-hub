import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          select: {
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
          },
        },
      },
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

    let questions = quiz.questions;
    if (sampleSize > 0 && questions.length > sampleSize) {
      const shuffled = [...questions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      questions = shuffled.slice(0, sampleSize);
    }

    return NextResponse.json({ quiz: { ...quiz, questions, poolSize: quiz.questions.length } });
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
