import React from 'react';
import Link from 'next/link';
import { GraduationCap, Heart, ExternalLink, Mail, Phone, MapPin, Sparkles, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-fbise-950 text-fbise-100 border-t-4 border-amber-400 relative overflow-hidden">
      {/* Decorative Top Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-fbise-600 via-amber-400 to-fbise-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fbise-600 to-fbise-800 flex items-center justify-center text-white shadow-md border border-amber-400/30">
                <GraduationCap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white">FBISE</span>{' '}
                <span className="font-extrabold text-2xl tracking-tight text-amber-400">Study Hub</span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The premier, all-in-one educational platform designed exclusively for students of the
              Federal Board of Intermediate and Secondary Education (FBISE), Islamabad.
            </p>

            <div className="p-3.5 rounded-xl bg-fbise-950/60 border border-fbise-800/40 text-xs text-fbise-200">
              <span className="font-bold text-amber-400 block mb-0.5">Platform Tagline:</span>
              &ldquo;Prepare Smart. Practice Better. Achieve More.&rdquo;
            </div>

            <div className="pt-2 flex items-center space-x-3 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-fbise-400 flex-shrink-0" />
              <span>Federal Board H-8/4, Islamabad, Pakistan</span>
            </div>
          </div>

          {/* Column 2: Classes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Class Sections</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/classes/class-9" className="hover:text-fbise-400 transition-colors">
                  Class 9 (SSC Part 1)
                </Link>
              </li>
              <li>
                <Link href="/classes/class-10" className="hover:text-fbise-400 transition-colors">
                  Class 10 (SSC Part 2)
                </Link>
              </li>
              <li>
                <Link href="/classes/class-11" className="hover:text-fbise-400 transition-colors">
                  1st Year — Class 11 (HSSC 1)
                </Link>
              </li>
              <li>
                <Link href="/classes/class-12" className="hover:text-fbise-400 transition-colors">
                  2nd Year — Class 12 (HSSC 2)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Study Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/past-papers" className="hover:text-fbise-400 transition-colors">
                  Past Papers Library
                </Link>
              </li>
              <li>
                <Link href="/model-papers" className="hover:text-fbise-400 transition-colors">
                  Model Papers (SLO Based)
                </Link>
              </li>
              <li>
                <Link href="/quizzes" className="hover:text-fbise-400 transition-colors">
                  Daily Chapter Quizzes
                </Link>
              </li>
              <li>
                <Link href="/ai-paper-check" className="hover:text-fbise-400 transition-colors flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Paper Checking</span>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-fbise-400 transition-colors">
                  Student Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-fbise-400 transition-colors">
                  FBISE Board News & Dates
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Links & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Support & Info</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-fbise-400 transition-colors">
                  About FBISE Study Hub
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-fbise-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <a
                  href="https://www.fbise.edu.pk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-fbise-400 transition-colors flex items-center space-x-1"
                >
                  <span>Official FBISE Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner with MANDATORY Credit: "Developed by Team Khan Hanan" */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 space-y-4 md:space-y-0">
          <div>
            © {new Date().getFullYear()} FBISE Study Hub. All rights reserved.
          </div>

          {/* Prominent Footer Credit */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-fbise-950/80 border border-amber-500/30 text-slate-200 shadow-sm">
            <span>Crafted with pride for Pakistani students</span>
            <span className="text-slate-600">•</span>
            <span className="font-bold text-amber-400 tracking-wide text-sm">
              Developed by Team Khan Hanan
            </span>
          </div>

          <div className="flex space-x-4">
            <Link href="/about" className="hover:text-fbise-400 transition-colors">
              Privacy & Guidelines
            </Link>
            <Link href="/contact" className="hover:text-fbise-400 transition-colors">
              Help Desk
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
