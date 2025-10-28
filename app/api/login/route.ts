import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

// モックユーザーデータ（実際のアプリケーションではデータベースから取得）
const mockUsers = [
  {
    id: "1",
    firstName: "kowaki",
    lastName: "test",
    email: "kowaki1111@gmail.com",
    password: "password123" // 実際のアプリケーションではハッシュ化されたパスワード
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 基本的なバリデーション
    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードが必要です' },
        { status: 400 }
      )
    }

    // ユーザー認証（モック実装）
    const user = mockUsers.find(u => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      )
    }

    // JWTの生成
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secure-jwt-secret-key-goes-here' // 後で.env.localに移動
    )
    const alg = 'HS256'

    const jwt = await new jose.SignJWT({ 'urn:example:claim': true, sub: user.id, email: user.email })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer('urn:example:issuer')
      .setAudience('urn:example:audience')
      .setExpirationTime('2h')
      .sign(secret)
    
    // CookieにJWTを設定
    const response = NextResponse.json(
      { 
        message: 'ログインに成功しました',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      },
      { status: 200 }
    )

    response.cookies.set('accessToken', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/',
    })

    // 成功レスポンス
    return response

  } catch (error) {
    console.error('ログインエラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 