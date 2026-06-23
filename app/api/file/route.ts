import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

// Office Online ViewerがアクセスできるS3ファイルのプロキシAPI
// MicrosoftのサーバーはS3の長い署名付きURLにアクセスできないため、
// このAPIがS3から直接取得してストリームで返す
// クライアントからはS3キー（短い文字列）のみ受け取る

const BUCKET = 'yellc34dfecaeb3545229f8a541d9a04a2aec8ef5-main'
const REGION = 'ap-northeast-1'

const s3Client = new S3Client({ region: REGION })

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'key パラメータが必要です' }, { status: 400 })
  }

  // パストラバーサル防止
  if (key.includes('..') || key.startsWith('/')) {
    return NextResponse.json({ error: '不正なキーです' }, { status: 400 })
  }

  // Amplify Storageは public/ プレフィックス付きでS3に保存する
  const s3Key = key.startsWith('public/') ? key : `public/${key}`

  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: s3Key })
    const s3Response = await s3Client.send(command)

    if (!s3Response.Body) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 404 })
    }

    const contentType = s3Response.ContentType || 'application/octet-stream'
    const contentLength = s3Response.ContentLength

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'private, max-age=3600',
    }
    if (contentLength) headers['Content-Length'] = String(contentLength)

    // S3のBodyをWeb ReadableStreamに変換してストリームで返す
    const stream = s3Response.Body.transformToWebStream()
    return new NextResponse(stream, { status: 200, headers })
  } catch (error: any) {
    console.error('[/api/file] S3取得エラー:', { key: s3Key, error: error?.message })
    if (error?.name === 'NoSuchKey') {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 404 })
    }
    return NextResponse.json({ error: 'ファイルの取得中にエラーが発生しました' }, { status: 500 })
  }
}
