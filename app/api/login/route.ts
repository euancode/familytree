import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  const correctPassword = process.env.TREE_PASSWORD ?? 'douglas'
  if (password !== correctPassword) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const from = request.nextUrl.searchParams.get('from') || '/'
  const response = NextResponse.redirect(new URL(from, request.url))
  response.cookies.set('ft_session', correctPassword, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  })
  return response
}
