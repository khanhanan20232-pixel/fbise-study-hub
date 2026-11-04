'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import { getStreamData } from '@/data/streams';

// "Choose Your Field" — presentational subject recommendations by stream.
// Picking a field shows the class's compulsory subjects plus the field's own
// subjects; every subject links to the quizzes page filtered for that
// class + subject (/quizzes?class=N&subject=...).

export default function FieldRecommendations({ classGrade }: { classGrade: string }) {
  const data = getStreamData(classGrade);
  const [selectedStreamId, setSelectedStreamId] = useState<string>(data.streams[0].id);
  const selectedStream = data.streams.find((s) => s.id === selectedStreamId) || data.streams[0];

  const subjectLink = (subject: string) =>
    `/quizzes?class=${classGrade}&subject=${encodeURIComponent(subject)}`;

  const renderSubjectCard = (subject: string) => (
    <Link
      key={subject}
      href={subjectLink(subject)}
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
  );

  return (
    <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <Compass className="w-5 h-5 text-fbise-700 dark:text-fbise-400" />
          <span>Choose Your Field</span>
        </h2>
        <p className="text-xs text-slate-500">
          Apna field select karein – aap ke liye recommended subjects (compulsory + field subjects) neeche show ho jayenge. Har subject ke quizzes aik click par khul jayenge.
        </p>
      </div>

      {/* Stream selector pills — same style as the subject filter bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {data.streams.map((stream) => (
          <button
            key={stream.id}
            onClick={() => setSelectedStreamId(stream.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-sm ${selectedStreamId === stream.id ? 'bg-fbise-800 text-white shadow-fbise-900/20' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-fbise-600'}`}
          >
            {stream.name}
          </button>
        ))}
      </div>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 -mt-2">
        {selectedStream.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compulsory subjects for this class */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-fbise-600" />
            <span>Compulsory Subjects</span>
          </h3>
          <div className="space-y-3">{data.compulsory.map(renderSubjectCard)}</div>
        </div>

        {/* The selected field's own subjects */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-fbise-600" />
            <span>Your Field Subjects – {selectedStream.name}</span>
          </h3>
          <div className="space-y-3">{selectedStream.subjects.map(renderSubjectCard)}</div>
        </div>
      </div>

      {data.note && <p className="text-[11px] text-slate-400">{data.note}</p>}
    </section>
  );
}
