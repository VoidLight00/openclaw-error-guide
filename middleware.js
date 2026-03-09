export default function middleware(request) {
  const url = new URL(request.url)
  
  // Allow login page and auth API
  if (url.pathname === '/login.html' || url.pathname === '/api/auth') {
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

export const config = {
  matcher: ['/((?!_vercel|favicon.ico|.*\\.css|.*\\.js|.*\\.png|.*\\.svg|.*\\.ico).*)'],
}
