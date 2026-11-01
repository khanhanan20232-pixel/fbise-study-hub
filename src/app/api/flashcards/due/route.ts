import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { previewsFor, correctOptionText } from '@/lib/flashcards';

// GET /api/flashcards/due — the logged-in student's cards whose FSRS due date
// has arrived, with question content and per-rating interval previews.
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to view flashcards' }, { status: 401 });
    }

    const now = new Date();
    const stored = await prisma.userFlashcard.findMany({
      where: { userId: user.id, dueDate: { lte: now } },
      orderBy: { dueDate: 'asc' },
      take: 200,
    });

    if (stored.length === 0) {
      return NextResponse.json({ dueCount: 0, cards: [] });
    }

    const questions = await prisma.quizQuestion.findMany({
      where: { id: { in: stored.map((s) => s.cardId) } },
      include: { quiz: { select: { subject: true, chapter: true, classGrade: true } } },
    });
    const qMap = new Map(questions.map((q) => [q.id, q]));

    const cards = [];
    for (const s of stored) {
      const q = qMap.get(s.cardId);
      if (!q) continue; // question was removed from the bank — skip the orphan card
      cards.push({
        cardId: q.id,
        front: q.question,
        options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
        back: correctOptionText(q),
        correctOption: q.correctOption,
        explanation: q.explanation,
        subject: q.quiz.subject,
        chapter: q.quiz.chapter,
        classGrade: q.quiz.classGrade,
        state: s.state,
        reps: s.reps,
        lapses: s.lapses,
        dueDate: s.dueDate,
        previews: previewsFor(s, now),
      });
    }

    return NextResponse.json({ dueCount: cards.length, cards });
  } catch (err: any) {
    console.error('Flashcards due error:', err);
    return NextResponse.json({ error: 'Failed to load due flashcards' }, { status: 500 });
  }
}
