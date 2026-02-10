import { readFileSync } from 'fs';
import { join } from 'path';

// ── In-memory cache (persists across warm invocations) ──
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const CACHE_MAX = 500;

function normalizeQuery(q) {
  return q.toLowerCase().trim().replace(/\s+/g, ' ');
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.value;
}

function setCache(key, value) {
  if (cache.size >= CACHE_MAX) {
    // Evict oldest
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(key, { value, ts: Date.now() });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { message, provider: reqProvider, apiKey: reqKey, history: reqHistory } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });
  
  // Use server-side key if available, otherwise require user key
  const serverKey = process.env.GROQ_API_KEY;
  const provider = reqProvider || 'groq';
  const apiKey = reqKey || (provider === 'groq' ? serverKey : null);
  if (!apiKey) return res.status(400).json({ error: 'apiKey required' });

  // Load error index for grounded responses
  let errorIndex = [];
  try {
    errorIndex = JSON.parse(readFileSync(join(process.cwd(), 'public', 'error-index.json'), 'utf-8'));
  } catch (e) {}

  // Find relevant errors by keyword matching
  const query = message.toLowerCase();
  const queryWords = query.split(/\s+/).filter(w => w.length > 0);
  const scored = errorIndex.map(err => {
    const text = (err.title + ' ' + err.error + ' ' + (err.symptoms||[]).join(' ') + ' ' + err.category + ' ' + (err.solutions||[]).join(' ')).toLowerCase();
    let score = queryWords.filter(w => text.includes(w)).length;
    // Boost exact error code/message matches
    if (err.error && query.includes(err.error.toLowerCase())) score += 5;
    if (err.id && query.includes(err.id)) score += 3;
    return { ...err, score };
  }).sort((a, b) => b.score - a.score);
  // Always include at least top 5 for context, up to 10 if matched
  const topErrors = scored.filter(e => e.score > 0).slice(0, 10);
  const fallback = topErrors.length < 3 ? scored.slice(0, 5) : topErrors;

  const errorContext = fallback.map(e =>
    `[${e.category}] ${e.title}\n  URL: https://openclaw-error-guide.vercel.app/${e.url}\n  증상: ${(e.symptoms||[]).join(', ')}\n  해결 요약: ${(e.solutions||[]).map(s => s.split(':')[0]).join(' | ')}`
  ).join('\n\n');

  const systemPrompt = `당신은 OpenClaw 오류 해결 가이드봇입니다.

## 필수 규칙
1. 아래 오류 데이터베이스에서 매칭되는 오류를 찾아 답변하세요.
2. **모든 오류를 언급할 때 반드시 클릭 가능한 링크를 포함하세요.**
   - 형식: [오류 제목](URL) — URL은 아래 데이터에 제공된 것을 그대로 사용
   - 예시: [PowerShell 실행 정책 차단](https://openclaw-error-guide.vercel.app/pages/windows.html#error-win-1)
3. 해결 방법의 핵심 단계를 간결하게 안내하고, "자세한 해결법은 위 링크를 참고하세요"로 마무리하세요.
4. 매칭되는 오류가 여러 개면 각각 링크와 함께 나열하세요.
5. 한국어로 답변. 간결하게.
6. 데이터베이스에 없는 내용은 "해당 오류는 가이드에 아직 등록되지 않았습니다"라고 답변.
7. 이전 대화가 있으면 참고하여 답변하세요. "더 자세히", "다른 방법은?" 등의 후속 질문에 맥락에 맞게 응답하세요.

**절대 링크 없이 오류를 언급하지 마세요. 반드시 [제목](URL) 형식으로.**

=== 매칭된 오류 (${fallback.length}건) ===
${errorContext || '매칭된 오류 없음'}`;

  // ── Cache check (only for single-turn, no history) ──
  const history = Array.isArray(reqHistory) ? reqHistory.slice(-5) : [];
  const cacheKey = normalizeQuery(message);
  if (history.length === 0) {
    const cached = getCached(cacheKey);
    if (cached) return res.status(200).json({ answer: cached, provider, cached: true });
  }

  try {
    const handlers = { openai: callOpenAI, anthropic: callAnthropic, gemini: callGemini, groq: callGroq, grok: callGrok, openrouter: callOpenRouter, kimi: callKimi };
    const fn = handlers[provider] || handlers.groq;
    const answer = await fn(apiKey, systemPrompt, message, history);
    // Cache single-turn answers
    if (history.length === 0) setCache(cacheKey, answer);
    return res.status(200).json({ answer, provider });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'API call failed' });
  }
}

function buildMessages(system, user, history) {
  const msgs = [{ role: 'system', content: system }];
  if (history && history.length) {
    for (const h of history) {
      if (h.role === 'user' || h.role === 'assistant') {
        msgs.push({ role: h.role, content: h.content });
      }
    }
  }
  msgs.push({ role: 'user', content: user });
  return msgs;
}

async function callOpenAI(apiKey, system, user, history) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: buildMessages(system, user, history), max_tokens: 1000, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices[0].message.content;
}

async function callAnthropic(apiKey, system, user, history) {
  const msgs = [];
  if (history && history.length) {
    for (const h of history) msgs.push({ role: h.role, content: h.content });
  }
  msgs.push({ role: 'user', content: user });
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-3-5-haiku-20241022', system, messages: msgs, max_tokens: 1000 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.content[0].text;
}

async function callGemini(apiKey, system, user, history) {
  const contents = [];
  if (history && history.length) {
    for (const h of history) contents.push({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] });
  }
  contents.push({ role: 'user', parts: [{ text: user }] });
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: 1000, temperature: 0.3 } })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.candidates[0].content.parts[0].text;
}

async function callGroq(apiKey, system, user, history) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: buildMessages(system, user, history), max_tokens: 1000, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices[0].message.content;
}

async function callGrok(apiKey, system, user, history) {
  const r = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'grok-3-mini-fast', messages: buildMessages(system, user, history), max_tokens: 1000, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices[0].message.content;
}

async function callOpenRouter(apiKey, system, user, history) {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'meta-llama/llama-3.3-70b-instruct:free', messages: buildMessages(system, user, history), max_tokens: 1000, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
  return d.choices[0].message.content;
}

async function callKimi(apiKey, system, user, history) {
  const r = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'moonshot-v1-8k', messages: buildMessages(system, user, history), max_tokens: 1000, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices[0].message.content;
}
