'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Calendar, ExternalLink, Pin, Award, BookOpen, ChevronRight } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (data.announcements) setAnnouncements(data.announcements);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-6 sm:p-10 shadow-xl border border-navy-700/40 text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent-400 text-navy-950 shadow-sm">
            <Bell className="w-3.5 h-3.5" />
            <span>Official Board Press & Circulars</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            FBISE Board Announcements & News
          </h1>
          <p className="text-xs sm:text-sm text-teal-200/90 max-w-xl mx-auto leading-relaxed">
            Stay up to date with official examination notifications, date sheets, gazettes,
            SLO curriculum reforms, and model paper releases from Federal Board Islamabad.
          </p>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading notifications...</p>
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border transition-all space-y-3 shadow-sm ${
                  a.isPinned
                    ? 'border-amber-400/80 dark:border-amber-500/40 bg-amber-50/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {a.category}
                    </span>
                    {a.isPinned && (
                      <span className="flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        <Pin className="w-3 h-3 fill-amber-500" />
                        <span>Pinned Notice</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {a.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {a.content}
                </p>

                {a.link && (
                  <div className="pt-2">
                    {a.link.startsWith('http') ? (
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        <span>Visit Federal Board Source</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <Link
                        href={a.link}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        <span>Open Resource Page</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">No Notifications Available</h4>
            <p className="text-xs text-slate-500">All recent board circulars will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
