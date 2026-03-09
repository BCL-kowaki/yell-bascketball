"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// 個別チャットページは廃止。コンタクト一覧ページに統合。
export default function MessageDetailPage() {
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
