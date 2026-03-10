import { NextRequest, NextResponse } from 'next/server'

const PASSWORD = process.env.TREE_PASSWORD ?? 'douglas'
const COOKIE = 'ft_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow the login page and its API through
  if (pathname === '/login' || pathname === '/api/login') {
    return NextResponse.next()
  }

  // Check session cookie
  const session = request.cookies.get(COOKIE)?.value
  if (session === PASSWORD) return NextResponse.next()

  // Redirect to login
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('from', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
