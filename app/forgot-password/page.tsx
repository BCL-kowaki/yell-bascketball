"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

// Cognitoエラーメッセージを日本語に翻訳
function translateCognitoError(errorMessage: string): string {
  if (errorMessage.includes("User does not exist") ||
      errorMessage.includes("UserNotFoundException") ||
      errorMessage.includes("user not found")) {
    return "このメールアドレスは登録されていません"
  }
  if (errorMessage.includes("Invalid verification code") ||
      errorMessage.includes("CodeMismatchException") ||
      errorMessage.includes("Invalid code")) {
    return "確認コードが正しくありません"
  }
  if (errorMessage.includes("ExpiredCodeException") ||
      errorMessage.includes("code has expired") ||
      errorMessage.includes("Code expired")) {
    return "確認コードの有効期限が切れています。再度コードを送信してください"
  }
  if (errorMessage.includes("Attempt limit exceeded") ||
      errorMessage.includes("LimitExceededException") ||
      errorMessage.includes("too many requests") ||
      errorMessage.includes("Too many attempts")) {
    return "試行回数が多すぎます。しばらく待ってからお試しください"
  }
  if (errorMessage.includes("Password did not conform") ||
      errorMessage.includes("Password does not conform") ||
      errorMessage.includes("password policy") ||
      errorMessage.includes("Password must have")) {
    if (errorMessage.includes("uppercase")) return "パスワードには大文字（A-Z）を含めてください"
    if (errorMessage.includes("lowercase")) return "パスワードには小文字（a-z）を含めてください"
    if (errorMessage.includes("numeric") || errorMessage.includes("number")) return "パスワードには数字（0-9）を含めてください"
    if (errorMessage.includes("symbol") || errorMessage.includes("special")) return "パスワードには記号（!@#$%^&*など）を含めてください"
    return "パスワードの形式が正しくありません（大文字・小文字・数字・記号を含む8文字以上）"
  }
  if (errorMessage.includes("Password not long enough") ||
      errorMessage.includes("password must have length") ||
      errorMessage.includes("Password must be at least")) {
    return "パスワードは8文字以上にしてください"
  }
  if (errorMessage.includes("Invalid email") ||
      errorMessage.includes("invalid email format")) {
    return "メールアドレスの形式が正しくありません"
  }
  if (errorMessage.includes("Network") || errorMessage.includes("network")) {
    return "ネットワークエラーが発生しました。接続を確認してください"
  }
  if (errorMessage.includes("NotAuthorizedException") ||
      errorMessage.includes("not authorized")) {
    return "この操作を実行する権限がありません"
  }
  return errorMessage || "エラーが発生しました"
}

// SVGアイコン（外部依存なし）
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  )
}

// 共通スタイル
const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "48px",
  padding: "0 16px",
  fontSize: "15px",
  backgroundColor: "#f5f5f5",
  borderRadius: "10px",
  border: "none",
  outline: "none",
  boxSizing: "border-box",
  color: "#1e1e1e",
}

const inputWithIconStyle: React.CSSProperties = {
  ...inputStyle,
  paddingRight: "48px",
}

const buttonStyle: React.CSSProperties = {
  width: "100%",
  height: "48px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #f7931e 0%, #f06a4e 50%, #e84b8a 100%)",
  color: "#fff",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
  border: "none",
  outline: "none",
  letterSpacing: "0.05em",
}

const errorBoxStyle: React.CSSProperties = {
  padding: "12px",
  fontSize: "14px",
  color: "#dc2626",
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  marginBottom: "16px",
  border: "1px solid #fecaca",
}

const successBoxStyle: React.CSSProperties = {
  padding: "12px",
  fontSize: "14px",
  color: "#16a34a",
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  marginBottom: "16px",
  border: "1px solid #bbf7d0",
}

export default function ForgotPasswordPage() {
  const router = useRouter()

  // ステップ管理: "email" | "code" | "complete"
  const [step, setStep] = useState<"email" | "code" | "complete">("email")

  const [email, setEmail] = useState("")
  const [confirmationCode, setConfirmationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  // ステップ1: パスワードリセットをリクエスト
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const { ensureAmplifyConfigured } = await import("@/lib/amplifyClient")
      ensureAmplifyConfigured()
      const { resetPassword } = await import("aws-amplify/auth")

      const output = await resetPassword({ username: email.toLowerCase().trim() })
      const { nextStep } = output
      if (nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        setMessage(`${email} に確認コードを送信しました`)
        setStep("code")
      }
    } catch (error: any) {
      setError(translateCognitoError(error?.message || ""))
    } finally {
      setIsLoading(false)
    }
  }

  // ステップ2: 確認コードと新しいパスワードで完了
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません")
      setIsLoading(false)
      return
    }

    try {
      const { ensureAmplifyConfigured } = await import("@/lib/amplifyClient")
      ensureAmplifyConfigured()
      const { confirmResetPassword } = await import("aws-amplify/auth")

      await confirmResetPassword({
        username: email.toLowerCase().trim(),
        confirmationCode,
        newPassword,
      })
      setStep("complete")
    } catch (error: any) {
      setError(translateCognitoError(error?.message || ""))
    } finally {
      setIsLoading(false)
    }
  }

  // 確認コードを再送信
  const handleResendCode = async () => {
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const { ensureAmplifyConfigured } = await import("@/lib/amplifyClient")
      ensureAmplifyConfigured()
      const { resetPassword } = await import("aws-amplify/auth")

      await resetPassword({ username: email.toLowerCase().trim() })
      setMessage("確認コードを再送信しました")
    } catch (error: any) {
      setError(translateCognitoError(error?.message || ""))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: "100vh",
        overflow: "auto",
        margin: 0,
        padding: 0,
        border: "none",
        outline: "none",
        backgroundColor: "#000",
      }}
    >
      {/* 動画背景 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src="/videos/landing-bg.mp4" type="video/mp4" />
      </video>

      {/* グラデーションオーバーレイ */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          background:
            "linear-gradient(135deg, rgba(247, 147, 30, 0.9) 0%, rgba(240, 106, 78, 0.9) 40%, rgba(232, 75, 138, 0.9) 100%)",
        }}
      />

      {/* コンテンツ */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "24px 16px",
          boxSizing: "border-box",
        }}
      >
        {/* ロゴ */}
        <div style={{ marginBottom: "24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="YeLL Basketball"
            style={{
              width: "160px",
              height: "auto",
              filter: "brightness(0) invert(1)",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>

        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          {step === "email" && "パスワードをリセット"}
          {step === "code" && "新しいパスワードを設定"}
          {step === "complete" && "リセット完了"}
        </p>

        {/* フォームカード */}
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "16px",
            padding: "28px 24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            boxSizing: "border-box",
          }}
        >
          {/* ===== ステップ1: メールアドレス入力 ===== */}
          {step === "email" && (
            <>
              <p style={{ fontSize: "13px", color: "#888", textAlign: "center", marginBottom: "20px", lineHeight: 1.6 }}>
                登録したメールアドレスを入力してください。<br />
                パスワードリセット用の確認コードを送信します。
              </p>

              <form onSubmit={handleRequestReset}>
                <div style={{ marginBottom: "16px" }}>
                  <input
                    type="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                {error && <div style={errorBoxStyle}>{error}</div>}
                {message && <div style={successBoxStyle}>{message}</div>}

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    ...buttonStyle,
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? "送信中..." : "確認コードを送信"}
                </button>
              </form>

              {/* ログインに戻る */}
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <a
                  href="/login"
                  style={{
                    color: "#999",
                    fontSize: "13px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ArrowLeftIcon />
                  ログインに戻る
                </a>
              </div>
            </>
          )}

          {/* ===== ステップ2: 確認コード＋新パスワード ===== */}
          {step === "code" && (
            <>
              <p style={{ fontSize: "13px", color: "#888", textAlign: "center", marginBottom: "20px", lineHeight: 1.6 }}>
                メールに届いた確認コードと<br />新しいパスワードを入力してください。
              </p>

              <form onSubmit={handleConfirmReset}>
                {/* 確認コード */}
                <div style={{ marginBottom: "16px" }}>
                  <input
                    type="text"
                    placeholder="確認コード（6桁）"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    maxLength={6}
                    required
                    style={{
                      ...inputStyle,
                      textAlign: "center",
                      fontSize: "20px",
                      letterSpacing: "0.3em",
                    }}
                  />
                </div>

                {/* 新しいパスワード */}
                <div style={{ marginBottom: "16px", position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="新しいパスワード"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={inputWithIconStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      outline: "none",
                      cursor: "pointer",
                      padding: "4px",
                      color: "#999",
                    }}
                    aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* パスワード確認 */}
                <div style={{ marginBottom: "16px", position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="新しいパスワード（確認）"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={inputWithIconStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      outline: "none",
                      cursor: "pointer",
                      padding: "4px",
                      color: "#999",
                    }}
                    aria-label={showConfirmPassword ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* パスワード要件 */}
                <div
                  style={{
                    padding: "12px",
                    fontSize: "12px",
                    color: "#888",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    lineHeight: 1.7,
                  }}
                >
                  <p style={{ fontWeight: 600, marginBottom: "4px", color: "#666" }}>パスワードの要件:</p>
                  <span>8文字以上 / 大文字(A-Z) / 小文字(a-z) / 数字(0-9) / 記号(!@#$%^&*)</span>
                </div>

                {error && <div style={errorBoxStyle}>{error}</div>}
                {message && <div style={successBoxStyle}>{message}</div>}

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    ...buttonStyle,
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? "設定中..." : "パスワードをリセット"}
                </button>
              </form>

              {/* コード再送信 / メールアドレス変更 */}
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#f06a4e",
                    fontSize: "13px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  確認コードを再送信
                </button>
              </div>
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <button
                  onClick={() => { setStep("email"); setError(""); setMessage("") }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#999",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: 0,
                  }}
                >
                  <ArrowLeftIcon />
                  メールアドレスを変更
                </button>
              </div>
            </>
          )}

          {/* ===== ステップ3: 完了 ===== */}
          {step === "complete" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <CheckCircleIcon />
              </div>
              <p style={{ fontSize: "18px", fontWeight: 700, color: "#16a34a", marginBottom: "8px" }}>
                パスワードをリセットしました
              </p>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>
                新しいパスワードでログインできます
              </p>
              <a
                href="/login"
                style={{
                  display: "block",
                  width: "100%",
                  height: "48px",
                  lineHeight: "48px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #f7931e 0%, #f06a4e 50%, #e84b8a 100%)",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: 700,
                  textDecoration: "none",
                  textAlign: "center",
                  letterSpacing: "0.05em",
                  boxSizing: "border-box",
                }}
              >
                ログインページへ
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
