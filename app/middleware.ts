import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ACCESS_COOKIE, ROLE_COOKIE, config as appConfig } from '../lib/api/config'

// Fully open paths that do not require authentication states
const PUBLIC_ROUTES = ['/', '/verify', '/hospitals', '/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (appConfig.bypassAuth) {
    return NextResponse.next()
  }
  // 1. Snag credentials directly via the typed cookies config keys
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  const userRole = request.cookies.get(ROLE_COOKIE)?.value

  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // 2. Unauthenticated Guard
  if (!accessToken && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Authenticated Trap: Bounce logged-in users away from the login screen
  if (accessToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 4. Role-Based Access Routing Protection
  if (accessToken && userRole) {
    // Pharmacy admins locked out of institutional spaces
    if (pathname.startsWith('/institutional') && userRole === 'pharmacy_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Institutional managers locked out of standard pharmacy administration layout views
    if (pathname.startsWith('/dashboard') && (userRole === 'institutional' || userRole === 'superadmin')) {
      return NextResponse.redirect(new URL('/institutional', request.url))
    }
    // Standard clients (patients) locked out of all backend operations workspaces
    if ((pathname.startsWith('/dashboard') || pathname.startsWith('/institutional')) && userRole === 'patient') {
      return NextResponse.redirect(new URL('/account', request.url))
    }
  }

  return NextResponse.next()
}

// Intercept routing layers, skipping Next.js static engine dependencies
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|favicon.ico|api/|.*\\.).*)',
  ],
}