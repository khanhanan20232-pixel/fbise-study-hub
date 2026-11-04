import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { canStudentAccessQuiz } from '@/lib/quiz-access';

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

    // Phase E speed: when the client sends the ids it was actually served
    // (Full/Half Book random subsets), filter IN the query instead of loading
    // the whole 100+ question pool and discarding most of it in memory.
    const hasServedIds = Array.isArray(questionIds) && questionIds.length > 0;
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: hasServedIds
          ? { where: { id: { in: questionIds } } }
          : true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Phase E (teacher audit): a student cannot submit an attempt for another
    // class's quiz (exception: shared into one of their study groups).
    if (!(await canStudentAccessQuiz(user, quizId, quiz.classGrade))) {
      return NextResponse.json(
        {
          error: `This quiz is for Class ${quiz.classGrade} students. Your account is Class ${user.className}, so you can only take Class ${user.className} quizzes.`,
        },
        { status: 403 }
      );
    }

    // For Full/Half Book quizzes the student only saw a random subset of the
    // pool — score only the questions that were actually served. If none of
    // the sent ids matched this quiz (stale/foreign ids), fall back to the
    // full question set, exactly as the previous in-memory filter did.
    let questionsToScore = quiz.questions;
    if (hasServedIds && questionsToScore.length === 0) {
      questionsToScore = await prisma.quizQuestion.findMany({
        where: { quizId },
      });
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

    // Flashcards (FSRS): har ghalat jawab wala sawal student ka flashcard ban
        // jata hai — lekin sirf tab jab pehle se mojood na ho (progress kabhi reset
        // nahi hota). Ye block kabhi attempt response ko fail nahi kar sakta.
        try {
                const wrongIds = questionsToScore
                  .filter((q) => {
                              const selected = userAnswers[q.id];
                              return !(selected && selected.toUpperCase() === q.correctOption.toUpperCase());
                  })
                  .map((q) => q.id);
                if (wrongIds.length > 0) {
                          const existingCards = await prisma.userFlashcard.findMany({
                                      where: { userId: user.id, cardId: { in: wrongIds } },
                                      select: { cardId: true },
                          });
                          const have = new Set(existingCards.map((c) => c.cardId));
                          // Phase E speed: pehle har naye card ke liye alag
                          // sequential create call jati thi (Full Book par 50
                          // tak round-trips). Ab saare creates aik hi
                          // transaction mein batch ho jate hain.
                          const newCardIds = wrongIds.filter((cardId) => !have.has(cardId));
                          if (newCardIds.length > 0) {
                                      await prisma.$transaction(
                                                    newCardIds.map((cardId) =>
                                                                  prisma.userFlashcard.create({ data: { userId: user.id, cardId } })
                                                    )
                                      );
                          }
                }
        } catch (fcErr) {
                console.error('Flashcard auto-generation failed (attempt unaffected):', fcErr);
        }

    // Increment streak if not already updated today
    // Phase E speed: pehle findUnique + update do alag queries thin; ab aik
    // hi updateMany hai (user mojood na ho to count 0, koi throw nahi).
    await prisma.user.updateMany({
      where: { id: user.id },
      data: {
        lastActiveDate: new Date(),
        streak: { increment: 1 },
      },
    });

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
