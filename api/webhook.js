import crypto from 'crypto';

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/openclaw-guide-9f79f/databases/(default)/documents';
const API_KEY = 'AIzaSyC8DyUdfL4C27yvydg7rfPOavEibVt3UDc';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // Verify webhook secret
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (secret) {
    const signature = req.headers['x-creem-signature'] || req.headers['x-webhook-signature'] || '';
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (signature !== expected) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  const body = req.body;
  const event = body.event || body.type;

  // Handle subscription/payment events
  if (!['subscription.created', 'subscription.active', 'payment.completed', 'checkout.completed'].includes(event)) {
    return res.status(200).json({ ok: true, skipped: event });
  }

  // Extract email
  const email = body.data?.customer?.email
    || body.data?.customer_email
    || body.data?.object?.customer?.email
    || body.customer_email;

  if (!email) {
    return res.status(400).json({ error: 'No customer email found' });
  }

  try {
    // Query Firestore for user with this email
    const queryUrl = `${FIRESTORE_BASE}:runQuery?key=${API_KEY}`;
    const queryRes = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'users' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'email' },
              op: 'EQUAL',
              value: { stringValue: email }
            }
          },
          limit: 1
        }
      })
    });

    const queryData = await queryRes.json();
    let docPath = null;

    if (queryData[0]?.document?.name) {
      docPath = queryData[0].document.name;
    }

    // Update or create user doc
    const now = new Date().toISOString();
    const fields = {
      pro: { booleanValue: true },
      email: { stringValue: email },
      proActivatedAt: { stringValue: now },
      proSource: { stringValue: 'creem' }
    };

    if (docPath) {
      // PATCH existing doc
      const patchUrl = `https://firestore.googleapis.com/v1/${docPath}?key=${API_KEY}&updateMask.fieldPaths=pro&updateMask.fieldPaths=proActivatedAt&updateMask.fieldPaths=proSource`;
      await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });
    } else {
      // Create doc with email as ID (sanitized)
      const docId = email.replace(/[^a-zA-Z0-9@._-]/g, '_');
      const createUrl = `${FIRESTORE_BASE}/users?documentId=${encodeURIComponent(docId)}&key=${API_KEY}`;
      await fetch(createUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });
    }

    return res.status(200).json({ ok: true, email, event });
  } catch (e) {
    console.error('Webhook error:', e);
    return res.status(500).json({ error: e.message });
  }
}
