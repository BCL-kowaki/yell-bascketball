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
  Filter,
  MapPin,
  Clock
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

  const totalTournaments = selectedCategory === "all"
    ? tournaments.length
    : tournaments.filter(t => t.category === selectedCategory).length

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
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

        {/* Statistics */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">全国の大会</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{totalTournaments}件</p>
          </div>
        </div>

        {/* Regions Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">地域から探す</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">読み込み中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {REGIONS.map((region) => {
                const count = regionCounts[region.slug] || 0
                return (
                  <Link key={region.id} href={`/tournaments/${region.slug}`}>
                    <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group h-full">
                      <CardHeader className="pt-3 pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold">
                            {region.name}
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
      </div>
    </Layout>
  )
}