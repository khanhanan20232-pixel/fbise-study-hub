import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getStreamData } from '@/data/streams';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [dbUser, rawQuizAttempts, rawCheckedPapers, rawBookmarks] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          className: true,
          stream: true,
          phone: true,
          streak: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.quizAttempt.findMany({
        where: { userId: user.id },
        orderBy: { completedAt: 'desc' },
        include: {
          quiz: {
            select: { title: true, subject: true, chapter: true, classGrade: true },
          },
        },
      }),
      prisma.checkedPaper.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          paper: {
            select: { title: true },
          },
        },
      }),
      prisma.bookmark.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          paper: true,
        },
      }),
    ]);

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ---- Personalisation (teacher audit, Phase C) ----
    // A student only sees their OWN class's content on the dashboard:
    // quiz attempts, AI-checked papers and saved papers from other classes
    // stay in the database (and in the library / quizzes pages) but are not
    // surfaced here. Admins keep seeing everything, unfiltered.
    const isAdmin = dbUser.role === 'ADMIN';
    const ownClass = String(dbUser.className);

    const quizAttempts = isAdmin
      ? rawQuizAttempts
      : rawQuizAttempts.filter((a) => String(a.quiz.classGrade) === ownClass);
    const checkedPapers = isAdmin
      ? rawCheckedPapers
      : rawCheckedPapers.filter((c) => String(c.classGrade) === ownClass);
    const bookmarks = isAdmin
      ? rawBookmarks
      : rawBookmarks.filter((b) => String(b.paper.classGrade) === ownClass);

    // Latest papers for the student's own class (admins: latest overall).
    // When the student has a study group/stream, papers in that stream's
    // subjects come first (e.g. Computer Science group → computer papers).
    const streamSubjects = (() => {
      if (isAdmin || !dbUser.stream) return [];
      const data = getStreamData(ownClass);
      const found = data.streams.find((s) => s.name === dbUser.stream);
      return found ? found.subjects : [];
    })();

    const recentPapers = await prisma.paper.findMany({
      where: isAdmin ? {} : { classGrade: ownClass },
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      take: streamSubjects.length > 0 ? 30 : 6,
    });
    const classPapers =
      streamSubjects.length > 0
        ? [
            ...recentPapers.filter((p) => streamSubjects.includes(p.subject)),
            ...recentPapers.filter((p) => !streamSubjects.includes(p.subject)),
          ].slice(0, 6)
        : recentPapers.slice(0, 6);

    const totalQuizzes = quizAttempts.length;
    const avgScore =
      totalQuizzes > 0
        ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalQuizzes)
        : 0;

    const stats = {
      totalQuizzes,
      avgScore,
      totalCheckedPapers: checkedPapers.length,
      totalBookmarks: bookmarks.length,
      streak: dbUser.streak,
    };

    return NextResponse.json({
      user: dbUser,
      stats,
      classPapers,
      quizAttempts: quizAttempts.map((a) => ({
        id: a.id,
        quizId: a.quizId,
        quizTitle: a.quiz.title,
        subject: a.quiz.subject,
        chapter: a.quiz.chapter,
        classGrade: a.quiz.classGrade,
        score: a.score,
        totalQuestions: a.totalQuestions,
        percentage: a.percentage,
        timeTakenSeconds: a.timeTakenSeconds,
        completedAt: a.completedAt,
      })),
      checkedPapers: checkedPapers.map((c) => ({
        id: c.id,
        subject: c.subject,
        classGrade: c.classGrade,
        totalMarks: c.totalMarks,
        obtainedMarks: c.obtainedMarks,
        percentage: c.percentage,
        grade: c.grade,
        paperTitle: c.paper?.title,
        createdAt: c.createdAt,
      })),
      bookmarks: bookmarks.map((b) => ({
        id: b.id,
        paperId: b.paperId,
        paper: b.paper,
      })),
    });
  } catch (err: any) {
    console.error('Dashboard API error:', err);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
