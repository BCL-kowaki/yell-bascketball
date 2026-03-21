import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

// JWT secret: middleware.ts と同じ値を使用
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'your-secure-jwt-secret-key-goes-here'
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING)

// セッション確認用のGETハンドラー
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
        issuer: 'urn:example:issuer',
        audience: 'urn:example:audience',
      })

      return NextResponse.json({
        email: payload.email,
        userId: payload.sub
      }, { status: 200 })
    } catch (error: any) {
      console.error('[/api/session GET] JWT検証失敗:', error?.message)
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
  } catch (error) {
    console.error('[/api/session GET] サーバーエラー:', error)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userId, rememberMe } = body

    if (!email) {
      console.error('[/api/session POST] emailが未指定')
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    const alg = 'HS256'
    // ログイン維持: 30日、通常: 2時間
    const expiration = rememberMe ? '30d' : '2h'
    const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 2

    const jwt = await new jose.SignJWT({ sub: userId || email, email })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer('urn:example:issuer')
      .setAudience('urn:example:audience')
      .setExpirationTime(expiration)
      .sign(JWT_SECRET)

    console.log('[/api/session POST] セッション発行成功:', email, rememberMe ? '(30日間維持)' : '(2時間)')

    const response = NextResponse.json({ message: 'session issued' }, { status: 200 })
    response.cookies.set('accessToken', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
    })
    return response
  } catch (error) {
    console.error('[/api/session POST] サーバーエラー:', error)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
