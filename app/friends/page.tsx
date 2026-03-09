"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// フレンド機能は廃止。大会ポータルサイトの方針に合わせ、コンタクト機能に統合。
export default function FriendsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/messages")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">リダイレクト中...</p>
    </div>
  )
}
