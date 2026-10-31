'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
  marks: number;
}

export default function QuizEnginePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  // Options are shuffled for every attempt (Abdul's requirement: the correct
  // answer must not sit on the same letter every time). displayQuestions holds
  // the shuffled copies the student sees; answerMap translates a displayed
  // letter back to the original letter so server-side marking stays correct.
  const [displayQuestions, setDisplayQuestions] = useState<Question[]>([]);
  const [answerMap, setAnswerMap] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // in seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // Require auth to access quizzes
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=/quizzes/${quizId}`);
    }
  }, [user, isLoading, quizId, router]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}`);
        if (res.ok) {
          const data = await res.json();
          setQuiz(data.quiz);
          const rawQuestions: Question[] = data.quiz.questions || [];
          setQuestions(rawQuestions);
          setTimeLeft(data.quiz.timeLimit || 600);

          // Shuffle each question's 4 options (Fisher-Yates)
          const shuffled: Question[] = [];
          const map: Record<string, Record<string, string>> = {};
          for (const q of rawQuestions) {
            const originals = ['A', 'B', 'C', 'D'] as const;
            const order = [...originals];
            for (let i = order.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [order[i], order[j]] = [order[j], order[i]];
            }
            const textOf = (letter: string) =>
              letter === 'A' ? q.optionA : letter === 'B' ? q.optionB : letter === 'C' ? q.optionC : q.optionD;
            const displayLetters = ['A', 'B', 'C', 'D'];
            const perQuestion: Record<string, string> = {};
            displayLetters.forEach((displayLetter, idx) => {
              perQuestion[displayLetter] = order[idx];
            });
            map[q.id] = perQuestion;
            shuffled.push({
              ...q,
              optionA: textOf(order[0]),
              optionB: textOf(order[1]),
              optionC: textOf(order[2]),
              optionD: textOf(order[3]),
              correctOption: displayLetters[order.indexOf(q.correctOption as (typeof originals)[number])] || q.correctOption,
            });
          }
          setDisplayQuestions(shuffled);
          setAnswerMap(map);
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || quizSubmitted) return;

    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizSubmitted, timeLeft]);

  const handleSelectOption = (questionId: string, optionLetter: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (quizSubmitted || submitting) return;
    setSubmitting(true);

    const timeTaken = quiz ? (quiz.timeLimit || 600) - timeLeft : 0;

    // Translate displayed (shuffled) letters back to the original letters
    // before submitting, so the server marks against the stored answers.
    const originalAnswers: Record<string, string> = {};
    for (const [questionId, displayLetter] of Object.entries(selectedAnswers)) {
      originalAnswers[questionId] = answerMap[questionId]?.[displayLetter] || displayLetter;
    }

    try {
      const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswers: originalAnswers,
          timeTakenSeconds: timeTaken,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResultData(data);
        setQuizSubmitted(true);

        // Confetti for score >= 70%
        if (data.percentage >= 70) {
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading FBISE Quiz Engine...</p>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Quiz Not Found</h3>
          <p className="text-xs text-slate-500">This quiz may have expired or is not yet published.</p>
          <Link
            href="/quizzes"
            className="inline-block px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  // Pre-Start Screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors flex items-center justify-center">
        <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-6">
          <div className="space-y-2 text-center">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Class {quiz.classGrade} • {quiz.subject}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white pt-2">
              {quiz.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">{quiz.chapter}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase">Questions</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">{questions.length}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase">Time Limit</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">
                {Math.round(quiz.timeLimit / 60)} Mins
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase">Format</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">FBISE MCQs</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Exam Instructions:</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>Questions appear one at a time with a countdown timer.</li>
              <li>You can navigate back and forth using the question palette.</li>
              <li>Instant result with textbook explanations is displayed immediately upon submission.</li>
              <li>Your score will be logged in your Student Dashboard and daily streak counter.</li>
            </ul>
          </div>

          <button
            onClick={() => setQuizStarted(true)}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <span>Begin Quiz Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Result Screen after submission
  if (quizSubmitted && resultData) {
    const isPassing = resultData.percentage >= 50;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Result Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-black shadow-lg ${
                isPassing
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500'
                  : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-2 border-red-500'
              }`}
            >
              {isPassing ? '🏆' : '📚'}
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Examination Assessment
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {isPassing ? 'Well Done, Scholar!' : 'Good Effort! Keep Practicing'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{quiz.title}</p>
            </div>

            {/* Score Metrics */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Marks</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {resultData.score} / {resultData.totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Percentage</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {resultData.percentage}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">FBISE Grade</p>
                <p className="text-2xl font-black text-amber-500">
                  {resultData.percentage >= 80
                    ? 'A+'
                    : resultData.percentage >= 70
                    ? 'A'
                    : resultData.percentage >= 60
                    ? 'B'
                    : resultData.percentage >= 50
                    ? 'C'
                    : 'D'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors"
              >
                View in Dashboard
              </Link>
              <Link
                href="/quizzes"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Take Another Quiz
              </Link>
            </div>
          </div>

          {/* Detailed Question Review with Explanations */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <span>Question Review & FBISE Explanations</span>
            </h3>

            <div className="space-y-4">
              {resultData.reviewList?.map((q: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-4 ${
                    q.isCorrect
                      ? 'border-emerald-200 dark:border-emerald-800/40'
                      : 'border-red-200 dark:border-red-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-bold text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Q{idx + 1}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                        q.isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {q.isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{q.isCorrect ? 'Correct (+1 Mark)' : 'Incorrect (0 Marks)'}</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    {q.question}
                  </h4>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                      const isStudentChoice = q.selectedOption === opt;
                      const isCorrectChoice = q.correctOption === opt;

                      let optClass = 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                      if (isCorrectChoice) {
                        optClass = 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isStudentChoice && !isCorrectChoice) {
                        optClass = 'bg-red-50 dark:bg-red-950/70 border-red-500 text-red-900 dark:text-red-200';
                      }

                      return (
                        <div key={opt} className={`p-3 rounded-xl border flex items-center space-x-2 ${optClass}`}>
                          <span className="font-mono font-bold w-5 h-5 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[10px] shadow-sm">
                            {opt}
                          </span>
                          <span className="flex-1">{q.options[opt]}</span>
                          {isCorrectChoice && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                          {isStudentChoice && !isCorrectChoice && (
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Syllabus Explanation Box */}
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200 space-y-1">
                    <span className="font-bold text-amber-800 dark:text-amber-400 block">
                      FBISE Syllabus Reference & Explanation:
                    </span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE QUIZ INTERFACE: ONE QUESTION AT A TIME
  const currentQ = displayQuestions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / displayQuestions.length) * 100);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeLow = timeLeft < 120; // less than 2 minutes

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Control Bar with Timer & Progress */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {quiz.subject} • Class {quiz.classGrade}
              </span>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-sm">
                {quiz.title}
              </h2>
            </div>

            {/* Countdown Timer */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-sm ${
                isTimeLow
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
          </div>

          {/* Smooth Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Question Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between text-xs">
            <span className="px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 font-bold text-emerald-800 dark:text-emerald-300">
              Question {currentIndex + 1}
            </span>
            <span className="font-semibold text-slate-400">1 Mark</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </h3>

          {/* 4 Options */}
          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as const).map((opt) => {
              const optionText =
                opt === 'A'
                  ? currentQ.optionA
                  : opt === 'B'
                  ? currentQ.optionB
                  : opt === 'C'
                  ? currentQ.optionC
                  : currentQ.optionD;

              const isSelected = selectedAnswers[currentQ.id] === opt;

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center space-x-3 transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 shadow-md ring-2 ring-emerald-600/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-emerald-500/50 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {opt}
                  </div>
                  <span className="text-xs sm:text-sm font-medium flex-1">{optionText}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center space-x-1 shadow-sm transition-colors"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center space-x-1 shadow-md transition-all"
              >
                <span>{submitting ? 'Evaluating...' : 'Submit & Check Answers'}</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question Palette */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center gap-2 flex-wrap">
          {displayQuestions.map((q, idx) => {
            const answered = Boolean(selectedAnswers[q.id]);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all ${
                  isCurrent
                    ? 'ring-2 ring-amber-500 bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : answered
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
