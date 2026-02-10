import { createHmac } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'webhook secret not configured' });

  // Verify signature
  const signature = req.headers['x-creem-signature'] || req.headers['x-webhook-signature'] || '';
  const body = JSON.stringify(req.body);
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  
  if (signature && signature !== expected) {
    return res.status(401).json({ error: 'invalid signature' });
  }

  const event = req.body;
  console.log('Creem webhook:', event.type || event.event, JSON.stringify(event).slice(0, 200));

  // Handle subscription events
  const type = event.type || event.event || '';
  if (type.includes('subscription') && (type.includes('created') || type.includes('active') || type.includes('paid'))) {
    // Subscription activated — in a real setup you'd store this in a DB
    // For now, the success_url redirect with ?pro=activated handles it client-side
    return res.status(200).json({ received: true, action: 'pro_activated' });
  }

  return res.status(200).json({ received: true });
}
