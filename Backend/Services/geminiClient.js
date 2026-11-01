import GEMINI_CONFIG from '../config/gemini.js';

// Model names change over time; if the configured one is retired/unknown, fall back to the next.
// Prioritize config over env variable to ensure controlled model selection
const MODEL_CHAIN = () =>
  [...new Set([GEMINI_CONFIG.model, process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-2.0-flash'].filter(Boolean))];

/**
 * Calls Gemini's generateContent. `parts` can mix text and { inlineData: { mimeType, data } }
 * (that is how PDFs / report images are sent). Returns the response text.
 */
export async function callGemini(parts, { maxOutputTokens = 4096, temperature = 0.2, json = true, timeoutMs = 60000 } = {}) {
  const { apiKey, baseUrl, safetySettings } = GEMINI_CONFIG;
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not set');
    err.code = 'NO_KEY';
    throw err;
  }

  let lastError;
  for (const model of MODEL_CHAIN()) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${baseUrl}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature, maxOutputTokens, ...(json ? { responseMimeType: 'application/json' } : {}) },
          safetySettings,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        lastError = new Error(data.error?.message || `Gemini ${res.status}`);
        lastError.status = res.status;
        // unknown model / quota on this model -> try the next one; anything else is final
        if ([404, 429, 503].includes(res.status) || /not found|not supported/i.test(lastError.message)) continue;
        throw lastError;
      }
      const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
      if (!text) {
        lastError = new Error(data.promptFeedback?.blockReason ? `Blocked: ${data.promptFeedback.blockReason}` : 'Empty response from Gemini');
        continue;
      }
      return text;
    } catch (err) {
      lastError = err.name === 'AbortError' ? new Error('Gemini request timed out') : err;
      if (err.status && ![404, 429, 503].includes(err.status)) throw lastError;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError || new Error('Gemini request failed');
}

/** Parses JSON that may be wrapped in ``` fences or have trailing commas. */
export function parseJsonLoose(text) {
  let s = String(text).trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) s = fence[1].trim();
  const obj = s.match(/[\[{][\s\S]*[\]}]/);
  if (obj) s = obj[0];
  try {
    return JSON.parse(s);
  } catch {
    return JSON.parse(s.replace(/,\s*([}\]])/g, '$1'));
  }
}
