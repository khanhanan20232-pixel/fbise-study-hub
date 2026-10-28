'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Trophy,
  CheckCircle,
  ArrowRight,
  Flame,
  FileText,
  Search,
  Bell,
  Star,
  Users,
  Award,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeAnnouncementIdx, setActiveAnnouncementIdx] = useState(0);

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (data.announcements) setAnnouncements(data.announcements);
      })
      .catch(() => {});
  }, []);

  const classesList = [
    {
      slug: 'class-9',
      grade: '9',
      name: 'Class 9',
      sub: 'SSC Part 1',
      desc: 'Physics, Chemistry, Biology, Mathematics, Computer Science, English, Urdu & Pak Studies.',
      color: 'from-fbise-700 to-fbise-900',
      badge: 'Matric Part 1',
    },
    {
      slug: 'class-10',
      grade: '10',
      name: 'Class 10',
      sub: 'SSC Part 2',
      desc: 'SLO-aligned board papers, model examinations, and chapter-wise daily quizzes.',
      color: 'from-fbise-700 to-fbise-900',
      badge: 'Matric Part 2',
    },
    {
      slug: 'class-11',
      grade: '11',
      name: '1st Year',
      sub: 'HSSC Part 1 (Class 11)',
      desc: 'Pre-Medical, Pre-Engineering, and ICS comprehensive preparation & AI grading.',
      color: 'from-fbise-800 to-fbise-950',
      badge: 'Intermediate Part 1',
    },
    {
      slug: 'class-12',
      grade: '12',
      name: '2nd Year',
      sub: 'HSSC Part 2 (Class 12)',
      desc: 'Final board examination papers, model marking schemes, and high-yield numerical quizzes.',
      color: 'from-fbise-900 to-slate-900',
      badge: 'Intermediate Part 2',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Ticker: Latest Official Board Announcements */}
      {announcements.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/40 py-2.5 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate pr-4">
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] tracking-wide uppercase flex-shrink-0">
                <Bell className="w-3 h-3" />
                <span>Notice</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {announcements[0]?.title}
              </span>
            </div>
            <Link
              href="/announcements"
              className="text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center space-x-1 flex-shrink-0"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Photo Banner — FBISE-style homepage pictures */}
      <section className="bg-slate-50 dark:bg-slate-950 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <img
              src="/hero-building.webp"
              alt="Federal Board of Intermediate and Secondary Education, Islamabad"
              className="w-full h-56 sm:h-72 lg:h-96 object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-fbise-950/90 via-fbise-950/40 to-transparent px-5 pb-4 pt-14">
              <div className="text-white font-extrabold text-lg sm:text-2xl leading-tight">
                Federal Board of Intermediate &amp; Secondary Education
              </div>
              <div className="text-amber-300 text-xs sm:text-sm font-semibold">
                H-8/4, Islamabad • SSC &amp; HSSC Annual Examinations
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pb-2">
            <Link
              href="/past-papers"
              className="group relative rounded-2xl overflow-hidden shadow border border-slate-200 dark:border-slate-800 block"
            >
              <img
                src="/hero-exam.webp"
                alt="Students writing their board examination"
                className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-4 pb-3 pt-10">
                <div className="text-white font-bold text-base">Board Examinations</div>
                <div className="text-fbise-200 text-xs">Past papers, model papers &amp; date sheets</div>
              </div>
            </Link>
            <Link
              href="/leaderboard"
              className="group relative rounded-2xl overflow-hidden shadow border border-slate-200 dark:border-slate-800 block"
            >
              <img
                src="/hero-students.webp"
                alt="Students celebrating their board results"
                className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-4 pb-3 pt-10">
                <div className="text-white font-bold text-base">Results &amp; Top Achievers</div>
                <div className="text-fbise-200 text-xs">Daily quizzes, streaks &amp; leaderboard</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-fbise-950 via-fbise-900 to-slate-950 text-white pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-fbise-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-fbise-800/60 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-semibold backdrop-blur-sm shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Federal Board Islamabad • Official Preparation Portal</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none">
              Prepare Smart. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                Practice Better.
              </span>{' '}
              Achieve More.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-fbise-100/90 leading-relaxed font-normal max-w-2xl mx-auto">
              The premier platform designed specifically for FBISE Matric & Intermediate students.
              Access authentic past papers, test your skills with daily chapter quizzes, and get your solved
              answer sheets graded by our instant AI paper assessment system.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 text-base"
                  >
                    <span>Go to My Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/ai-paper-check"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-fbise-800/80 hover:bg-fbise-700/80 border border-fbise-600/50 backdrop-blur-sm transition-all flex items-center justify-center space-x-2 text-base"
                  >
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Check a Solved Paper</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 text-base"
                  >
                    <span>Create Free Student Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-fbise-800/80 hover:bg-fbise-700/80 border border-fbise-600/50 backdrop-blur-sm transition-all flex items-center justify-center space-x-2 text-base"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-2xl mx-auto">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="font-extrabold text-2xl text-amber-400">100%</div>
                <div className="text-[11px] text-fbise-200 uppercase tracking-wider font-semibold">
                  FBISE Syllabus
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="font-extrabold text-2xl text-white">4 Classes</div>
                <div className="text-[11px] text-fbise-200 uppercase tracking-wider font-semibold">
                  SSC 1 & 2 • HSSC 1 & 2
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="font-extrabold text-2xl text-amber-400">Daily</div>
                <div className="text-[11px] text-fbise-200 uppercase tracking-wider font-semibold">
                  Chapter MCQs
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="font-extrabold text-2xl text-white">AI Graded</div>
                <div className="text-[11px] text-fbise-200 uppercase tracking-wider font-semibold">
                  Marking Scheme Rubric
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Class Sections Grid (Dedicated Section for Each Class) */}
      <section className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-fbise-700 dark:text-fbise-400">
              Select Your Academic Level
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Dedicated Class Portals
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Each class section is curated with that grade&apos;s specific FBISE subjects, past papers,
              SLO-based model papers, and daily quizzes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {classesList.map((cls) => (
              <Link
                key={cls.slug}
                href={`/classes/${cls.slug}`}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Header gradient banner */}
                <div className={`h-2 w-full absolute top-0 left-0 bg-gradient-to-r ${cls.color}`} />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-fbise-50 dark:bg-fbise-950/60 text-fbise-800 dark:text-fbise-400 border border-fbise-200/50 dark:border-fbise-800/40">
                      {cls.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Grade {cls.grade}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-fbise-700 dark:group-hover:text-fbise-400 transition-colors">
                    {cls.name}
                  </h3>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-3">
                    {cls.sub}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {cls.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-fbise-700 dark:text-fbise-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Class Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Tiles — every picture is a button to its section */}
      <section className="bg-slate-50 dark:bg-slate-950 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-fbise-700 dark:text-fbise-400">
              Tap a Picture to Explore
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Explore Study Hub
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Har picture aik button hai — jis section mein jana hai, us ki picture ko touch karo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/past-papers"
              className="group relative rounded-2xl overflow-hidden shadow border border-slate-200 dark:border-slate-800 block"
            >
              <img
                src="/tile-papers.webp"
                alt="Stacks of board exam past papers"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-4 pb-3 pt-10">
                <div className="text-white font-bold text-base">Past Papers</div>
                <div className="text-fbise-200 text-xs">Har subject ke asal FBISE papers</div>
              </div>
            </Link>
            <Link
              href="/quizzes"
              className="group relative rounded-2xl overflow-hidden shadow border border-slate-200 dark:border-slate-800 block"
            >
              <img
                src="/tile-quiz.webp"
                alt="Students taking a daily quiz"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-4 pb-3 pt-10">
                <div className="text-white font-bold text-base">Daily Quizzes</div>
                <div className="text-fbise-200 text-xs">Roz naye MCQs — touch karo, quiz shuru</div>
              </div>
            </Link>
            <Link
              href="/ai-paper-check"
              className="group relative rounded-2xl overflow-hidden shadow border border-slate-200 dark:border-slate-800 block"
            >
              <img
                src="/tile-checking.webp"
                alt="A paper being checked with a red pen"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-4 pb-3 pt-10">
                <div className="text-white font-bold text-base">AI Paper Checker</div>
                <div className="text-fbise-200 text-xs">Apna solved paper check karwao</div>
              </div>
            </Link>
            <Link
              href="/leaderboard"
              className="group relative rounded-2xl overflow-hidden shadow border border-slate-200 dark:border-slate-800 block"
            >
              <img
                src="/tile-trophy.webp"
                alt="Students celebrating with a trophy"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-4 pb-3 pt-10">
                <div className="text-white font-bold text-base">Leaderboard</div>
                <div className="text-fbise-200 text-xs">Top students ki list dekho</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Platform Highlights: 4 Major Pillars */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Complete Preparation Ecosystem
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Everything an FBISE Student Needs
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              No more searching through scattered groups or outdated PDFs. Study Hub centralizes
              all resources under authentic Federal Board standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Past Papers */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-fbise-100 dark:bg-fbise-950/70 text-fbise-800 dark:text-fbise-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Comprehensive Past Papers Library
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Filter by Class, Subject, Year (2021-2024), and Session (Annual & Supplementary).
                Read papers online using our built-in PDF viewer or download them directly to your device.
              </p>
              <Link
                href="/past-papers"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-fbise-700 dark:text-fbise-400 hover:underline pt-2"
              >
                <span>Browse Past Papers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2: AI Paper Checker */}
            <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-3 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                Exclusive AI Feature
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Automated AI Paper Checking
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload photos/PDF of your solved answer sheets or type your responses. Our AI grades
                your work according to official FBISE marking schemes with question-wise marks and mistake analysis.
              </p>
              <Link
                href="/ai-paper-check"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline pt-2"
              >
                <span>Try AI Paper Checker</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3: Daily Quizzes */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-fbise-100 dark:bg-fbise-950/70 text-fbise-800 dark:text-fbise-400 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Daily Chapter MCQs & Streaks
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A new quiz every single day for your class. Solve timed questions one-by-one, maintain
                your daily streak, view complete textbook explanations, and compete on the leaderboard.
              </p>
              <Link
                href="/quizzes"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-fbise-700 dark:text-fbise-400 hover:underline pt-2"
              >
                <span>Take Today&apos;s Quiz</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 4: Model Papers */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-fbise-100 dark:bg-fbise-950/70 text-fbise-800 dark:text-fbise-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                SLO Model Papers & Marking Rubrics
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Master the Student Learning Outcomes (SLO) conceptual examination model with verified
                FBISE specimen papers, mark distribution rules, and sample answers.
              </p>
              <Link
                href="/model-papers"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-fbise-700 dark:text-fbise-400 hover:underline pt-2"
              >
                <span>Explore Model Papers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 5: Leaderboard */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-fbise-100 dark:bg-fbise-950/70 text-fbise-800 dark:text-fbise-400 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Federal Board Student Leaderboard
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Rank among the top scholars across Islamabad and Federal Board institutions.
                Earn points for daily practice, high accuracy, and continuous study streaks.
              </p>
              <Link
                href="/leaderboard"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-fbise-700 dark:text-fbise-400 hover:underline pt-2"
              >
                <span>View Leaderboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 6: Dashboard */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-fbise-100 dark:bg-fbise-950/70 text-fbise-800 dark:text-fbise-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Personalized Student Dashboard
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Track your progress, view your quiz scores, revisit AI-checked papers with printable
                diagnostic reports, and access all bookmarked past papers in one place.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-fbise-700 dark:text-fbise-400 hover:underline pt-2"
              >
                <span>Open Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Banner / Developer Credit callout */}
      <section className="py-12 bg-gradient-to-r from-fbise-900 via-fbise-800 to-fbise-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              Federal Board Community Initiative
            </div>
            <h3 className="text-2xl font-black">
              Built specifically for Pakistan&apos;s FBISE scholars.
            </h3>
            <p className="text-xs text-fbise-200">
              Developed by Team Khan Hanan — empowering the next generation of top board achievers.
            </p>
          </div>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-md transition-colors flex-shrink-0"
          >
            Join Study Hub Today
          </Link>
        </div>
      </section>
    </div>
  );
}
