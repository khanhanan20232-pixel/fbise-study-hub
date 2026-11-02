import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

// Admin-only diagnostic: probe candidate Gemini models with a tiny prompt
// (in parallel) and report status + response time for each, so we can pick
// a model that actually answers quickly for this API key.
const CANDIDATES = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
  'gemma-4-31b-it',
];

async function probeModel(apiKey: string, model: string) {
  const t0 = Date.now();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Reply with exactly: OK' }] }],
          generationConfig: { maxOutputTokens: 256, temperature: 0 },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );
    const ms = Date.now() - t0;
    const bodyText = await res.text();
    let snippet = '';
    try {
      const data = JSON.parse(bodyText);
      if (res.ok) {
        const parts = data.candidates?.[0]?.content?.parts || [];
        snippet = parts.map((p: any) => p.text || '').join('').slice(0, 60);
      } else {
        snippet = (data.error?.message || bodyText).slice(0, 160);
      }
    } catch {
      snippet = bodyText.slice(0, 160);
    }
    return { model, status: res.status, ms, snippet };
  } catch (err: any) {
    return {
      model,
      status: 0,
      ms: Date.now() - t0,
      snippet: `TIMEOUT/ERROR: ${err.message || 'fetch failed'}`.slice(0, 160),
    };
  }
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
  }
  const results = await Promise.all(CANDIDATES.map((m) => probeModel(apiKey, m)));
  results.sort((a, b) => a.ms - b.ms);
  return NextResponse.json({ results });
}
