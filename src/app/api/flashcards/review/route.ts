import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { applyRating, previewsFor } from '@/lib/flashcards';

// POST /api/flashcards/review { cardId, rating } — rating: 1=Again 2=Hard 3=Good 4=Easy.
// Loads (or creates) the student's UserFlashcard for that question, advances it
// with ts-fsrs, and saves the new scheduling state.
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to review flashcards' }, { status: 401 });
    }

    const body = await req.json();
    const cardId = body?.cardId;
    const rating = Number(body?.rating);
    if (!cardId || ![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json({ error: 'cardId and a rating of 1-4 are required' }, { status: 400 });
    }

    const question = await prisma.quizQuestion.findUnique({ where: { id: cardId } });
    if (!question) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const now = new Date();
    const existing = await prisma.userFlashcard.findUnique({
      where: { userId_cardId: { userId: user.id, cardId } },
    });

    const next = applyRating(existing, rating, now);

    const saved = await prisma.userFlashcard.upsert({
      where: { userId_cardId: { userId: user.id, cardId } },
      create: {
        userId: user.id,
        cardId,
        state: next.state,
        stability: next.stability,
        difficulty: next.difficulty,
        elapsedDays: next.elapsedDays,
        scheduledDays: next.scheduledDays,
        reps: next.reps,
        lapses: next.lapses,
        dueDate: next.dueDate,
        lastReview: next.lastReview,
      },
      update: {
        state: next.state,
        stability: next.stability,
        difficulty: next.difficulty,
        elapsedDays: next.elapsedDays,
        scheduledDays: next.scheduledDays,
        reps: next.reps,
        lapses: next.lapses,
        dueDate: next.dueDate,
        lastReview: next.lastReview,
      },
    });

    return NextResponse.json({
      success: true,
      cardId,
      rating,
      state: saved.state,
      scheduledDays: saved.scheduledDays,
      dueDate: saved.dueDate,
      interval: next.interval,
      previews: previewsFor(saved, now),
    });
  } catch (err: any) {
    console.error('Flashcard review error:', err);
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}
