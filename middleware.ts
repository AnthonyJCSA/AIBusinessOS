import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only guard dashboard routes
  if (!PROTECTED.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow if Supabase not configured (demo mode)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return NextResponse.next()
  }

  // Check Zustand persisted session in cookie (coriva-session)
  const sessionCookie = req.cookies.get('coriva-session')
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value)
      if (session?.state?.isAuthenticated) return NextResponse.next()
    } catch {}
  }

  // Redirect to login
  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
