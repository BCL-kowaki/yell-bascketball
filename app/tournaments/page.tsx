"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  Plus,
  Filter,
  MapPin,
  Clock,
  Navigation2
} from "lucide-react"
import { Layout } from "@/components/layout"
import { listTournaments, DbTournament, getCurrentUserEmail } from "@/lib/api"
import { LoginPromptModal } from "@/components/login-prompt"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES, PREFECTURES_BY_REGION } from "@/lib/regionData"
import { REGION_SLUG_TO_NAME, REGION_NAME_TO_SLUG, PREFECTURE_NAME_TO_SLUG } from "@/lib/regionMapping"
import { getCurrentPosition, getNearestPrefecture } from "@/lib/geolocation"

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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ prefecture: string; region: string } | null>(null)
  const [locationLoading, setLocationLoading] = useState(true)

  useEffect(() => {
    loadTournaments()
    // ログイン状態を確認
    const checkAuth = async () => {
      try {
        const email = await getCurrentUserEmail()
        setIsLoggedIn(!!email)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
    // GPS位置情報から現在地を取得
    const detectLocation = async () => {
      try {
        const pos = await getCurrentPosition()
        const loc = getNearestPrefecture(pos.lat, pos.lng)
        setCurrentLocation(loc)
      } catch {
        // 位置情報の取得に失敗（拒否・非対応）→そのまま通常表示
      } finally {
        setLocationLoading(false)
      }
    }
    detectLocation()
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

  // 現在地の地域をトップに並べ替え
  const sortedRegions = currentLocation
    ? [
        ...REGIONS.filter(r => r.name === currentLocation.region),
        ...REGIONS.filter(r => r.name !== currentLocation.region),
      ]
    : REGIONS

  // 現在地の都道府県のslug
  const currentPrefectureSlug = currentLocation
    ? PREFECTURE_NAME_TO_SLUG[currentLocation.prefecture]
    : null
  const currentRegionSlug = currentLocation
    ? REGION_NAME_TO_SLUG[currentLocation.region]
    : null

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
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
              if (!isLoggedIn) {
                setShowLoginModal(true)
                return
              }
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

        {/* 現在地バナー */}
        {currentLocation && currentRegionSlug && currentPrefectureSlug && (
          <div className="mb-4">
            <Link href={`/tournaments/${currentRegionSlug}/${currentPrefectureSlug}`}>
              <div className="rounded-lg p-4 border border-[#e8d6c0] hover:shadow-md transition-all cursor-pointer" style={{ backgroundColor: "#fcf4e7" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Navigation2 className="w-4 h-4" style={{ color: "#f06a4e" }} />
                  <span className="text-xs font-medium" style={{ color: "#888" }}>現在地付近</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold" style={{ color: "#1e1e1e" }}>{currentLocation.prefecture}の大会を見る</p>
                    <p className="text-sm" style={{ color: "#888" }}>{currentLocation.region}エリア</p>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: "#f06a4e" }} />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regions Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5" style={{ color: "#f06a4e" }} />
            <h2 className="text-xl font-bold" style={{ color: "#1e1e1e" }}>地域から探す</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: "#f06a4e" }}></div>
              <p className="mt-4 text-gray-500">読み込み中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {sortedRegions.map((region) => {
                const count = regionCounts[region.slug] || 0
                const isCurrentRegion = currentLocation?.region === region.name
                return (
                  <Link key={region.id} href={`/tournaments/${region.slug}`}>
                    <Card
                      className={`hover:shadow-md transition-all duration-300 cursor-pointer group h-full ${isCurrentRegion ? "border-[#f06a4e]/30" : ""}`}
                      style={isCurrentRegion ? { backgroundColor: "#fcf4e7" } : {}}
                    >
                      <CardHeader className="pt-3 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isCurrentRegion && <Navigation2 className="w-4 h-4" style={{ color: "#f06a4e" }} />}
                            <CardTitle className="text-xl font-bold" style={{ color: "#1e1e1e" }}>
                              {region.name}
                            </CardTitle>
                          </div>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1">
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" style={{ color: "#f06a4e" }} />
                            <span className="text-sm font-medium">登録大会数:</span>
                            <span className="text-lg font-bold" style={{ color: "#f06a4e" }}>{count}件</span>
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

      {/* ログイン促進モーダル */}
      <LoginPromptModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        action="大会を登録"
      />
    </Layout>
  )
}