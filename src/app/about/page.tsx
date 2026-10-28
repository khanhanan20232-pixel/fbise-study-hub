import React from 'react';
import Link from 'next/link';
import { GraduationCap, Award, BookOpen, Sparkles, Heart, Shield, CheckCircle2, ArrowRight, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 items-center justify-center text-white shadow-lg border border-amber-400/40 mb-2">
            <GraduationCap className="w-9 h-9 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            About FBISE Study Hub
          </h1>
          <p className="text-base text-amber-600 dark:text-amber-400 font-bold">
            &ldquo;Prepare Smart. Practice Better. Achieve More.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The premier educational platform crafted specifically to empower students appearing for
            Federal Board of Intermediate and Secondary Education (FBISE) Islamabad examinations.
          </p>
        </div>

        {/* Our Goal */}
        <div className="p-8 sm:p-10 rounded-3xl bg-fbise-600 text-white shadow-xl space-y-5">
          <div className="flex items-center space-x-3">
            <span className="inline-flex w-11 h-11 rounded-xl bg-white/15 items-center justify-center">
              <Target className="w-6 h-6 text-amber-300" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Our Goal</h2>
          </div>
          <p className="text-sm sm:text-base text-emerald-50 leading-relaxed">
            The goal of FBISE Study Hub is simple: to give <strong>every Federal Board student</strong> —
            in Islamabad, the cantonments, and overseas — <strong>completely free</strong> access to
            authentic board past papers, SLO-based model papers, daily practice quizzes, and AI-powered
            paper checking, all in one place, so that no student is ever held back by expensive tuition
            or unreliable study material.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
            <div className="rounded-xl bg-white/10 px-4 py-3">100% free for every student</div>
            <div className="rounded-xl bg-white/10 px-4 py-3">Authentic FBISE material in one place</div>
            <div className="rounded-xl bg-white/10 px-4 py-3">Better marks through daily practice &amp; instant feedback</div>
          </div>
        </div>

        {/* Mission & Purpose */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Our Mission for Pakistani Students
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Every year, hundreds of thousands of students across Islamabad, Federal Administered Areas,
            Cantonments, Army Public Schools, and Overseas Pakistani Institutions appear in Matric (SSC)
            and Intermediate (HSSC) board examinations. However, finding verified past papers with genuine
            marking schemes, authentic SLO question banks, and actionable step-by-step feedback has
            traditionally been a challenge.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>FBISE Study Hub</strong> solves this comprehensively. By integrating authentic
            past papers, curated SLO model papers, daily timed chapter MCQs, and an AI assessment engine
            calibrated directly against Federal Board scoring rubrics, we make high-quality board
            preparation accessible to every student, everywhere.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>100% FBISE Aligned:</strong> Dedicated sections for Class 9, 10, 11 & 12.</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>SLO-Based Model Papers:</strong> Calibrated to modern analytical standards.</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>Daily Streak System:</strong> Gamified chapter MCQs with complete explanations.</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>Automated AI Examiner:</strong> Detailed marks breakdown & mistake diagnosis.</span>
            </div>
          </div>
        </div>

        {/* Team Khan Hanan Feature Tribute Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border-2 border-amber-400/50 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
            <Award className="w-4 h-4" />
            <span>Architect & Engineering Team</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Developed by Team Hanan Khan
          </h2>
          <p className="text-sm sm:text-base font-bold text-amber-300">
            FG Science Degree College for Men, Wah Cantt
          </p>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            FBISE Study Hub was architected and built by <strong>Team Hanan Khan</strong> of
            <strong> FG Science Degree College for Men, Wah Cantt</strong>, as an educational
            innovation project dedicated to improving academic outcomes, conceptual learning,
            and digital access for Pakistani secondary and intermediate students.
          </p>

          <div className="pt-4 flex items-center justify-center space-x-2 text-xs text-amber-300 font-semibold">
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span>Dedicated with pride to the youth of Pakistan</span>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center pt-4">
          <Link
            href="/signup"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/20 transition-all"
          >
            <span>Start Your Preparation Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
