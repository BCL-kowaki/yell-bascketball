"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { getUserByEmail } from "@/lib/api"
import { generateClient } from 'aws-amplify/api'
import { createUser } from '@/src/graphql/mutations'
import { HeaderNavigation } from "@/components/header-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  ensureAmplifyConfigured()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // 0) 既にサインイン済みか確認
      let signedIn = false
      let loginId: string | undefined
      try {
        const u = await getCurrentUser()
        signedIn = !!u
        // Amplify v6: loginId にメールが入る
        // 型安全ではないが存在すれば利用
        // @ts-ignore
        loginId = u?.signInDetails?.loginId
      } catch (_) {
        signedIn = false
      }

      // 1) 未サインインなら Cognito でサインイン
      if (!signedIn) {
        await signIn({ username: email, password })
        loginId = email
      }

      // 2) DynamoDBにユーザーが存在するか確認、なければ作成
      try {
        const userEmail = loginId || email
        const dbUser = await getUserByEmail(userEmail)
        
        if (!dbUser) {
          // DynamoDBにユーザーが存在しない場合、Cognitoから情報を取得して作成
          console.log('User not found in DynamoDB, creating...')
          const attributes = await fetchUserAttributes()
          
          const client = generateClient()
          await client.graphql({
            query: createUser,
            variables: {
              input: {
                email: userEmail,
                firstName: attributes.given_name || '',
                lastName: attributes.family_name || '',
              }
            }
          })
          console.log('User created in DynamoDB')
        }
      } catch (dbError) {
        console.error('DynamoDB user check/create error:', dbError)
        // エラーがあってもログインは続行
      }

      // 3) アプリのセッションクッキー発行（HTTP-only）
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginId || email }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'セッション発行に失敗しました')
        return
      }

      setSuccess("ログインに成功しました！ホームへ移動します...")
      
      // フォームをリセット
      setEmail("")
      setPassword("")

      // ログイン成功後、ホームにリダイレクト
      router.replace('/')

    } catch (error: any) {
      // 既にサインイン済みの場合
      if (error?.name === 'UserAlreadyAuthenticatedException') {
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (res.ok) {
          router.replace('/')
          return
        }
      }
      
      // ユーザーが存在しない場合
      if (error?.name === 'UserNotFoundException') {
        setError('メールアドレスまたはパスワードが正しくありません。アカウントが存在しない可能性があります。')
        return
      }
      
      // パスワードが間違っている場合
      if (error?.name === 'NotAuthorizedException') {
        setError('メールアドレスまたはパスワードが正しくありません。')
        return
      }
      
      // その他のエラー
      console.error("Login error:", error)
      setError(error?.message || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。')
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
          <p className="text-muted-foreground">アカウントにログイン</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">ログイン</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="メールアドレスまたは電話番号"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                  {success}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "ログイン中..." : "ログイン"}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link href="/forgot-password" className="text-primary hover:underline text-sm">
                パスワードを忘れましたか？
              </Link>
            </div>

            <hr className="my-6" />

            <div className="text-center">
              <Link href="/register">
                <Button variant="secondary" className="px-8">
                  新しいアカウントを作成
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
