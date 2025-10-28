import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value

  // ログインページとAPIルートはチェックから除外
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/register') || 
      request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secure-jwt-secret-key-goes-here'
    )
    await jose.jwtVerify(token, secret, {
      issuer: 'urn:example:issuer',
      audience: 'urn:example:audience',
    })

    return NextResponse.next()
  } catch (error) {
    console.error('JWT verification failed:', error)
    // トークンが無効な場合は、Cookieを削除してログインページへリダイレクト
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('accessToken')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

