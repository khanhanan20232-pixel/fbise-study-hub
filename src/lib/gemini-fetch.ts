// Shared Gemini caller with a model fallback chain.
// Probe results for this API key (2026-11-02): the full-size Flash models
// (3.8 / latest / 3.7) frequently return 503 "high demand" or stall, while
// the Flash-Lite models answer in under a second. Callers therefore pass an
// ordered model list; we try each model once (45s timeout per attempt) and
// return the first successful response. If every model fails, the last
// response is returned (or the last error thrown) so callers keep their
// normal error logging and fallback behaviour.
export const GEMINI_MODELS_SPEED = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
];

export const GEMINI_MODELS_QUALITY = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
];

export async function fetchGeminiChain(
  apiKey: string,
  body: unknown,
  models: string[]
): Promise<Response> {
  let lastResponse: Response | null = null;
  let lastError: unknown = null;
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(45000),
        }
      );
      if (res.ok) {
        console.log(`[gemini-chain] ${model} answered`);
        return res;
      }
      console.error(`[gemini-chain] ${model} HTTP ${res.status} — trying next model`);
      lastResponse = res;
      lastError = null;
    } catch (err) {
      console.error(`[gemini-chain] ${model} failed/timed out — trying next model:`, err);
      lastError = err;
      lastResponse = null;
    }
  }
  if (lastResponse) return lastResponse;
  throw lastError instanceof Error ? lastError : new Error('All Gemini models failed');
}
