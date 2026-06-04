"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, Settings, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  isAdminLoggedIn,
  isAdminEmail,
  getCurrentUserEmail,
  getShowTeams,
  setShowTeams,
} from "@/lib/api"
import { clearShowTeamsCache } from "@/lib/useShowTeams"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentEmail, setCurrentEmail] = useState("")

  const [showTeams, setShowTeamsState] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      if (isAdminLoggedIn()) {
        setIsAuthorized(true)
        setCurrentEmail("admin")
        setShowTeamsState(await getShowTeams())
        return
      }
      const email = await getCurrentUserEmail()
      if (email && isAdminEmail(email)) {
        setIsAuthorized(true)
        setCurrentEmail(email)
        setShowTeamsState(await getShowTeams())
        return
      }
      setIsAuthorized(false)
    } catch (error) {
      console.error("認証チェックエラー:", error)
      setIsAuthorized(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleTeams(next: boolean) {
    // 楽観的にUIを更新
    setShowTeamsState(next)
    setIsSaving(true)
    try {
      await setShowTeams(next, currentEmail)
      clearShowTeamsCache()
      toast({
        title: "保存しました",
        description: next ? "チームメニューを表示にしました" : "チームメニューを非表示にしました",
      })
    } catch (error: any) {
      setShowTeamsState(!next) // 失敗したら戻す
      toast({ title: "エラー", description: error?.message || "保存に失敗しました", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">アクセス権限がありません</p>
          <Link href="/admin" className="text-blue-500 hover:underline mt-4 inline-block">
            管理者パネルに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-gray-600" />
            <h1 className="text-lg font-bold">サイト設定</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-2 py-6 space-y-4">
        {/* チームメニュー表示 */}
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <Users className="w-5 h-5 text-[#e84b8a] mt-1 shrink-0" />
            <div className="flex-1">
              <div className="font-medium">チームメニューを表示</div>
              <p className="text-sm text-muted-foreground mt-1">
                OFFにすると、サイト内のメニューから「チーム」関連の導線が非表示になります（大会のみで運用）。
                ページ自体は残るため、解禁時はONに戻すだけで復活します。
              </p>
            </div>
            <Switch
              checked={showTeams}
              onCheckedChange={handleToggleTeams}
              disabled={isSaving}
              className="mt-1"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
