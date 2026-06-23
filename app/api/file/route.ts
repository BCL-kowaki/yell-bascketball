import { NextRequest, NextResponse } from 'next/server'

// Office Online ViewerがアクセスできるS3ファイルのプロキシAPI
//
// 【設計】
// クライアント（ブラウザ）はCognito Identity Poolでs3に対して署名付きURLを生成できるが、
// MicrosoftのサーバーはそのURLに直接アクセスできない（URLが長すぎる問題）。
// そのため以下の2ステップで解決する:
//   1. POST /api/file: クライアントがS3署名付きURLを登録 → 短いトークンを取得
//   2. GET  /api/file?token=xxx: Office ViewerがトークンURLを要求 → プロキシがS3から取得して返す

type TokenEntry = { url: string; expiresAt: number }
const tokenStore = new Map<string, TokenEntry>()

// 期限切れトークンを定期的に削除
function cleanExpiredTokens() {
  const now = Date.now()
  for (const [key, entry] of tokenStore.entries()) {
    if (entry.expiresAt < now) tokenStore.delete(key)
  }
}

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const ALLOWED_S3_HOSTS = ['.amazonaws.com']

function isAllowedS3Url(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      ALLOWED_S3_HOSTS.some((host) => parsed.hostname.endsWith(host))
    )
  } catch {
    return false
  }
}

// Step1: S3署名付きURLをトークンに変換
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url が必要です' }, { status: 400 })
    }

    if (!isAllowedS3Url(url)) {
      return NextResponse.json({ error: '許可されていないURLです' }, { status: 403 })
    }

    cleanExpiredTokens()

    const token = generateToken()
    // 10分間有効（Office Viewerがファイルを取得するのに十分な時間）
    tokenStore.set(token, { url, expiresAt: Date.now() + 10 * 60 * 1000 })

    return NextResponse.json({ token })
  } catch (error) {
    console.error('[/api/file POST] エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// Step2: トークンを使ってS3からファイルをプロキシ
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'token パラメータが必要です' }, { status: 400 })
  }

  const entry = tokenStore.get(token)
  if (!entry) {
    return NextResponse.json({ error: 'トークンが無効または期限切れです' }, { status: 404 })
  }
  if (entry.expiresAt < Date.now()) {
    tokenStore.delete(token)
    return NextResponse.json({ error: 'トークンが期限切れです' }, { status: 410 })
  }

  try {
    const s3Response = await fetch(entry.url)

    if (!s3Response.ok) {
      console.error('[/api/file GET] S3エラー:', s3Response.status, s3Response.statusText)
      return NextResponse.json(
        { error: `S3からのファイル取得に失敗しました (${s3Response.status})` },
        { status: s3Response.status }
      )
    }

    const contentType = s3Response.headers.get('content-type') || 'application/octet-stream'
    const contentLength = s3Response.headers.get('content-length')

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'private, max-age=600',
    }
    if (contentLength) headers['Content-Length'] = contentLength

    return new NextResponse(s3Response.body, { status: 200, headers })
  } catch (error) {
    console.error('[/api/file GET] プロキシエラー:', error)
    return NextResponse.json({ error: 'ファイルの取得中にエラーが発生しました' }, { status: 500 })
  }
}
