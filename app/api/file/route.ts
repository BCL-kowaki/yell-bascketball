import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

// Office Online ViewerがアクセスできるS3ファイルのプロキシAPI
//
// 【設計】
// トークンはサーバーメモリではなくJWT署名で管理する。
// JWT内にS3署名付きURLを埋め込むことで、Lambdaのインスタンス間共有や
// コールドスタートによるメモリ消失の問題を回避する。
//
//   1. POST /api/file: S3署名付きURLをJWTトークンに変換（有効期限付き）
//   2. GET  /api/file?token=xxx: JWTを検証してS3からファイルをプロキシ

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secure-jwt-secret-key-goes-here'
)

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

// Step1: S3署名付きURLをJWTトークンに変換
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

    // S3署名付きURLをJWTに埋め込む（30分有効）
    // JWTはサーバーのどのインスタンスでも検証できるため、Lambda複数インスタンス問題を回避
    const token = await new jose.SignJWT({ s3url: url })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(JWT_SECRET)

    return NextResponse.json({ token })
  } catch (error) {
    console.error('[/api/file POST] エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// Step2: JWTトークンを検証してS3からファイルをプロキシ
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'token パラメータが必要です' }, { status: 400 })
  }

  let s3Url: string
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    s3Url = payload.s3url as string
    if (!s3Url || !isAllowedS3Url(s3Url)) {
      return NextResponse.json({ error: 'トークンが不正です' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('[/api/file GET] JWT検証エラー:', error?.message)
    return NextResponse.json({ error: 'トークンが無効または期限切れです' }, { status: 401 })
  }

  try {
    const s3Response = await fetch(s3Url)

    if (!s3Response.ok) {
      console.error('[/api/file GET] S3エラー:', s3Response.status)
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
      'Cache-Control': 'private, max-age=1800',
    }
    if (contentLength) headers['Content-Length'] = contentLength

    return new NextResponse(s3Response.body, { status: 200, headers })
  } catch (error) {
    console.error('[/api/file GET] プロキシエラー:', error)
    return NextResponse.json({ error: 'ファイルの取得中にエラーが発生しました' }, { status: 500 })
  }
}
