import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

// UUID形式のチェック
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// JWT secret: 環境変数未設定時はハードコードされたデフォルト値を使用
// ※ /api/session/route.ts と同じ値を使用すること
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'your-secure-jwt-secret-key-goes-here'
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING)

// 認証不要の公開ルート（Set使用で高速判定）
const PUBLIC_EXACT = new Set(['/', '/login', '/register', '/forgot-password', '/confirm-signup', '/search', '/welcome', '/terms', '/privacy', '/setup-profile'])
const PUBLIC_PREFIXES = ['/api', '/tournaments', '/teams', '/admin']

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true
  // プレフィックスマッチ: /api, /api/session, /tournaments, /tournaments/xxx 等すべてマッチ
  return PUBLIC_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 公開ルートは即座にリターン（JWT検証を完全スキップ）
  if (isPublicRoute(pathname)) {
    // /tournaments/[UUID] のパターンチェック
    if (pathname.startsWith('/tournaments/')) {
      const slug = pathname.split('/')[2]
      if (slug && UUID_REGEX.test(slug)) {
        const response = NextResponse.next()
        response.headers.set('x-tournament-id', slug)
        return response
      }
    }
    return NextResponse.next()
  }

  // 認証が必要なルート
  const token = request.cookies.get('accessToken')?.value

  if (!token) {
    console.log(`[middleware] ${pathname}: accessToken cookie なし → /login へリダイレクト`)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', 'auth')
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: 'urn:example:issuer',
      audience: 'urn:example:audience',
    })
    console.log(`[middleware] ${pathname}: JWT検証成功 (email: ${payload.email})`)
    return NextResponse.next()
  } catch (err: any) {
    console.error(`[middleware] ${pathname}: JWT検証失敗:`, err?.message || err)
    // トークン無効 → cookie削除してログインページへ
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', 'auth')
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('accessToken')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|videos|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|mp4|webm)$).*)',
  ],
}
