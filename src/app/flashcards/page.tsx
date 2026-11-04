'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Layers, Eye, CheckCircle2, RotateCcw, ChevronRight, BookOpen, Sparkles } from 'lucide-react';

type Preview = { rating: number; label: string; interval: string };
type Card = {
  cardId: string;
  front: string;
  options: { A: string; B: string; C: string; D: string };
  back: string;
  correctOption: string;
  explanation: string;
  subject: string;
  chapter: string;
  classGrade: string;
  previews: Preview[];
};

const RATING_STYLES: Record<number, string> = {
  1: 'bg-red-600 hover:bg-red-700 text-white',
  2: 'bg-amber-500 hover:bg-amber-600 text-white',
  3: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  4: 'bg-fbise-600 hover:bg-fbise-700 text-white',
};

export default function FlashcardsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [mode, setMode] = useState<'review' | 'deck'>('review');
  const [dueCount, setDueCount] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  // Deck (cram) mode state
  const [decks, setDecks] = useState<{ classGrade: string; subject: string; count: number }[]>([]);
  const [deckClass, setDeckClass] = useState<string>('');
  const [deckSubject, setDeckSubject] = useState<string>('');

  // Guests: same pattern as the dashboard — login par bhejo, wapas yahin lao
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/flashcards');
    }
  }, [user, isLoading, router]);

  const loadDue = async () => {
    setLoadingCards(true);
    try {
      const res = await fetch('/api/flashcards/due');
      if (res.ok) {
        const data = await res.json();
        setDueCount(data.dueCount || 0);
        setCards(data.cards || []);
        setIdx(0);
        setFlipped(false);
        setSessionDone(false);
      }
    } catch (err) {
      console.error('Failed to load due flashcards:', err);
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    if (user) loadDue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch('/api/flashcards/decks');
        if (res.ok) {
          const data = await res.json();
          setDecks(data.decks || []);
        }
      } catch (err) {
        console.error('Failed to load decks:', err);
      }
    })();
  }, [user]);

  const startDeck = async () => {
    if (!deckClass || !deckSubject) return;
    setLoadingCards(true);
    try {
      const res = await fetch(
        `/api/flashcards/decks?classGrade=${encodeURIComponent(deckClass)}&subject=${encodeURIComponent(deckSubject)}`
      );
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
        setIdx(0);
        setFlipped(false);
        setSessionDone(false);
      }
    } catch (err) {
      console.error('Failed to load deck:', err);
    } finally {
      setLoadingCards(false);
    }
  };

  const rate = async (rating: number) => {
    const card = cards[idx];
    if (!card || ratingBusy) return;
    setRatingBusy(true);
    try {
      await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.cardId, rating }),
      });
      if (mode === 'review') setDueCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to save review:', err);
    } finally {
      setRatingBusy(false);
    }
    if (idx + 1 >= cards.length) {
      setSessionDone(true);
    } else {
      setIdx(idx + 1);
      setFlipped(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-fbise-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Flashcards...</p>
        </div>
      </div>
    );
  }

  const card = cards[idx];
  const deckSubjects = decks.filter((d) => d.classGrade === deckClass);

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="w-11 h-11 rounded-2xl bg-fbise-600 text-white flex items-center justify-center shadow-sm">
              <Layers className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Flashcards</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Ghalat jawab walay sawal khud-ba-khud cards ban jatay hain — FSRS unhein bhoolne se pehle dobara dikhata hai.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-fbise-50 dark:bg-fbise-950/60 text-fbise-800 dark:text-fbise-300 border border-fbise-100 dark:border-fbise-900">
            {dueCount} cards due today
          </span>
        </div>

        {/* Mode tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setMode('review');
              loadDue();
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              mode === 'review'
                ? 'bg-fbise-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Due Review
          </button>
          <button
            onClick={() => setMode('deck')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              mode === 'deck'
                ? 'bg-fbise-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Deck Mode (Cram)
          </button>
        </div>

        {/* Deck picker */}
        {mode === 'deck' && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Class</label>
              <select
                value={deckClass}
                onChange={(e) => {
                  setDeckClass(e.target.value);
                  setDeckSubject('');
                }}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-fbise-600"
              >
                <option value="">Select class…</option>
                {[...new Set(decks.map((d) => d.classGrade))].sort().map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Subject</label>
              <select
                value={deckSubject}
                onChange={(e) => setDeckSubject(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-fbise-600"
              >
                <option value="">Select subject…</option>
                {deckSubjects.map((d) => (
                  <option key={d.subject} value={d.subject}>
                    {d.subject} ({d.count} cards)
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={startDeck}
              disabled={!deckClass || !deckSubject}
              className="px-5 py-2 rounded-xl bg-accent-400 hover:bg-accent-500 disabled:opacity-50 text-navy-950 font-bold text-xs shadow-sm transition-colors"
            >
              Start Deck
            </button>
          </div>
        )}

        {/* Card area */}
        {loadingCards ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-fbise-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading cards…</p>
          </div>
        ) : sessionDone ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Session Complete!</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Aaj ke saaray due cards review ho gaye. FSRS inhein sahi waqt par dobara dikhayega.
            </p>
            <button
              onClick={loadDue}
              className="px-5 py-2.5 rounded-xl bg-fbise-600 hover:bg-fbise-700 text-white font-bold text-xs inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Check Again
            </button>
          </div>
        ) : !card ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">No Cards Due</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              {mode === 'deck'
                ? 'Is class + subject ke liye abhi koi flashcard nahi hai. Quiz mein jo sawal ghalat hoga, us ka card yahan ban jayega.'
                : 'Abhi koi card due nahi hai. Quiz mein jo sawal ghalat hoga, us ka card yahan ban jayega aur FSRS usay sahi waqt par review karwayega.'}
            </p>
            <Link
              href="/quizzes"
              className="px-5 py-2.5 rounded-xl bg-accent-400 hover:bg-accent-500 text-navy-950 font-bold text-xs inline-flex items-center gap-1.5"
            >
              Take a Quiz <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Progress */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>
                Card {idx + 1} of {cards.length}
              </span>
              <span>
                Class {card.classGrade} • {card.subject} • {card.chapter}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-fbise-600 transition-all"
                style={{ width: `${((idx + 1) / cards.length) * 100}%` }}
              />
            </div>

            {/* The card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {card.front}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(card.options) as ('A' | 'B' | 'C' | 'D')[]).map((k) => {
                  const isCorrect = flipped && k === card.correctOption;
                  const cls = isCorrect
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200';
                  return (
                    <div key={k} className={`px-4 py-3 rounded-xl border text-sm ${cls}`}>
                      <span className="font-black mr-2">{k}.</span>
                      {card.options[k]}
                    </div>
                  );
                })}
              </div>

              {flipped && (
                <div className="p-4 rounded-2xl bg-fbise-50 dark:bg-fbise-950/40 border border-fbise-100 dark:border-fbise-900 space-y-1.5">
                  <p className="text-sm font-bold text-fbise-800 dark:text-fbise-200">
                    Correct Answer: {card.correctOption}. {card.back}
                  </p>
                  {card.explanation && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{card.explanation}</p>
                  )}
                </div>
              )}

              {!flipped ? (
                <button
                  onClick={() => setFlipped(true)}
                  className="w-full py-3 rounded-xl bg-fbise-600 hover:bg-fbise-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4" /> Show Answer
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 text-center">
                    Kitna yaad tha? Rating do — FSRS agli review isi se tay karega.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {card.previews.map((p) => (
                      <button
                        key={p.rating}
                        onClick={() => rate(p.rating)}
                        disabled={ratingBusy}
                        className={`py-2.5 rounded-xl font-bold text-xs disabled:opacity-60 ${RATING_STYLES[p.rating]}`}
                      >
                        {p.label}
                        <span className="block text-[10px] font-semibold opacity-80">{p.interval}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
