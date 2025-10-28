"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth"
import { generateClient } from 'aws-amplify/api'
import { createUser } from '@/src/graphql/mutations'
import { HeaderNavigation } from "@/components/header-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"

function ConfirmSignUpForm() {
  ensureAmplifyConfigured()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const firstName = searchParams.get("firstName") || ""
  const lastName = searchParams.get("lastName") || ""

  const [confirmationCode, setConfirmationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    if (!email || !firstName || !lastName) {
      setError("ユーザー情報が見つかりません。登録をやり直してください。")
      setIsLoading(false)
      return
    }

    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode,
      })

      if (isSignUpComplete || nextStep.signUpStep === 'DONE') {
        const client = generateClient()
        await client.graphql({
          query: createUser,
          variables: {
            input: {
              email: email,
              firstName: firstName,
              lastName: lastName,
            }
          }
        })

        toast({
          title: "登録が完了しました！",
          description: "ログインページに移動します。",
        })
        router.push("/login")
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <HeaderNavigation isLoggedIn={false} />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>アカウントの確認</CardTitle>
              <CardDescription>
                {email} に送信された6桁の確認コードを入力してください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center">
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
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md text-center">
                    {error}
                  </div>
                )}

                <Button type="submit" variant="secondary" className="w-full h-12 text-lg" disabled={isLoading || confirmationCode.length < 6}>
                  {isLoading ? "確認中..." : "確認して登録"}
                </Button>
              </form>

              <div className="text-center mt-6">
                <Button variant="link" onClick={handleResendCode} className="text-sm">
                  確認コードが届かない場合
                </Button>
              </div>
            </CardContent>
          </Card>
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
