'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getVisitorId(): string {
  try {
    let vid = window.localStorage.getItem('fbise_vid');
    if (!vid) {
      vid =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      window.localStorage.setItem('fbise_vid', vid);
    }
    return vid;
  } catch {
    return 'unknown';
  }
}

// Records a page view on every route change (skips admin pages).
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin')) return;
    try {
      const payload = JSON.stringify({
        path: pathname,
        visitorId: getVisitorId(),
        referrer: document.referrer || '',
      });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/track', blob);
      } else {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Analytics must never break the site for a visitor
    }
  }, [pathname]);

  return null;
}
