'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Flame,
  Clock,
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Award,
  Zap,
  BookOpen,
  Layers,
} from 'lucide-react';

export default function DailyQuizzesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classGrade, setClassGrade] = useState<string>(user?.className || 'ALL');
  const [subject, setSubject] = useState<string>('ALL');

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          classGrade,
          subject,
        });
        const res = await fetch(`/api/quizzes?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data.quizzes || []);
        }
      } catch (err) {
        console.error('Failed to load quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [classGrade, subject]);

  const handleStartQuiz = (quizId: string) => {
    if (!user) {
      router.push(`/login?redirect=/quizzes/${quizId}`);
      return;
    }
    router.push(`/quizzes/${quizId}`);
  };

  // Group quizzes chapter-wise per class + subject; a "Full Book" quiz (if one
  // exists for the subject) is pulled out and shown as its own big option.
  const isFullBook = (q: any) => (q.chapter || '').toLowerCase().startsWith('full book');

  type QuizGroup = {
    classGrade: string;
    subject: string;
    chapterQuizzes: any[];
    fullBook: any | null;
  };

  const groupsMap = new Map<string, QuizGroup>();
  for (const q of quizzes) {
    const key = `${q.classGrade}|${q.subject}`;
    if (!groupsMap.has(key)) {
      groupsMap.set(key, { classGrade: q.classGrade, subject: q.subject, chapterQuizzes: [], fullBook: null });
    }
    const g = groupsMap.get(key)!;
    if (isFullBook(q)) {
      if (!g.fullBook) g.fullBook = q;
    } else {
      g.chapterQuizzes.push(q);
    }
  }
  const groups: QuizGroup[] = Array.from(groupsMap.values())
    .sort(
      (a, b) =>
        Number(a.classGrade) - Number(b.classGrade) || a.subject.localeCompare(b.subject)
    )
    .map((g) => ({
      ...g,
      chapterQuizzes: [...g.chapterQuizzes].sort((a, b) =>
        (a.chapter || '').localeCompare(b.chapter || '', undefined, { numeric: true })
      ),
    }));

  const renderChapterCard = (quiz: any) => (
    <div
      key={quiz.id}
      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            Class {quiz.classGrade} • {quiz.subject}
          </span>
          {quiz.isDaily && (
            <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3 fill-amber-500" />
              <span>Today&apos;s Quiz</span>
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2">
          {quiz.chapter}
        </h3>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">
          {quiz.title}
        </p>

        <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>{quiz.questionCount} Questions</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{Math.round(quiz.timeLimit / 60)} mins</span>
          </span>
        </div>

        {quiz.userLatestAttempt && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between font-bold">
            <span>Previous Score:</span>
            <span>{quiz.userLatestAttempt.percentage}%</span>
          </div>
        )}
      </div>

      <button
        onClick={() => handleStartQuiz(quiz.id)}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-800 to-teal-700 hover:from-teal-900 hover:to-teal-800 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all"
      >
        <span>{quiz.userLatestAttempt ? 'Retake Quiz' : 'Start Chapter Quiz'}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderFullBookCard = (quiz: any) => (
    <div
      key={quiz.id}
      className="p-6 rounded-2xl bg-gradient-to-r from-fbise-700 via-fbise-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center gap-5"
    >
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <span className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-amber-300" />
        </span>
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-wide">
              Full Book
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/15">
              Class {quiz.classGrade} • {quiz.subject}
            </span>
          </div>
          <h3 className="font-extrabold text-lg leading-snug">
            Full Book Quiz — {quiz.subject} (Class {quiz.classGrade})
          </h3>
          <p className="text-xs text-fbise-100/90">
            Poori book ke tamam chapters ke sawal aik hi quiz mein — final revision ke liye best.
          </p>
          <div className="flex items-center space-x-4 text-xs text-fbise-100 pt-1">
            <span className="flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{quiz.questionCount} Questions</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{Math.round(quiz.timeLimit / 60)} mins</span>
            </span>
            {quiz.userLatestAttempt && (
              <span className="font-bold text-amber-300">
                Previous Score: {quiz.userLatestAttempt.percentage}%
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => handleStartQuiz(quiz.id)}
        className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap flex-shrink-0"
      >
        <span>{quiz.userLatestAttempt ? 'Retake Full Book Quiz' : 'Start Full Book Quiz'}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner with Streak Focus */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-teal-700/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-sm">
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>Daily Knowledge Drill</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                FBISE Daily Chapter Quizzes
              </h1>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                Sharpen your concepts every day with timed chapter MCQs designed strictly according to
                the Federal Board syllabus. Maintain your streak and climb the leaderboard!
              </p>
            </div>

            {/* User Streak Box */}
            {user ? (
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[180px]">
                <div className="flex items-center justify-center space-x-1.5 text-amber-400 font-black text-3xl">
                  <Flame className="w-8 h-8 fill-amber-400" />
                  <span>{user.streak} Days</span>
                </div>
                <div className="text-[11px] text-emerald-200 uppercase tracking-wider font-bold mt-1">
                  Active Study Streak
                </div>
                <p className="text-[10px] text-slate-300 mt-1">Take a quiz today to keep it growing!</p>
              </div>
            ) : (
              <Link
                href="/login?redirect=/quizzes"
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                Sign In to Track Streaks
              </Link>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Class:</label>
            <select
              value={classGrade}
              onChange={(e) => setClassGrade(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="ALL">All Classes</option>
              <option value="9">Class 9 (SSC-I)</option>
              <option value="10">Class 10 (SSC-II)</option>
              <option value="11">1st Year (HSSC-I)</option>
              <option value="12">2nd Year (HSSC-II)</option>
            </select>

            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 pl-2">Subject:</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="ALL">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Computer Science">Computer Science</option>
              <option value="English">English</option>
              <option value="Urdu">Urdu</option>
              <option value="Pakistan Studies">Pakistan Studies</option>
            </select>
          </div>

          <Link
            href="/leaderboard"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-purple-100 transition-colors"
          >
            <Trophy className="w-4 h-4 text-purple-600" />
            <span>View Student Leaderboard</span>
          </Link>
        </div>

        {/* Quizzes Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Available Quizzes: <strong className="text-slate-800 dark:text-white">{quizzes.length}</strong>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Updated Daily for FBISE Syllabus
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500">Loading daily quizzes...</p>
            </div>
          ) : quizzes.length > 0 ? (
            <div className="space-y-10">
              {groups.map((g) => (
                <section key={`${g.classGrade}-${g.subject}`} className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-fbise-600 text-white flex items-center justify-center flex-shrink-0">
                      <Layers className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                        {g.subject} — Class {g.classGrade}
                      </h2>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Chapter-wise quizzes{g.fullBook ? ' + Full Book Quiz' : ''}
                      </p>
                    </div>
                  </div>

                  {g.fullBook && renderFullBookCard(g.fullBook)}

                  {g.chapterQuizzes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {g.chapterQuizzes.map((quiz) => renderChapterCard(quiz))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200">No Quizzes for this Selection</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a different class or subject to explore active chapter quizzes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
