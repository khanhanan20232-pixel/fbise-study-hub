import { fsrs, generatorParameters, createEmptyCard, Rating, type Card } from 'ts-fsrs';

// FSRS scheduler (ts-fsrs) — fuzz off so intervals are deterministic for a
// given card state, which keeps the preview labels honest.
const scheduler = fsrs(generatorParameters({ enable_fuzz: false }));

export const RATING_ORDER: Rating[] = [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy];

export const RATING_LABELS: Record<number, string> = {
  1: 'Again',
  2: 'Hard',
  3: 'Good',
  4: 'Easy',
};

// Shape of a UserFlashcard row as the helpers need it.
export interface StoredFlashcard {
  state: number;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  dueDate: Date;
  lastReview: Date | null;
}

export function toFsrsCard(stored: StoredFlashcard | null, now: Date): Card {
  if (!stored) return createEmptyCard(now);
  const base = createEmptyCard(now);
  return {
    ...base,
    due: stored.dueDate,
    stability: stored.stability,
    difficulty: stored.difficulty,
    scheduled_days: stored.scheduledDays,
    reps: stored.reps,
    lapses: stored.lapses,
    state: stored.state as Card['state'],
    last_review: stored.lastReview ?? undefined,
  };
}

// Human label for a scheduled due date relative to `now`: "1m", "6m", "2h", "4d", "1mo"
export function intervalLabel(due: Date, now: Date): string {
  const ms = Math.max(0, due.getTime() - now.getTime());
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.round(days / 30)}mo`;
}

export interface RatingPreview {
  rating: number;
  label: string;
  interval: string;
  due: Date;
}

// For one card, when would each of the 4 ratings schedule the next review?
export function previewsFor(stored: StoredFlashcard | null, now: Date): RatingPreview[] {
  const card = toFsrsCard(stored, now);
  const rec = scheduler.repeat(card, now);
  return RATING_ORDER.map((r) => ({
    rating: r,
    label: RATING_LABELS[r],
    interval: intervalLabel(rec[r].card.due, now),
    due: rec[r].card.due,
  }));
}

// Apply a rating and return the new FSRS state in DB field shape.
export function applyRating(stored: StoredFlashcard | null, rating: number, now: Date) {
  const card = toFsrsCard(stored, now);
  const rec = scheduler.repeat(card, now);
  const next = rec[rating as Rating].card;
  const elapsedDays = stored?.lastReview
    ? Math.max(0, Math.round((now.getTime() - stored.lastReview.getTime()) / 86400000))
    : 0;
  return {
    state: next.state as unknown as number,
    stability: next.stability,
    difficulty: next.difficulty,
    elapsedDays,
    scheduledDays: next.scheduled_days,
    reps: next.reps,
    lapses: next.lapses,
    dueDate: next.due,
    lastReview: now,
    interval: intervalLabel(next.due, now),
  };
}

// The correct answer's full text for a QuizQuestion row.
export function correctOptionText(q: {
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}): string {
  const map: Record<string, string> = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD };
  return map[(q.correctOption || 'A').toUpperCase()] || q.optionA;
}
