"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Save, Loader2, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { isAdminLoggedIn, isSystemAdmin, getCurrentUserEmail, getSiteSponsors, updateSiteSponsors, type SponsorBanner } from "@/lib/api"
import SponsorBannerEditor from "@/components/sponsor-banner-editor"
import SponsorBannerDisplay from "@/components/sponsor-banner-display"

export default function AdminSponsorsPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [sponsors, setSponsors] = useState<SponsorBanner[]>([])
  const [currentEmail, setCurrentEmail] = useState<string>("")
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      // 固定認証またはCognito管理者チェック
      if (isAdminLoggedIn()) {
        setIsAuthorized(true)
        setCurrentEmail("admin")
        await loadSponsors()
        return
      }

      const email = await getCurrentUserEmail()
      if (email && isSystemAdmin(email)) {
        setIsAuthorized(true)
        setCurrentEmail(email)
        await loadSponsors()
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

  async function loadSponsors() {
    try {
      const data = await getSiteSponsors()
      setSponsors(data)
    } catch (error) {
      console.error("スポンサー読み込みエラー:", error)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    setSaveMessage(null)
    try {
      await updateSiteSponsors(sponsors, currentEmail)
      setSaveMessage("保存しました")
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error("スポンサー保存エラー:", error)
      setSaveMessage("保存に失敗しました")
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
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <Megaphone size={20} className="text-orange-500" />
              <h1 className="text-lg font-bold">YeLL全体スポンサー管理</h1>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
            style={{
              background: 'linear-gradient(135deg, #f7931e 0%, #f06a4e 50%, #e84b8a 100%)',
            }}
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            保存
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 保存メッセージ */}
        {saveMessage && (
          <div className={`p-3 rounded-lg text-sm text-center ${
            saveMessage.includes('失敗') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* 説明 */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">
              YeLL全体のスポンサーバナーを管理します。ここで設定したスポンサーはタイムラインページに表示されます。
              最大5つまで登録できます。
            </p>
          </CardContent>
        </Card>

        {/* スポンサー編集 */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <h2 className="font-semibold">スポンサー編集</h2>
          </CardHeader>
          <CardContent>
            <SponsorBannerEditor
              sponsors={sponsors}
              onChange={setSponsors}
              maxCount={5}
            />
          </CardContent>
        </Card>

        {/* プレビュー */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <h2 className="font-semibold">プレビュー</h2>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <SponsorBannerDisplay
                sponsors={sponsors}
                title="YeLL スポンサー"
                showPlaceholder={true}
                layout="horizontal"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
