// Twilio Verify API ヘルパー（サーバー専用 / route.ts からのみ使用）
import twilio from 'twilio'

// Twilioクライアントをシングルトンで生成
let client: ReturnType<typeof twilio> | null = null

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error('Twilioの認証情報(TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN)が設定されていません')
  }

  if (!client) {
    client = twilio(accountSid, authToken)
  }
  return client
}

export function getVerifyServiceSid(): string {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID
  if (!serviceSid) {
    throw new Error('TWILIO_VERIFY_SERVICE_SID が設定されていません')
  }
  return serviceSid
}

/**
 * 日本の電話番号をE.164形式(+81...)へ正規化する。
 * 例: "090-1234-5678" / "09012345678" → "+819012345678"
 * すでに "+" 始まりの国際表記はそのまま採用する。
 */
export function normalizeJpPhone(input: string): string {
  // 数字と先頭の + 以外を除去
  const trimmed = input.trim()
  if (trimmed.startsWith('+')) {
    return '+' + trimmed.slice(1).replace(/[^0-9]/g, '')
  }
  const digits = trimmed.replace(/[^0-9]/g, '')
  // 先頭が0の国内表記 → 0を落として+81を付与
  if (digits.startsWith('0')) {
    return '+81' + digits.slice(1)
  }
  // 81始まり(国番号付き)はそのまま+を付与
  if (digits.startsWith('81')) {
    return '+' + digits
  }
  // それ以外は日本前提で+81を付与
  return '+81' + digits
}

/**
 * E.164化した番号がおおよそ妥当か簡易チェック（+ と 10〜15桁）
 */
export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{9,14}$/.test(phone)
}
