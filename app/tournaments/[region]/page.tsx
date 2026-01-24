"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MapPin,
  ChevronRight,
  ChevronLeft,
  Clock,
  Trophy,
  Calendar,
  Users,
  Mail
} from "lucide-react"
import { Layout } from "@/components/layout"
import { listTournaments, type DbTournament } from "@/lib/api"
import { PREFECTURES_BY_REGION } from "@/lib/regionData"
import { REGION_SLUG_TO_NAME, PREFECTURE_NAME_TO_SLUG } from "@/lib/regionMapping"

// UUID形式のチェック（例: 31a08672-9241-4999-b0f4-03c3a3b00c02）
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// 大会詳細ページコンポーネントを動的にインポート
const TournamentDetailPage = dynamic(() => import("../_id_backup/page"), {
  loading: () => (
    <Layout>
      <div className="max-w-6xl mx-auto pb-20 px-4 pt-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    </Layout>
  ),
  ssr: false
})

export default function RegionTournamentsPage() {
  const params = useParams()
  const regionSlug = params.region as string

  // UUID形式の場合は、大会詳細ページコンポーネントを表示
  // Next.jsのルーティングで[region]と[id]が競合しているため、
  // このページ内でUUIDの場合の処理を行う
  if (regionSlug && UUID_REGEX.test(regionSlug)) {
    console.log('RegionTournamentsPage: UUID detected, rendering TournamentDetailPage component')
    return <TournamentDetailPage />
  }

  const regionName = REGION_SLUG_TO_NAME[regionSlug]

  const [tournaments, setTournaments] = useState<DbTournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tournamentCounts, setTournamentCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (regionName) {
      loadTournaments()
    }
  }, [regionName])

  async function loadTournaments() {
    if (!regionName) return
    
    try {
      setIsLoading(true)
      const allTournaments = await listTournaments(1000)

      // 指定された地域の大会のみフィルター
      const regionTournaments = allTournaments.filter(
        t => t.regionBlock === regionName
      )
      setTournaments(regionTournaments)

      // 都道府県ごとの大会数をカウント
      const counts: Record<string, number> = {}
      regionTournaments.forEach(tournament => {
        const pref = tournament.prefecture || ""
        if (pref) {
          counts[pref] = (counts[pref] || 0) + 1
        }
      })
      setTournamentCounts(counts)
    } catch (error) {
      console.error("Failed to load tournaments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!regionName) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-2 py-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">地域が見つかりません</p>
            <Link href="/tournaments">
              <Button className="mt-4">大会トップに戻る</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const prefectures = PREFECTURES_BY_REGION[regionName] || []

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/tournaments" className="text-gray-500 hover:text-gray-700">
            大会トップ
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-red-600 font-medium">{regionName}エリア</span>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">{regionName}エリアの大会</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{tournaments.length}件</p>
          </div>
        </div>

        {/* All Prefectures - Unified Layout */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">都道府県から探す</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">読み込み中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {prefectures.map((prefectureName) => {
                const prefectureSlug = PREFECTURE_NAME_TO_SLUG[prefectureName] || prefectureName.toLowerCase().replace(/[県府都]/g, "")
                const count = tournamentCounts[prefectureName] || 0
                return (
                  <Link key={prefectureName} href={`/tournaments/${regionSlug}/${prefectureSlug}`}>
                    <Card className="border-0 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:scale-105 h-full">
                      <CardHeader className="pt-3 pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold">
                            {prefectureName}
                          </CardTitle>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1">
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium">登録大会数:</span>
                            <span className="text-lg font-bold text-red-600">{count}件</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link href="/tournaments">
            <Button variant="outline" className="px-6 py-3">
              <ChevronLeft className="w-4 h-4 mr-2" />
              地域選択に戻る
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
