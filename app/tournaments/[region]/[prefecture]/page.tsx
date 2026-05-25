"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Trophy,
  Calendar,
  Shield,
  Swords
} from "lucide-react"
import { Layout } from "@/components/layout"
import { listTournaments, DbTournament, getCurrentUserEmail } from "@/lib/api"
import { REGION_SLUG_TO_NAME, PREFECTURE_SLUG_TO_NAME } from "@/lib/regionMapping"
import { refreshS3Url } from "@/lib/storage"
import { LoginPromptModal } from "@/components/login-prompt"
import { OFFICIAL_AREAS_BY_PREFECTURE } from "@/lib/regionData"

// 大会カード
function TournamentCard({ tournament }: { tournament: DbTournament }) {
  const isOfficial = tournament.tournamentType === "official"
  // 公式戦=オレンジ系、カップ戦=青系のプレースホルダー背景
  const placeholderBg = isOfficial
    ? "bg-gradient-to-br from-orange-400 to-red-400"
    : "bg-gradient-to-br from-blue-400 to-indigo-500"
  const PlaceholderIcon = isOfficial ? Shield : Swords

  return (
    <Link href={`/tournaments/detail/${tournament.id}`}>
      <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group h-full overflow-hidden py-0">
        <div className={`relative w-full h-32 overflow-hidden ${tournament.coverImage ? "" : placeholderBg}`}>
          {tournament.coverImage ? (
            <>
              <img
                src={tournament.coverImage}
                alt={tournament.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  // 画像読み込み失敗時はプレースホルダー表示に切り替え
                  const wrapper = e.currentTarget.parentElement
                  if (wrapper) {
                    wrapper.classList.add(...placeholderBg.split(" "))
                    e.currentTarget.style.display = "none"
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlaceholderIcon className="w-12 h-12 text-white/60 group-hover:scale-110 transition-transform duration-300" />
            </div>
          )}
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mt-3">
            <CardTitle className="text-lg font-bold group-hover:text-red-600 transition-colors">
              {tournament.name}
            </CardTitle>
            <div className="flex items-center gap-1 flex-shrink-0">
              {tournament.tournamentType === "official" && (
                <Badge className="bg-[#f06a4e] text-white text-xs">公式</Badge>
              )}
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {tournament.category && (
            <Badge variant="secondary" className="text-xs">{tournament.category}</Badge>
          )}
          {tournament.tournamentType === "official" && (tournament.area || tournament.subArea) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{[tournament.area, tournament.subArea].filter(Boolean).join(" / ")}</span>
            </div>
          )}
          {(!tournament.tournamentType || tournament.tournamentType === "cup") && tournament.district && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{tournament.district}</span>
            </div>
          )}
          {tournament.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{tournament.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

// ビュー: "hub" = 公式/カップ選択, "official" = 公式戦エリア階層, "cup" = カップ戦一覧
type ViewMode = "hub" | "official" | "cup"

export default function PrefectureTournamentsPage() {
  const params = useParams()
  const regionSlug = params.region as string
  const prefectureSlug = params.prefecture as string
  const regionName = REGION_SLUG_TO_NAME[regionSlug]
  const prefectureName = PREFECTURE_SLUG_TO_NAME[prefectureSlug] || prefectureSlug

  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get("type")
  const initialViewMode: ViewMode =
    typeParam === "official" ? "official" : typeParam === "cup" ? "cup" : "hub"

  const [tournaments, setTournaments] = useState<DbTournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [selectedSubArea, setSelectedSubArea] = useState<string | null>(null)

  // URL クエリ `?type=` の変化に追従（戻る/進む対応）
  useEffect(() => {
    if (typeParam === "official") {
      setViewMode("official")
    } else if (typeParam === "cup") {
      setViewMode("cup")
    } else {
      setViewMode("hub")
    }
    setSelectedArea(null)
    setSelectedSubArea(null)
  }, [typeParam])

  // {prefecture}にUUIDが入っている古いリンクからのアクセスは大会詳細ページへリダイレクト
  // (例: /tournaments/九州・沖縄/9b10c08b-... → /tournaments/detail/9b10c08b-...)
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const isUuidPrefecture = prefectureSlug && UUID_REGEX.test(prefectureSlug)

  useEffect(() => {
    if (isUuidPrefecture) {
      router.replace(`/tournaments/detail/${prefectureSlug}`)
      return
    }
    if (regionName && prefectureName) {
      loadTournaments()
    }
    const checkAuth = async () => {
      try {
        const email = await getCurrentUserEmail()
        setIsLoggedIn(!!email)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [regionName, prefectureName, isUuidPrefecture, prefectureSlug])

  async function loadTournaments() {
    if (!regionName || !prefectureName) return

    try {
      setIsLoading(true)
      const allTournaments = await listTournaments(1000, { isApproved: true })

      // 指定された地域と都道府県の大会のみフィルター
      const filteredTournaments = allTournaments.filter(
        t => t.regionBlock === regionName && t.prefecture === prefectureName
      )

      // 画像URLを更新
      const tournamentsWithRefreshedImages = await Promise.all(
        filteredTournaments.map(async (tournament) => {
          const updatedTournament = { ...tournament }
          if (updatedTournament.iconUrl && !updatedTournament.iconUrl.startsWith('data:') && !updatedTournament.iconUrl.startsWith('blob:')) {
            try {
              updatedTournament.iconUrl = await refreshS3Url(updatedTournament.iconUrl) || updatedTournament.iconUrl
            } catch (error) {
              console.error('Failed to refresh icon URL:', error)
            }
          }
          if (updatedTournament.coverImage && !updatedTournament.coverImage.startsWith('data:') && !updatedTournament.coverImage.startsWith('blob:')) {
            try {
              updatedTournament.coverImage = await refreshS3Url(updatedTournament.coverImage) || updatedTournament.coverImage
            } catch (error) {
              console.error('Failed to refresh cover image URL:', error)
            }
          }
          return updatedTournament
        })
      )

      setTournaments(tournamentsWithRefreshedImages)
    } catch (error) {
      console.error("Failed to load tournaments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 大会を公式戦とカップ戦に分類
  const officialTournaments = tournaments.filter(t => t.tournamentType === "official")
  const cupTournaments = tournaments.filter(t => !t.tournamentType || t.tournamentType === "cup")

  // カップ戦を開催期間が直近の順にソート
  const sortedCupTournaments = [...cupTournaments].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
    return dateB - dateA // 直近順（降順）
  })

  // 公式戦のエリア階層データ
  const areaHierarchy = OFFICIAL_AREAS_BY_PREFECTURE[prefectureName] || null

  // 選択されたエリア＆サブエリアに該当する公式大会をフィルター
  const filteredOfficialTournaments = officialTournaments.filter(t => {
    if (selectedSubArea) return t.area === selectedArea && t.subArea === selectedSubArea
    if (selectedArea) return t.area === selectedArea
    return true
  })

  // UUID形式の場合はリダイレクト中のローディング表示
  if (isUuidPrefecture) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">大会詳細を読み込み中...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!regionName || !prefectureName) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">都道府県が見つかりません</p>
            <Link href="/tournaments">
              <Button className="mt-4">大会トップに戻る</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6">
        {/* Breadcrumb（大会トップへの戻りのみ） */}
        <div className="flex items-center gap-2 mb-2 text-sm flex-wrap px-2 md:px-6">
          <Link href="/tournaments" className="text-gray-500 hover:text-gray-700">
            大会トップ
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="font-medium" style={{ color: "#f06a4e" }}>{prefectureName}</span>
        </div>

        {/* Header - コンパクト1行表示 */}
        <div className="mb-4 px-2 md:px-6">
          <div className="rounded-lg px-4 py-2 border border-[#e8d6c0] flex items-center gap-2" style={{ backgroundColor: "#fcf4e7" }}>
            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#f06a4e" }} />
            <h1 className="text-base font-bold" style={{ color: "#1e1e1e" }}>
              {prefectureName}の大会
            </h1>
            <span className="text-base font-bold" style={{ color: "#f06a4e" }}>
              {tournaments.length}件
            </span>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: "#f06a4e" }}></div>
            <p className="mt-4 text-gray-500">読み込み中...</p>
          </div>
        )}

        {/* ====== HUB VIEW: 公式戦 / カップ戦 選択 ====== */}
        {!isLoading && viewMode === "hub" && (
          <div className="space-y-4">
            {/* 2つの大きなカード */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {/* 公式戦カード */}
              <div
                onClick={() => setViewMode("official")}
                className="cursor-pointer rounded-xl border-2 border-gray-200 hover:border-[#f06a4e] bg-white hover:bg-orange-50 transition-all duration-200 p-6 flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f7931e 0%, #e84b8a 100%)" }}>
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 group-hover:text-[#f06a4e] transition-colors">
                  公式戦を見る
                </h2>
                <p className="text-sm text-gray-500 text-center">
                  エリア別に公式大会を探す
                </p>
                <Badge className="bg-[#f06a4e] text-white">
                  {officialTournaments.length}件
                </Badge>
              </div>

              {/* カップ戦カード */}
              <div
                onClick={() => setViewMode("cup")}
                className="cursor-pointer rounded-xl border-2 border-gray-200 hover:border-[#3b82f6] bg-white hover:bg-blue-50 transition-all duration-200 p-6 flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Swords className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  カップ戦を見る
                </h2>
                <p className="text-sm text-gray-500 text-center">
                  開催日が近い順に表示
                </p>
                <Badge className="bg-blue-500 text-white">
                  {cupTournaments.length}件
                </Badge>
              </div>
            </div>

            {/* 大会がない場合 */}
            {tournaments.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">まだ大会が登録されていません</p>
                {isLoggedIn ? (
                  <Link href="/tournaments/create">
                    <Button className="mt-4">新規大会を登録</Button>
                  </Link>
                ) : (
                  <Button className="mt-4" onClick={() => setShowLoginModal(true)}>
                    新規大会を登録
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ====== OFFICIAL VIEW: 公式戦エリア階層 ====== */}
        {!isLoading && viewMode === "official" && (
          <div className="space-y-4">
            {/* エリア階層データがある場合 */}
            {areaHierarchy && !selectedArea && (
              <>
                <h2 className="text-sm font-bold text-gray-600 mb-2">
                  エリアを選択してください
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {Object.keys(areaHierarchy).map((areaName) => {
                    const subAreas = areaHierarchy[areaName]
                    const areaCount = officialTournaments.filter(t => t.area === areaName).length
                    return (
                      <div
                        key={areaName}
                        onClick={() => setSelectedArea(areaName)}
                        className="cursor-pointer rounded-lg border border-gray-200 hover:border-[#f06a4e] bg-white hover:bg-orange-50 transition-all duration-200 p-4 group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 flex-shrink-0" style={{ color: "#f06a4e" }} />
                          <h3 className="font-bold text-gray-800 group-hover:text-[#f06a4e] transition-colors">
                            {areaName}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                          {subAreas.join("・")}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{areaCount}件</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* エリア選択済み → サブエリア一覧 */}
            {areaHierarchy && selectedArea && !selectedSubArea && (
              <>
                <h2 className="text-sm font-bold text-gray-600 mb-2">
                  {selectedArea}のエリアを選択してください
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {areaHierarchy[selectedArea]?.map((subAreaName) => {
                    const subAreaCount = officialTournaments.filter(
                      t => t.area === selectedArea && t.subArea === subAreaName
                    ).length
                    return (
                      <div
                        key={subAreaName}
                        onClick={() => setSelectedSubArea(subAreaName)}
                        className="cursor-pointer rounded-lg border border-gray-200 hover:border-[#f06a4e] bg-white hover:bg-orange-50 transition-all duration-200 p-4 group"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800 group-hover:text-[#f06a4e] transition-colors">
                            {subAreaName}
                          </h3>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">{subAreaCount}件</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* このエリアの全大会も表示 */}
                {filteredOfficialTournaments.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-gray-600 mb-2">
                      {selectedArea}の公式大会 ({filteredOfficialTournaments.length}件)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filteredOfficialTournaments.map((tournament) => (
                        <TournamentCard key={tournament.id} tournament={tournament} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* サブエリア選択済み → 大会一覧 */}
            {selectedArea && selectedSubArea && (
              <>
                <h2 className="text-sm font-bold text-gray-600 mb-2">
                  {selectedArea} / {selectedSubArea}の公式大会 ({filteredOfficialTournaments.length}件)
                </h2>
                {filteredOfficialTournaments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {filteredOfficialTournaments.map((tournament) => (
                      <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">このエリアにはまだ公式大会が登録されていません</p>
                  </div>
                )}
              </>
            )}

            {/* エリア階層データがない都道府県 */}
            {!areaHierarchy && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-700">
                    {prefectureName}のエリア分類は準備中です。公式大会は一覧で表示されます。
                  </p>
                </div>
                {officialTournaments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {officialTournaments.map((tournament) => (
                      <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">まだ公式大会が登録されていません</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ====== CUP VIEW: カップ戦一覧（直近順） ====== */}
        {!isLoading && viewMode === "cup" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-600 mb-2">
              カップ戦 ({cupTournaments.length}件) — 開催日が近い順
            </h2>
            {sortedCupTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {sortedCupTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Swords className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">まだカップ大会が登録されていません</p>
                {isLoggedIn ? (
                  <Link href="/tournaments/create">
                    <Button className="mt-4">新規大会を登録</Button>
                  </Link>
                ) : (
                  <Button className="mt-4" onClick={() => setShowLoginModal(true)}>
                    新規大会を登録
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <Link href="/tournaments">
            <Button variant="outline" className="px-6 py-3">
              <ChevronLeft className="w-4 h-4 mr-2" />
              大会トップへ戻る
            </Button>
          </Link>
        </div>
      </div>

      <LoginPromptModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        action="大会を登録"
      />
    </Layout>
  )
}
