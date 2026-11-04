'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Crown,
  Copy,
  Check,
  Trophy,
  Send,
  Trash2,
  LogOut,
  Share2,
  BookOpen,
  Layers,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface GroupInfo {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  ownerId: string;
  ownerName: string;
  myRole: string;
}
interface Member {
  userId: string;
  name: string;
  className: string;
  role: string;
  isMe: boolean;
}
interface SharedQuiz {
  id: string;
  quizId: string;
  title: string;
  subject: string;
  chapter: string;
  classGrade: string;
  questionCount: number;
  sharedByName: string;
  canRemove: boolean;
}
interface LeaderRow {
  userId: string;
  name: string;
  className: string;
  role: string;
  sharedAttempts: number;
  sharedAverage: number;
  totalAttempts: number;
  isMe: boolean;
}
interface ChatMsg {
  id: string;
  userId: string;
  name: string;
  text: string;
  createdAt: string;
  mine: boolean;
}
interface QuizOption {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  classGrade: string;
  questionCount: number;
}

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const groupId = params.id;

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [shared, setShared] = useState<SharedQuiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  const [shareQuizId, setShareQuizId] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [shareError, setShareError] = useState('');

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const lastMsgAtRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=/groups/${groupId}`);
    }
  }, [user, isLoading, router, groupId]);

  const loadGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setGroup(data.group);
      setMembers(data.members || []);
      setShared(data.sharedQuizzes || []);
      setLeaderboard(data.leaderboard || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Group load nahi ho saka.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (user) {
      loadGroup();
      fetch('/api/quizzes')
        .then((r) => r.json())
        .then((d) => {
          const list = (d.quizzes || d || []).map((q: any) => ({
            id: q.id,
            title: q.title,
            subject: q.subject,
            chapter: q.chapter,
            classGrade: q.classGrade,
            questionCount: q.questionCount ?? q._count?.questions ?? 0,
          }));
          setQuizzes(list);
        })
        .catch(() => {});
    }
  }, [user, loadGroup]);

  const loadMessages = useCallback(
    async (initial: boolean) => {
      try {
        const url =
          !initial && lastMsgAtRef.current
            ? `/api/groups/${groupId}/messages?after=${encodeURIComponent(lastMsgAtRef.current)}`
            : `/api/groups/${groupId}/messages`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) return;
        const incoming: ChatMsg[] = data.messages || [];
        if (incoming.length > 0) {
          lastMsgAtRef.current = incoming[incoming.length - 1].createdAt;
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.id));
            const fresh = incoming.filter((m) => !seen.has(m.id));
            return fresh.length ? [...prev, ...fresh] : prev;
          });
        }
      } catch {
        // polling errors are silent; next tick retries
      }
    },
    [groupId]
  );

  useEffect(() => {
    if (!user || !group) return;
    loadMessages(true);
    const timer = setInterval(() => loadMessages(false), 4000);
    return () => clearInterval(timer);
  }, [user, group, loadMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setShareMsg('');
    setShareError('');
    if (!shareQuizId) {
      setShareError('Pehle list se aik quiz select karein.');
      return;
    }
    setSharing(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: shareQuizId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Share nahi ho saka.');
      setShareMsg('Quiz group mein share ho gaya!');
      setShareQuizId('');
      await loadGroup();
    } catch (err: any) {
      setShareError(err.message || 'Share nahi ho saka.');
    } finally {
      setSharing(false);
    }
  }

  async function handleUnshare(quizId: string) {
    try {
      const res = await fetch(`/api/groups/${groupId}/share?quizId=${quizId}`, { method: 'DELETE' });
      if (res.ok) await loadGroup();
    } catch {}
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        lastMsgAtRef.current = data.message.createdAt;
        setMessages((prev) => (prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]));
        setChatInput('');
      }
    } catch {
    } finally {
      setSending(false);
    }
  }

  async function handleLeave() {
    if (!confirm('Kya aap waqai ye group leave karna chahte hain?')) return;
    const res = await fetch(`/api/groups/${groupId}/leave`, { method: 'POST' });
    if (res.ok) router.push('/groups');
  }

  async function handleDelete() {
    if (!confirm('Poora group delete ho jayega — chat, shared quizzes sab khatam. Kya aap sure hain?')) return;
    const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' });
    if (res.ok) router.push('/groups');
  }

  function copyCode() {
    if (!group) return;
    navigator.clipboard?.writeText(group.inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Group load ho raha hai...
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Group nahi mila.'}</p>
        <Link href="/groups" className="text-fbise-600 hover:underline text-sm">
          ← Study Groups par wapas
        </Link>
      </div>
    );
  }

  const isOwner = group.myRole === 'OWNER';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/groups" className="text-sm text-fbise-600 hover:underline">
        ← Tamam Study Groups
      </Link>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm mt-3 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-fbise-600" /> {group.name}
              {isOwner && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-xs font-medium">
                  <Crown className="h-3 w-3" /> Owner
                </span>
              )}
            </h1>
            {group.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{group.description}</p>}
            <p className="text-xs text-slate-400 mt-1">
              Owner: {group.ownerName} · {members.length} members
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Invite Code:</span>
              <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 font-mono font-bold tracking-[0.2em] text-slate-800 dark:text-slate-100">
                {group.inviteCode}
              </span>
              <button
                onClick={copyCode}
                className="rounded-lg border border-slate-300 dark:border-slate-700 p-1.5 text-slate-500 hover:text-fbise-600"
                title="Code copy karein"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {isOwner ? (
              <button onClick={handleDelete} className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
                <Trash2 className="h-3.5 w-3.5" /> Group Delete Karein
              </button>
            ) : (
              <button onClick={handleLeave} className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
                <LogOut className="h-3.5 w-3.5" /> Group Leave Karein
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm mb-6">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-3">
          <Share2 className="h-5 w-5 text-fbise-600" /> Shared Study Material
        </h2>
        <form onSubmit={handleShare} className="flex flex-col sm:flex-row gap-2 mb-4">
          <select
            value={shareQuizId}
            onChange={(e) => setShareQuizId(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fbise-500"
          >
            <option value="">— Share karne ke liye quiz select karein —</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                Class {q.classGrade} · {q.subject} — {q.chapter} ({q.questionCount} sawal)
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={sharing}
            className="rounded-xl bg-fbise-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fbise-700 disabled:opacity-60"
          >
            {sharing ? 'Share ho raha hai...' : 'Share Karein'}
          </button>
        </form>
        {shareError && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{shareError}</p>}
        {shareMsg && <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">{shareMsg}</p>}

        {shared.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Abhi koi quiz shared nahi hai. Pehla quiz share karke group study shuru karein!
          </p>
        ) : (
          <div className="space-y-3">
            {shared.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    Class {s.classGrade} {s.subject} — {s.chapter}
                  </p>
                  <p className="text-xs text-slate-400">
                    {s.questionCount} sawal · {s.sharedByName} ne share kiya
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/quizzes/${s.quizId}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-fbise-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-fbise-700"
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Quiz Do
                  </Link>
                  <Link
                    href={`/groups/${groupId}/deck/${s.quizId}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-fbise-600 text-fbise-600 dark:text-fbise-400 px-3 py-1.5 text-xs font-semibold hover:bg-fbise-50 dark:hover:bg-slate-800"
                  >
                    <Layers className="h-3.5 w-3.5" /> Deck Parho
                  </Link>
                  {s.canRemove && (
                    <button
                      onClick={() => handleUnshare(s.quizId)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Hatayein
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-3">
            <MessageCircle className="h-5 w-5 text-fbise-600" /> Group Chat
          </h2>
          <div className="h-80 overflow-y-auto space-y-2 pr-1 mb-3">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">
                Abhi koi message nahi. Pehla message bhej kar guftagu shuru karein!
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={
                      m.mine
                        ? 'max-w-[80%] rounded-2xl rounded-br-md bg-fbise-600 text-white px-3 py-2 text-sm whitespace-pre-wrap'
                        : 'max-w-[80%] rounded-2xl rounded-bl-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm whitespace-pre-wrap'
                    }
                  >
                    {!m.mine && <p className="text-[11px] font-semibold text-fbise-600 dark:text-fbise-400 mb-0.5">{m.name}</p>}
                    {m.text}
                  </div>
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>
          <form onSubmit={handleSend} className="flex gap-2 mt-auto">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Apna message likhein..."
              maxLength={1000}
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fbise-500"
            />
            <button
              type="submit"
              disabled={sending || !chatInput.trim()}
              className="inline-flex items-center gap-1 rounded-xl bg-fbise-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fbise-700 disabled:opacity-60"
            >
              <Send className="h-4 w-4" /> Bhejein
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-3">
              <Trophy className="h-5 w-5 text-amber-500" /> Group Leaderboard
            </h2>
            <p className="text-xs text-slate-400 mb-3">Group ke shared quizzes par attempts aur average score ki ranking.</p>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-slate-400">Abhi koi data nahi.</p>
            ) : (
              <ol className="space-y-2">
                {leaderboard.map((row, i) => (
                  <li
                    key={row.userId}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                      row.isMe ? 'bg-fbise-50 dark:bg-slate-800 border border-fbise-200 dark:border-slate-700' : 'bg-cream-100 dark:bg-slate-800/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-orange-300 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {row.name}
                        {row.isMe && <span className="ml-1 text-xs text-fbise-600">(Tum)</span>}
                      </span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 text-right">
                      {row.sharedAttempts} attempts · {row.sharedAverage}%
                      <span className="block text-[11px]">kul {row.totalAttempts} attempts</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-3">
              <Users className="h-5 w-5 text-fbise-600" /> Members ({members.length})
            </h2>
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.userId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-800 dark:text-slate-100">
                    {m.name}
                    {m.isMe && <span className="ml-1 text-xs text-fbise-600">(Tum)</span>}
                    <span className="block text-xs text-slate-400">Class {m.className}</span>
                  </span>
                  {m.role === 'OWNER' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-xs font-medium">
                      <Crown className="h-3 w-3" /> Owner
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
