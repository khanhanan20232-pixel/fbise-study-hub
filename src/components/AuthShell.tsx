import React from 'react';
import Link from 'next/link';

// Split-screen auth layout — left: real photo panel with branding and a
// tagline, right: the form. Modern auth-screen idea, site ki apni theme
// (lime + cream + white + black) mein.
export default function AuthShell({
  image,
  tagline,
  subtext,
  children,
}: {
  image: string;
  tagline: string;
  subtext: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[90vh] flex items-center justify-center py-10 px-4 sm:px-6 bg-cream-100 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-4xl grid lg:grid-cols-[42%_58%] overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Photo panel — sirf bari (lg) screen par */}
        <div className="relative hidden lg:block">
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-navy-950/40" />
          <div className="relative h-full flex flex-col justify-between p-7">
            <div className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-accent-400 flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                  <img src="/logo-symbol.png" alt="FBISE Study Hub logo" className="w-full h-full object-contain" />
                </span>
                <span className="font-display font-bold text-white leading-tight">
                  FBISE Study Hub
                  <span className="block text-[9px] font-sans font-semibold tracking-widest text-white/70 uppercase">
                    SSC &amp; HSSC Preparation
                  </span>
                </span>
              </span>
              <Link
                href="/"
                className="text-[11px] font-semibold text-white/85 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
              >
                Back to website →
              </Link>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-white leading-snug">{tagline}</p>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">{subtext}</p>
              <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
                <span className="w-7 h-1.5 rounded-full bg-accent-400" />
                <span className="w-2.5 h-1.5 rounded-full bg-white/40" />
                <span className="w-2.5 h-1.5 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="p-7 sm:p-10">{children}</div>
      </div>
    </div>
  );
}
