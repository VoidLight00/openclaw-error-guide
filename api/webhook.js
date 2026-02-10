import { createHmac } from 'crypto';
import admin from 'firebase-admin';

// Initialize Firebase Admin (singleton)
function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set — Firestore writes disabled');
    return null;
  }
  try {
    const cred = JSON.parse(serviceAccount);
    admin.initializeApp({ credential: admin.credential.cert(cred) });
    return admin;
  } catch (e) {
    console.error('Firebase Admin init error:', e.message);
    return null;
  }
}

async function setProByEmail(email) {
  const fb = getFirebaseAdmin();
  if (!fb) return false;
  try {
    // Find user by email in Firebase Auth
    const userRecord = await fb.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    // Set pro: true in Firestore
    await fb.firestore().collection('users').doc(uid).set({
      pro: true,
      email: email,
      upgradedAt: fb.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('Pro activated for:', email, 'uid:', uid);
    return true;
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      // User hasn't signed up via Google yet — store by email for later matching
      console.log('User not found in Auth, storing pending pro for:', email);
      await fb.firestore().collection('pending_pro').doc(email.toLowerCase()).set({
        email: email,
        pro: true,
        createdAt: fb.firestore.FieldValue.serverTimestamp()
      });
      return true;
    }
    console.error('setProByEmail error:', e.message);
    return false;
  }
}

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
    // Extract customer email from webhook payload
    const email = event.customer?.email || event.data?.customer?.email || event.email || '';
    if (email) {
      await setProByEmail(email);
    }
    return res.status(200).json({ received: true, action: 'pro_activated' });
  }

  return res.status(200).json({ received: true });
}
