"use client"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  Plus,
  Filter,
  MapPin,
  Shield,
  Swords,
} from "lucide-react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
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
import {
  REGION_SLUG_TO_NAME,
  PREFECTURE_NAME_TO_SLUG,
} from "@/lib/regionMapping"

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

// 大会を地域→都道府県→{公式戦, カップ戦} に集計するための型
type PrefectureCounts = {
  prefectureName: string
  prefectureSlug: string
  total: number
  official: number
  cup: number
}

type RegionCounts = {
  total: number
  prefectures: PrefectureCounts[]
}

export default function TournamentsPage() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<DbTournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

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
  }, [])

  async function loadTournaments() {
    try {
      setIsLoading(true)
      const allTournaments = await listTournaments(1000, { isApproved: true })
      setTournaments(allTournaments)
    } catch (error) {
      console.error("Failed to load tournaments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 地域 → 都道府県 → (公式戦/カップ戦) の集計
  const regionData = useMemo<Record<string, RegionCounts>>(() => {
    const filtered = selectedCategory === "all"
      ? tournaments
      : tournaments.filter(t => t.category === selectedCategory)

    const result: Record<string, RegionCounts> = {}

    REGIONS.forEach(region => {
      const regionName = REGION_SLUG_TO_NAME[region.slug]
      const prefectureNames = PREFECTURES_BY_REGION[regionName] || []

      const prefectures: PrefectureCounts[] = prefectureNames.map(prefName => {
        const prefTournaments = filtered.filter(
          t => t.regionBlock === regionName && t.prefecture === prefName
        )
        const officialCount = prefTournaments.filter(
          t => t.tournamentType === "official"
        ).length
        const cupCount = prefTournaments.filter(
          t => !t.tournamentType || t.tournamentType === "cup"
        ).length

        return {
          prefectureName: prefName,
          prefectureSlug: PREFECTURE_NAME_TO_SLUG[prefName] || prefName,
          total: prefTournaments.length,
          official: officialCount,
          cup: cupCount,
        }
      })

      const regionTotal = prefectures.reduce((sum, p) => sum + p.total, 0)

      result[region.slug] = {
        total: regionTotal,
        prefectures,
      }
    })

    return result
  }, [tournaments, selectedCategory])

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 px-2 md:px-6">
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

        {/* Regions Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2 px-2 md:px-6">
            <MapPin className="w-5 h-5" style={{ color: "#f06a4e" }} />
            <h2 className="text-xl font-bold" style={{ color: "#1e1e1e" }}>地域から探す</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: "#f06a4e" }}></div>
              <p className="mt-4 text-gray-500">読み込み中...</p>
            </div>
          ) : (
            <div className="px-2 md:px-6">
              {/* 地域アコーディオン */}
              <Accordion type="single" collapsible className="bg-white rounded-lg border border-gray-200 divide-y">
                {REGIONS.map((region) => {
                  const data = regionData[region.slug]
                  const total = data?.total || 0
                  const prefs = data?.prefectures || []
                  return (
                    <AccordionItem
                      key={region.id}
                      value={region.slug}
                      className="border-b-0 px-4"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full pr-2">
                          <span className="text-lg font-bold" style={{ color: "#1e1e1e" }}>
                            {region.name}
                          </span>
                          <span className="text-sm font-semibold" style={{ color: "#f06a4e" }}>
                            {total}件
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {/* 都道府県アコーディオン */}
                        <Accordion type="single" collapsible className="bg-gray-50 rounded-md divide-y divide-gray-200">
                          {prefs.map((pref) => (
                            <AccordionItem
                              key={pref.prefectureSlug}
                              value={pref.prefectureSlug}
                              className="border-b-0 px-3"
                            >
                              <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center justify-between w-full pr-2">
                                  <span className="text-base font-medium text-gray-800">
                                    {pref.prefectureName}
                                  </span>
                                  <span className="text-sm font-semibold" style={{ color: "#f06a4e" }}>
                                    {pref.total}件
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                {/* 公式戦 / カップ戦 のリンク */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-1">
                                  <Link
                                    href={`/tournaments/${region.slug}/${pref.prefectureSlug}?type=official`}
                                    className="flex items-center justify-between rounded-md border border-gray-200 bg-white hover:border-[#f06a4e] hover:bg-orange-50 transition-colors px-3 py-2 group"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: "linear-gradient(135deg, #f7931e 0%, #e84b8a 100%)" }}
                                      >
                                        <Shield className="w-3.5 h-3.5 text-white" />
                                      </div>
                                      <span className="text-sm font-medium text-gray-800">公式戦</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-semibold" style={{ color: "#f06a4e" }}>
                                        {pref.official}件
                                      </span>
                                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                  </Link>
                                  <Link
                                    href={`/tournaments/${region.slug}/${pref.prefectureSlug}?type=cup`}
                                    className="flex items-center justify-between rounded-md border border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 transition-colors px-3 py-2 group"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600">
                                        <Swords className="w-3.5 h-3.5 text-white" />
                                      </div>
                                      <span className="text-sm font-medium text-gray-800">カップ戦</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-semibold text-blue-600">
                                        {pref.cup}件
                                      </span>
                                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                  </Link>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
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
