import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ message: 'ログアウトしました' }, { status: 200 })
    
    // Cookieを削除
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      expires: new Date(0), // Cookieの有効期限を過去に設定して削除
      path: '/',
    })

    return response
  } catch (error) {
    console.error('ログアウトエラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

