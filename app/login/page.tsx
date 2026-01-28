"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, signOut, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { getUserByEmail } from "@/lib/api"
import { generateClient } from 'aws-amplify/api'
import { createUser } from '@/src/graphql/mutations'
import { HeaderNavigation } from "@/components/header-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

// Cognitoエラーメッセージを日本語に翻訳
function translateCognitoError(errorMessage: string): string {
  // 認証エラー
  if (errorMessage.includes("Incorrect username or password") || 
      errorMessage.includes("NotAuthorizedException")) {
    return "メールアドレスまたはパスワードが正しくありません"
  }
  
  // ユーザーが存在しない
  if (errorMessage.includes("User does not exist") || 
      errorMessage.includes("UserNotFoundException")) {
    return "このメールアドレスは登録されていません"
  }
  
  // パスワードリセットが必要
  if (errorMessage.includes("Password reset required")) {
    return "パスワードのリセットが必要です"
  }
  
  // ユーザーが確認されていない
  if (errorMessage.includes("User is not confirmed") || 
      errorMessage.includes("UserNotConfirmedException")) {
    return "メールアドレスの確認が完了していません"
  }
  
  // アカウントが無効
  if (errorMessage.includes("User is disabled")) {
    return "このアカウントは無効になっています"
  }
  
  // 試行回数超過
  if (errorMessage.includes("too many") || errorMessage.includes("LimitExceededException")) {
    return "ログイン試行回数が多すぎます。しばらく待ってからお試しください"
  }
  
  // 認証フローエラー
  if (errorMessage.includes("AuthFlow") || errorMessage.includes("InvalidParameterException")) {
    return "認証設定に問題があります。管理者にお問い合わせください"
  }
  
  // 設定エラー
  if (errorMessage.includes("configuration") || errorMessage.includes("Config")) {
    return "認証設定が正しくありません。ページをリロードしてください"
  }
  
  // ネットワークエラー
  if (errorMessage.includes("Network") || errorMessage.includes("network")) {
    return "ネットワークエラーが発生しました。接続を確認してください"
  }
  
  // その他のエラー
  return errorMessage || "ログインに失敗しました。メールアドレスとパスワードを確認してください"
}

export default function LoginPage() {
  ensureAmplifyConfigured()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // ページ読み込み時にログイン状態をチェック
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          console.log('User already logged in, checking JWT token...')
          
          // JWTトークン（accessToken Cookie）が存在するか確認
          const hasAccessToken = document.cookie.split(';').some(cookie => 
            cookie.trim().startsWith('accessToken=')
          )
          
          if (hasAccessToken) {
            console.log('JWT token exists, redirecting to home...')
            // JWTトークンが存在する場合のみリダイレクト
            window.location.href = '/'
            return
          } else {
            console.log('JWT token missing, setting session token...')
            // JWTトークンがない場合は、セッションを設定してからリダイレクト
            try {
              // ユーザー属性からメールアドレスを取得
              let userEmail: string
              try {
                const attributes = await fetchUserAttributes()
                userEmail = attributes.email || attributes.preferred_username || ''
              } catch (attrError) {
                console.warn('Could not fetch user attributes:', attrError)
                // @ts-ignore
                userEmail = user?.signInDetails?.loginId || ''
              }
              
              if (userEmail) {
                // JWTトークンを設定
                const sessionResponse = await fetch('/api/session', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: userEmail,
                    userId: userEmail,
                  }),
                })
                
                if (sessionResponse.ok) {
                  console.log('Session token set successfully, redirecting...')
                  window.location.href = '/'
                  return
                } else {
                  console.error('Failed to set session token:', await sessionResponse.text())
                }
              }
            } catch (sessionError) {
              console.error('Error setting session token:', sessionError)
            }
          }
        }
      } catch (error) {
        // ログインしていない場合は何もしない
        console.log('User not logged in, showing login form')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuthStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('=== handleSubmit called ===')
    e.preventDefault()
    setIsLoading(true)
    setError("")
    console.log('Email:', email)
    console.log('Password length:', password.length)

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
        try {
          // Cognito User Poolの設定に合わせて、emailをusernameとして使用
          const signInResult = await signIn({
            username: email.toLowerCase().trim(), // メールアドレスを小文字に変換し、前後の空白を削除
            password: password,
            options: {
              authFlowType: 'USER_SRP_AUTH' // SRP認証フローを明示的に指定
            }
          })
          loginId = email
          console.log('Login successful, user authenticated:', signInResult)
        } catch (signInError: any) {
          // サインインエラーでも、実際に認証されているか確認
          console.warn('signIn threw error, but checking if actually authenticated:', signInError?.message)
          try {
            const currentUser = await getCurrentUser()
            if (currentUser) {
              console.log('User is actually authenticated despite error')
              // @ts-ignore
              loginId = currentUser?.signInDetails?.loginId || email
              signedIn = true
            } else {
              // 本当に認証失敗
              throw signInError
            }
          } catch {
            // 認証確認も失敗したら、元のエラーを投げる
            throw signInError
          }
        }
      }

      // 2) DynamoDBにユーザーが存在するか確認、なければ作成
      try {
        const userEmail = loginId || email
        const dbUser = await getUserByEmail(userEmail)
        
        if (!dbUser) {
          // DynamoDBにユーザーが存在しない場合、Cognitoから情報を取得して作成
          console.log('User not found in DynamoDB, creating...')
          try {
            // 認証が完了していることを確認してから属性を取得
            const attributes = await fetchUserAttributes()
            
            const client = generateClient({ authMode: 'apiKey' })
            await client.graphql({
              query: createUser,
              variables: {
                input: {
                  email: userEmail,
                  firstName: attributes.given_name || '',
                  lastName: attributes.family_name || '',
                }
              },
              authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
            })
            console.log('User created in DynamoDB')
          } catch (attrError: any) {
            // fetchUserAttributesが失敗した場合（認証が完了していない場合など）
            console.warn('Failed to fetch user attributes, creating user with email only:', attrError?.message)
            // メールアドレスのみでユーザーを作成
            const client = generateClient({ authMode: 'apiKey' })
            await client.graphql({
              query: createUser,
              variables: {
                input: {
                  email: userEmail,
                  firstName: '',
                  lastName: '',
                }
              },
              authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
            })
            console.log('User created in DynamoDB with email only')
          }
        }
      } catch (dbError) {
        console.error('DynamoDB user check/create error:', dbError)
        // エラーがあってもログインは続行
      }

      // 3) ログイン成功 - JWTトークンをCookieに設定
      console.log('Login successful, setting session token...')

      // Cognitoセッションが確実にlocalStorageに保存されるまで待機
      await new Promise(resolve => setTimeout(resolve, 500))

      // 認証セッションが確立されたことを確認
      let userEmail = loginId || email
      try {
        const verifyUser = await getCurrentUser()
        console.log('Session verified before setting token:', !!verifyUser)
        
        // ユーザー属性からメールアドレスを取得
        try {
          const attributes = await fetchUserAttributes()
          userEmail = attributes.email || attributes.preferred_username || userEmail
        } catch (attrError) {
          console.warn('Could not fetch user attributes, using loginId:', attrError)
        }
      } catch (e) {
        console.warn('Could not verify session before setting token:', e)
      }

      // JWTトークンをCookieに設定するために/api/sessionエンドポイントを呼び出す
      try {
        const sessionResponse = await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            userId: userEmail, // ユーザーIDとしてメールアドレスを使用
          }),
        })

        if (!sessionResponse.ok) {
          console.error('Failed to set session token:', await sessionResponse.text())
          throw new Error('セッショントークンの設定に失敗しました')
        }

        console.log('Session token set successfully')
      } catch (sessionError) {
        console.error('Error setting session token:', sessionError)
        // セッショントークンの設定に失敗しても、Cognito認証は成功しているので続行
        // ただし、middleware.tsがJWTをチェックするため、リダイレクト後に再度ログインページに戻る可能性がある
      }

      // 4) リダイレクト実行
      console.log('Redirecting to home page...')
      // window.location.hrefを使用してページ全体をリロード
      // これにより、CognitoセッションとJWT Cookieが完全に確立された状態でトップページが読み込まれる
      window.location.href = '/'

    } catch (error: any) {
      console.error("=== Login Error Details ===")
      console.error("Error name:", error?.name)
      console.error("Error message:", error?.message)
      console.error("Error code:", error?.code)
      console.error("Error recoverySuggestion:", error?.recoverySuggestion)
      console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      
      // 既にサインイン済みの場合
      if (error?.name === 'UserAlreadyAuthenticatedException') {
        console.log('User already authenticated, redirecting...')
        router.replace('/')
        return
      }
      
      // ユーザーが存在しない場合
      if (error?.name === 'UserNotFoundException' || error?.message?.includes('User does not exist')) {
        setError('メールアドレスまたはパスワードが正しくありません。アカウントが存在しない可能性があります。')
        setIsLoading(false)
        return
      }
      
      // パスワードが間違っている場合
      if (error?.name === 'NotAuthorizedException' || error?.message?.includes('Incorrect username or password')) {
        setError('メールアドレスまたはパスワードが正しくありません。')
        setIsLoading(false)
        return
      }
      
      // 設定エラーの場合
      if (error?.message?.includes('configuration') || error?.message?.includes('Config') || error?.message?.includes('User pool client')) {
        setError('認証設定に問題があります。ページをリロードするか、管理者にお問い合わせください。')
        setIsLoading(false)
        return
      }
      
      // その他のエラー
      // Cognitoのエラーメッセージを日本語に翻訳
      const translatedError = translateCognitoError(error?.message || error?.toString() || '')
      setError(translatedError || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。')
      setIsLoading(false)
    }
  }

  // 認証チェック中はローディング表示
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <img src="/images/logo.png" alt="Yell Basketball" className="h-16 md:h-20 w-auto mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <img src="/images/logo.png" alt="Yell Basketball" className="h-16 md:h-20 w-auto mx-auto" />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-2xl font-bold text-[#DC0000]">
            ログイン
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-[#F5F5F5] border-0 rounded-lg placeholder:text-gray-400"
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-[#F5F5F5] border-0 rounded-lg placeholder:text-gray-400 pr-12"
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

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-[#DC0000] hover:bg-[#B80000] text-white rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>

          <div className="text-center mt-4">
            <a 
              href="/forgot-password" 
              className="text-[#2563EB] hover:underline text-sm cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                window.location.href = "/forgot-password"
              }}
            >
              パスワードを忘れた場合
            </a>
          </div>

          <div className="text-center mt-6">
            <Link href="/register">
              <Button
                type="button"
                className="w-full h-12 text-base font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg"
              >
                新規アカウント作成
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
