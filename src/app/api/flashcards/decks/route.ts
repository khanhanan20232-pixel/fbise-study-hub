import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { previewsFor, correctOptionText } from '@/lib/flashcards';

// GET /api/flashcards/decks
//  - without params: list of available decks (class + subject + question count)
//  - with ?classGrade=&subject=: every question of that deck as a flashcard
//    (cram / custom study mode), merged with the student's FSRS state if any.
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to view flashcards' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classGrade = searchParams.get('classGrade');
    const subject = searchParams.get('subject');

    if (!classGrade || !subject) {
      const quizzes = await prisma.quiz.findMany({
        select: { classGrade: true, subject: true, _count: { select: { questions: true } } },
      });
      const map = new Map<string, { classGrade: string; subject: string; count: number }>();
      for (const q of quizzes) {
        const key = `${q.classGrade}|${q.subject}`;
        const cur = map.get(key) || { classGrade: q.classGrade, subject: q.subject, count: 0 };
        cur.count += q._count.questions;
        map.set(key, cur);
      }
      const decks = Array.from(map.values()).sort(
        (a, b) => Number(a.classGrade) - Number(b.classGrade) || a.subject.localeCompare(b.subject)
      );
      return NextResponse.json({ decks });
    }

    const questions = await prisma.quizQuestion.findMany({
      where: { quiz: { classGrade, subject } },
      include: { quiz: { select: { subject: true, chapter: true, classGrade: true } } },
      orderBy: { quiz: { chapter: 'asc' } },
      take: 500,
    });

    const now = new Date();
    const stored = await prisma.userFlashcard.findMany({
      where: { userId: user.id, cardId: { in: questions.map((q) => q.id) } },
    });
    const sMap = new Map(stored.map((s) => [s.cardId, s]));

    const cards = questions.map((q) => {
      const s = sMap.get(q.id) || null;
      return {
        cardId: q.id,
        front: q.question,
        options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
        back: correctOptionText(q),
        correctOption: q.correctOption,
        explanation: q.explanation,
        subject: q.quiz.subject,
        chapter: q.quiz.chapter,
        classGrade: q.quiz.classGrade,
        state: s ? s.state : 0,
        reps: s ? s.reps : 0,
        lapses: s ? s.lapses : 0,
        dueDate: s ? s.dueDate : null,
        isDue: s ? s.dueDate <= now : false,
        previews: previewsFor(s, now),
      };
    });

    return NextResponse.json({ classGrade, subject, total: cards.length, cards });
  } catch (err: any) {
    console.error('Flashcards decks error:', err);
    return NextResponse.json({ error: 'Failed to load flashcard deck' }, { status: 500 });
  }
}
