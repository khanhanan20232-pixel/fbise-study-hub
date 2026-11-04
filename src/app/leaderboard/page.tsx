'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Award,
  Medal,
  Users,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classGrade, setClassGrade] = useState<string>('ALL');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?classGrade=${classGrade}`);
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [classGrade]);

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-6 sm:p-10 shadow-xl border border-navy-700/40 text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent-400 text-navy-950 shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span>Federal Board Roll of Honor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            FBISE Student Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-fbise-100/90 max-w-xl mx-auto leading-relaxed">
            Recognizing the top academic performers across Federal Board Islamabad.
            Earn ranking points through daily chapter quiz mastery, continuous streaks, and accuracy.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Filter by Class:</span>
            <div className="flex space-x-1 overflow-x-auto">
              {['ALL', '9', '10', '11', '12'].map((c) => (
                <button
                  key={c}
                  onClick={() => setClassGrade(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    classGrade === c
                      ? 'bg-navy-800 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {c === 'ALL' ? 'All Classes' : c === '9' ? 'Class 9' : c === '10' ? 'Class 10' : c === '11' ? '1st Year' : '2nd Year'}
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/quizzes"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Earn Points Today</span>
          </Link>
        </div>

        {/* Top 3 Scholars Podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Rank 2 (Silver) */}
            {top3[1] && (
              <div className="order-2 md:order-1 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3 relative overflow-hidden flex flex-col justify-between">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-slate-300"></div>
                <div>
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 text-slate-700 dark:text-slate-200 font-black text-xl flex items-center justify-center mx-auto shadow-md">
                    🥈
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2 truncate">
                    {top3[1].name}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full inline-block mt-1">
                    Class {top3[1].className}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-around text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</p>
                    <p className="font-black text-emerald-600">{top3[1].avgPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Streak</p>
                    <p className="font-black text-amber-500">{top3[1].streak}d 🔥</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Points</p>
                    <p className="font-black text-slate-800 dark:text-slate-200">{top3[1].points}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold - Elevated) */}
            {top3[0] && (
              <div className="order-1 md:order-2 p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 via-white to-white dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-400/80 shadow-xl text-center space-y-3 relative overflow-hidden md:-translate-y-2 flex flex-col justify-between">
                <div className="h-2 w-full absolute top-0 left-0 bg-gradient-to-r from-accent-400 to-accent-500"></div>
                <div>
                  <div className="w-18 h-18 rounded-full bg-accent-400 text-navy-950 font-black text-3xl flex items-center justify-center mx-auto shadow-lg border-2 border-white">
                    🥇
                  </div>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-accent-400 text-navy-950 font-black text-[10px] uppercase tracking-wider mt-2 shadow-sm">
                    Federal Board Top Scholar
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg mt-1 truncate">
                    {top3[0].name}
                  </h3>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-0.5 rounded-full inline-block mt-1">
                    Class {top3[0].className}
                  </span>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-around text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</p>
                    <p className="font-black text-emerald-600 text-sm">{top3[0].avgPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Streak</p>
                    <p className="font-black text-amber-500 text-sm">{top3[0].streak}d 🔥</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Points</p>
                    <p className="font-black text-slate-900 dark:text-white text-sm">{top3[0].points}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3[2] && (
              <div className="order-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3 relative overflow-hidden flex flex-col justify-between">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-amber-700/60"></div>
                <div>
                  <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950 border-2 border-amber-700 text-amber-900 font-black text-xl flex items-center justify-center mx-auto shadow-md">
                    🥉
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2 truncate">
                    {top3[2].name}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full inline-block mt-1">
                    Class {top3[2].className}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-around text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</p>
                    <p className="font-black text-emerald-600">{top3[2].avgPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Streak</p>
                    <p className="font-black text-amber-500">{top3[2].streak}d 🔥</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Points</p>
                    <p className="font-black text-slate-800 dark:text-slate-200">{top3[2].points}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Complete Leaderboard Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Streak</th>
                  <th className="py-3.5 px-4">Quizzes Solved</th>
                  <th className="py-3.5 px-4">Accuracy</th>
                  <th className="py-3.5 px-4 text-right">Honor Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {leaderboard.map((student) => (
                  <tr
                    key={student.id}
                    className={`hover:bg-cream-100 dark:hover:bg-slate-800/40 ${
                      student.rank <= 3 ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-bold">
                      {student.rank === 1 ? (
                        <span className="text-base">🥇</span>
                      ) : student.rank === 2 ? (
                        <span className="text-base">🥈</span>
                      ) : student.rank === 3 ? (
                        <span className="text-base">🥉</span>
                      ) : (
                        <span className="font-mono text-slate-400">#{student.rank}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {student.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                        Class {student.className}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-500">
                      {student.streak > 0 ? `${student.streak} days 🔥` : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{student.totalAttempts}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {student.avgPercentage}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                      {student.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
