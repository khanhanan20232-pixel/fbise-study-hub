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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
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
            Deck (Cram) Mode
          </button>
        </div>

        {/* Deck picker */}
        {mode === 'deck' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={deckClass}
              onChange={(e) => {
                setDeckClass(e.target.value);
                setDeckSubject('');
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="">Select Class</option>
              {['9', '10', '11', '12'].map((g) => (
                <option key={g} value={g}>
                  Class {g}
                </option>
              ))}
            </select>
            <select
              value={deckSubject}
              onChange={(e) => setDeckSubject(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="">Select Subject</option>
              {deckSubjects.map((d) => (
                <option key={d.subject} value={d.subject}>
                  {d.subject} ({d.count} cards)
                </option>
              ))}
            </select>
            <button
              onClick={startDeck}
              disabled={!deckClass || !deckSubject}
              className="px-5 py-2.5 rounded-xl bg-fbise-600 hover:bg-fbise-700 disabled:opacity-40 text-white text-sm font-bold transition-all"
            >
              Start Deck
            </button>
            <p className="text-[11px] text-slate-400 sm:ml-auto">
              Exam qareeb hai? Poora deck abhi practice karein — FSRS schedule apni jagah rahega.
            </p>
          </div>
        )}

        {/* Card area */}
        {loadingCards ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="w-8 h-8 border-4 border-fbise-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading flashcards...</p>
          </div>
        ) : sessionDone || !card ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {mode === 'review' ? 'No cards due — great job! 🎉' : 'Deck complete — well done! 🎉'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {mode === 'review'
                ? 'Aaj ke liye koi card baqi nahi. Quiz mein ghalat honay walay naye sawal yahan khud aa jayenge.'
                : 'Is deck ke saaray cards review ho gaye. Ratings FSRS mein save ho gayi hain.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {mode === 'review' ? (
                <button
                  onClick={() => setMode('deck')}
                  className="px-5 py-2.5 rounded-xl bg-fbise-600 hover:bg-fbise-700 text-white text-sm font-bold inline-flex items-center"
                >
                  Deck Mode try karein <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMode('review');
                    loadDue();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-fbise-600 hover:bg-fbise-700 text-white text-sm font-bold inline-flex items-center"
                >
                  Due Review par wapas <RotateCcw className="w-4 h-4 ml-1" />
                </button>
              )}
              <Link
                href="/quizzes"
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                Quizzes dein
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>
                Card {idx + 1} of {cards.length}
              </span>
              <span>
                Class {card.classGrade} • {card.subject} • {card.chapter}
              </span>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">{card.front}</p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                  <div
                    key={opt}
                    className={`px-3.5 py-2.5 rounded-xl border text-sm ${
                      flipped && card.correctOption === opt
                        ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-bold mr-1.5">{opt}.</span>
                    {card.options[opt]}
                  </div>
                ))}
              </div>

              {flipped && (
                <div className="p-4 rounded-2xl bg-fbise-50 dark:bg-fbise-950/40 border border-fbise-100 dark:border-fbise-900 space-y-1.5">
                  <p className="text-sm font-bold text-fbise-900 dark:text-fbise-200">
                    Correct Answer: {card.correctOption}. {card.back}
                  </p>
                  {card.explanation && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{card.explanation}</p>
                  )}
                </div>
              )}
            </div>

            {!flipped ? (
              <button
                onClick={() => setFlipped(true)}
                className="w-full py-3.5 rounded-2xl bg-fbise-600 hover:bg-fbise-700 text-white text-sm font-bold transition-all inline-flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-2" /> Show Answer
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-center text-xs font-semibold text-slate-500">Kitna yaad tha? Sachi rating dein — FSRS usi hisab se agla review rakhega.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {card.previews.map((p) => (
                    <button
                      key={p.rating}
                      onClick={() => rate(p.rating)}
                      disabled={ratingBusy}
                      className={`py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-50 ${RATING_STYLES[p.rating]}`}
                    >
                      {p.label}
                      <span className="block text-[11px] font-semibold opacity-80 mt-0.5">{p.interval}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
