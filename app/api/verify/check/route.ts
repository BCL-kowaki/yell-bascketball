import { NextRequest, NextResponse } from 'next/server'
import { getTwilioClient, getVerifyServiceSid, normalizeJpPhone, isValidE164 } from '@/lib/twilio'

// 入力された認証コードを検証する（Twilio Verify）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawPhone: string | undefined = body?.phone
    const code: string | undefined = body?.code

    if (!rawPhone || typeof rawPhone !== 'string') {
      return NextResponse.json(
        { error: '電話番号が必要です' },
        { status: 400 }
      )
    }
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: '認証コードが必要です' },
        { status: 400 }
      )
    }

    const phone = normalizeJpPhone(rawPhone)
    if (!isValidE164(phone)) {
      return NextResponse.json(
        { error: '電話番号の形式が正しくありません' },
        { status: 400 }
      )
    }

    const client = getTwilioClient()
    const serviceSid = getVerifyServiceSid()

    const check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phone, code })

    const approved = check.status === 'approved'

    return NextResponse.json(
      { approved, status: check.status },
      { status: approved ? 200 : 400 }
    )
  } catch (error: any) {
    console.error('認証コード検証エラー:', error)
    // Twilioコード20404 / HTTP404 = 有効な認証が存在しない（期限切れ・既に認証済み・試行回数超過など）
    const notFound = error?.code === 20404 || error?.status === 404
    const message = notFound
      ? '認証コードの有効期限が切れているか、無効です。「コードを再送する」から新しいコードを取得してください。'
      : (error?.message || '認証コードの検証に失敗しました')
    return NextResponse.json(
      { approved: false, error: message },
      { status: 400 }
    )
  }
}
