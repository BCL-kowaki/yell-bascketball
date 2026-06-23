import { NextRequest, NextResponse } from 'next/server'

// Office Online ViewerがアクセスできるS3ファイルのプロキシAPI
// Microsoft/Googleのサーバーは直接S3の署名付きURLにアクセスできないため、
// このAPIがS3から取得してストリームで返す

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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const fileUrl = searchParams.get('url')

  if (!fileUrl) {
    return NextResponse.json({ error: 'url パラメータが必要です' }, { status: 400 })
  }

  // S3のURLのみ許可（オープンプロキシ防止）
  if (!isAllowedS3Url(fileUrl)) {
    return NextResponse.json({ error: '許可されていないURLです' }, { status: 403 })
  }

  try {
    const s3Response = await fetch(fileUrl, {
      headers: {
        // S3へのリクエストにはブラウザヘッダーを送らない
        'User-Agent': 'YeLL-Basketball-FileProxy/1.0',
      },
    })

    if (!s3Response.ok) {
      return NextResponse.json(
        { error: `S3からのファイル取得に失敗しました (${s3Response.status})` },
        { status: s3Response.status }
      )
    }

    const contentType = s3Response.headers.get('content-type') || 'application/octet-stream'
    const contentLength = s3Response.headers.get('content-length')
    const contentDisposition = s3Response.headers.get('content-disposition')

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      // Office Online ViewerがiframeでアクセスできるようCORSを許可
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'private, max-age=3600',
    }

    if (contentLength) headers['Content-Length'] = contentLength
    if (contentDisposition) headers['Content-Disposition'] = contentDisposition

    return new NextResponse(s3Response.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('[/api/file] S3プロキシエラー:', error)
    return NextResponse.json({ error: 'ファイルの取得中にエラーが発生しました' }, { status: 500 })
  }
}
