"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  Plus,
  Trophy,
  Filter
} from "lucide-react"
import { Layout } from "@/components/layout"
import { listTournaments, DbTournament } from "@/lib/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES } from "@/lib/regionData"
import { REGION_SLUG_TO_NAME } from "@/lib/regionMapping"

// ハードコードされた地域リスト（Regionテーブルが空の場合に使用）
const REGIONS = [
  { id: "hokkaido", name: "北海道", slug: "hokkaido", sortOrder: 1 },
  { id: "tohoku", name: "東北", slug: "tohoku", sortOrder: 2 },
  { id: "kanto", name: "関東", slug: "kanto", sortOrder: 3 },
  { id: "hokushinetsu", name: "北信越", slug: "hokushinetsu", sortOrder: 4 },
  { id: "tokai", name: "東海", slug: "tokai", sortOrder: 5 },
  { id: "kinki", name: "近畿", slug: "kinki", sortOrder: 6 },
  { id: "chugoku", name: "中国", slug: "chugoku", sortOrder: 7 },
  { id: "shikoku", name: "四国", slug: "shikoku", sortOrder: 8 },
  { id: "kyushu", name: "九州・沖縄", slug: "kyushu", sortOrder: 9 },
]

export default function TournamentsPage() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<DbTournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [regionCounts, setRegionCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    loadTournaments()
  }, [])

  useEffect(() => {
    calculateRegionCounts()
  }, [tournaments, selectedCategory])

  async function loadTournaments() {
    try {
      setIsLoading(true)
      const allTournaments = await listTournaments(1000)
      console.log("📊 Total tournaments loaded:", allTournaments.length)
      if (allTournaments.length > 0) {
        console.log("📝 First tournament sample:", allTournaments[0])
        console.log("🗺️ All tournament regionBlocks:", allTournaments.map(t => t.regionBlock))
      }
      setTournaments(allTournaments)
    } catch (error) {
      console.error("Failed to load tournaments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function calculateRegionCounts() {
    const counts: Record<string, number> = {}
    const filteredTournaments = selectedCategory === "all"
      ? tournaments
      : tournaments.filter(t => t.category === selectedCategory)

    console.log("🔍 Calculating region counts for", filteredTournaments.length, "tournaments")

    // 地域名からslugへのマッピング（REGION_SLUG_TO_NAMEの逆マッピング）
    const regionNameToSlug: Record<string, string> = {}
    Object.entries(REGION_SLUG_TO_NAME).forEach(([slug, name]) => {
      regionNameToSlug[name] = slug
    })

    filteredTournaments.forEach(tournament => {
      const regionBlock = tournament.regionBlock || ""
      const slug = regionNameToSlug[regionBlock]
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1
      } else {
        console.warn("⚠️ Unknown regionBlock:", regionBlock, "for tournament:", tournament.name)
      }
    })

    console.log("✅ Final region counts:", counts)
    setRegionCounts(counts)
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pt-2 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 px-2 md:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">大会一覧</h1>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={async () => {
              try {
                await router.push('/tournaments/create')
              } catch (error) {
                console.error('Failed to navigate to create tournament page:', error)
              }
            }}
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規大会登録
          </Button>
        </div>

        {/* Regions Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">読み込み中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 px-2 md:px-6">
            {REGIONS.map((region) => {
              const count = regionCounts[region.slug] || 0
              return (
                <Link key={region.id} href={`/tournaments/${region.slug}`}>
                  <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group">
                    <CardHeader className="pt-3 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold">
                          {region.name}
                        </CardTitle>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Tournament Count */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">登録大会数</span>
                        <span className="text-xl font-bold text-red-600">{count}件</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {/* Bottom Info */}
        {/* <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-100 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)]">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">大会主催者の皆様へ</h3>
            <p className="text-gray-600 text-sm mb-4">
              新しい大会の登録や既存大会の管理は、各地域ページからアクセスできます。<br />
              多くのチームが参加できる素晴らしい大会を一緒に作り上げましょう！
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">大会主催者</Badge>
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">クラブチーム</Badge>
              <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white">ゲスト</Badge>
            </div>
          </div>
        </div> */}
      </div>
    </Layout>
  )
}