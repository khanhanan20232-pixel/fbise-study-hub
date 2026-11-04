'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  Download,
  Bookmark,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Layers,
  Calendar,
  X,
} from 'lucide-react';
import PdfViewerModal from '@/components/PdfViewerModal';

function PastPapersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [classGrade, setClassGrade] = useState<string>(searchParams.get('classGrade') || 'ALL');
  const [subject, setSubject] = useState<string>(searchParams.get('subject') || 'ALL');
  const [year, setYear] = useState<string>(searchParams.get('year') || 'ALL');
  const [session, setSession] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // PDF Viewer Modal State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{
    title: string;
    fileUrl: string;
    paperId?: string;
    subject?: string;
    classGrade?: string;
  } | null>(null);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        paperType: 'PAST_PAPER',
        classGrade,
        subject,
        year,
        session,
        search,
      });

      const res = await fetch(`/api/papers?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPapers(data.papers || []);
      }
    } catch (err) {
      console.error('Error fetching past papers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [classGrade, subject, year, session]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPapers();
  };

  const handleOpenPdf = (paper: any) => {
    if (!user) {
      router.push('/login?redirect=/past-papers');
      return;
    }
    setSelectedPdf({
      title: paper.title,
      fileUrl: paper.fileUrl,
      paperId: paper.id,
      subject: paper.subject,
      classGrade: paper.classGrade,
    });
    setPdfModalOpen(true);
  };

  const handleToggleBookmark = async (paperId: string) => {
    if (!user) {
      router.push('/login?redirect=/past-papers');
      return;
    }
    try {
      const res = await fetch(`/api/papers/${paperId}/bookmark`, { method: 'POST' });
      if (res.ok) {
        setPapers((prev) =>
          prev.map((p) => (p.id === paperId ? { ...p, isBookmarked: !p.isBookmarked } : p))
        );
      }
    } catch (err) {}
  };

  const subjectList = [
    'ALL',
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
    'Computer Science',
    'English',
    'Urdu',
    'Pakistan Studies',
    'Islamiat',
  ];

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-6 sm:p-10 shadow-xl border border-navy-700/40">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-accent-400 text-navy-950 shadow-sm">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Federal Board Islamabad</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              FBISE Past Papers Library
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Explore authentic solved & unsolved examination papers spanning Class 9, Class 10,
              1st Year, and 2nd Year. View papers online or download the official PDF documents.
            </p>
          </div>
          <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
            <BookOpen className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search past papers by subject, year, or keyword (e.g., 'Physics 2024', 'Matric Math')..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    fetchPapers();
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Class Grade</label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="ALL">All Classes</option>
                <option value="9">Class 9 (SSC-I)</option>
                <option value="10">Class 10 (SSC-II)</option>
                <option value="11">1st Year — Class 11</option>
                <option value="12">2nd Year — Class 12</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {subjectList.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'All Subjects' : s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="ALL">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="ALL">All Sessions</option>
                <option value="Annual">Annual Exam</option>
                <option value="Supplementary">Supplementary (2nd Annual)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800 dark:text-white">{papers.length}</strong> past papers
            </span>
            <Link
              href="/model-papers"
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center space-x-1"
            >
              <span>Switch to Model Papers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500">Retrieving past papers...</p>
            </div>
          ) : papers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Class {paper.classGrade}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {paper.session} {paper.year}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleBookmark(paper.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          paper.isBookmarked
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                            : 'text-slate-400 hover:text-amber-500'
                        }`}
                        title={paper.isBookmarked ? 'Bookmarked' : 'Save paper'}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {paper.title}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                      {paper.subject}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span>File Size: {paper.fileSize}</span>
                      <span>•</span>
                      <span>{paper.downloadCount} downloads</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenPdf(paper)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Online</span>
                      </button>
                      <a
                        href={paper.fileUrl}
                        download
                        className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <Link
                      href={`/ai-paper-check?subject=${encodeURIComponent(paper.subject)}&classGrade=${paper.classGrade}&paperId=${paper.id}`}
                      className="w-full py-1.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Solve & Check with AI</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200">No Past Papers Match Your Filter</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try resetting your filters or selecting a different subject or year.
              </p>
              <button
                onClick={() => {
                  setClassGrade('ALL');
                  setSubject('ALL');
                  setYear('ALL');
                  setSession('ALL');
                  setSearch('');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
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

export default function PastPapersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading FBISE Past Papers Library...</p>
        </div>
      }
    >
      <PastPapersContent />
    </Suspense>
  );
}
