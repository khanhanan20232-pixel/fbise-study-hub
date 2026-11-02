import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

// Admin-only diagnostic: list the Gemini models this server's API key can
// actually use (names + supported methods). Never returns the key itself.
export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`,
      { signal: AbortSignal.timeout(30000) }
    );
    const bodyText = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: `Google models list HTTP ${res.status}`, detail: bodyText.slice(0, 800) },
        { status: 502 }
      );
    }
    const data = JSON.parse(bodyText);
    const models = (data.models || []).map((m: any) => ({
      name: m.name,
      displayName: m.displayName,
      methods: m.supportedGenerationMethods,
    }));
    return NextResponse.json({ count: models.length, models });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'models list failed' }, { status: 502 });
  }
}
