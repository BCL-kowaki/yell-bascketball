import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

// UUID形式のチェック（例: 31a08672-9241-4999-b0f4-03c3a3b00c02）
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// 認証不要の公開ルート
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/confirm-signup',
  '/api',
  '/tournaments',
  '/teams',
  '/search',
  '/welcome',
  '/terms',
  '/privacy',
]

// パスが公開ルートかどうかを判定
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // /tournaments/[UUID] のパターンをチェック（[region]と[id]の競合を解決）
  const tournamentMatch = pathname.match(/^\/tournaments\/([^\/]+)$/)
  if (tournamentMatch) {
    const slug = tournamentMatch[1]
    if (UUID_REGEX.test(slug)) {
      const response = NextResponse.next()
      response.headers.set('x-tournament-id', slug)
      return response
    }
  }

  // 公開ルートは認証チェックをスキップ
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('accessToken')?.value

  // ランディングページ（/）は常にアクセス可能
  if (pathname === '/') {
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
    // トークンが無効な場合は、Cookieを削除して大会一覧へリダイレクト
    const response = NextResponse.redirect(new URL('/tournaments', request.url))
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
     * - images (public images directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|videos).*)',
  ],
}

