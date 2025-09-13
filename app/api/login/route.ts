import { NextRequest, NextResponse } from 'next/server'

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

    // 成功レスポンス
    return NextResponse.json(
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

  } catch (error) {
    console.error('ログインエラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 