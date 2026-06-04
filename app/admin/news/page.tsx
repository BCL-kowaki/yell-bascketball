"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, Newspaper, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  isAdminLoggedIn,
  isAdminEmail,
  getCurrentUserEmail,
  listNews,
  createNews,
  deleteNews,
  type DbNotification,
} from "@/lib/api"
import { broadcastPushToAll } from "@/lib/push-sender"

function formatNewsDate(iso?: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}.${m}.${day}`
}

export default function AdminNewsPage() {
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [news, setNews] = useState<DbNotification[]>([])

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      if (isAdminLoggedIn()) {
        setIsAuthorized(true)
        await loadNews()
        return
      }
      const email = await getCurrentUserEmail()
      if (email && isAdminEmail(email)) {
        setIsAuthorized(true)
        await loadNews()
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

  async function loadNews() {
    try {
      const items = await listNews()
      setNews(items)
    } catch (error) {
      console.error("News読み込みエラー:", error)
    }
  }

  async function handlePost() {
    if (!title.trim()) {
      toast({ title: "エラー", description: "タイトルを入力してください", variant: "destructive" })
      return
    }
    if (!body.trim()) {
      toast({ title: "エラー", description: "本文を入力してください", variant: "destructive" })
      return
    }
    setIsPosting(true)
    try {
      const created = await createNews({ title: title.trim(), body: body.trim() })
      // 全ユーザーへプッシュ通知をブロードキャスト（非ブロッキング・失敗しても投稿は成立）
      broadcastPushToAll({
        title: "運営本部からのお知らせ",
        body: title.trim(),
        url: created?.id ? `/news/${created.id}` : "/news",
        tag: "yell-news",
      }).catch((e) => console.error("お知らせのプッシュ配信に失敗:", e))
      toast({ title: "投稿しました", description: "お知らせを公開し、全ユーザーへ通知を送信しました" })
      setTitle("")
      setBody("")
      await loadNews()
    } catch (error: any) {
      toast({ title: "エラー", description: error?.message || "投稿に失敗しました", variant: "destructive" })
    } finally {
      setIsPosting(false)
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`「${title}」を削除しますか？`)) return
    try {
      await deleteNews(id)
      setNews((prev) => prev.filter((n) => n.id !== id))
      toast({ title: "削除しました" })
    } catch (error: any) {
      toast({ title: "エラー", description: error?.message || "削除に失敗しました", variant: "destructive" })
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
            <Newspaper size={20} className="text-sky-500" />
            <h1 className="text-lg font-bold">お知らせ管理</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-2 py-6 space-y-6">
        {/* 投稿フォーム */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="font-semibold">新しいお知らせを投稿</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium block">タイトル</label>
              <Input
                placeholder="お知らせのタイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPosting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium block">本文</label>
              <Textarea
                placeholder="お知らせの本文"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                disabled={isPosting}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handlePost} disabled={isPosting} className="gap-2 bg-sky-600 hover:bg-sky-700 text-white">
                {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                投稿する
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 既存のお知らせ一覧 */}
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b font-semibold text-sm">投稿済みのお知らせ（{news.length}件）</div>
            {news.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">まだお知らせがありません</div>
            ) : (
              <div className="divide-y">
                {news.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-4">
                    <span className="text-sm text-muted-foreground tabular-nums shrink-0 w-[88px]">
                      {formatNewsDate(item.createdAt)}
                    </span>
                    <span className="flex-1 min-w-0 font-medium truncate">{item.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 shrink-0"
                      onClick={() => handleDelete(item.id, item.title)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
