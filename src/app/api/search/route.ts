import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Global search — lafz-ba-lafz (tokenized) matching:
// query ke har lafz ko alag match karo (AND), har lafz kisi bhi field se
// match ho sakta hai (OR). Is se "Class 9 Physics", "Physics 2024",
// "Model Papers" jaisi multi-word searches bhi sahi results deti hain.
const STOPWORDS = new Set(['class', 'grade', 'paper', 'papers']);

function tokenize(raw: string): string[] {
  const words = raw
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
  const meaningful = words.filter((w) => !STOPWORDS.has(w.toLowerCase()));
  return meaningful.length > 0 ? meaningful : words;
}

function paperWordFilter(w: string) {
  const ors: any[] = [
    { title: { contains: w } },
    { subject: { contains: w } },
    { session: { contains: w } },
  ];
  if (/^\d+$/.test(w)) {
    // "9" / "10" waghera → exact class; "2024" → exact year
    ors.push({ classGrade: w });
    if (w.length === 4) ors.push({ year: parseInt(w, 10) });
  } else {
    ors.push({ classGrade: { contains: w } });
  }
  const lw = w.toLowerCase();
  if (lw === 'model') ors.push({ paperType: 'MODEL_PAPER' });
  if (lw === 'past') ors.push({ paperType: 'PAST_PAPER' });
  return { OR: ors };
}

function quizWordFilter(w: string) {
  const ors: any[] = [
    { title: { contains: w } },
    { subject: { contains: w } },
    { chapter: { contains: w } },
  ];
  if (/^\d+$/.test(w)) {
    ors.push({ classGrade: w });
  } else {
    ors.push({ classGrade: { contains: w } });
  }
  return { OR: ors };
}

function announcementWordFilter(w: string) {
  return {
    OR: [
      { title: { contains: w } },
      { content: { contains: w } },
      { category: { contains: w } },
    ],
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ papers: [], quizzes: [], announcements: [] });
    }

    const words = tokenize(query.trim());

    const [papers, quizzes, announcements] = await Promise.all([
      prisma.paper.findMany({
        where: { AND: words.map(paperWordFilter) },
        take: 12,
        orderBy: { year: 'desc' },
      }),
      prisma.quiz.findMany({
        where: { AND: words.map(quizWordFilter) },
        take: 12,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.announcement.findMany({
        where: { AND: words.map(announcementWordFilter) },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ papers, quizzes, announcements });
  } catch (err) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
