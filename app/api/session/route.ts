import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

// 注意: 開発用の簡易セッション発行エンドポイント。
// クライアント側で Cognito サインイン成功後に呼び出し、
// アプリ用の HTTP-only JWT クッキーを発行します。

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userId } = body

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secure-jwt-secret-key-goes-here'
    )
    const alg = 'HS256'

    const jwt = await new jose.SignJWT({ sub: userId || email, email })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer('urn:example:issuer')
      .setAudience('urn:example:audience')
      .setExpirationTime('2h')
      .sign(secret)

    const response = NextResponse.json({ message: 'session issued' }, { status: 200 })
    response.cookies.set('accessToken', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2,
      path: '/',
    })
    return response
  } catch (error) {
    console.error('session error', error)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}


