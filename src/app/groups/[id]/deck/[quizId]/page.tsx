'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Eye, Loader2, Layers } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DeckCard {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctOption: string;
  explanation: string;
}

export default function GroupDeckPage({ params }: { params: { id: string; quizId: string } }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [quizTitle, setQuizTitle] = useState('');
  const [cards, setCards] = useState<DeckCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=/groups/${params.id}/deck/${params.quizId}`);
    }
  }, [user, isLoading, router, params.id, params.quizId]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch(`/api/groups/${params.id}/deck/${params.quizId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Deck load nahi ho saka.');
        setQuizTitle(`${data.quiz.subject} — ${data.quiz.chapter}`);
        setCards(data.cards || []);
      } catch (err: any) {
        setError(err.message || 'Deck load nahi ho saka.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, params.id, params.quizId]);

  if (isLoading || !user || loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Deck load ho raha hai...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Link href={`/groups/${params.id}`} className="text-fbise-600 hover:underline text-sm">
          ← Group par wapas
        </Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500">
        Is quiz mein abhi koi sawal nahi hai.
        <div className="mt-4">
          <Link href={`/groups/${params.id}`} className="text-fbise-600 hover:underline text-sm">
            ← Group par wapas
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[index];
  const keys = ['A', 'B', 'C', 'D'] as const;

  function go(delta: number) {
    setIndex((i) => Math.min(cards.length - 1, Math.max(0, i + delta)));
    setFlipped(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href={`/groups/${params.id}`} className="text-sm text-fbise-600 hover:underline">
        ← Group par wapas
      </Link>

      <div className="flex items-center gap-2 mt-3 mb-1">
        <Layers className="h-5 w-5 text-fbise-600" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Group Study Deck</h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        {quizTitle} · Card {index + 1} / {cards.length} — pehle khud jawab sochho, phir jawab dekho.
      </p>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <p className="text-base font-medium text-slate-900 dark:text-white mb-4">{card.question}</p>
        <div className="space-y-2 mb-5">
          {keys.map((k) => {
            const isCorrect = flipped && card.correctOption === k;
            return (
              <div
                key={k}
                className={`rounded-xl border px-4 py-2.5 text-sm ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 font-medium'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="font-bold mr-2">{k}.</span>
                {card.options[k]}
                {isCorrect && <span className="ml-2 text-xs font-semibold">✓ Sahi jawab</span>}
              </div>
            );
          })}
        </div>

        {flipped ? (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
            <span className="font-semibold text-fbise-600 dark:text-fbise-400">Explanation: </span>
            {card.explanation}
          </div>
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-fbise-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fbise-700"
          >
            <Eye className="h-4 w-4" /> Jawab Dekho
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Pichla
        </button>
        <span className="text-sm text-slate-400">
          {index + 1} / {cards.length}
        </span>
        <button
          onClick={() => go(1)}
          disabled={index === cards.length - 1}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 disabled:opacity-40"
        >
          Agla <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
