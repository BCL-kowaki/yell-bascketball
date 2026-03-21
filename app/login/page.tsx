"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { signIn, signOut, fetchUserAttributes } from "aws-amplify/auth"

// Cognitoエラーメッセージを日本語に翻訳
function translateCognitoError(errorMessage: string): string {
  if (errorMessage.includes("Incorrect username or password") ||
      errorMessage.includes("NotAuthorizedException")) {
    return "メールアドレスまたはパスワードが正しくありません"
  }
  if (errorMessage.includes("User does not exist") ||
      errorMessage.includes("UserNotFoundException")) {
    return "このメールアドレスは登録されていません"
  }
  if (errorMessage.includes("Password reset required")) {
    return "パスワードのリセットが必要です"
  }
  if (errorMessage.includes("User is not confirmed") ||
      errorMessage.includes("UserNotConfirmedException")) {
    return "メールアドレスの確認が完了していません"
  }
  if (errorMessage.includes("User is disabled")) {
    return "このアカウントは無効になっています"
  }
  if (errorMessage.includes("too many") || errorMessage.includes("LimitExceededException")) {
    return "ログイン試行回数が多すぎます。しばらく待ってからお試しください"
  }
  if (errorMessage.includes("AuthFlow") || errorMessage.includes("InvalidParameterException")) {
    return "認証設定に問題があります。管理者にお問い合わせください"
  }
  if (errorMessage.includes("Network") || errorMessage.includes("network")) {
    return "ネットワークエラーが発生しました。接続を確認してください"
  }
  return errorMessage || "ログインに失敗しました"
}

// SVGアイコン
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

export default function LoginPage() {
  ensureAmplifyConfigured()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [statusMsg, setStatusMsg] = useState("")

  // 保存済みメアド読み込み + セッションチェック
  useEffect(() => {
    try {
      const cookies = document.cookie.split('; ')
      const savedEmail = cookies.find(row => row.startsWith('savedEmail='))?.split('=')[1]
      if (savedEmail) setEmail(decodeURIComponent(savedEmail))
    } catch {}

    // ループ防止: middlewareからリダイレクトされた場合はスキップ
    const params = new URLSearchParams(window.location.search)
    if (params.get('from') !== 'auth') {
      fetch('/api/session').then(res => {
        if (res.ok) window.location.href = '/profile'
      }).catch(() => {})
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setStatusMsg("")

    const loginEmail = email.toLowerCase().trim()

    if (!loginEmail || !password) {
      setError("メールアドレスとパスワードを入力してください")
      setIsLoading(false)
      return
    }

    try {
      // === Step 1: 既存セッションをクリア ===
      setStatusMsg("認証準備中...")
      try {
        await signOut()
      } catch {
        // サインアウト失敗は無視（未ログイン状態なら失敗する）
      }

      // === Step 2: Cognito signIn ===
      setStatusMsg("認証中...")
      let signInResult: any
      try {
        signInResult = await signIn({
          username: loginEmail,
          password: password,
          options: { authFlowType: 'USER_SRP_AUTH' }
        })
      } catch (signInError: any) {
        // signInの例外 = 認証失敗（ID/パスワード間違い等）
        console.error("[ログイン] signInエラー:", signInError?.name, signInError?.message)
        setError(translateCognitoError(signInError?.message || signInError?.toString() || ""))
        setIsLoading(false)
        return
      }

      console.log("[ログイン] signIn結果:", JSON.stringify(signInResult))

      // nextStepの確認（CONFIRM_SIGN_UP等の追加認証が必要な場合）
      if (signInResult?.nextStep?.signInStep && signInResult.nextStep.signInStep !== 'DONE') {
        const step = signInResult.nextStep.signInStep
        if (step === 'CONFIRM_SIGN_UP') {
          setError("メールアドレスの確認が完了していません。確認メールをご確認ください。")
        } else if (step === 'RESET_PASSWORD') {
          setError("パスワードのリセットが必要です。")
        } else {
          setError(`追加認証が必要です: ${step}`)
        }
        setIsLoading(false)
        return
      }

      // === Step 3: メールアドレス取得 ===
      setStatusMsg("ユーザー情報取得中...")
      let userEmail = loginEmail
      try {
        const attributes = await fetchUserAttributes()
        userEmail = attributes.email || loginEmail
      } catch {
        // 属性取得失敗でも続行
      }

      // === Step 4: セッションCookie発行 ===
      setStatusMsg("セッション設定中...")
      const sessionRes = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, userId: userEmail, rememberMe }),
      })

      if (!sessionRes.ok) {
        console.error("[ログイン] セッション発行失敗:", sessionRes.status)
        setError("セッションの設定に失敗しました。もう一度お試しください。")
        setIsLoading(false)
        return
      }

      // === Step 5: Cookie確認（リダイレクト先でmiddlewareに弾かれないか事前チェック） ===
      setStatusMsg("セッション確認中...")
      const verifyRes = await fetch('/api/session')
      if (!verifyRes.ok) {
        console.error("[ログイン] セッション確認失敗:", verifyRes.status)
        setError("セッションの確認に失敗しました。もう一度お試しください。")
        setIsLoading(false)
        return
      }

      // メアドをクッキーに保存（30日間）
      const expires = new Date()
      expires.setDate(expires.getDate() + 30)
      document.cookie = `savedEmail=${encodeURIComponent(userEmail)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`

      // === Step 6: ページ遷移 ===
      // ★ DB操作はここではやらない（profileページで行う）
      // ★ window.location.hrefで確実にフルリロードさせる
      setStatusMsg("ログイン成功！リダイレクト中...")
      window.location.href = '/profile'

    } catch (error: any) {
      console.error("[ログイン] 予期せぬエラー:", error)
      setError(translateCognitoError(error?.message || "予期せぬエラーが発生しました"))
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
          アカウントにログイン
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
          <form onSubmit={handleSubmit}>
            {/* メールアドレス */}
            <div style={{ marginBottom: "16px" }}>
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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

            {/* パスワード */}
            <div style={{ marginBottom: "16px", position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* ログインを維持 */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#555",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    accentColor: "#e84b8a",
                    cursor: "pointer",
                  }}
                />
                ログインを維持
              </label>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div
                style={{
                  padding: "12px",
                  fontSize: "14px",
                  color: "#dc2626",
                  backgroundColor: "#fef2f2",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  border: "1px solid #fecaca",
                }}
              >
                {error}
              </div>
            )}

            {/* ステータスメッセージ（処理中の進捗表示） */}
            {statusMsg && !error && (
              <div
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "#2563eb",
                  backgroundColor: "#eff6ff",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  border: "1px solid #bfdbfe",
                  textAlign: "center",
                }}
              >
                {statusMsg}
              </div>
            )}

            {/* ログインボタン */}
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
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          {/* パスワードを忘れた場合 */}
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <a
              href="/forgot-password"
              style={{
                color: "#999",
                fontSize: "13px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              パスワードを忘れた場合
            </a>
          </div>

          {/* 区切り線 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "20px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }} />
            <span style={{ color: "#999", fontSize: "12px" }}>または</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }} />
          </div>

          {/* 新規登録リンク */}
          <div
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#666",
            }}
          >
            アカウントをお持ちでない方は{" "}
            <a
              href="/register"
              style={{
                color: "#f06a4e",
                cursor: "pointer",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              こちら
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
