"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { Newspaper, Loader2, ChevronRight } from "lucide-react"
import { listNews, type DbNotification } from "@/lib/api"

// createdAt を「YYYY.MM.DD」形式に整形
function formatNewsDate(iso?: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}.${m}.${day}`
}

export default function NewsListPage() {
  const [news, setNews] = useState<DbNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const items = await listNews()
        setNews(items)
      } catch (e) {
        console.error("News取得エラー:", e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center gap-2 mb-6">
          <Newspaper className="w-6 h-6 text-[#e84b8a]" />
          <h1 className="text-2xl font-bold">運営本部からのお知らせ</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : news.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              現在お知らせはありません。
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 divide-y">
              {news.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-muted-foreground tabular-nums shrink-0 w-[88px]">
                    {formatNewsDate(item.createdAt)}
                  </span>
                  <span className="flex-1 min-w-0 font-medium truncate">{item.title}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
