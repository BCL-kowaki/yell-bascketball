"use client"
import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Layout } from "@/components/layout"

/**
 * /tournaments/[region] のリダイレクト専用ページ
 *
 * 旧来の3階層ナビゲーション（地域→都道府県→大会）は廃止され、
 * /tournaments のトップでアコーディオン表示に統合された。
 *
 * このページは下記2用途のみで残している:
 *   1. /tournaments/{UUID} 形式の旧リンクを /tournaments/detail/{UUID} に振り替える
 *      （プッシュ通知・通知ページ・listページの旧URLとの後方互換）
 *   2. それ以外（地域スラッグなど）はトップの /tournaments にリダイレクト
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function RegionRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const regionSlug = params.region as string

  useEffect(() => {
    if (!regionSlug) return
    if (UUID_REGEX.test(regionSlug)) {
      router.replace(`/tournaments/detail/${regionSlug}`)
    } else {
      router.replace("/tournaments")
    }
  }, [regionSlug, router])

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pb-20 px-4 pt-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    </Layout>
  )
}
