'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  FileText,
  Upload,
  BookOpen,
  Users,
  Bell,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  BarChart3,
  Search,
  Lock,
  Unlock,
} from 'lucide-react';

export default function AdminPanelPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'papers' | 'quizzes' | 'students' | 'announcements'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Papers State
  const [papersList, setPapersList] = useState<any[]>([]);
  const [newPaper, setNewPaper] = useState({
    title: '',
    classGrade: '9',
    subject: 'Physics',
    year: '2024',
    session: 'Annual',
    paperType: 'PAST_PAPER',
  });
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [uploadingPaper, setUploadingPaper] = useState(false);

  // Quizzes State
  const [quizzesList, setQuizzesList] = useState<any[]>([]);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    classGrade: '9',
    subject: 'Physics',
    chapter: '',
    timeLimit: 600,
  });
  const [quizQuestions, setQuizQuestions] = useState<any[]>([
    {
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      explanation: '',
    },
  ]);
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  // Students State
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Announcements State
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    category: 'DATE_SHEET',
    content: '',
    link: '',
    isPinned: false,
  });
  const [postingNotice, setPostingNotice] = useState(false);

  // Status Alerts
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check admin authorization
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, papersRes, quizzesRes, usersRes, noticesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/papers'),
        fetch('/api/quizzes'),
        fetch('/api/admin/users'),
        fetch('/api/announcements'),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats);
      }
      if (papersRes.ok) {
        const pData = await papersRes.json();
        setPapersList(pData.papers || []);
      }
      if (quizzesRes.ok) {
        const qData = await quizzesRes.json();
        setQuizzesList(qData.quizzes || []);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setStudentsList(uData.users || []);
      }
      if (noticesRes.ok) {
        const nData = await noticesRes.json();
        setAnnouncementsList(nData.announcements || []);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user]);

  // Upload Paper Handler
  const handleUploadPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingPaper(true);
    setStatusMsg(null);

    try {
      const formData = new FormData();
      formData.append('title', newPaper.title);
      formData.append('classGrade', newPaper.classGrade);
      formData.append('subject', newPaper.subject);
      formData.append('year', newPaper.year);
      formData.append('session', newPaper.session);
      formData.append('paperType', newPaper.paperType);
      if (paperFile) formData.append('file', paperFile);

      const res = await fetch('/api/papers', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Paper uploaded successfully!' });
        setNewPaper({
          title: '',
          classGrade: '9',
          subject: 'Physics',
          year: '2024',
          session: 'Annual',
          paperType: 'PAST_PAPER',
        });
        setPaperFile(null);
        loadAdminData();
      } else {
        const err = await res.json();
        setStatusMsg({ type: 'error', text: err.error || 'Failed to upload paper' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network error uploading paper' });
    } finally {
      setUploadingPaper(false);
    }
  };

  // Delete Paper Handler
  const handleDeletePaper = async (id: string) => {
    if (!confirm('Are you sure you want to delete this paper?')) return;
    try {
      const res = await fetch(`/api/papers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Paper deleted successfully' });
        loadAdminData();
      }
    } catch (err) {}
  };

  // Add Question Row to Quiz Form
  const handleAddQuestionRow = () => {
    setQuizQuestions((prev) => [
      ...prev,
      {
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        explanation: '',
      },
    ]);
  };

  // Create Quiz Handler
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingQuiz(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newQuiz,
          isDaily: true,
          questions: quizQuestions,
        }),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Quiz created successfully!' });
        setNewQuiz({
          title: '',
          classGrade: '9',
          subject: 'Physics',
          chapter: '',
          timeLimit: 600,
        });
        setQuizQuestions([
          {
            question: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: 'A',
            explanation: '',
          },
        ]);
        loadAdminData();
      } else {
        const err = await res.json();
        setStatusMsg({ type: 'error', text: err.error || 'Failed to create quiz' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network error creating quiz' });
    } finally {
      setCreatingQuiz(false);
    }
  };

  // Delete Quiz Handler
  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Quiz deleted successfully' });
        loadAdminData();
      }
    } catch (err) {}
  };

  // Toggle Block Student
  const handleToggleBlockStudent = async (studentId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !currentStatus }),
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {}
  };

  // Delete Student
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student account?')) return;
    try {
      const res = await fetch(`/api/admin/users/${studentId}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Student deleted successfully' });
        loadAdminData();
      }
    } catch (err) {}
  };

  // Post Announcement
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingNotice(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnouncement),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Announcement published successfully!' });
        setNewAnnouncement({
          title: '',
          category: 'DATE_SHEET',
          content: '',
          link: '',
          isPinned: false,
        });
        loadAdminData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to post announcement' });
    } finally {
      setPostingNotice(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {}
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-fbise-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading FBISE Admin Control Panel...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
          <p className="text-xs text-slate-500">
            This section is restricted to Federal Board administrators.
          </p>
          <Link href="/login" className="px-4 py-2 rounded-lg bg-emerald-800 text-white text-xs font-bold inline-block">
            Sign in as Administrator
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-fbise-950 to-slate-900 text-white shadow-xl border border-fbise-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-fbise-500 text-white">
              <Shield className="w-3.5 h-3.5" />
              <span>FBISE Administrative Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Administration
            </h1>
            <p className="text-xs text-fbise-200">
              Logged in as <strong className="text-white">{user.name}</strong> ({user.email})
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/analytics"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-colors"
            >
              Visitor Report
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
            >
              View Student Dashboard
            </Link>
          </div>
        </div>

        {/* Global Status Alert */}
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200'
            }`}
          >
            <span>{statusMsg.text}</span>
            <button onClick={() => setStatusMsg(null)} className="underline text-[10px]">
              Dismiss
            </button>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Platform KPIs', icon: BarChart3 },
            { id: 'papers', label: `Manage Papers (${papersList.length})`, icon: BookOpen },
            { id: 'quizzes', label: `Manage Quizzes (${quizzesList.length})`, icon: FileText },
            { id: 'students', label: `Students (${studentsList.length})`, icon: Users },
            { id: 'announcements', label: `Announcements (${announcementsList.length})`, icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                  isActive
                    ? 'border-fbise-600 text-fbise-700 dark:text-fbise-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & KPIS */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Students</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.totalStudents}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase">Board Papers</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">{stats.totalPapers}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase">Active Quizzes</p>
                <p className="text-3xl font-black text-teal-600 mt-1">{stats.totalQuizzes}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase">Quizzes Solved</p>
                <p className="text-3xl font-black text-amber-500 mt-1">{stats.totalAttempts}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase">AI Papers Checked</p>
                <p className="text-3xl font-black text-fbise-600 mt-1">{stats.totalCheckedPapers}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Platform Health & Recent Registrations
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Class</th>
                      <th className="py-2.5 px-4">Streak</th>
                      <th className="py-2.5 px-4">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {studentsList.slice(0, 5).map((s) => (
                      <tr key={s.id}>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                        <td className="py-3 px-4 text-slate-500">{s.email}</td>
                        <td className="py-3 px-4 font-semibold">Class {s.className}</td>
                        <td className="py-3 px-4 font-bold text-amber-500">{s.streak}d 🔥</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE PAPERS */}
        {activeTab === 'papers' && (
          <div className="space-y-8">
            {/* Upload Paper Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                <Upload className="w-5 h-5 text-emerald-700" />
                <span>Upload New FBISE Past Paper / Model Paper</span>
              </h3>

              <form onSubmit={handleUploadPaper} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Paper Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPaper.title}
                    onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                    placeholder="e.g. Physics SSC-I Annual 2024"
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class Grade *
                  </label>
                  <select
                    value={newPaper.classGrade}
                    onChange={(e) => setNewPaper({ ...newPaper, classGrade: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="9">Class 9 (SSC Part 1)</option>
                    <option value="10">Class 10 (SSC Part 2)</option>
                    <option value="11">1st Year — Class 11</option>
                    <option value="12">2nd Year — Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={newPaper.subject}
                    onChange={(e) => setNewPaper({ ...newPaper, subject: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPaper.year}
                    onChange={(e) => setNewPaper({ ...newPaper, year: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Session
                  </label>
                  <select
                    value={newPaper.session}
                    onChange={(e) => setNewPaper({ ...newPaper, session: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Annual">Annual Exam</option>
                    <option value="Supplementary">Supplementary (2nd Annual)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Paper Type
                  </label>
                  <select
                    value={newPaper.paperType}
                    onChange={(e) => setNewPaper({ ...newPaper, paperType: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="PAST_PAPER">Past Examination Paper</option>
                    <option value="MODEL_PAPER">SLO Model Paper</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PDF Document File
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setPaperFile(e.target.files[0]);
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-800 file:text-white hover:file:bg-emerald-900 cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-3 pt-2">
                  <button
                    type="submit"
                    disabled={uploadingPaper}
                    className="px-6 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {uploadingPaper ? 'Uploading...' : 'Publish Paper to Library'}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Papers */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  All Published Papers ({papersList.length})
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-4">Title</th>
                      <th className="py-2.5 px-4">Class</th>
                      <th className="py-2.5 px-4">Subject</th>
                      <th className="py-2.5 px-4">Year/Session</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {papersList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{p.title}</td>
                        <td className="py-3 px-4">Class {p.classGrade}</td>
                        <td className="py-3 px-4">{p.subject}</td>
                        <td className="py-3 px-4 text-slate-500">{p.year} ({p.session})</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.paperType === 'MODEL_PAPER' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.paperType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <a
                            href={p.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 font-bold hover:underline"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDeletePaper(p.id)}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE QUIZZES */}
        {activeTab === 'quizzes' && (
          <div className="space-y-8">
            {/* Create Quiz Form */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>Create New Daily Chapter Quiz</span>
              </h3>

              <form onSubmit={handleCreateQuiz} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                      placeholder="e.g. Physics Class 9: Motion & Force"
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Class Grade *
                    </label>
                    <select
                      value={newQuiz.classGrade}
                      onChange={(e) => setNewQuiz({ ...newQuiz, classGrade: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                      <option value="11">1st Year (11)</option>
                      <option value="12">2nd Year (12)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subject *
                    </label>
                    <select
                      value={newQuiz.subject}
                      onChange={(e) => setNewQuiz({ ...newQuiz, subject: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="English">English</option>
                      <option value="Urdu">Urdu</option>
                      <option value="Pakistan Studies">Pakistan Studies</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Chapter Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newQuiz.chapter}
                      onChange={(e) => setNewQuiz({ ...newQuiz, chapter: e.target.value })}
                      placeholder="e.g. Chapter 2: Kinematics"
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Time Limit (Seconds)
                    </label>
                    <input
                      type="number"
                      value={newQuiz.timeLimit}
                      onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) || 600 })}
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Questions Builder */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      Quiz Questions ({quizQuestions.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddQuestionRow}
                      className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Question</span>
                    </button>
                  </div>

                  {quizQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                        <span>Question {qIdx + 1}</span>
                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setQuizQuestions((prev) => prev.filter((_, idx) => idx !== qIdx))
                            }
                            className="text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Enter MCQ statement..."
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...quizQuestions];
                          updated[qIdx].question = e.target.value;
                          setQuizQuestions(updated);
                        }}
                        className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          required
                          placeholder="Option A"
                          value={q.optionA}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[qIdx].optionA = e.target.value;
                            setQuizQuestions(updated);
                          }}
                          className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Option B"
                          value={q.optionB}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[qIdx].optionB = e.target.value;
                            setQuizQuestions(updated);
                          }}
                          className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Option C"
                          value={q.optionC}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[qIdx].optionC = e.target.value;
                            setQuizQuestions(updated);
                          }}
                          className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Option D"
                          value={q.optionD}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[qIdx].optionD = e.target.value;
                            setQuizQuestions(updated);
                          }}
                          className="py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Correct Option
                          </label>
                          <select
                            value={q.correctOption}
                            onChange={(e) => {
                              const updated = [...quizQuestions];
                              updated[qIdx].correctOption = e.target.value;
                              setQuizQuestions(updated);
                            }}
                            className="w-full py-1.5 px-2 rounded-lg border bg-white dark:bg-slate-800 text-xs font-bold"
                          >
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Syllabus Explanation
                          </label>
                          <input
                            type="text"
                            placeholder="Reasoning based on FBISE textbook..."
                            value={q.explanation}
                            onChange={(e) => {
                              const updated = [...quizQuestions];
                              updated[qIdx].explanation = e.target.value;
                              setQuizQuestions(updated);
                            }}
                            className="w-full py-1.5 px-3 rounded-lg border bg-white dark:bg-slate-800 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={creatingQuiz}
                  className="px-6 py-2.5 rounded-xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 transition-colors shadow-sm disabled:opacity-50"
                >
                  {creatingQuiz ? 'Creating Quiz...' : 'Publish Quiz'}
                </button>
              </form>
            </div>

            {/* Quizzes List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Active Quizzes ({quizzesList.length})
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-4">Title</th>
                      <th className="py-2.5 px-4">Class</th>
                      <th className="py-2.5 px-4">Subject</th>
                      <th className="py-2.5 px-4">Chapter</th>
                      <th className="py-2.5 px-4">Questions</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {quizzesList.map((q) => (
                      <tr key={q.id}>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{q.title}</td>
                        <td className="py-3 px-4">Class {q.classGrade}</td>
                        <td className="py-3 px-4">{q.subject}</td>
                        <td className="py-3 px-4 text-slate-500">{q.chapter}</td>
                        <td className="py-3 px-4 font-semibold">{q.questionCount}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteQuiz(q.id)}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MANAGE STUDENTS */}
        {activeTab === 'students' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Enrolled Students Directory ({studentsList.length})
              </h4>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Filter students by name or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Class</th>
                    <th className="py-2.5 px-4">Streak</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {studentsList
                    .filter(
                      (s) =>
                        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                        s.email.toLowerCase().includes(studentSearch.toLowerCase())
                    )
                    .map((s) => (
                      <tr key={s.id}>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                        <td className="py-3 px-4 text-slate-500">{s.email}</td>
                        <td className="py-3 px-4 font-semibold">Class {s.className}</td>
                        <td className="py-3 px-4 font-bold text-amber-500">{s.streak}d 🔥</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.isBlocked
                                ? 'bg-red-100 text-red-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {s.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleBlockStudent(s.id, s.isBlocked)}
                            className="text-amber-600 hover:text-amber-800 font-bold"
                          >
                            {s.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: MANAGE ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-8">
            {/* Post Announcement Form */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <span>Post Board Notice / Announcement</span>
              </h3>

              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Announcement Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      placeholder="e.g. FBISE SSC-I Date Sheet 2025 Announced"
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={newAnnouncement.category}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="DATE_SHEET">Date Sheet</option>
                      <option value="RESULT">Exam Result</option>
                      <option value="SYLLABUS">Syllabus / SLO Update</option>
                      <option value="BOARD_UPDATE">General Board Notification</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Content *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    placeholder="Enter detailed notification statement for students..."
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPinnedCheck"
                    checked={newAnnouncement.isPinned}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })}
                    className="rounded text-emerald-800 focus:ring-emerald-700"
                  />
                  <label htmlFor="isPinnedCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pin this announcement to top ticker banner
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={postingNotice}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-colors"
                >
                  {postingNotice ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </form>
            </div>

            {/* Announcements List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Active Announcements ({announcementsList.length})
                </h4>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {announcementsList.map((a) => (
                  <div key={a.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {a.category}
                        </span>
                        {a.isPinned && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-fbise-100 text-fbise-800">
                            PINNED
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</h4>
                      <p className="text-xs text-slate-500 max-w-2xl">{a.content}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-bold p-1"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
