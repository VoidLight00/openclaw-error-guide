const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/openclaw-guide-9f79f/databases/(default)/documents';
const API_KEY = 'AIzaSyC8DyUdfL4C27yvydg7rfPOavEibVt3UDc';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { question, answer, helpful } = req.body || {};
  if (!question || typeof helpful !== 'boolean') {
    return res.status(400).json({ error: 'question and helpful required' });
  }

  try {
    const now = new Date().toISOString();
    const createUrl = `${FIRESTORE_BASE}/feedback?key=${API_KEY}`;
    await fetch(createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          question: { stringValue: question.slice(0, 500) },
          answer: { stringValue: (answer || '').slice(0, 2000) },
          helpful: { booleanValue: helpful },
          timestamp: { stringValue: now }
        }
      })
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
