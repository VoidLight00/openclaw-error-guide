export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { password } = req.body || {}
  
  if (password === '001023') {
    res.setHeader('Set-Cookie', 'site_auth=ok_001023; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000')
    return res.status(200).json({ ok: true })
  }
  
  return res.status(401).json({ error: 'wrong' })
}
