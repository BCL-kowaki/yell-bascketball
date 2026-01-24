"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { resetPassword, confirmResetPassword } from "aws-amplify/auth"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { HeaderNavigation } from "@/components/header-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, EyeOff, ArrowLeft, Mail, Key, CheckCircle } from "lucide-react"

// Cognitoエラーメッセージを日本語に翻訳
function translateCognitoError(errorMessage: string): string {
  // ユーザーが存在しない
  if (errorMessage.includes("User does not exist") || 
      errorMessage.includes("UserNotFoundException") ||
      errorMessage.includes("user not found")) {
    return "このメールアドレスは登録されていません"
  }
  
  // 確認コード関連
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
  
  // 試行回数制限
  if (errorMessage.includes("Attempt limit exceeded") || 
      errorMessage.includes("LimitExceededException") ||
      errorMessage.includes("too many requests") ||
      errorMessage.includes("Too many attempts")) {
    return "試行回数が多すぎます。しばらく待ってからお試しください"
  }
  
  // パスワードポリシー関連（複数のパターンに対応）
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
    return "パスワードの形式が正しくありません（大文字・小文字・数字・記号を含む8文字以上）"
  }
  
  // パスワード長
  if (errorMessage.includes("Password not long enough") || 
      errorMessage.includes("password must have length") ||
      errorMessage.includes("Password must be at least")) {
    return "パスワードは8文字以上にしてください"
  }
  
  // メールアドレス関連
  if (errorMessage.includes("Invalid email") || 
      errorMessage.includes("invalid email format") ||
      errorMessage.includes("Invalid email address format")) {
    return "メールアドレスの形式が正しくありません"
  }
  
  // ネットワークエラー
  if (errorMessage.includes("Network") || errorMessage.includes("network")) {
    return "ネットワークエラーが発生しました。接続を確認してください"
  }
  
  // 認証エラー
  if (errorMessage.includes("NotAuthorizedException") ||
      errorMessage.includes("not authorized")) {
    return "この操作を実行する権限がありません"
  }
  
  return errorMessage || "エラーが発生しました"
}

export default function ForgotPasswordPage() {
  ensureAmplifyConfigured()
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
      const output = await resetPassword({ username: email })
      console.log("Reset password output:", output)
      
      const { nextStep } = output
      if (nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        setMessage(`${email} に確認コードを送信しました`)
        setStep("code")
      }
    } catch (error: any) {
      console.error("Reset password error:", error)
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
      await confirmResetPassword({
        username: email,
        confirmationCode,
        newPassword,
      })
      
      setStep("complete")
    } catch (error: any) {
      console.error("Confirm reset password error:", error)
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
      await resetPassword({ username: email })
      setMessage("確認コードを再送信しました")
    } catch (error: any) {
      console.error("Resend code error:", error)
      setError(translateCognitoError(error?.message || ""))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#E5E5E5]">
      <HeaderNavigation isLoggedIn={false} />
      
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)] pt-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#DC0000] tracking-wide">
              Yell Basketball
            </h1>
            <p className="text-gray-600 mt-2">パスワードをリセット</p>
          </div>

          <Card className="shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] border-0">
            {step === "email" && (
              <>
                <CardHeader className="pb-4">
                  <CardTitle className="text-center text-2xl font-bold text-[#DC0000]">
                    パスワードを忘れた場合
                  </CardTitle>
                  <CardDescription className="text-center">
                    登録したメールアドレスを入力してください。
                    パスワードリセット用の確認コードを送信します。
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <form onSubmit={handleRequestReset} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="メールアドレス"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-[#F5F5F5] border-0 rounded-lg placeholder:text-gray-400 pl-10"
                        required
                      />
                    </div>

                    {error && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                      </div>
                    )}

                    {message && (
                      <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                        {message}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium bg-[#DC0000] hover:bg-[#B80000] text-white rounded-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "送信中..." : "確認コードを送信"}
                    </Button>
                  </form>

                  <div className="text-center mt-6">
                    <Link href="/login" className="text-[#2563EB] hover:underline text-sm inline-flex items-center gap-1">
                      <ArrowLeft className="w-4 h-4" />
                      ログインに戻る
                    </Link>
                  </div>
                </CardContent>
              </>
            )}

            {step === "code" && (
              <>
                <CardHeader className="pb-4">
                  <CardTitle className="text-center text-2xl font-bold text-[#DC0000]">
                    新しいパスワードを設定
                  </CardTitle>
                  <CardDescription className="text-center">
                    メールに届いた確認コードと新しいパスワードを入力してください。
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <form onSubmit={handleConfirmReset} className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="確認コード（6桁）"
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value)}
                        className="h-12 bg-[#F5F5F5] border-0 rounded-lg placeholder:text-gray-400 text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="新しいパスワード"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 bg-[#F5F5F5] border-0 rounded-lg placeholder:text-gray-400 pl-10 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="新しいパスワード（確認）"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 bg-[#F5F5F5] border-0 rounded-lg placeholder:text-gray-400 pl-10 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    {/* パスワードポリシーの注意書き */}
                    <div className="p-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="font-medium mb-1">パスワードの要件:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>8文字以上</li>
                        <li>大文字（A-Z）を含む</li>
                        <li>小文字（a-z）を含む</li>
                        <li>数字（0-9）を含む</li>
                        <li>記号（!@#$%^&*など）を含む</li>
                      </ul>
                    </div>

                    {error && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                      </div>
                    )}

                    {message && (
                      <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                        {message}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium bg-[#DC0000] hover:bg-[#B80000] text-white rounded-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "設定中..." : "パスワードをリセット"}
                    </Button>
                  </form>

                  <div className="text-center mt-4 space-y-2">
                    <button
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="text-[#2563EB] hover:underline text-sm"
                    >
                      確認コードを再送信
                    </button>
                    <div>
                      <button
                        onClick={() => setStep("email")}
                        className="text-gray-500 hover:underline text-sm inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        メールアドレスを変更
                      </button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {step === "complete" && (
              <>
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                  <CardTitle className="text-center text-2xl font-bold text-green-600">
                    パスワードをリセットしました
                  </CardTitle>
                  <CardDescription className="text-center">
                    新しいパスワードでログインできます
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <Link href="/login">
                    <Button
                      className="w-full h-12 text-base font-medium bg-[#DC0000] hover:bg-[#B80000] text-white rounded-lg"
                    >
                      ログインページへ
                    </Button>
                  </Link>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

