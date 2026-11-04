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
  Layers,
  ChevronRight,
} from 'lucide-react';
import PdfViewerModal from '@/components/PdfViewerModal';
import { getStreamData } from '@/data/streams';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [flashcardsDue, setFlashcardsDue] = useState<number>(0);
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
      // Flashcards (FSRS) — aaj kitne cards due hain (banner ke liye)
      try {
        const fcRes = await fetch('/api/flashcards/due');
        if (fcRes.ok) {
          const fcData = await fcRes.json();
          setFlashcardsDue(fcData.dueCount || 0);
        }
      } catch {}
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
  const classPapers: any[] = dashboardData.classPapers || [];

  // ---- My Subjects (teacher audit, Phase C) ----
  // Aik hi subjects section: student ki apni class ke compulsory subjects +
  // us ke study group/stream ke field subjects. Stream set na ho (purane
  // accounts) to class ke tamam elective subjects dikhaye jate hain.
  // Dashboard API pehle hi tamam lists (attempts / checked papers /
  // bookmarks) ko student ki apni class tak mehdood kar deta hai.
  const dashUser = dashboardData.user || {};
  const isAdminUser = (dashUser.role || user?.role) === 'ADMIN';
  const myClass = String(dashUser.className || user?.className || '9');
  const myStreamName: string | null = dashUser.stream ?? user?.stream ?? null;
  const streamData = getStreamData(myClass);
  const myStream = myStreamName
    ? streamData.streams.find((s) => s.name === myStreamName)
    : undefined;
  const electiveSubjects = (
    myStream
      ? myStream.subjects
      : Array.from(new Set(streamData.streams.flatMap((s) => s.subjects)))
  ).filter((s) => !streamData.compulsory.includes(s));

  // Dashboard se bahir jane walay links bhi student ki apni class par scoped
  const quizzesHref = isAdminUser ? '/quizzes' : `/quizzes?class=${myClass}`;
  const papersHref = isAdminUser ? '/past-papers' : `/past-papers?classGrade=${myClass}`;

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
    <div className="min-h-screen bg-cream-100 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Profile Card & Streak Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 text-white p-6 sm:p-8 shadow-xl border border-navy-700/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-accent-400 text-navy-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quizzes Solved</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalQuizzes}</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Score</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.avgScore}%</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-fbise-50 dark:bg-fbise-950/70 text-fbise-700 dark:text-fbise-300 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI Papers Checked</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalCheckedPapers}</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saved Papers</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalBookmarks}</h3>
            </div>
          </div>
        </div>

        {/* Flashcards (FSRS) due banner */}
        <Link
          href="/flashcards"
          className="flex items-center justify-between p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-fbise-50 dark:bg-fbise-950/70 text-fbise-700 dark:text-fbise-400 flex items-center justify-center flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">Flashcards — Smart Review (FSRS)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {flashcardsDue > 0
                  ? `${flashcardsDue} cards aaj due hain — bhoolne se pehle revise kar lein`
                  : 'Aaj koi card due nahi — ghalat jawab walay sawal yahan khud cards ban jatay hain'}
              </p>
            </div>
          </div>
          <span className="flex items-center text-xs font-bold text-fbise-700 dark:text-fbise-400 flex-shrink-0">
            {flashcardsDue > 0 && (
              <span className="mr-3 px-2.5 py-1 rounded-full bg-fbise-600 text-white text-[11px] font-black">{flashcardsDue} due</span>
            )}
            Review <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>

        {/* My Subjects — aik hi section: apni class ke compulsory + stream subjects */}
        {!isAdminUser && (
          <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-fbise-700 dark:text-fbise-400" />
                <span>
                  My Subjects —{' '}
                  {myClass === '9'
                    ? 'Class 9'
                    : myClass === '10'
                      ? 'Class 10'
                      : myClass === '11'
                        ? '1st Year (Class 11)'
                        : '2nd Year (Class 12)'}
                </span>
                {myStream && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-fbise-50 dark:bg-fbise-950/50 border border-fbise-200 dark:border-fbise-800/40 text-fbise-800 dark:text-fbise-300">
                    {myStream.name}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sirf aap ki class ke subjects — har subject ke quizzes aik click par khul jayenge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Compulsory subjects for this class */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-fbise-600" />
                  <span>Compulsory Subjects</span>
                </h3>
                <div className="space-y-3">
                  {streamData.compulsory.map((subject) => (
                    <Link
                      key={subject}
                      href={`/quizzes?class=${myClass}&subject=${encodeURIComponent(subject)}`}
                      className="flex items-center justify-between gap-3 p-4 rounded-xl bg-cream-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-fbise-600 transition-colors"
                    >
                      <span className="flex items-center space-x-2.5">
                        <BookOpen className="w-4 h-4 text-fbise-700 dark:text-fbise-400 flex-shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{subject}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-xs font-bold text-fbise-700 dark:text-fbise-400 whitespace-nowrap">
                        <span>Quizzes</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* The student's own stream subjects (or all electives if no stream set) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-fbise-600" />
                  <span>{myStream ? `Your Field Subjects – ${myStream.name}` : 'Elective Subjects'}</span>
                </h3>
                <div className="space-y-3">
                  {electiveSubjects.map((subject) => (
                    <Link
                      key={subject}
                      href={`/quizzes?class=${myClass}&subject=${encodeURIComponent(subject)}`}
                      className="flex items-center justify-between gap-3 p-4 rounded-xl bg-cream-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-fbise-600 transition-colors"
                    >
                      <span className="flex items-center space-x-2.5">
                        <BookOpen className="w-4 h-4 text-fbise-700 dark:text-fbise-400 flex-shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{subject}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-xs font-bold text-fbise-700 dark:text-fbise-400 whitespace-nowrap">
                        <span>Quizzes</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {!myStream && (
              <p className="text-[11px] text-slate-400">
                Aap ke profile mein study group set nahi hai, is liye is class ke tamam elective subjects
                dikhaye ja rahe hain.
              </p>
            )}
            {streamData.note && <p className="text-[11px] text-slate-400">{streamData.note}</p>}
          </section>
        )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <text x="12" y="12" fontSize="8" fill="#94a3b8" fontWeight="600">100%</text>
                      <text x="12" y="99" fontSize="8" fill="#94a3b8" fontWeight="600">0%</text>
                      {n > 1 && <polygon points={areaPoints} fill={stroke} opacity="0.08" />}
                      {n > 1 && <polyline points={linePoints} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
                      {coords.map((c, i) => (
                    <g key={i}>
                      <title>{`${sp.subject} — Test ${i + 1}: ${c.v}%`}</title>
                      <circle cx={c.x} cy={c.y} r="10" fill="transparent" />
                      <circle cx={c.x} cy={c.y} r={i === n - 1 ? 4.5 : 2.5} fill={stroke} stroke="white" strokeWidth="1" />
                    </g>
                    ))}
                      <text x={Math.min(coords[n - 1].x, 260)} y={Math.max(coords[n - 1].y - 8, 10)} fontSize="9" fontWeight="700" fill={stroke}>
                        {sp.current}%
                      </text>
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
            <Award className="w-4 h-4" />
            <span>Quiz Attempts ({quizAttempts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('checkedPapers')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'checkedPapers'
                ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Papers Checked ({checkedPapers.length})</span>
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

        {/* TAB 1: OVERVIEW / PROGRESS ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Papers for Your Class — sirf student ki apni class ke papers */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <span>Papers for Your Class{isAdminUser ? '' : ` — Class ${myClass}`}</span>
                </h3>
                <Link href={papersHref} className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center hover:underline">
                  View All Papers <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>

              {classPapers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Is class ke liye abhi koi paper available nahi hai.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {classPapers.map((paper) => (
                    <div
                      key={paper.id}
                      onClick={() => handleOpenPdf(paper)}
                      className="p-4 rounded-xl bg-cream-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-600 hover:shadow-sm transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{paper.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex-shrink-0">
                          {paper.paperType === 'MODEL_PAPER' ? 'Model Paper' : 'Past Paper'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-semibold">
                        <span>Class {paper.classGrade}</span>
                        <span>•</span>
                        <span>{paper.subject}</span>
                      </div>
                      <div className="flex items-center space-x-2 pt-1">
                        <span className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <Eye className="w-3.5 h-3.5 mr-1" /> View PDF
                        </span>
                        <a
                          href={paper.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center text-xs font-bold text-slate-500 hover:text-emerald-700"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> PDF
                        </a>
                        <Link
                          href={`/ai-paper-check?subject=${encodeURIComponent(paper.subject)}&classGrade=${paper.classGrade}&paperId=${paper.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center text-xs font-bold text-slate-500 hover:text-emerald-700"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Check
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabad text-slate-900 dark:text-white flex items-center space-x-2">
                    <Award className="w-5 h-5 text-emerald-700" />
                    <span>Recent Quiz Attempts</span>
                  </h3>
                </div>

                {quizAttempts.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">Abhi tak koi quiz attempt nahi hua. Apni pehli daily quiz start karen!</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {quizAttempts.slice(0, 5).map((attempt) => (
                      <div key={attempt.id} className="py-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{attempt.quizTitle}</h4>
                          <p className="text-[11px] text-slate-400 font-semibold">
                            {attempt.subject} • Class {attempt.classGrade} • {new Date(attempt.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            attempt.percentage >= 80
                              ? 'bg-emerald-50 text-emerald-800'
                              : attempt.percentage >= 50
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-red-50 text-red-800'
                          }`}>
                            {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                            {attempt.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 dark:text-white">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={quizzesHref}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-accent-400" />
                      <div>
                        <p className="text-xs font-bold">Daily Quiz Attempt</p>
                        <p className="text-[10px] text-emerald-200">Test your preparation today</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href="/ai-paper-check"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-cream-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-600 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-5 h-5 text-emerald-700" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">AI Paper Checker</p>
                        <p className="text-[10px] text-slate-500">Check a solved past paper</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href={papersHref}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-cream-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-600 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-emerald-700" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Browse Past Papers</p>
                        <p className="text-[10px] text-slate-500">View FBISE board exams</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Tips Panel */}
              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>🎯</span> <span>Board Exam Strategy Tip</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  FBISE checking mein step-wise marking hoti hai. Har numerical ke liye formula, data aur units
                  lazmi likhein — agar final answer ghalat bhi ho to formula ke marks mil jate hain. Attempt
                  paper chronologically, aur long questions mein diagrams lazmi banayein.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUIZ ATTEMPTS LOG */}
        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Quiz Attempts History</h3>
                <p className="text-xs text-slate-500">Total {quizAttempts.length} attempts recorded under your FBISE student profile.</p>
              </div>
              <Link
                href={quizzesHref}
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors"
              >
                Take New Quiz
              </Link>
            </div>

            {quizAttempts.length > 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-cream-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3 px-4">Quiz Title</th>
                        <th className="py-3 px-4">Subject / Class</th>
                        <th className="py-3 px-4">Marks Obtained</th>
                        <th className="py-3 px-4">Score %</th>
                        <th className="py-3 px-4">FBISE Grade</th>
                        <th className="py-3 px-4">Date Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                      {quizAttempts.map((attempt) => (
                        <tr key={attempt.id} className="hover:bg-cream-100 dark:hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{attempt.quizTitle}</td>
                          <td className="py-3.5 px-4">{attempt.subject} • Class {attempt.classGrade}</td>
                          <td className="py-3.5 px-4">{attempt.score} / {attempt.totalQuestions}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              attempt.percentage >= 80
                                ? 'bg-emerald-50 text-emerald-800'
                                : attempt.percentage >= 50
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-red-50 text-red-800'
                            }`}>
                              {attempt.percentage}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">{attempt.grade}</td>
                          <td className="py-3.5 px-4 text-slate-400">{new Date(attempt.completedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200">
                <p className="text-sm text-slate-500">No quiz attempts logged yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI CHECKED PAPERS HISTORY */}
        {activeTab === 'checkedPapers' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">AI Paper Evaluations History</h3>
              <p className="text-xs text-slate-500">Saare reports jo AI ne check kiye — kisi bhi row par click karke poori report dubara dekho.</p>
            </div>

            {checkedPapers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checkedPapers.map((paper) => (
                  <div
                    key={paper.id}
                    onClick={() => setSelectedReport(paper)}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                          {paper.paperTitle || `${paper.subject} Examination`}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          {paper.subject} • Class {paper.classGrade} • {new Date(paper.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-xs whitespace-nowrap">
                        {paper.score}/{paper.totalMarks} ({paper.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-500">Grade: <span className="text-slate-900 dark:text-white font-black">{paper.grade}</span></span>
                      <span className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        View Full Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No papers checked by AI yet. Use the AI Paper Checker to submit answers.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED / BOOKMARKED PAPERS */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">My Saved Papers</h3>
              <p className="text-xs text-slate-500">Bookmarked FBISE past & model papers for offline revision.</p>
            </div>

            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cream-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Class {bookmark.paper.classGrade} • {bookmark.paper.subject}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2 line-clamp-2">{bookmark.paper.title}</h4>
                      </div>
                      <button
                        onClick={() => handleRemoveBookmark(bookmark.paper.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => handleOpenPdf(bookmark.paper)}
                        className="flex-1 py-2 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 flex items-center justify-center space-x-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF</span>
                      </button>
                      <a
                        href={bookmark.paper.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 flex items-center justify-center space-x-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No saved papers yet. Bookmark papers from Past Papers page.</p>
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

      {/* Selected Evaluation Report Modal — quick view only (question-wise
          breakdown ke liye har report ka apna link /ai-paper-check?reportId=) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-700 dark:text-emerald-400">
                  FBISE AI Assessment Report (Saved)
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {selectedReport.paperTitle || `${selectedReport.subject} Examination`}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {selectedReport.subject} • Class {selectedReport.classGrade} • Checked on{' '}
                  {new Date(selectedReport.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white text-center">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Marks</p>
                <p className="text-2xl font-black text-accent-400">
                  {selectedReport.score} <span className="text-sm font-normal text-white">/ {selectedReport.totalMarks}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Percentage</p>
                <p className="text-2xl font-black">{selectedReport.percentage}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Grade</p>
                <p className="text-2xl font-black text-accent-400">{selectedReport.grade}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cream-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Chief Examiner Remarks:
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedReport.feedbackSummary}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
              <Link
                href={`/ai-paper-check?reportId=${selectedReport.id}`}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Detailed Breakdown</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
