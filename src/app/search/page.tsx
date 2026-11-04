'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  BookOpen,
  FileText,
  Flame,
  Bell,
  ArrowRight,
  ExternalLink,
  X,
  Layers,
} from 'lucide-react';
import PdfViewerModal from '@/components/PdfViewerModal';
import { useAuth } from '@/context/AuthContext';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { user } = useAuth();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<{
    papers: any[];
    quizzes: any[];
    announcements: any[];
  }>({
    papers: [],
    quizzes: [],
    announcements: [],
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState('');
  const [suggestions, setSuggestions] = useState<{ label: string; term: string; kind: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const suggestSeq = useRef(0);

  // PDF Viewer Modal State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<any>(null);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setResults({ papers: [], quizzes: [], announcements: [] });
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    setSearchedTerm(searchTerm.trim());
    setShowSuggestions(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults({
          papers: data.papers || [],
          quizzes: data.quizzes || [],
          announcements: data.announcements || [],
        });
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const pickSuggestion = (s: { label: string; term: string }) => {
    setQuery(s.term);
    performSearch(s.term);
  };

  // Live suggestions — type karte hi (300ms debounce) asal database results se
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const seq = ++suggestSeq.current;
    const t = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        if (res.ok && suggestSeq.current === seq) {
          const data = await res.json();
          const list: { label: string; term: string; kind: string }[] = [];
          (data.papers || []).slice(0, 3).forEach((p: any) =>
            list.push({ label: `${p.title} — Class ${p.classGrade} ${p.subject}`, term: p.title, kind: 'Paper' })
          );
          (data.quizzes || []).slice(0, 3).forEach((q: any) =>
            list.push({ label: `${q.title} — Class ${q.classGrade} ${q.subject}`, term: q.title, kind: 'Quiz' })
          );
          (data.announcements || []).slice(0, 2).forEach((a: any) =>
            list.push({ label: a.title, term: a.title, kind: 'Notice' })
          );
          setSuggestions(list);
          setShowSuggestions(true);
        }
      } catch {}
      if (suggestSeq.current === seq) setSuggestLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

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

  const totalResults = results.papers.length + results.quizzes.length + results.announcements.length;

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Input Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Global FBISE Search
            </h1>
            <p className="text-xs text-slate-500">
              Find past papers, model papers, chapter quizzes, and official board notices
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                autoFocus
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all subjects, classes, topics (e.g. 'Physics', 'Class 10 Math', 'Model Papers')..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setResults({ papers: [], quizzes: [], announcements: [] }); setSearched(false); setSuggestions([]); setShowSuggestions(false); }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showSuggestions && query.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                  {suggestLoading ? (
                    <div className="px-4 py-3 text-xs text-slate-500">Searching...</div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pickSuggestion(s);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-cream-100 dark:hover:bg-slate-800 flex items-center justify-between gap-3"
                      >
                        <span className="truncate">{s.label}</span>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{s.kind}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-500">
                      No suggestions — press Search to see full results
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 overflow-x-auto pt-1">
            <span>Popular:</span>
            {['Physics', 'Mathematics', 'Class 9 Physics', 'Class 10', 'Model Papers', 'Biology'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  performSearch(s);
                }}
                className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-600 dark:text-slate-300 transition-colors whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Searching FBISE resources...</p>
          </div>
        ) : searched ? (
          <div className="space-y-8">
            <div className="text-xs font-bold text-slate-500">
              Found <strong className="text-slate-900 dark:text-white">{totalResults}</strong> results matching &ldquo;{searchedTerm}&rdquo;
            </div>

            {/* 1. Papers Results */}
            {results.papers.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Examination Papers ({results.papers.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.papers.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                          <span className="bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                            Class {p.classGrade}
                          </span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                            {p.session} {p.year}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500">{p.subject}</p>
                      </div>

                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <button
                          onClick={() => handleOpenPdf(p)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white font-bold hover:bg-emerald-900 transition-colors"
                        >
                          View PDF
                        </button>
                        <Link
                          href={`/ai-paper-check?subject=${encodeURIComponent(p.subject)}&classGrade=${p.classGrade}&paperId=${p.id}`}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-100 transition-colors"
                        >
                          Solve with AI
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Quizzes Results */}
            {results.quizzes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Flame className="w-4 h-4 text-teal-600" />
                  <span>Chapter Quizzes ({results.quizzes.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.quizzes.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                          Class {q.classGrade} • {q.subject}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                          {q.title}
                        </h4>
                        <p className="text-xs text-slate-500">{q.chapter}</p>
                      </div>

                      <Link
                        href={`/quizzes/${q.id}`}
                        className="px-4 py-2 rounded-xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 transition-colors whitespace-nowrap"
                      >
                        Start Quiz
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Announcements Results */}
            {results.announcements.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Board Notices ({results.announcements.length})</span>
                </h3>
                <div className="space-y-3">
                  {results.announcements.map((a) => (
                    <div
                      key={a.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1"
                    >
                      <div className="flex items-center space-x-2 text-[10px] font-bold">
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          {a.category}
                        </span>
                        <span className="text-slate-400">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{a.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalResults === 0 && (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">No Matching Results Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try checking your spelling or searching with broader keywords like &ldquo;Physics&rdquo; or &ldquo;Matric&rdquo;.
                </p>
              </div>
            )}
          </div>
        ) : null}
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading FBISE Search...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
