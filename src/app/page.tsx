'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Sparkles,
  Flame,
  FileText,
  Trophy,
  LayoutDashboard,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/*
 * Landing page rebuilt to the Figma "Web Design" Landing frame (Phase A,
 * 2026-11-04): cream hero + stacked cards, 6 feature cards, How-it-works with
 * class selector, dark navy CTA with sign-up card, spec footer.
 * HARD RULES from the spec: NO photographs on the landing, and never a large
 * circular photo (the skipped pic #2). The old announcements ticker is not
 * part of this design — notices live under "Board Notices" (/announcements).
 */

const FEATURES = [
  {
    icon: BookOpen,
    tint: 'bg-sky-100 text-sky-700',
    title: 'Past papers library',
    text: 'Real FBISE past papers for every subject — filter by class, subject, year and session, read online or download.',
    href: '/past-papers',
    link: 'Browse past papers',
    featured: false,
  },
  {
    icon: Sparkles,
    tint: 'bg-accent-100 text-accent-700',
    title: 'AI paper checker',
    text: 'Upload a photo of your solved paper and get it marked against the official FBISE scheme — marks, mistakes and a grade in minutes.',
    href: '/ai-paper-check',
    link: 'Check a paper',
    featured: true,
  },
  {
    icon: Flame,
    tint: 'bg-orange-100 text-orange-600',
    title: 'Daily chapter quizzes',
    text: 'A fresh chapter-wise quiz every day for your class. Instant results, textbook explanations and a streak that keeps you going.',
    href: '/quizzes',
    link: "Start today's quiz",
    featured: false,
  },
  {
    icon: FileText,
    tint: 'bg-lime-100 text-lime-700',
    title: 'SLO model papers',
    text: 'Official SLO-based model papers with marking rubrics and sample answers, so you know exactly how the board exam looks.',
    href: '/model-papers',
    link: 'View model papers',
    featured: false,
  },
  {
    icon: Trophy,
    tint: 'bg-amber-100 text-amber-600',
    title: 'Student leaderboard',
    text: 'Earn XP for daily practice and accuracy, climb your class ranking and see where you stand among FBISE students.',
    href: '/leaderboard',
    link: 'See the leaderboard',
    featured: false,
  },
  {
    icon: LayoutDashboard,
    tint: 'bg-violet-100 text-violet-700',
    title: 'Your personal dashboard',
    text: 'Your progress graphs, quiz history, saved papers and flashcards — everything you are studying, in one place.',
    href: '/dashboard',
    link: 'Open your dashboard',
    featured: false,
  },
];

const CLASS_ROWS = [
  { slug: 'class-9', label: 'Class 9', sub: 'SSC Part 1' },
  { slug: 'class-10', label: 'Class 10', sub: 'SSC Part 2' },
  { slug: 'class-11', label: 'Class 11 · 1st Year', sub: 'HSSC Part 1' },
  { slug: 'class-12', label: 'Class 12 · 2nd Year', sub: 'HSSC Part 2' },
];

const HERO_CHECKS = ['Free for students', '100% FBISE syllabus', 'Class 9 to 12'];
const CTA_CHECKS = [
  'Free for every FBISE student',
  'Past papers & SLO model papers, Class 9–12',
  'Daily quizzes with instant results',
  'AI paper checking in minutes',
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showCtaPassword, setShowCtaPassword] = useState(false);

  return (
    <div className="bg-cream-100 text-navy-900">
      {/* ============ HERO (cream, stacked cards right) ============ */}
      <section className="relative overflow-hidden">
        {/* Lime diagonal stripes, top-right — Figma decoration */}
        <div
          aria-hidden="true"
          className="lime-stripes absolute -top-10 right-0 w-72 sm:w-96 h-44 rotate-6 opacity-70 pointer-events-none"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24 relative">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left copy */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-cream-300 shadow-sm text-xs font-bold tracking-wide text-navy-900">
                Federal Board, Islamabad · SSC &amp; HSSC
              </span>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] mt-6">
                Every FBISE paper, a daily quiz and an AI check.{' '}
                <span className="text-accent-500">Free</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mt-5 max-w-xl">
                Past papers, SLO model papers, daily chapter quizzes and instant AI paper
                checking for Class 9 to 12 — everything an FBISE student needs, in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 mt-8">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-accent-400 hover:bg-accent-500 text-navy-950 font-bold shadow-md shadow-accent-500/20 transition-colors"
                    >
                      Go to my dashboard <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      href="/ai-paper-check"
                      className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white hover:bg-cream-200 text-navy-900 font-bold border border-slate-300 transition-colors"
                    >
                      Check a paper
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-accent-400 hover:bg-accent-500 text-navy-950 font-bold shadow-md shadow-accent-500/20 transition-colors"
                    >
                      Create free account <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white hover:bg-cream-200 text-navy-900 font-bold border border-slate-300 transition-colors"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>

              <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-8">
                {HERO_CHECKS.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                    <CheckCircle2 className="w-5 h-5 text-accent-500 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — three stacked overlapping cards */}
            <div className="relative max-w-md w-full mx-auto lg:ml-auto animate-float">
              {/* Card 1 — lime Today's quiz */}
              <div className="relative z-10 bg-accent-400 rounded-[1.75rem] shadow-xl shadow-accent-600/20 p-6 -rotate-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-navy-900/70">
                    Today&apos;s quiz
                  </span>
                  <span className="px-3 py-1 rounded-full bg-navy-900 text-white text-[11px] font-bold">
                    Class 10
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl text-navy-950 mt-2">
                  Physics — Chapter 4
                </h3>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 rounded-full bg-white/80 text-navy-900 text-xs font-bold">
                    15 MCQs
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/80 text-navy-900 text-xs font-bold">
                    20 mins
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 text-navy-900 text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 text-orange-500" /> Streak 12 days
                  </span>
                </div>
                                <div className="flex gap-2.5 mt-6">
                  <Link
                    href="/quizzes"
                    className="px-4 py-2 rounded-full bg-white text-navy-900 text-sm font-bold hover:bg-cream-100 transition-colors"
                  >
                    View chapter
                  </Link>
                  <Link
                    href="/quizzes"
                    className="px-4 py-2 rounded-full bg-navy-900 text-white text-sm font-bold hover:bg-navy-800 transition-colors"
                  >
                    Start quiz
                  </Link>
                </div>
              </div>

              {/* Card 2 — white Leaderboard */}
              <div className="relative z-20 bg-white rounded-[1.75rem] shadow-xl shadow-slate-900/10 border border-slate-100 p-5 mt-[-0.75rem] ml-8 sm:ml-16 rotate-1">
                <div className="flex items-center gap-3.5">
                  <span className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                      Leaderboard
                    </div>
                    <div className="font-bold text-navy-900 truncate">
                      You&apos;re #3 in Class 10{' '}
                      <span className="text-accent-600 whitespace-nowrap">· +120 XP</span>
                    </div>
                  </div>
                  <Link
                    href="/leaderboard"
                    className="ml-auto text-accent-600 font-bold text-lg flex-shrink-0"
                    aria-label="View leaderboard"
                  >
                    →
                  </Link>
                </div>
              </div>

              {/* Card 3 — dark navy AI paper check */}
              <div className="relative z-30 bg-navy-900 text-white rounded-[1.75rem] shadow-xl shadow-navy-950/30 p-6 mt-[-0.5rem] mr-4 sm:mr-10 -rotate-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-accent-300">
                      AI paper check · Chemistry
                    </div>
                    <div className="font-display font-bold text-4xl mt-2">
                      42<span className="text-slate-400 text-2xl">/50</span>
                    </div>
                    <div className="text-sm font-semibold text-accent-300 mt-1">
                      Score 84% · Grade A
                    </div>
                    <div className="text-xs text-slate-300 mt-1">3 mistakes to review</div>
                  </div>
                  <span className="w-11 h-11 rounded-2xl bg-white/10 text-accent-300 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </span>
                </div>
                <Link
                  href="/ai-paper-check"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-accent-300 hover:text-accent-200 transition-colors"
                >
                  Check your paper <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SUBJECTS MARQUEE (black strip, slow scroll) ============ */}
      <div className="bg-navy-900 py-3.5 overflow-hidden" aria-hidden="true">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {[
                'Physics',
                'Chemistry',
                'Biology',
                'Mathematics',
                'Computer Science',
                'English',
                'Urdu',
                'Pakistan Studies',
                'Islamiat',
                'Class 9',
                'Class 10',
                'Class 11',
                'Class 12',
              ].map((s) => (
                <span key={s} className="mx-5 text-sm font-bold tracking-wide text-white whitespace-nowrap">
                  {s} <span className="text-accent-400 ml-10">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============ FEATURES ============ */}
      <section id="features" className="bg-white py-20 lg:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent-600">
              What you can do here
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy-900 mt-3">
              Everything an FBISE student needs, in one place
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  style={{ animationDelay: `${i * 90}ms` }}
                  className={`animate-fade-up relative rounded-[1.75rem] p-7 border transition-all hover:shadow-lg hover:-translate-y-1 ${
                    f.featured
                      ? 'bg-accent-50 border-2 border-accent-400 shadow-md'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  {f.featured && (
                    <span className="absolute top-5 right-5 px-3 py-1 rounded-full bg-navy-900 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      Exclusive
                    </span>
                  )}
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${f.tint}`}>
                    <Icon className="w-6 h-6" />
                  </span>
                  <h3 className="font-display font-bold text-xl text-navy-900 mt-4">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">{f.text}</p>
                  <Link
                    href={f.href}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-accent-600 hover:text-accent-700 transition-colors"
                  >
                    {f.link} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS + SELECT YOUR CLASS ============ */}
      <section id="how-it-works" className="bg-cream-100 py-20 lg:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent-600">
                How it works
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy-900 mt-3">
                Board-ready in three simple steps
              </h2>

              <ol className="mt-10 space-y-8">
                <li className="flex gap-4">
                  <span className="w-11 h-11 rounded-full bg-accent-400 text-navy-950 font-display font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    1
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-lg text-navy-900">Pick your class</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-1 max-w-md">
                      Choose Class 9, 10, 11 or 12 — your papers, quizzes and dashboard are set
                      for your class from day one.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="w-11 h-11 rounded-full bg-accent-400 text-navy-950 font-display font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    2
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-lg text-navy-900">Practice every day</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-1 max-w-md">
                      Solve the daily chapter quiz, keep your streak alive and review every
                      mistake as a flashcard until it sticks.
                    </p>
                  </div>
                </li>
                                <li className="flex gap-4">
                  <span className="w-11 h-11 rounded-full bg-accent-400 text-navy-950 font-display font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    3
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-lg text-navy-900">
                      Get your paper checked
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-1 max-w-md">
                      Upload a solved paper and let the AI mark it on the official FBISE scheme —
                      marks, grade and exactly what to fix.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Select your class card */}
            <div id="classes" className="bg-white rounded-[1.75rem] shadow-xl shadow-slate-900/5 border border-slate-100 p-6 sm:p-8 max-w-lg w-full mx-auto lg:ml-auto scroll-mt-28">
              <h3 className="font-display font-bold text-2xl text-navy-900">Select your class</h3>
              <p className="text-sm text-slate-500 mt-1">
                Har class ka apna portal hai — papers, quizzes aur dashboard usi class ke.
              </p>
              <div className="mt-5 space-y-3">
                {CLASS_ROWS.map((row) => {
                  const selected = row.slug === 'class-10';
                  return (
                    <Link
                      key={row.slug}
                      href={`/classes/${row.slug}`}
                      className={`flex items-center gap-3.5 rounded-2xl border-2 px-4 py-3.5 transition-colors ${
                        selected
                          ? 'border-accent-400 bg-accent-50'
                          : 'border-slate-200 hover:border-accent-300 hover:bg-cream-50'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selected ? 'border-accent-500' : 'border-slate-300'
                        }`}
                      >
                        {selected && <span className="w-2.5 h-2.5 rounded-full bg-accent-500" />}
                      </span>
                      <GraduationCap
                        className={`w-5 h-5 flex-shrink-0 ${selected ? 'text-accent-600' : 'text-slate-400'}`}
                      />
                      <span className="font-bold text-navy-900">{row.label}</span>
                      <span className="ml-auto text-xs font-semibold text-slate-400">{row.sub}</span>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/classes/class-10"
                className="inline-flex items-center gap-1.5 mt-6 font-bold text-accent-600 hover:text-accent-700 transition-colors"
              >
                Enter class portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA — dark navy panel + sign-up card ============ */}
      <section className="bg-cream-100 pb-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-navy-900 rounded-[2.5rem] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
            <div
              aria-hidden="true"
              className="lime-stripes absolute -top-8 right-10 w-56 h-32 rotate-6 opacity-40 pointer-events-none"
            />
            <div className="grid lg:grid-cols-2 gap-12 items-center relative">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent-300">
                  Join Study Hub
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-3">
                  Your board prep starts today.
                </h2>
                <ul className="mt-7 space-y-3">
                  {CTA_CHECKS.map((c) => (
                    <li key={c} className="flex items-center gap-2.5 text-sm font-semibold text-white">
                      <CheckCircle2 className="w-5 h-5 text-accent-400 flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* White sign-up card — decorative fields; the action routes to /signup */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  router.push('/signup');
                }}
                className="bg-white rounded-[1.75rem] shadow-2xl p-6 sm:p-8 max-w-md w-full mx-auto lg:ml-auto"
              >
                <h3 className="font-display font-bold text-2xl text-navy-900">
                  Create your free account
                </h3>
                <label className="block mt-5">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Email</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400"
                  />
                </label>
                <label className="block mt-4">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Password</span>
                  <div className="relative mt-1.5">
                    <input
                      type={showCtaPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCtaPassword((v) => !v)}
                      aria-label={showCtaPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showCtaPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </label>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
                  By signing up you agree to the Study Hub terms. Free for students — no card required.
                </p>
                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 rounded-full bg-accent-400 hover:bg-accent-500 text-navy-950 font-bold shadow-md shadow-accent-500/20 transition-colors"
                >
                  Agree &amp; sign up
                </button>
                <div className="flex items-center gap-3 my-4">
                  <span className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-bold text-slate-400">OR</span>
                  <span className="flex-1 h-px bg-slate-200" />
                </div>
                <Link
                  href="/signup"
                  className="block w-full py-3.5 rounded-full bg-white border border-slate-300 text-navy-900 font-bold text-center hover:bg-cream-100 transition-colors"
                >
                  Sign up with Google
                </Link>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LANDING FOOTER (per Figma spec) ============ */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center gap-5 md:gap-8">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <span className="w-9 h-9 rounded-lg bg-accent-400 flex items-center justify-center overflow-hidden p-1.5">
              <img src="/logo-symbol.png" alt="FBISE Study Hub logo" className="w-full h-full object-contain" />
            </span>
            <span className="font-display font-bold text-lg text-navy-900">FBISE Study Hub</span>
          </Link>

          <p className="text-sm text-slate-500 text-center md:text-left">
            © 2026 · Developed by Team Khan Hanan
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:ml-auto text-sm font-semibold">
            <Link href="/about" className="text-slate-600 hover:text-accent-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-slate-600 hover:text-accent-600 transition-colors">
              Contact
            </Link>
            <Link href="/contact" className="text-slate-600 hover:text-accent-600 transition-colors">
              Help desk
            </Link>
            <a
              href="https://www.fbise.edu.pk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-accent-600 transition-colors"
            >
              Official FBISE portal
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
