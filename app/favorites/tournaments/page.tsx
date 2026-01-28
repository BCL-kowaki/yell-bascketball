"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Search,
  MapPin,
  Calendar,
  ChevronRight,
  Filter,
  Heart,
  Loader2,
  Users,
  Clock
} from "lucide-react"
import { Layout } from "@/components/layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUserFavorites, getCurrentUserEmail, type DbTournament } from "@/lib/api"
import { REGION_BLOCKS, PREFECTURES_BY_REGION, CATEGORIES } from "@/lib/regionData"

export default function FavoriteTournamentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedPrefecture, setSelectedPrefecture] = useState("all")
  const [tournaments, setTournaments] = useState<DbTournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    loadFavoriteTournaments()
  }, [])

  async function loadFavoriteTournaments() {
    setIsLoading(true)
    try {
      const email = await getCurrentUserEmail()
      if (!email) {
        console.log("User not logged in")
        setIsLoading(false)
        return
      }
      setUserEmail(email)

      const favorites = await getUserFavorites(email)
      setTournaments(favorites.tournaments)
      console.log(`Loaded ${favorites.tournaments.length} favorite tournaments`)
    } catch (error) {
      console.error("Failed to load favorite tournaments:", error)
      setTournaments([])
    } finally {
      setIsLoading(false)
    }
  }

  // カテゴリの定義
  const categoryOptions = [
    { id: "all", name: "すべて" },
    { id: "U-12", name: "U-12" },
    { id: "U-15", name: "U-15" },
    { id: "U-18", name: "U-18" },
  ]

  // エリア選択時に都道府県リストを更新
  const availablePrefectures = selectedRegion === "all" 
    ? []
    : PREFECTURES_BY_REGION[selectedRegion] || []

  // エリア変更時に都道府県選択をリセット
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    setSelectedPrefecture("all")
  }

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tournament.prefecture && tournament.prefecture.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (tournament.category && tournament.category.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || tournament.category === selectedCategory
    const matchesRegion = selectedRegion === "all" || tournament.regionBlock === selectedRegion
    const matchesPrefecture = selectedPrefecture === "all" || tournament.prefecture === selectedPrefecture

    return matchesSearch && matchesCategory && matchesRegion && matchesPrefecture
  })

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "U-12":
        return "bg-yellow-100 text-yellow-800"
      case "U-15":
        return "bg-blue-100 text-blue-800"
      case "U-18":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "未定"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    } catch {
      return dateString
    }
  }

  if (!userEmail && !isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto pt-2 pb-20">
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 px-2 md:px-6">
            <Heart className="w-16 h-16 mb-4" />
            <p className="text-lg">ログインが必要です</p>
            <p className="text-sm mb-4">お気に入り大会を表示するにはログインしてください</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                ログイン
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pt-3 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2 px-2 md:px-6">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h1 className="text-lg font-bold text-gray-800">お気に入り大会</h1>
            </div>
            <p className="text-xs text-gray-500">あなたがお気に入りに登録した大会一覧</p>
          </div>
          <Link href="/tournaments">
            <Button variant="outline" size="sm" className="border-orange-500 text-orange-500 hover:bg-orange-50 text-xs px-2.5 py-1.5 h-auto">
              <Trophy className="w-3.5 h-3.5 mr-1.5" />
              大会を探す
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-2 px-2 md:px-6">
          <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-2">
            <div className="relative w-full md:flex-1 md:max-w-md">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                type="text"
                placeholder="大会名、地域で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 bg-white"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 mb-2">
            {categoryOptions.map((category) => {
              const count = category.id === "all" 
                ? tournaments.length 
                : tournaments.filter(t => t.category === category.id).length
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {category.name} ({count})
                </button>
              )
            })}
          </div>

          {/* Region and Prefecture Filters */}
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-600">地域:</span>
              <Select value={selectedRegion} onValueChange={handleRegionChange}>
                <SelectTrigger className="w-36 bg-white h-8 text-xs">
                  <SelectValue placeholder="地域を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">すべての地域</SelectItem>
                  {REGION_BLOCKS.map((region) => (
                    <SelectItem key={region} value={region} className="text-xs">
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRegion !== "all" && availablePrefectures.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-600">都道府県:</span>
                <Select value={selectedPrefecture} onValueChange={setSelectedPrefecture}>
                  <SelectTrigger className="w-36 bg-white h-8 text-xs">
                    <SelectValue placeholder="都道府県を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">すべての都道府県</SelectItem>
                    {availablePrefectures.map((prefecture: string) => (
                      <SelectItem key={prefecture} value={prefecture} className="text-xs">
                        {prefecture}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Tournaments Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-600">お気に入り大会を読み込み中...</span>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Heart className="w-16 h-16 mb-4" />
            <p className="text-lg">お気に入り大会がありません</p>
            <p className="text-sm mb-4">大会をお気に入りに追加してみましょう</p>
            <Link href="/tournaments">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                大会を探す
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTournaments.map((tournament) => (
              <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                <Card className="border-0 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={tournament.iconUrl || undefined} />
                        <AvatarFallback className="bg-orange-100">
                          <Trophy className="w-6 h-6 text-orange-600" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-gray-900 truncate">{tournament.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {tournament.prefecture && (
                            <p className="text-xs text-gray-500">{tournament.prefecture}</p>
                          )}
                          {tournament.category && (
                            <>
                              {tournament.prefecture && <span className="text-xs text-gray-400">•</span>}
                              <p className="text-xs text-gray-500">{tournament.category}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}



