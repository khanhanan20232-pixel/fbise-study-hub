// Shared Gemini fetch with retry on temporary unavailability.
// Google returns HTTP 503 ("model is currently experiencing high demand")
// or 429 during demand spikes; these are temporary, so retry with backoff
// before the caller falls back.
export async function fetchGeminiWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastResponse: Response | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    // 90s per-attempt timeout: a stuck Gemini call must fail over to the
    // caller's fallback instead of hanging the request forever.
    lastResponse = await fetch(url, { ...init, signal: AbortSignal.timeout(90000) });
    if (lastResponse.ok || (lastResponse.status !== 503 && lastResponse.status !== 429)) {
      return lastResponse;
    }
    console.error(
      `[gemini-retry] Gemini HTTP ${lastResponse.status} (attempt ${attempt}/3) — temporary unavailability`
    );
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 2500));
    }
  }
  return lastResponse as Response;
}
