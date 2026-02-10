// AI Chatbot API — supports OpenAI, Anthropic, Google Gemini, Groq
// POST /api/chat { message, provider, apiKey }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { message, provider = 'groq', apiKey } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  if (!apiKey) return res.status(400).json({ error: 'apiKey required' });

  // Load error context from llms-full.txt (built at deploy time)
  const fs = await import('fs');
  const path = await import('path');
  let errorContext = '';
  try {
    errorContext = fs.readFileSync(path.join(process.cwd(), 'public', 'llms-full.txt'), 'utf-8');
    // Trim to ~8000 chars to fit context window
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
    let answer;
    switch (provider) {
      case 'openai':
        answer = await callOpenAI(apiKey, systemPrompt, message);
        break;
      case 'anthropic':
        answer = await callAnthropic(apiKey, systemPrompt, message);
        break;
      case 'gemini':
        answer = await callGemini(apiKey, systemPrompt, message);
        break;
      case 'groq':
      default:
        answer = await callGroq(apiKey, systemPrompt, message);
        break;
    }
    res.status(200).json({ answer, provider });
  } catch (e) {
    res.status(500).json({ error: e.message || 'API call failed' });
  }
}

async function callOpenAI(apiKey, system, user) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: 1000, temperature: 0.3
    })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices[0].message.content;
}

async function callAnthropic(apiKey, system, user) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      system: system,
      messages: [{ role: 'user', content: user }],
      max_tokens: 1000
    })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.content[0].text;
}

async function callGemini(apiKey, system, user) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: 1000, temperature: 0.3 }
    })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.candidates[0].content.parts[0].text;
}

async function callGroq(apiKey, system, user) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: 1000, temperature: 0.3
    })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices[0].message.content;
}
