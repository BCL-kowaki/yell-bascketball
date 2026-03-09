"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { signUp } from "aws-amplify/auth"
import { Eye, EyeOff } from "lucide-react"

// Cognitoエラーメッセージを日本語に翻訳
function translateCognitoError(errorMessage: string): string {
  if (errorMessage.includes("Password did not conform") ||
      errorMessage.includes("Password does not conform") ||
      errorMessage.includes("password policy") ||
      errorMessage.includes("Password must have")) {
    if (errorMessage.includes("uppercase")) {
      return "パスワードには大文字（A-Z）を含めてください"
    }
    if (errorMessage.includes("lowercase")) {
      return "パスワードには小文字（a-z）を含めてください"
    }
    if (errorMessage.includes("numeric") || errorMessage.includes("number")) {
      return "パスワードには数字（0-9）を含めてください"
    }
    if (errorMessage.includes("symbol") || errorMessage.includes("special")) {
      return "パスワードには記号（!@#$%^&*など）を含めてください"
    }
    if (errorMessage.includes("long enough") || errorMessage.includes("length")) {
      return "パスワードは8文字以上にしてください"
    }
    return "パスワードの形式が正しくありません（大文字・小文字・数字・記号を含む8文字以上）"
  }
  if (errorMessage.includes("Password not long enough") ||
      errorMessage.includes("password must have length") ||
      errorMessage.includes("Password must be at least")) {
    return "パスワードは8文字以上にしてください"
  }
  if (errorMessage.includes("email already exists") ||
      errorMessage.includes("already registered") ||
      errorMessage.includes("An account with the given email already exists")) {
    return "このメールアドレスは既に登録されています"
  }
  if (errorMessage.includes("Username cannot be empty") ||
      errorMessage.includes("email cannot be empty") ||
      errorMessage.includes("Username is required")) {
    return "メールアドレスを入力してください"
  }
  if (errorMessage.includes("Invalid email") ||
      errorMessage.includes("invalid email format") ||
      errorMessage.includes("Invalid email address format")) {
    return "メールアドレスの形式が正しくありません"
  }
  if (errorMessage.includes("User already exists") ||
      errorMessage.includes("UsernameExistsException")) {
    return "このメールアドレスは既に登録されています"
  }
  if (errorMessage.includes("Invalid verification code") ||
      errorMessage.includes("CodeMismatchException")) {
    return "確認コードが正しくありません"
  }
  if (errorMessage.includes("ExpiredCodeException") ||
      errorMessage.includes("code has expired")) {
    return "確認コードの有効期限が切れています"
  }
  if (errorMessage.includes("Attempt limit exceeded") ||
      errorMessage.includes("LimitExceededException") ||
      errorMessage.includes("too many requests") ||
      errorMessage.includes("Too many attempts")) {
    return "試行回数が多すぎます。しばらく待ってからお試しください"
  }
  if (errorMessage.includes("Network") || errorMessage.includes("network")) {
    return "ネットワークエラーが発生しました。接続を確認してください"
  }
  return errorMessage || "登録に失敗しました。入力内容を確認してください"
}

export default function RegisterPage() {
  ensureAmplifyConfigured()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("パスワードが一致しません")
      setIsLoading(false)
      return
    }

    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
          },
        }
      })

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        sessionStorage.setItem('pendingPassword', password)
        const params = new URLSearchParams({ email })
        router.push(`/confirm-signup?${params.toString()}`)
      } else {
        router.push('/login')
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      const translatedError = translateCognitoError(error.message || '')
      setError(translatedError)
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

        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "14px",
            marginBottom: "24px",
            border: "none",
            outline: "none",
          }}
        >
          新しいアカウントを作成
        </p>

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
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px", border: "none", outline: "none" }}>
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
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
                }}
              />
            </div>

            <div style={{ marginBottom: "16px", position: "relative", border: "none", outline: "none" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 48px 0 16px",
                  fontSize: "15px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "10px",
                  border: "none",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#1e1e1e",
                }}
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
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div style={{ marginBottom: "16px", position: "relative", border: "none", outline: "none" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="パスワードを再入力"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 48px 0 16px",
                  fontSize: "15px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "10px",
                  border: "none",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#1e1e1e",
                }}
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
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* パスワード要件 */}
            <div
              style={{
                padding: "12px",
                fontSize: "12px",
                color: "#666",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "none",
                outline: "none",
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: "4px", border: "none", outline: "none" }}>パスワードの要件:</p>
              <ul style={{ paddingLeft: "18px", margin: 0, border: "none", outline: "none" }}>
                <li>8文字以上</li>
                <li>大文字（A-Z）を含む</li>
                <li>小文字（a-z）を含む</li>
                <li>数字（0-9）を含む</li>
                <li>記号（!@#$%^&*など）を含む</li>
              </ul>
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
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #f7931e 0%, #f06a4e 50%, #e84b8a 100%)",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                border: "none",
                outline: "none",
                letterSpacing: "0.05em",
              }}
            >
              {isLoading ? "作成中..." : "アカウントを作成"}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "14px",
              color: "#666",
              border: "none",
              outline: "none",
            }}
          >
            すでにアカウントをお持ちですか？{" "}
            <span
              onClick={() => router.push("/login")}
              style={{
                color: "#f06a4e",
                cursor: "pointer",
                fontWeight: 600,
                border: "none",
                outline: "none",
              }}
            >
              ログイン
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
