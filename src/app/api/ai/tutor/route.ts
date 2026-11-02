import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { askTutor, TutorHistoryItem } from '@/lib/ai-tutor';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to your student account to use the AI Tutor' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return NextResponse.json({ error: 'Please write a question first.' }, { status: 400 });
    }
    if (question.length > 1500) {
      return NextResponse.json(
        { error: 'Question is too long. Please keep it under 1500 characters.' },
        { status: 400 }
      );
    }

    const subject =
      typeof body?.subject === 'string' && body.subject.length <= 40 ? body.subject : 'General';
    const classGrade =
      typeof body?.classGrade === 'string' && body.classGrade.length <= 4
        ? body.classGrade
        : user.className || '9';

    const rawHistory: any[] = Array.isArray(body?.history) ? body.history : [];
    const history: TutorHistoryItem[] = rawHistory
      .filter(
        (h) =>
          h &&
          (h.role === 'user' || h.role === 'model') &&
          typeof h.text === 'string' &&
          h.text.trim().length > 0
      )
      .slice(-8)
      .map((h) => ({ role: h.role, text: h.text.slice(0, 1500) }));

    const result = await askTutor({ question, classGrade, subject, history });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'AI Tutor could not answer right now.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, answer: result.answer });
  } catch (err: any) {
    console.error('AI Tutor error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error in AI Tutor' },
      { status: 500 }
    );
  }
}
