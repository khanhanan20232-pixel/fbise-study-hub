import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Day boundaries follow Pakistan time, not UTC.
function pktDateKey(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }); // YYYY-MM-DD
}

function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = keyFn(item);
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

function toSortedList(counts: Record<string, number>, total: number, limit: number) {
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// GET /api/admin/analytics — full visitor report for the admin panel (admin only).
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const now = new Date();
    const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayKey = pktDateKey(now);
    const key7 = pktDateKey(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));

    const [totalViews, visitorGroups, rows30, totalStudents, newStudents30] = await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.groupBy({ by: ['visitorId'] }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: since30 } },
        select: { path: true, visitorId: true, referrer: true, device: true, browser: true, createdAt: true },
      }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'STUDENT', createdAt: { gte: since30 } } }),
    ]);

    const rowsToday = rows30.filter((r) => pktDateKey(r.createdAt) === todayKey);
    const rows7 = rows30.filter((r) => pktDateKey(r.createdAt) >= key7);
    const uniqueOf = (rows: typeof rows30) => new Set(rows.map((r) => r.visitorId)).size;

    // Last 14 days, oldest first, for the chart
    const daily: { date: string; views: number; visitors: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const key = pktDateKey(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
      const dayRows = rows30.filter((r) => pktDateKey(r.createdAt) === key);
      daily.push({ date: key, views: dayRows.length, visitors: uniqueOf(dayRows) });
    }

    const topPages = toSortedList(countBy(rows30, (r) => r.path), rows30.length, 10).map((p) => ({
      path: p.name,
      views: p.count,
      percentage: p.percentage,
    }));

    const referrerCounts = countBy(rows30, (r) => (r.referrer ? r.referrer : 'Direct'));
    const topReferrers = toSortedList(referrerCounts, rows30.length, 8).map((r) => ({
      source: r.name,
      visits: r.count,
      percentage: r.percentage,
    }));

    return NextResponse.json({
      generatedAt: now.toISOString(),
      totals: {
        pageViews: totalViews,
        uniqueVisitors: visitorGroups.length,
        registeredStudents: totalStudents,
      },
      today: { pageViews: rowsToday.length, uniqueVisitors: uniqueOf(rowsToday) },
      last7Days: { pageViews: rows7.length, uniqueVisitors: uniqueOf(rows7) },
      last30Days: {
        pageViews: rows30.length,
        uniqueVisitors: uniqueOf(rows30),
        newStudents: newStudents30,
      },
      daily,
      topPages,
      devices: toSortedList(countBy(rows30, (r) => r.device), rows30.length, 5),
      browsers: toSortedList(countBy(rows30, (r) => r.browser), rows30.length, 6),
      topReferrers,
    });
  } catch (err: any) {
    console.error('Admin analytics error:', err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
