import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function parseDevice(ua: string): string {
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(s) || (/android/.test(s) && !/mobile/.test(s))) return 'Tablet';
  if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(s)) return 'Mobile';
  return 'Desktop';
}

function parseBrowser(ua: string): string {
  if (/edg\//.test(ua)) return 'Edge';
  if (/opr\/|opera/.test(ua)) return 'Opera';
  if (/samsungbrowser/.test(ua.toLowerCase())) return 'Samsung Internet';
  if (/chrome\//.test(ua) && !/edg/.test(ua.toLowerCase())) return 'Chrome';
  if (/firefox\//.test(ua)) return 'Firefox';
  if (/safari\//.test(ua) && !/chrome/.test(ua.toLowerCase())) return 'Safari';
  return 'Other';
}

// POST /api/analytics/track — records one page view. Called by AnalyticsTracker on every page change.
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get('user-agent') || '';
    // Skip bots/crawlers so the counts reflect real people
    if (/bot|crawler|spider|crawling|headless|preview|monitor/i.test(ua)) {
      return NextResponse.json({ ok: true, skipped: 'bot' });
    }

    const body = await req.json().catch(() => ({}));
    const path = typeof body.path === 'string' ? body.path.slice(0, 300) : '';
    const visitorId = typeof body.visitorId === 'string' ? body.visitorId.slice(0, 64) : '';
    if (!path || !visitorId) {
      return NextResponse.json({ error: 'path and visitorId are required' }, { status: 400 });
    }
    // Never track admin or API routes
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({ ok: true, skipped: 'excluded-path' });
    }

    let referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 300) : '';
    // Reduce a full referrer URL to just its host for a clean report
    if (referrer) {
      try {
        referrer = new URL(referrer).host;
      } catch {
        referrer = referrer.slice(0, 100);
      }
    }

    await prisma.pageView.create({
      data: {
        path,
        visitorId,
        referrer,
        device: parseDevice(ua),
        browser: parseBrowser(ua),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Analytics track error:', err);
    return NextResponse.json({ error: 'Failed to record page view' }, { status: 500 });
  }
}
