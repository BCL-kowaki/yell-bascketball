import { NextRequest, NextResponse } from 'next/server'
import { getTwilioClient, getVerifyServiceSid, normalizeJpPhone, isValidE164 } from '@/lib/twilio'

// 認証コードをSMS送信する（Twilio Verify）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawPhone: string | undefined = body?.phone

    if (!rawPhone || typeof rawPhone !== 'string') {
      return NextResponse.json(
        { error: '電話番号が必要です' },
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

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phone, channel: 'sms' })

    return NextResponse.json(
      { status: verification.status, phone },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('認証コード送信エラー:', error)
    return NextResponse.json(
      { error: error?.message || '認証コードの送信に失敗しました' },
      { status: 500 }
    )
  }
}
