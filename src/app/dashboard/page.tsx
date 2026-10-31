'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  GraduationCap,
  Flame,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Bookmark,
  FileText,
  Eye,
  Download,
  Trash2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Calendar,
  AlertCircle,
  Printer,
} from 'lucide-react';
import PdfViewerModal from '@/components/PdfViewerModal';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'quizzes' | 'checkedPapers' | 'bookmarks'>('overview');

  // PDF Viewer Modal State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{
    title: string;
    fileUrl: string;
    paperId?: string;
    subject?: string;
    classGrade?: string;
  } | null>(null);

  // Selected Evaluation Report Modal State
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, isLoading, router]);

  const loadDashboard = async () => {
    try {
      const res = await fetch('/api/student/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  if (isLoading || loadingData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Student Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Unable to load dashboard records</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 rounded-lg bg-emerald-800 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, quizAttempts, checkedPapers, bookmarks } = dashboardData;

  // ---- Subject-wise Progress algorithm ----
  // Har subject ke attempts purane → naye ki taraf lagao. Progress line aik
  // smoothed line hai (EMA): naya point = 0.55 × pichli line + 0.45 × naya score.
  // Test acha ho to line oper uthti hai, bura ho to neeche girti hai — aik
  // achanak fluke se poori line nahi hilti, lekin asal trend saaf dikhta hai.
  const subjectProgress = (() => {
    const bySubject = new Map<string, any[]>();
    for (const a of quizAttempts) {
      if (!bySubject.has(a.subject)) bySubject.set(a.subject, []);
      bySubject.get(a.subject)!.push(a);
    }
    const result: { subject: string; tests: number; points: number[]; current: number; trend: number }[] = [];
    for (const [subject, list] of Array.from(bySubject.entries())) {
      const chronological = [...list].sort(
        (x, y) => new Date(x.completedAt).getTime() - new Date(y.completedAt).getTime()
      );
      const points: number[] = [];
      for (const a of chronological) {
        const pct = Math.round(a.percentage);
        points.push(points.length === 0 ? pct : Math.round(0.55 * points[points.length - 1] + 0.45 * pct));
      }
      const shown = points.slice(-12);
      const current = shown[shown.length - 1];
      const trend = shown.length > 1 ? current - shown[shown.length - 2] : 0;
      result.push({ subject, tests: list.length, points: shown, current, trend });
    }
    return result.sort((a, b) => a.subject.localeCompare(b.subject));
  })();

  const handleOpenPdf = (paper: any) => {
    setSelectedPdf({
      title: paper.title,
      fileUrl: paper.fileUrl,
      paperId: paper.id,
      subject: paper.subject,
      classGrade: paper.classGrade,
    });
    setPdfModalOpen(true);
  };

  const handleRemoveBookmark = async (paperId: string) => {
    try {
      await fetch(`/api/papers/${paperId}/bookmark`, { method: 'POST' });
      loadDashboard();
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Card & Streak Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                {user?.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-700/80 border border-emerald-500/40 text-emerald-200">
                    {user?.role === 'ADMIN' ? 'Board Administrator' : `Class ${user?.className} Student`}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 mt-1">{user?.email}</p>
                <div className="flex items-center space-x-3 mt-2 text-xs text-emerald-300">
                  <span>FBISE Roll / Student ID: {user?.id.slice(-6).toUpperCase()}</span>
                  <span>•</span>
                  <span>Class: {user?.className === '9' ? 'SSC Part 1' : user?.className === '10' ? 'SSC Part 2' : user?.className === '11' ? '1st Year' : '2nd Year'}</span>
                </div>
              </div>
            </div>

            {/* Streak & Rank Counter */}
            <div className="flex items-center space-x-3 self-stretch sm:self-auto justify-between sm:justify-end">
              <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <div className="flex items-center justify-center space-x-1 text-amber-400 font-extrabold text-xl">
                  <Flame className="w-5 h-5 fill-amber-400" />
                  <span>{stats.streak} Days</span>
                </div>
                <div className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">
                  Study Streak
                </div>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <div className="text-white font-extrabold text-xl">{stats.avgScore}%</div>
                <div className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">
                  Avg Accuracy
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quizzes Solved</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalQuizzes}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Score</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.avgScore}%</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI Papers Checked</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalCheckedPapers}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saved Papers</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalBookmarks}</h3>
            </div>
          </div>
        </div>

        {/* Subject-wise Progress — har subject ka apna graph: acha test → line oper, bura test → line neeche */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Subject-wise Progress</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Har subject ka graph usi subject ke tests se banta hai — score acha aaye to line oper jati hai,
              kam aaye to neeche aa jati hai.
            </p>
          </div>

          {subjectProgress.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Abhi koi quiz attempt nahi hua</p>
              <p className="text-xs text-slate-500 mt-1">
                Pehla quiz do — har subject ka progress graph yahin banna shuru ho jayega.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subjectProgress.map((sp) => {
                const n = sp.points.length;
                const coords = sp.points.map((v, i) => {
                  const x = n === 1 ? 150 : 10 + (i * 280) / (n - 1);
                  const y = 90 - (v / 100) * 76;
                  return { x, y, v };
                });
                const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
                const areaPoints = `${linePoints} ${coords[coords.length - 1].x},96 ${coords[0].x},96`;
                const stroke = sp.trend > 0 ? '#059669' : sp.trend < 0 ? '#dc2626' : '#64748b';
                const scoreColor =
                  sp.current >= 60
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : sp.current >= 40
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400';
                return (
                  <div
                    key={sp.subject}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{sp.subject}</h3>
                        <p className="text-[11px] text-slate-500 font-semibold">
                          {sp.tests} test{sp.tests === 1 ? '' : 's'} diye
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-black leading-none ${scoreColor}`}>{sp.current}%</div>
                        <div
                          className={`flex items-center justify-end gap-1 text-[11px] font-bold mt-1 ${
                            sp.trend > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : sp.trend < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-slate-400'
                          }`}
                        >
                          {sp.trend > 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : sp.trend < 0 ? (
                            <TrendingDown className="w-3.5 h-3.5" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {n === 1 ? 'Pehla test' : sp.trend > 0 ? `+${sp.trend} oper` : sp.trend < 0 ? `${sp.trend} neeche` : 'Barabar'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <svg viewBox="0 0 300 100" className="w-full h-24" role="img" aria-label={`${sp.subject} progress graph`}>
                      {/* 50% guide line */}
                      <line x1="10" y1="52" x2="290" y2="52" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                      {n > 1 && <polygon points={areaPoints} fill={stroke} opacity="0.08" />}
                      {n > 1 && <polyline points={linePoints} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
                      {coords.map((c, i) => (
                        <circle key={i} cx={c.x} cy={c.y} r={i === n - 1 ? 4.5 : 2.5} fill={stroke} stroke="white" strokeWidth="1" />
                      ))}
                    </svg>

                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span>Pehla test</span>
                      <span>50% line</span>
                      <span>Latest</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Progress & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'quizzes'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Quiz History ({quizAttempts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('checkedPapers')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'checkedPapers'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Checked Papers ({checkedPapers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'bookmarks'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Papers ({bookmarks.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & PROGRESS CHARTS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Performance Chart & Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Trend Box */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Quiz Score Progression
                    </h3>
                    <p className="text-xs text-slate-500">Chronological accuracy across recent attempts</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                    Target: 85%+ Distinction
                  </span>
                </div>

                {/* SVG Visual Performance Chart */}
                <div className="h-44 w-full flex items-end justify-between pt-6 px-2 gap-2 border-b border-slate-100 dark:border-slate-800">
                  {quizAttempts.length > 0 ? (
                    quizAttempts.slice(0, 7).reverse().map((attempt: any, idx: number) => {
                      const heightPercent = Math.max(15, attempt.percentage);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                          <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-700 mb-1">
                            {attempt.percentage}%
                          </span>
                          <div
                            className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-emerald-800 to-emerald-500 group-hover:from-amber-500 group-hover:to-amber-400 transition-all duration-300 shadow-sm"
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                          <span className="text-[10px] text-slate-400 mt-2 truncate max-w-[60px]">
                            {attempt.subject}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      No quiz attempts yet. Take a daily quiz to see your progress chart!
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Action Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={`/classes/class-${user?.className || '9'}`}
                  className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between group"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-700 transition-colors">
                      My Class Section ({user?.className === '9' ? 'Class 9' : user?.className === '10' ? 'Class 10' : user?.className === '11' ? '1st Year' : '2nd Year'})
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      View all subjects, syllabus papers & model quizzes
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/ai-paper-check"
                  className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between group"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-amber-700 transition-colors">
                      AI Paper Assessment
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Upload or type your answers for instant FBISE grading
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right 1 Col: Quick Profile Summary & FBISE Target */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  FBISE Board Examination Target
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Matric/Inter Readiness</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {Math.min(100, (stats.totalQuizzes * 10) + (stats.totalCheckedPapers * 20))}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (stats.totalQuizzes * 10) + (stats.totalCheckedPapers * 20))}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Recommended Strategy:
                    </span>
                    <p>• Attempt 1 daily quiz every morning to maintain your streak.</p>
                    <p>• Check at least 1 full-length model paper using the AI tool before final exams.</p>
                  </div>
                </div>
              </div>

              {/* Latest Saved Papers Preview */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Saved Past Papers</h3>
                  <button
                    onClick={() => setActiveTab('bookmarks')}
                    className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {bookmarks.length > 0 ? (
                  <div className="space-y-2">
                    {bookmarks.slice(0, 3).map((b: any) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                          {b.paper.title}
                        </span>
                        <button
                          onClick={() => handleOpenPdf(b.paper)}
                          className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-bold flex-shrink-0"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No bookmarked papers yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUIZ HISTORY */}
        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">My Quiz Attempts</h3>
                <p className="text-xs text-slate-500">Record of all daily chapter quizzes completed</p>
              </div>
              <Link
                href="/quizzes"
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors"
              >
                Take New Quiz
              </Link>
            </div>

            {quizAttempts.length > 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3 px-4">Quiz Title & Subject</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Accuracy</th>
                        <th className="py-3 px-4">Time Taken</th>
                        <th className="py-3 px-4">Completed On</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {quizAttempts.map((attempt: any) => (
                        <tr key={attempt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                            <div>{attempt.quizTitle}</div>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                              {attempt.subject} • {attempt.chapter}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold">
                            {attempt.score} / {attempt.totalQuestions}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${
                                attempt.percentage >= 80
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : attempt.percentage >= 60
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                  : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                              }`}
                            >
                              {attempt.percentage}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/quizzes/${attempt.quizId}`}
                              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                            >
                              Retake / View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">No Quizzes Solved Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Test your FBISE chapter understanding with a daily quiz and track your score progression.
                </p>
                <Link
                  href="/quizzes"
                  className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
                >
                  Start First Quiz
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI CHECKED PAPERS & PRINTABLE REPORTS */}
        {activeTab === 'checkedPapers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  AI Evaluated Papers & Diagnostic Reports
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed question-by-question FBISE marking scheme breakdown
                </p>
              </div>
              <Link
                href="/ai-paper-check"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Check Another Paper</span>
              </Link>
            </div>

            {checkedPapers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checkedPapers.map((paper: any) => (
                  <div
                    key={paper.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {paper.subject} • Class {paper.classGrade}
                        </span>
                        <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                          Grade {paper.grade}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {paper.paperTitle || `${paper.subject} Board Submission`}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Checked on {new Date(paper.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Score: <span className="text-emerald-700 dark:text-emerald-400">{paper.obtainedMarks}</span> / {paper.totalMarks} ({paper.percentage}%)
                      </div>

                      <Link
                        href={`/ai-paper-check?reportId=${paper.id}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-100 transition-colors flex items-center space-x-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View / Print Report</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">No Checked Papers Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Submit your solved paper answers to get an instant question-wise breakdown of marks and FBISE mistake diagnosis.
                </p>
                <Link
                  href="/ai-paper-check"
                  className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Submit Paper to AI
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BOOKMARKED PAPERS */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  Saved / Bookmarked Papers
                </h3>
                <p className="text-xs text-slate-500">
                  Quick access to all past and model papers you have pinned for study
                </p>
              </div>
              <Link
                href="/past-papers"
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors"
              >
                Browse Library
              </Link>
            </div>

            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Class {b.paper.classGrade} • {b.paper.session} {b.paper.year}
                        </span>
                        <button
                          onClick={() => handleRemoveBookmark(b.paper.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {b.paper.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{b.paper.subject}</p>
                    </div>

                    <div className="flex items-center space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleOpenPdf(b.paper)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF</span>
                      </button>
                      <Link
                        href={`/ai-paper-check?subject=${encodeURIComponent(b.paper.subject)}&classGrade=${b.paper.classGrade}&paperId=${b.paper.id}`}
                        className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1"
                        title="Solve & AI Check"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Solve</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">No Saved Papers</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click the bookmark ribbon on any past paper in the library to save it here for fast revision.
                </p>
                <Link
                  href="/past-papers"
                  className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
                >
                  Browse Past Papers
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PdfViewerModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          title={selectedPdf.title}
          fileUrl={selectedPdf.fileUrl}
          paperId={selectedPdf.paperId}
          subject={selectedPdf.subject}
          classGrade={selectedPdf.classGrade}
        />
      )}
    </div>
  );
}
