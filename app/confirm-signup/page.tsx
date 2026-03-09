"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { confirmSignUp, resendSignUpCode, signIn } from "aws-amplify/auth"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"

function ConfirmSignUpForm() {
  ensureAmplifyConfigured()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [confirmationCode, setConfirmationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    if (!email) {
      setError("メールアドレスが見つかりません。登録をやり直してください。")
      setIsLoading(false)
      return
    }

    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode,
      })

      if (isSignUpComplete || nextStep.signUpStep === 'DONE') {
        // セッションストレージからパスワードを取得して自動ログイン
        const pendingPassword = sessionStorage.getItem('pendingPassword')
        if (pendingPassword) {
          try {
            await signIn({
              username: email,
              password: pendingPassword,
            })
            sessionStorage.removeItem('pendingPassword')
          } catch (signInError) {
            console.error("Auto sign-in error:", signInError)
          }
        }

        // プロフィール詳細入力画面に遷移
        const params = new URLSearchParams({ email })
        router.push(`/setup-profile?${params.toString()}`)
      }
    } catch (error: any) {
      console.error("Confirmation error:", error)
      setError(error.message || "確認コードが正しくありません。")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      await resendSignUpCode({ username: email })
      toast({
        title: "確認コードを再送信しました",
        description: "メールをご確認ください。",
      })
    } catch (error) {
      console.error("Resend code error:", error)
      setError("コードの再送信に失敗しました。時間をおいて再度お試しください。")
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        margin: 0,
        padding: 0,
        border: "none",
        outline: "none",
        background: "linear-gradient(135deg, rgba(247, 147, 30, 0.9) 0%, rgba(240, 106, 78, 0.9) 40%, rgba(232, 75, 138, 0.9) 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          padding: "24px 16px",
          border: "none",
          outline: "none",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "24px", border: "none", outline: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="YeLL Basketball"
            style={{
              width: "160px",
              height: "auto",
              filter: "brightness(0) invert(1)",
              border: "none",
              outline: "none",
            }}
          />
        </div>

        {/* Form Card */}
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "16px",
            padding: "28px 24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            border: "none",
            outline: "none",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#1e1e1e",
              marginBottom: "8px",
              border: "none",
              outline: "none",
            }}
          >
            アカウントの確認
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#666",
              marginBottom: "24px",
              lineHeight: 1.5,
              border: "none",
              outline: "none",
            }}
          >
            {email} に送信された<br />6桁の確認コードを入力してください
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", border: "none", outline: "none" }}>
              <InputOTP maxLength={6} value={confirmationCode} onChange={setConfirmationCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <div
                style={{
                  padding: "12px",
                  fontSize: "14px",
                  color: "#dc2626",
                  backgroundColor: "#fef2f2",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: "1px solid #fecaca",
                  outline: "none",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || confirmationCode.length < 6}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #f7931e 0%, #f06a4e 50%, #e84b8a 100%)",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 700,
                cursor: isLoading || confirmationCode.length < 6 ? "not-allowed" : "pointer",
                opacity: isLoading || confirmationCode.length < 6 ? 0.7 : 1,
                border: "none",
                outline: "none",
                letterSpacing: "0.05em",
              }}
            >
              {isLoading ? "確認中..." : "確認して登録"}
            </button>
          </form>

          <div style={{ marginTop: "20px", border: "none", outline: "none" }}>
            <span
              onClick={handleResendCode}
              style={{
                color: "#f06a4e",
                fontSize: "14px",
                cursor: "pointer",
                border: "none",
                outline: "none",
              }}
            >
              確認コードが届かない場合
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmSignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmSignUpForm />
    </Suspense>
  )
}
