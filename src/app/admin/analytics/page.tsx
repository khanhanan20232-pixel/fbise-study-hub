'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  BarChart3,
  Eye,
  Users,
  UserPlus,
  CalendarDays,
  Globe,
  Smartphone,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface AnalyticsData {
  generatedAt: string;
  totals: { pageViews: number; uniqueVisitors: number; registeredStudents: number };
  today: { pageViews: number; uniqueVisitors: number };
  last7Days: { pageViews: number; uniqueVisitors: number };
  last30Days: { pageViews: number; uniqueVisitors: number; newStudents: number };
  daily: { date: string; views: number; visitors: number }[];
  topPages: { path: string; views: number; percentage: number }[];
  devices: { name: string; count: number; percentage: number }[];
  browsers: { name: string; count: number; percentage: number }[];
  topReferrers: { source: string; visits: number; percentage: number }[];
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  );
}

function BreakdownList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: { name: string; count: number; percentage: number }[];
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-4">
        {icon}
        <span>{title}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No data yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.name}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate pr-2">{item.name}</span>
                <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {item.count} · {item.percentage}%
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${item.percentage}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login?redirect=/admin/analytics');
      } else if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetch('/api/admin/analytics')
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to load analytics');
          return res.json();
        })
        .then((json) => setData(json))
        .catch(() => setError('Analytics report load nahi ho saki. Page refresh karke dobara try karein.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto w-full px-4 py-16 text-center text-slate-500">
        Loading visitor report…
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-6xl mx-auto w-full px-4 py-16 text-center text-slate-500">
        Admin access required.
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto w-full px-4 py-16">
        <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxDailyViews = Math.max(1, ...data.daily.map((d) => d.views));

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Admin Panel
        </Link>
      </div>
      <div className="flex items-center gap-3 mb-1">
        <BarChart3 className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Visitor Report</h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Kitne log website par aaye, kaun se pages dekhe, aur kis device se aaye — poori report. Counting
        analytics lagne ke din se shuru hui hai.
      </p>

      {data.totals.pageViews === 0 ? (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 rounded-xl p-4 mb-8 text-sm">
          Abhi tak koi visit record nahi hua. Jaise hi log website kholenge, un ki ginti yahan nazar aana
          shuru ho jayegi.
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Visitors Today"
          value={data.today.uniqueVisitors}
          sub={`${data.today.pageViews} page views today`}
        />
        <StatCard
          icon={<CalendarDays className="w-4 h-4" />}
          label="Visitors (7 Days)"
          value={data.last7Days.uniqueVisitors}
          sub={`${data.last7Days.pageViews} page views`}
        />
        <StatCard
          icon={<Eye className="w-4 h-4" />}
          label="All-Time Page Views"
          value={data.totals.pageViews}
          sub={`${data.totals.uniqueVisitors} unique visitors in total`}
        />
        <StatCard
          icon={<UserPlus className="w-4 h-4" />}
          label="Registered Students"
          value={data.totals.registeredStudents}
          sub={`${data.last30Days.newStudents} new in the last 30 days`}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-8">
        <div className="font-semibold text-slate-900 dark:text-white mb-4">Last 14 Days — Page Views</div>
        <div className="flex items-end gap-1 sm:gap-2 h-40">
          {data.daily.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[10px] text-slate-500">{d.views > 0 ? d.views : ''}</span>
              <div
                className="w-full bg-emerald-600/90 rounded-t-md min-h-[3px]"
                style={{ height: `${Math.max(3, (d.views / maxDailyViews) * 110)}px` }}
                title={`${d.date}: ${d.views} views, ${d.visitors} visitors`}
              />
              <span className="text-[10px] text-slate-400 truncate w-full text-center">
                {d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-4">
            <FileText className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Most Viewed Pages (30 Days)</span>
          </div>
          {data.topPages.length === 0 ? (
            <p className="text-sm text-slate-500">No data yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.topPages.map((p) => (
                <li key={p.path} className="py-2 flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate pr-2">{p.path}</span>
                  <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {p.views} views · {p.percentage}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <BreakdownList
          title="Where Visitors Come From (30 Days)"
          icon={<Globe className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />}
          items={data.topReferrers.map((r) => ({ name: r.source, count: r.visits, percentage: r.percentage }))}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <BreakdownList
          title="Devices (30 Days)"
          icon={<Smartphone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />}
          items={data.devices}
        />
        <BreakdownList
          title="Browsers (30 Days)"
          icon={<Globe className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />}
          items={data.browsers}
        />
      </div>

      <p className="mt-8 text-xs text-slate-400">
        Notes: A &quot;unique visitor&quot; is counted once per browser. Admin pages are not tracked, and
        bots/crawlers are excluded. WhatsApp par share kiye gaye link se aanay walay aksar &quot;Direct&quot;
        mein ginay jatay hain, kyunke WhatsApp referrer nahi bhejta. Report updated:{' '}
        {new Date(data.generatedAt).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })} PKT.
      </p>
    </div>
  );
}
