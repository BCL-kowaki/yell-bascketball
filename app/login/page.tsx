"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HeaderNavigation } from "@/components/header-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'ログインに失敗しました')
        return
      }

      setSuccess("ログインに成功しました！タイムラインページに移動します...")
      console.log("Login successful:", data)
      
      // フォームをリセット
      setEmail("")
      setPassword("")

      // ログイン成功後、タイムラインページにリダイレクト
      setTimeout(() => {
        router.push('/timeline')
      }, 1500) // 1.5秒後にリダイレクト（成功メッセージを表示するため）

    } catch (error) {
      console.error("Login error:", error)
      setError('ネットワークエラーが発生しました')
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

              <div>
                <Input
                  type="password"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                />
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
