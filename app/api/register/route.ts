import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, confirmPassword } = body

    // 基本的なバリデーション
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'すべてのフィールドが必要です' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'パスワードが一致しません' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上である必要があります' },
        { status: 400 }
      )
    }

    // モック実装: 実際のデータベース保存は行わない
    console.log('ユーザー登録:', { firstName, lastName, email })

    // 成功レスポンス
    return NextResponse.json(
      { 
        message: 'アカウントが正常に作成されました',
        user: {
          id: Date.now().toString(),
          firstName,
          lastName,
          email
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('登録エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 