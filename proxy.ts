import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/app/lib/session'

const protectedRoutes = ['/dashboard', '/admin']
const authRoutes = ['/login', '/signup']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route))

  const cookie = req.cookies.get('session')?.value
  const session = cookie ? await decrypt(cookie) : null

  if (isProtectedRoute && !session?.userId) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  if (session?.userId) {
    if (isAuthRoute) {
      const dest = session.role === 'admin' ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    if (path.startsWith('/dashboard') && session.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    if (path.startsWith('/admin') && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}