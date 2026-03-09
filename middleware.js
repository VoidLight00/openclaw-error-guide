export default function middleware(request) {
  const url = new URL(request.url)
  const path = url.pathname
  
  // Allow static assets, login page, and auth API
  if (
    path === '/login.html' ||
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/_vercel/') ||
    path.endsWith('.css') ||
    path.endsWith('.js') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.svg') ||
    path.endsWith('.ico') ||
    path.endsWith('.woff') ||
    path.endsWith('.woff2') ||
    path.endsWith('.ttf') ||
    path.endsWith('.gif') ||
    path.endsWith('.webp') ||
    path.endsWith('.json') ||
    path.endsWith('.map')
  ) {
    return;
  }
  
  // Check auth cookie
  const cookie = request.headers.get('cookie') || ''
  if (cookie.includes('site_auth=ok_001023')) {
    return;
  }
  
  // Redirect to login
  return Response.redirect(new URL('/login.html', request.url), 302)
}
