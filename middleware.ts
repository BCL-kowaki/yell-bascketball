import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

// UUID形式のチェック（例: 31a08672-9241-4999-b0f4-03c3a3b00c02）
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // /tournaments/[UUID] のパターンをチェック（[region]と[id]の競合を解決）
  const tournamentMatch = pathname.match(/^\/tournaments\/([^\/]+)$/)
  if (tournamentMatch) {
    const slug = tournamentMatch[1]
    // UUIDの場合は[id]ページを優先的に使用するため、
    // Next.jsにヒントを与えるためのヘッダーを追加
    if (UUID_REGEX.test(slug)) {
      const response = NextResponse.next()
      response.headers.set('x-tournament-id', slug)
      // このリクエストは大会詳細ページであることを示す
      return response
    }
  }

  const token = request.cookies.get('accessToken')?.value

  // ログインページ、登録ページ、パスワードリセットページ、APIルートはチェックから除外
  if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register') ||
      request.nextUrl.pathname.startsWith('/forgot-password') ||
      request.nextUrl.pathname.startsWith('/confirm-signup') ||
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
     * - images (public images directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
}

