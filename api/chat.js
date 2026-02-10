import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { message, provider = 'groq', apiKey } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });
  if (!apiKey) return res.status(400).json({ error: 'apiKey required' });

  let errorContext = '';
  try {
    errorContext = readFileSync(join(process.cwd(), 'public', 'llms-full.txt'), 'utf-8');
    if (errorContext.length > 8000) errorContext = errorContext.slice(0, 8000);
  } catch (e) {
    errorContext = 'Error database not available.';
  }

  const systemPrompt = `당신은 OpenClaw 오류 해결 전문 AI 어시스턴트입니다.
아래는 OpenClaw 오류 데이터베이스입니다. 사용자의 질문에 맞는 오류와 해결 방법을 찾아 친절하게 안내하세요.
증상만 설명해도 유사한 오류를 추론하여 답변하세요.
한국어로 답변하세요. 답변은 간결하게.

=== 오류 데이터베이스 ===
${errorContext}`;

  try {
    const handlers = { openai: callOpenAI, anthropic: callAnthropic, gemini: callGemini, groq: callGroq, grok: callGrok, openrouter: callOpenRouter, kimi: callKimi };
    const fn = handlers[provider] || handlers.groq;
    const answer = await fn(apiKey, systemPrompt, message);
    return res.status(200).json({ answer, provider });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'API call failed' });
  }
}

async function callOpenAI(apiKey, system, user) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 1000, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices[0].message.content;
}

async function callAnthropic(apiKey, system, user) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-3-5-haiku-20241022', system, messages: [{ role: 'user', content: user }], max_tokens: 1000 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.content[0].text;
}

async function callGemini(apiKey, system, user) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents: [{ parts: [{ text: user }] }], generationConfig: { maxOutputTokens: 1000, temperature: 0.3 } })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.candidates[0].content.parts[0].text;
}

async function callGroq(apiKey, system, user) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 1000, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices[0].message.content;
}

async function callGrok(apiKey, system, user) {
  const r = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'grok-3-mini-fast', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 1000, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices[0].message.content;
}

async function callOpenRouter(apiKey, system, user) {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'meta-llama/llama-3.3-70b-instruct:free', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 1000, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
  return d.choices[0].message.content;
}

async function callKimi(apiKey, system, user) {
  const r = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'moonshot-v1-8k', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 1000, temperature: 0.3 })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices[0].message.content;
}
