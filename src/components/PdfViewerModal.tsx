'use client';

import React from 'react';
import { X, Download, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrl: string;
  paperId?: string;
  subject?: string;
  classGrade?: string;
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  title,
  fileUrl,
  paperId,
  subject,
  classGrade,
}: PdfViewerModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Call view/download increment API if paperId exists
    if (paperId) {
      fetch(`/api/papers/${paperId}/download`, { method: 'POST' }).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 overflow-hidden pr-4">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Federal Board of Intermediate & Secondary Education, Islamabad
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* AI Checker Link */}
            {subject && classGrade && (
              <Link
                href={`/ai-paper-check?subject=${encodeURIComponent(subject)}&classGrade=${classGrade}&paperId=${paperId || ''}`}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-colors"
                onClick={onClose}
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>Solve & AI Check</span>
              </Link>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors shadow-sm"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper open panel — the document itself is hosted on the official
            FBISE website, which does not allow embedding inside other pages,
            so the paper opens in a new browser tab instead of an iframe. */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 p-4 sm:p-8 overflow-auto flex items-center justify-center">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 sm:p-8 text-center space-y-5">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                This is an official Federal Board document. It opens in a new tab on the
                FBISE website, where you can read it or save it to your device.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Paper</span>
              </a>
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Status bar */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Official FBISE Paper Document</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
