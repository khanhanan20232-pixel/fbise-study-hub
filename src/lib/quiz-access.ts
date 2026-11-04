import { prisma } from './prisma';

// Phase E (teacher audit, 2026-11-04): students may only access quizzes of
// their OWN class. The one exception is a quiz that has been shared into a
// study group the student belongs to — group members study shared quizzes
// together by design (Phase: Study Groups), so those stay accessible even
// when the quiz belongs to another class.
//
// Admins are never restricted. Guests have no class, so they are never
// restricted here either (quiz pages already require login to play).

type SessionLike = {
  id: string;
  role: string;
  className: string;
} | null | undefined;

export function isCrossClassForStudent(
  user: SessionLike,
  quizClassGrade: string
): boolean {
  if (!user) return false;
  if (user.role !== 'STUDENT') return false;
  return String(user.className) !== String(quizClassGrade);
}

export async function isQuizSharedWithUser(
  quizId: string,
  userId: string
): Promise<boolean> {
  const share = await prisma.groupSharedQuiz.findFirst({
    where: {
      quizId,
      group: { members: { some: { userId } } },
    },
    select: { id: true },
  });
  return Boolean(share);
}

// Full check used by the quiz GET + attempt POST routes.
export async function canStudentAccessQuiz(
  user: SessionLike,
  quizId: string,
  quizClassGrade: string
): Promise<boolean> {
  if (!isCrossClassForStudent(user, quizClassGrade)) return true;
  return isQuizSharedWithUser(quizId, user!.id);
}
