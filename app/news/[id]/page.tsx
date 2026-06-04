"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layout } from "@/components/layout"
import { Newspaper, Loader2, ChevronLeft } from "lucide-react"
import { getNews, type DbNotification } from "@/lib/api"

// createdAt を「YYYY年MM月DD日」形式に整形
function formatNewsDate(iso?: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [item, setItem] = useState<DbNotification | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNews(id)
        setItem(data)
      } catch (e) {
        console.error("News取得エラー:", e)
      } finally {
        setIsLoading(false)
      }
    }
    if (id) load()
  }, [id])

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push("/news")}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          お知らせ一覧へ
        </Button>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !item ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              お知らせが見つかりませんでした。
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Newspaper className="w-4 h-4 text-[#e84b8a]" />
                <span>{formatNewsDate(item.createdAt)}</span>
              </div>
              <h1 className="text-2xl font-bold border-b pb-4">{item.title}</h1>
              <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                {item.message}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
