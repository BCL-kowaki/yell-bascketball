import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

// Office Online ViewerがアクセスできるS3ファイルのプロキシAPI
//
// 【根本的な問題】
// Cognito Identity Poolの一時的認証情報は最大1時間で失効する。
// そのため署名付きURLの expiresIn を1年に設定しても、
// 認証情報が失効した時点でURLも無効になる。
//
// 【解決策】
// JWTにS3キーを保存し、サーバー側でAWS SDKのGetObjectCommandを使って直接取得する。
// LambdaのIAMロールがS3にアクセスできる場合はこれで解決する。
// 失敗時は署名付きURL（最大1時間有効）でフォールバック。

const BUCKET = 'yellc34dfecaeb3545229f8a541d9a04a2aec8ef5-main'
const REGION = 'ap-northeast-1'

const s3Client = new S3Client({ region: REGION })

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secure-jwt-secret-key-goes-here'
)

const ALLOWED_S3_HOSTS = ['.amazonaws.com']

function isAllowedS3Url(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && ALLOWED_S3_HOSTS.some(h => parsed.hostname.endsWith(h))
  } catch {
    return false
  }
}

// Step1: S3キーと署名付きURLをJWTトークンに変換
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, key } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url が必要です' }, { status: 400 })
    }
    if (!isAllowedS3Url(url)) {
      return NextResponse.json({ error: '許可されていないURLです' }, { status: 403 })
    }

    // JWTにS3キーと署名付きURLを両方保存
    // - key: サーバー側GetObjectCommandで使用（IAMロールがある場合）
    // - url: フォールバック用（署名付きURL、最大1時間有効）
    const token = await new jose.SignJWT({ s3key: key || null, s3url: url })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(JWT_SECRET)

    return NextResponse.json({ token })
  } catch (error) {
    console.error('[/api/file POST] エラー:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// Step2: JWTを検証してS3からファイルをプロキシ
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'token パラメータが必要です' }, { status: 400 })
  }

  let s3Key: string | null
  let s3Url: string
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    s3Key = (payload.s3key as string) || null
    s3Url = payload.s3url as string
    if (!s3Url) return NextResponse.json({ error: 'トークンが不正です' }, { status: 400 })
  } catch (error: any) {
    console.error('[/api/file GET] JWT検証エラー:', error?.message)
    return NextResponse.json({ error: 'トークンが無効または期限切れです' }, { status: 401 })
  }

  // 方法1: S3キーがある場合はGetObjectCommandで直接取得（IAMロール使用・有効期限なし）
  if (s3Key) {
    try {
      // Amplify Storageはpublic/プレフィックス付きでS3に保存する
      const objectKey = s3Key.startsWith('public/') ? s3Key : `public/${s3Key}`
      const command = new GetObjectCommand({ Bucket: BUCKET, Key: objectKey })
      const s3Response = await s3Client.send(command)

      if (s3Response.Body) {
        const headers: Record<string, string> = {
          'Content-Type': s3Response.ContentType || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'private, max-age=3600',
        }
        if (s3Response.ContentLength) {
          headers['Content-Length'] = String(s3Response.ContentLength)
        }
        return new NextResponse(s3Response.Body.transformToWebStream(), { status: 200, headers })
      }
    } catch (sdkError: any) {
      // IAM権限がない場合は署名付きURLでフォールバック
      console.warn('[/api/file GET] GetObject失敗、署名付きURLでフォールバック:', sdkError?.message)
    }
  }

  // 方法2: 署名付きURLでフォールバック（Cognito一時認証、最大1時間有効）
  try {
    const s3Response = await fetch(s3Url)
    if (!s3Response.ok) {
      console.error('[/api/file GET] 署名付きURLフォールバックも失敗:', s3Response.status)
      return NextResponse.json(
        { error: `S3へのアクセスに失敗しました (${s3Response.status})` },
        { status: s3Response.status }
      )
    }
    const headers: Record<string, string> = {
      'Content-Type': s3Response.headers.get('content-type') || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'private, max-age=3600',
    }
    const cl = s3Response.headers.get('content-length')
    if (cl) headers['Content-Length'] = cl
    return new NextResponse(s3Response.body, { status: 200, headers })
  } catch (error) {
    console.error('[/api/file GET] プロキシエラー:', error)
    return NextResponse.json({ error: 'ファイルの取得中にエラーが発生しました' }, { status: 500 })
  }
}
