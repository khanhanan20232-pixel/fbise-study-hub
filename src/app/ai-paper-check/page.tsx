'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Printer,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  ChevronDown,
  Info,
  Eye,
} from 'lucide-react';
import { PaperEvaluationReport } from '@/lib/ai-checker';
import PdfViewerModal from '@/components/PdfViewerModal';

function AiPaperCheckerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  const querySubject = searchParams.get('subject') || 'Physics';
  const queryClass = searchParams.get('classGrade') || user?.className || '9';
  const queryPaperId = searchParams.get('paperId') || '';
  const queryReportId = searchParams.get('reportId') || '';

  // Form State
  const [classGrade, setClassGrade] = useState<string>(queryClass);
  const [subject, setSubject] = useState<string>(querySubject);

  // Paper Selection State — selecting a paper OPENS it so the student can
  // read the questions before writing answers.
  const [availablePapers, setAvailablePapers] = useState<any[]>([]);
  const [papersLoading, setPapersLoading] = useState<boolean>(false);
  const [selectedPaperId, setSelectedPaperId] = useState<string>(queryPaperId);
  const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false);
  const [selectedPdf, setSelectedPdf] = useState<{
    title: string;
    fileUrl: string;
    paperId?: string;
    subject?: string;
    classGrade?: string;
  } | null>(null);
  const [submissionType, setSubmissionType] = useState<'TYPED' | 'FILE_UPLOAD'>('TYPED');
  const [typedAnswers, setTypedAnswers] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Evaluation & Processing State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationStage, setEvaluationStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result Report
  const [report, setReport] = useState<PaperEvaluationReport | null>(null);
  const [reportMeta, setReportMeta] = useState<any>(null);

  // Require auth to access AI paper checking
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=/ai-paper-check`);
    }
  }, [user, isLoading, router]);

  // Load existing report if reportId is passed
  useEffect(() => {
    if (queryReportId && user) {
      fetchExistingReport(queryReportId);
    }
  }, [queryReportId, user]);

  // Load the papers available for the chosen class + subject
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setPapersLoading(true);
    fetch(`/api/papers?classGrade=${classGrade}&subject=${encodeURIComponent(subject)}`)
      .then((res) => (res.ok ? res.json() : { papers: [] }))
      .then((data) => {
        if (cancelled) return;
        const list = data.papers || [];
        setAvailablePapers(list);
        // Keep the paper that was passed in the URL selected (without forcing
        // the viewer open — the student already came from that paper).
        if (queryPaperId && list.some((p: any) => p.id === queryPaperId)) {
          setSelectedPaperId(queryPaperId);
        }
      })
      .catch(() => {
        if (!cancelled) setAvailablePapers([]);
      })
      .finally(() => {
        if (!cancelled) setPapersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [classGrade, subject, user, queryPaperId]);

  const openPaperInViewer = (paper: any) => {
    if (!paper) return;
    // fileUrl is a /uploads/papers/*.pdf path; next.config.js redirects it to
    // the official FBISE PDF, and PdfViewerModal opens it through that URL.
    setSelectedPdf({
      title: paper.title,
      fileUrl: paper.fileUrl,
      paperId: paper.id,
      subject: paper.subject,
      classGrade: paper.classGrade,
    });
    setPdfModalOpen(true);
  };

  // Selecting a paper immediately opens it for reading.
  const handlePaperSelect = (paperId: string) => {
    setSelectedPaperId(paperId);
    const paper = availablePapers.find((p) => p.id === paperId);
    if (paper) openPaperInViewer(paper);
  };

  const selectedPaper = availablePapers.find((p) => p.id === selectedPaperId) || null;

  const fetchExistingReport = async (id: string) => {
    setIsEvaluating(true);
    setEvaluationStage('Loading saved FBISE assessment report...');
    try {
      const res = await fetch(`/api/ai/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data.report.evaluation);
        setReportMeta({
          studentName: data.report.studentName,
          subject: data.report.subject,
          classGrade: data.report.classGrade,
          createdAt: data.report.createdAt,
          paperTitle: data.report.paperTitle,
        });
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleFillSample = () => {
    setSubmissionType('TYPED');
    setClassGrade('9');
    setSubject('Physics');
    setTypedAnswers(
      `Question 1: Differentiate between vector and scalar quantities.
Answer: A scalar quantity is defined as a physical quantity that is completely specified by its magnitude along with a suitable unit. Examples include speed, distance, mass, and work.
In contrast, a vector quantity requires both magnitude, unit, and a specific direction in space for its complete description. Examples include displacement, velocity, force, and momentum. Vectors can be represented graphically by a straight line with an arrowhead pointing in the direction of the vector.

Question 2: State Newton's Second Law of Motion and derive its mathematical formula F = ma.
Answer: When a net external unbalanced force acts on a body, it produces an acceleration in the body in the direction of the force. The magnitude of this acceleration is directly proportional to the applied force and inversely proportional to the mass of the body.
Mathematically:
a ∝ F (at constant mass)
a ∝ 1/m (at constant force)
Combining both proportions:
a ∝ F / m
F ∝ m * a
F = k * m * a
In the International System of Units (SI), the unit of force is Newton (N), defined such that k = 1 when m = 1 kg and a = 1 m/s^2.
Therefore: F = ma.

Question 3: A car starting from rest attains a velocity of 20 m/s in 10 seconds. Find acceleration and distance covered.
Answer:
Given Data:
Initial velocity (vi) = 0 m/s
Final velocity (vf) = 20 m/s
Time interval (t) = 10 s
Formula for Acceleration:
a = (vf - vi) / t = (20 - 0) / 10 = 2 m/s^2.
Formula for Distance:
Using 2nd equation of motion:
s = vi * t + 1/2 * a * t^2
s = 0 * 10 + 1/2 * (2) * (10)^2
s = 1 * 100 = 100 meters.`
    );
  };

  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (submissionType === 'TYPED' && (!typedAnswers || typedAnswers.trim().length < 20)) {
      setErrorMessage('Please type or paste at least 20 characters of your solved answers.');
      return;
    }
    if (submissionType === 'FILE_UPLOAD' && !selectedFile) {
      setErrorMessage('Please select an image or PDF file of your handwritten answer sheet.');
      return;
    }

    setIsEvaluating(true);
    setEvaluationStage('Parsing student responses...');

    const timer1 = setTimeout(() => {
      setEvaluationStage('Matching against FBISE SLO Model Marking Scheme...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setEvaluationStage('Evaluating question-wise rubrics, SI units & diagrams...');
    }, 2800);

    const timer3 = setTimeout(() => {
      setEvaluationStage('Generating comprehensive examiner report & grade...');
    }, 4500);

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('classGrade', classGrade);
      formData.append('submissionType', submissionType);
      const paperIdToSubmit = selectedPaperId || queryPaperId;
      if (paperIdToSubmit) formData.append('paperId', paperIdToSubmit);

      if (submissionType === 'TYPED') {
        formData.append('typedAnswers', typedAnswers);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Evaluation failed. Please try again.');
        setIsEvaluating(false);
        return;
      }

      setReport(data.evaluation);
      setReportMeta({
        studentName: user?.name,
        subject,
        classGrade,
        createdAt: new Date().toISOString(),
        paperTitle: `${subject} Class ${classGrade} Examination Submission`,
      });
    } catch (err: any) {
      setErrorMessage('Network error during evaluation. Please verify your connection.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setReport(null);
    setReportMeta(null);
    setTypedAnswers('');
    setSelectedFile(null);
    setSelectedPaperId('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-fbise-950 via-slate-900 to-amber-950 text-white p-6 sm:p-10 shadow-xl border border-amber-500/30">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Federal Board AI Assessor</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              FBISE AI Paper Checking System
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Upload your handwritten answer sheets (photos/PDF) or type your responses.
              Our diagnostic AI checks your work question-by-question against official FBISE marking schemes,
              highlights missed points, awards step-wise marks, and provides targeted tips.
            </p>
          </div>
        </div>

        {/* LOADING / EVALUATION PROGRESS MODAL OVERLAY */}
        {isEvaluating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 text-center space-y-5 border border-amber-500/30 shadow-2xl">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-amber-500 font-bold">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  AI Assessor at Work
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1 animate-pulse">
                  {evaluationStage}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 text-left space-y-1">
                <p>• Applying FBISE Student Learning Outcomes (SLOs)</p>
                <p>• Calculating Section B (Short) & Section C (Long) marks</p>
                <p>• Verifying formula units, diagrams & nomenclature</p>
              </div>
            </div>
          </div>
        )}

        {/* Paper Viewer — opens the selected paper through its
            /uploads/papers/*.pdf URL (redirected to the official FBISE PDF) */}
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

        {/* REPORT VIEW (When Evaluation is Complete) */}
        {report ? (
          <div className="space-y-6">
            {/* Action Bar for Report */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Check Another Paper</span>
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Link
                  href="/dashboard"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-fbise-50 dark:bg-fbise-950 text-fbise-800 dark:text-fbise-300 font-bold text-xs hover:bg-fbise-100 flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved to Dashboard</span>
                </Link>

                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-fbise-800 hover:bg-fbise-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF Report</span>
                </button>
              </div>
            </div>

            {/* PRINTABLE ASSESSMENT REPORT DOCUMENT */}
            <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 print:border-none print:shadow-none print:p-0">
              {/* Document Official Header */}
              <div className="border-b-2 border-fbise-900/20 dark:border-fbise-500/30 pb-6 text-center space-y-2">
                <div className="text-xs uppercase tracking-widest font-extrabold text-fbise-800 dark:text-fbise-400">
                  Federal Board of Intermediate and Secondary Education, Islamabad
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Automated Paper Evaluation Report
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1 font-medium">
                  <span>Candidate: <strong className="text-slate-900 dark:text-white">{reportMeta?.studentName || user?.name}</strong></span>
                  <span>•</span>
                  <span>Subject: <strong className="text-slate-900 dark:text-white">{report.subject}</strong></span>
                  <span>•</span>
                  <span>Class: <strong className="text-slate-900 dark:text-white">Class {report.classGrade}</strong></span>
                  <span>•</span>
                  <span>Date: {new Date(reportMeta?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Total Marks & Grade Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-2xl bg-gradient-to-r from-fbise-900 to-slate-900 text-white shadow-md">
                <div className="text-center sm:text-left space-y-1">
                  <p className="text-xs uppercase tracking-wider text-fbise-200 font-bold">Marks Awarded</p>
                  <p className="text-3xl sm:text-4xl font-black text-amber-400">
                    {report.totalObtainedMarks} <span className="text-lg text-white font-normal">/ {report.totalMaxMarks}</span>
                  </p>
                </div>

                <div className="text-center space-y-1 border-t sm:border-t-0 sm:border-x border-white/10 pt-3 sm:pt-0">
                  <p className="text-xs uppercase tracking-wider text-fbise-200 font-bold">Percentage</p>
                  <p className="text-3xl sm:text-4xl font-black text-white">{report.percentage}%</p>
                </div>

                <div className="text-center sm:text-right space-y-1 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                  <p className="text-xs uppercase tracking-wider text-fbise-200 font-bold">FBISE Letter Grade</p>
                  <p className="text-3xl sm:text-4xl font-black text-amber-400">{report.grade}</p>
                </div>
              </div>

              {/* Assessor Remarks */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-bold text-xs uppercase tracking-wider text-fbise-800 dark:text-fbise-400">
                  Chief Examiner Overall Remarks:
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {report.overallRemarks}
                </p>
              </div>

              {/* 4-Pillar Rubric Radar Bars */}
              {report.rubricsEvaluation && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    FBISE 4-Pillar Evaluation Rubrics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">Conceptual Clarity</span>
                        <span className="text-fbise-700 dark:text-fbise-400">{report.rubricsEvaluation.conceptualClarity}/10</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-fbise-600 rounded-full"
                          style={{ width: `${report.rubricsEvaluation.conceptualClarity * 10}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">Diagrams & Presentation</span>
                        <span className="text-fbise-700 dark:text-fbise-400">{report.rubricsEvaluation.presentationAndDiagrams}/10</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${report.rubricsEvaluation.presentationAndDiagrams * 10}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">FBISE Keyword Adherence</span>
                        <span className="text-fbise-700 dark:text-fbise-400">{report.rubricsEvaluation.fbiseKeywordAdherence}/10</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-fbise-600 rounded-full"
                          style={{ width: `${report.rubricsEvaluation.fbiseKeywordAdherence * 10}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">Mathematical Steps & Structure</span>
                        <span className="text-fbise-700 dark:text-fbise-400">{report.rubricsEvaluation.timeAndStructureEfficiency}/10</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${report.rubricsEvaluation.timeAndStructureEfficiency * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Question-Wise Breakdown */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-fbise-700 dark:text-fbise-400" />
                  <span>Question-by-Question Marking Breakdown</span>
                </h3>

                <div className="space-y-4">
                  {report.questionBreakdown.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded-md bg-fbise-800 text-white font-bold text-xs font-mono">
                            {q.questionNumber}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white text-sm">
                            {q.questionTitle}
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-fbise-100 dark:bg-fbise-950 text-fbise-800 dark:text-fbise-300">
                          {q.obtainedMarks} / {q.maxMarks} Marks
                        </span>
                      </div>

                      {/* Excerpt */}
                      <div className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        &ldquo;{q.studentAnswerExcerpt}&rdquo;
                      </div>

                      {/* Mistakes Highlighted */}
                      {q.mistakes && q.mistakes.length > 0 && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-900 dark:text-red-200 space-y-1">
                          <span className="font-bold block text-red-800 dark:text-red-400">
                            Identified Deductions & Mistakes:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {q.mistakes.map((m, mIdx) => (
                              <li key={mIdx}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Correct Model Scheme */}
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-950 dark:text-amber-200 space-y-1">
                        <span className="font-bold block text-amber-800 dark:text-amber-400">
                          Official Model Answer Standard:
                        </span>
                        <p>{q.correctExplanation}</p>
                      </div>

                      <div className="text-xs text-slate-500 pt-1">
                        <strong>Assessor Note:</strong> {q.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-fbise-50/50 dark:bg-fbise-950/20 border border-fbise-200 dark:border-fbise-800/40 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-fbise-800 dark:text-fbise-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-fbise-600" />
                    <span>Key Strengths Observed</span>
                  </h4>
                  <ul className="list-disc pl-4 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {report.strongAreas.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-red-800 dark:text-red-400 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Areas Requiring Immediate Revision</span>
                  </h4>
                  <ul className="list-disc pl-4 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {report.weakAreas.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Practical Board Exam Tips */}
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Actionable Tips for Higher Board Marks</span>
                </h4>
                <ul className="list-disc pl-4 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  {report.studyTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Document Official Footer */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Verified Diagnostic Engine • FBISE Study Hub</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">Developed by Team Khan Hanan</span>
              </div>
            </div>
          </div>
        ) : (
          /* SUBMISSION FORM */
          <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Submit Solved Paper for AI Evaluation
                </h2>
                <p className="text-xs text-slate-500">
                  Select your subject, submission format, and let AI grade your answers
                </p>
              </div>

              {/* Quick Sample Button */}
              <button
                type="button"
                onClick={handleFillSample}
                className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs hover:bg-amber-100 transition-colors flex items-center space-x-1 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Fill Sample Answers</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleEvaluateSubmit} className="space-y-6">
              {/* Selectors: Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class Grade *
                  </label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fbise-700"
                  >
                    <option value="9">Class 9 (SSC Part 1)</option>
                    <option value="10">Class 10 (SSC Part 2)</option>
                    <option value="11">1st Year — Class 11 (HSSC-I)</option>
                    <option value="12">2nd Year — Class 12 (HSSC-II)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fbise-700"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Pakistan Studies">Pakistan Studies</option>
                    <option value="Islamiat">Islamiat</option>
                  </select>
                </div>
              </div>

              {/* Paper Picker — selecting a paper opens it right away */}
              <div className="p-4 rounded-2xl bg-fbise-50 dark:bg-fbise-950/30 border border-fbise-200 dark:border-fbise-800/50 space-y-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-fbise-700 dark:text-fbise-400" />
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Paper to Attempt (paper select karte hi paper khul jayega)
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedPaperId}
                    onChange={(e) => handlePaperSelect(e.target.value)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fbise-600"
                  >
                    <option value="">
                      {papersLoading
                        ? 'Loading papers...'
                        : availablePapers.length > 0
                        ? '— Choose a paper —'
                        : `No ${subject} paper for Class ${classGrade} yet`}
                    </option>
                    {availablePapers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.paperType === 'MODEL_PAPER' ? 'Model Paper' : 'Past Paper'} • {p.year})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedPaper}
                    onClick={() => selectedPaper && openPaperInViewer(selectedPaper)}
                    className="px-5 py-2.5 rounded-xl bg-fbise-600 hover:bg-fbise-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-sm transition-colors flex-shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Open Paper</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pehle paper khol kar sawal parh lo, phir neeche apne answers likho ya answer sheet
                  upload karo — AI unhi sawalon ke hisaab se checking karega.
                </p>
                {selectedPaper && (
                  <p className="text-[11px] font-semibold text-fbise-800 dark:text-fbise-300">
                    Selected: {selectedPaper.title}
                  </p>
                )}
              </div>

              {/* Mode Toggle Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Submission Format *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSubmissionType('TYPED')}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                      submissionType === 'TYPED'
                        ? 'border-fbise-700 bg-fbise-50 dark:bg-fbise-950 text-fbise-900 dark:text-fbise-100 shadow-sm ring-1 ring-fbise-700'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-fbise-600'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-fbise-700" />
                    <span>Type / Paste Answers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmissionType('FILE_UPLOAD')}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                      submissionType === 'FILE_UPLOAD'
                        ? 'border-fbise-700 bg-fbise-50 dark:bg-fbise-950 text-fbise-900 dark:text-fbise-100 shadow-sm ring-1 ring-fbise-700'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-fbise-600'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>Upload Answer Sheet (PDF / Photo)</span>
                  </button>
                </div>
              </div>

              {/* MODE A: TYPED ANSWERS */}
              {submissionType === 'TYPED' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Your Solved Answers Script
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Write Question numbers (e.g. Q1, Q2, Q3) for best evaluation
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={typedAnswers}
                    onChange={(e) => setTypedAnswers(e.target.value)}
                    placeholder="Question 1: Define inertia and give two practical examples...&#10;Answer: Inertia is the property of a body due to which it resists any change in its state of rest or uniform motion...&#10;&#10;Question 2: Derive second equation of motion...&#10;Answer: Let initial velocity be vi..."
                    className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-fbise-700 font-mono leading-relaxed"
                  />
                </div>
              ) : (
                /* MODE B: FILE UPLOAD */
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Upload Solved Answer Sheet File
                  </label>
                  <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {selectedFile ? selectedFile.name : 'Click to select or drag & drop files'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Supports PDF files and high-resolution JPEG/PNG photos (max 15 MB)
                      </p>
                    </div>

                    <input
                      type="file"
                      id="answerSheetUpload"
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="answerSheetUpload"
                      className="inline-block px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      {selectedFile ? 'Replace Selected File' : 'Choose File from Computer'}
                    </label>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isEvaluating}
                className="w-full py-4 px-6 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Sparkles className="w-5 h-5" />
                <span>Evaluate Paper Against FBISE Marking Scheme</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AiPaperCheckerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-20 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading FBISE AI Paper Checker...</p>
        </div>
      }
    >
      <AiPaperCheckerContent />
    </Suspense>
  );
}
