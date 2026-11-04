'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Send, Sparkles } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
};

const SUBJECTS = [
  'General',
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

const EXAMPLES = [
  'Newton ka second law asaan alfaz mein samjhao with example',
  'Photosynthesis kya hai? Definition aur equation batao',
  'Quadratic equation ko factorize karke hal karna sikhao: x² + 5x + 6 = 0',
  'Cell aur us ke parts ki definition FBISE style mein batao',
];

// Models sometimes answer with LaTeX/markdown despite plain-text
// instructions; clean the markup so students see readable plain text.
function cleanAnswer(text: string): string {
  const cleanLatex = (s: string) =>
      s
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2')
  .replace(/\\text\{([^{}]*)\}/g, '$1')
  .replace(/\\times/g, '×')
  .replace(/\\/g, '');
return text
    .replace(/\*\*([\s\S]+?)\*\*/g, '$1')
  .replace(/\$([\s\S]+?)\$/g, (_m, inner: string) => cleanLatex(inner))
  .replace(/\*\*/g, '')
  .replace(/\$/g, '');
}

export default function TutorPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [subject, setSubject] = useState('Physics');
  const [classGrade, setClassGrade] = useState('9');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Guests: same pattern as flashcards — login par bhejo, wapas yahin lao
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/tutor');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.className) setClassGrade(String(user.className));
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (raw?: string) => {
    const question = (raw ?? input).trim();
    if (!question || sending) return;

    const history = messages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setSending(true);
    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, subject, classGrade, history }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.answer) {
        setMessages((prev) => [...prev, { role: 'model', text: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text:
              data.error ||
              'AI Tutor abhi jawab nahi de pa raha. Thori dair baad dobara koshish karo.',
            isError: true,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Network masla — jawab nahi aa saka. Dobara koshish karo.',
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-slate-950 py-12 px-4 transition-colors">
        <div className="w-10 h-10 border-4 border-fbise-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-fbise-600 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">AI Tutor</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Apna sawal likho — FBISE syllabus ke mutabiq asaan, step-by-step jawab milega.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Class
              </label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fbise-700"
              >
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fbise-700"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chat card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="text-center py-6 space-y-4">
              <Sparkles className="w-10 h-10 text-fbise-600 mx-auto" />
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Koi bhi concept, definition ya numerical poochho. Neeche aik misal chuno ya apna
                sawal neeche likho.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => send(ex)}
                    className="text-xs font-semibold px-3 py-2 rounded-full bg-fbise-50 dark:bg-fbise-950/40 text-fbise-800 dark:text-fbise-300 border border-fbise-200 dark:border-fbise-800/50 hover:bg-fbise-100 dark:hover:bg-fbise-950/70 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={
                      m.role === 'user'
                        ? 'max-w-[85%] rounded-2xl rounded-br-md bg-fbise-600 text-white px-4 py-3 text-sm font-medium whitespace-pre-wrap'
                        : m.isError
                        ? 'max-w-[85%] rounded-2xl rounded-bl-md bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 px-4 py-3 text-sm whitespace-pre-wrap'
                        : 'max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-4 py-3 text-sm whitespace-pre-wrap'
                    }
                  >
                    {m.role === 'model' ? cleanAnswer(m.text) : m.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    Tutor soch raha hai...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2 mt-6">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="Apna sawal yahan likho... (Enter = bhejo)"
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-fbise-700 resize-none"
            />
            <button
              onClick={() => send()}
              disabled={sending || !input.trim()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-fbise-600 hover:bg-fbise-700 disabled:opacity-50 text-white text-sm font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Bhejo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
