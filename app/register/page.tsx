"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { signUp } from "aws-amplify/auth"
import { generateClient } from 'aws-amplify/api'
import { createUser } from '@/src/graphql/mutations'
import { HeaderNavigation } from "@/components/header-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

// Cognitoエラーメッセージを日本語に翻訳
function translateCognitoError(errorMessage: string): string {
  // パスワードポリシー関連のエラー（複数のパターンに対応）
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
  
  // パスワード長のエラー
  if (errorMessage.includes("Password not long enough") || 
      errorMessage.includes("password must have length") ||
      errorMessage.includes("Password must be at least")) {
    return "パスワードは8文字以上にしてください"
  }
  
  // メールアドレス関連のエラー
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
  
  // ユーザー名関連のエラー
  if (errorMessage.includes("User already exists") || 
      errorMessage.includes("UsernameExistsException")) {
    return "このメールアドレスは既に登録されています"
  }
  
  // 確認コード関連のエラー
  if (errorMessage.includes("Invalid verification code") || 
      errorMessage.includes("CodeMismatchException")) {
    return "確認コードが正しくありません"
  }
  if (errorMessage.includes("ExpiredCodeException") || 
      errorMessage.includes("code has expired")) {
    return "確認コードの有効期限が切れています"
  }
  
  // 試行回数制限
  if (errorMessage.includes("Attempt limit exceeded") || 
      errorMessage.includes("LimitExceededException") ||
      errorMessage.includes("too many requests") ||
      errorMessage.includes("Too many attempts")) {
    return "試行回数が多すぎます。しばらく待ってからお試しください"
  }
  
  // ネットワークエラー
  if (errorMessage.includes("Network") || errorMessage.includes("network")) {
    return "ネットワークエラーが発生しました。接続を確認してください"
  }
  
  // その他のエラー
  return errorMessage || "登録に失敗しました。入力内容を確認してください"
}

export default function RegisterPage() {
  ensureAmplifyConfigured()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("パスワードが一致しません")
      setIsLoading(false)
      return
    }

    try {
      // Cognitoにユーザーを登録
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            given_name: formData.firstName,
            family_name: formData.lastName,
          },
        }
      })
      
      console.log('SignUp result:', { isSignUpComplete, nextStep })
      
      // メール確認の有無に関わらず、DynamoDBに保存
      console.log('Saving to DynamoDB...')
      try {
        const client = generateClient()
        const result = await client.graphql({
          query: createUser,
          variables: {
            input: {
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
            }
          }
        })
        console.log('DynamoDB save successful:', result)
        
        // メール確認が必要な場合は確認画面へ（パスワードはセッションストレージに保存）
        if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          console.log('Redirecting to confirmation page')
          // セッションストレージにパスワードを一時保存（認証完了後に使用）
          sessionStorage.setItem('pendingPassword', formData.password)
          const params = new URLSearchParams({
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
          })
          router.push(`/confirm-signup?${params.toString()}`)
        } else {
          // メール確認が不要な場合は、ログイン画面へ
          setSuccess('登録完了しました')
          setTimeout(() => {
            router.push('/login')
          }, 1500)
        }
      } catch (dbError) {
        console.error("Database save error:", dbError)
        // Cognitoには登録されているので、警告のみ表示
        setError('アカウントは作成されましたが、プロフィール情報の保存に失敗しました。')
      }

    } catch (error: any) {
      console.error("Registration error:", error)
      // Cognitoのエラーメッセージを日本語に翻訳
      const translatedError = translateCognitoError(error.message || '')
      setError(translatedError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header Navigation */}
      <HeaderNavigation isLoggedIn={false} />
      
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-primary mb-2">SocialConnect</h1>
          <p className="text-muted-foreground">新しいアカウントを作成</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">アカウント作成</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="lastName"
                  placeholder="姓"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
                <Input
                  name="firstName"
                  placeholder="名"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>

              <Input
                name="email"
                type="email"
                placeholder="メールアドレス"
                value={formData.email}
                onChange={handleChange}
                className="h-12"
                required
              />

              <div className="relative">
              <Input
                name="password"
                  type={showPassword ? "text" : "password"}
                placeholder="パスワード"
                value={formData.password}
                onChange={handleChange}
                  className="h-12 pr-12"
                required
              />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
              <Input
                name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                placeholder="パスワードを再入力"
                value={formData.confirmPassword}
                onChange={handleChange}
                  className="h-12 pr-12"
                required
              />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "パスワードを隠す" : "パスワードを表示"}
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

              <Button 
                type="submit" 
                variant="secondary" 
                className="w-full h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "作成中..." : "アカウントを作成"}
              </Button>
              
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md text-center">
                  {success}
                </div>
              )}
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                すでにアカウントをお持ちですか？{" "}
                <Link href="/login" className="text-primary hover:underline">
                  ログイン
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
