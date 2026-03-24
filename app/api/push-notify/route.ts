import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// VAPID設定
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:yell-basketball@example.com'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

/**
 * プッシュ通知送信APIルート
 * POST /api/push-notify
 * body: {
 *   subscriptions: [{ endpoint, p256dh, auth }],
 *   title: string,
 *   body: string,
 *   url?: string,
 *   tag?: string,
 *   icon?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { subscriptions, title, body, url, tag, icon } = await request.json()

    if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0) {
      return NextResponse.json({ error: '購読情報が必要です' }, { status: 400 })
    }

    if (!title || !body) {
      return NextResponse.json({ error: 'タイトルと本文が必要です' }, { status: 400 })
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/timeline',
      tag: tag || 'yell-notification',
      icon: icon || '/icons/icon-192x192.png'
    })

    // 各購読者に通知を送信
    const results = await Promise.allSettled(
      subscriptions.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          payload
        )
      )
    )

    // 成功・失敗数を集計
    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    // 410 Gone（購読切れ）のエンドポイントを特定
    const expiredEndpoints: string[] = []
    results.forEach((r, i) => {
      if (r.status === 'rejected' && (r.reason as any)?.statusCode === 410) {
        expiredEndpoints.push(subscriptions[i].endpoint)
      }
    })

    return NextResponse.json({
      succeeded,
      failed,
      expiredEndpoints
    })
  } catch (error: any) {
    console.error('プッシュ通知送信エラー:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
