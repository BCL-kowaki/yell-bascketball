"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Search,
  MapPin,
  Calendar,
  ChevronRight,
  Filter,
  Heart,
  Loader2,
  Crown,
  Shield,
  Target
} from "lucide-react"
import { Layout } from "@/components/layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUserFavorites, getCurrentUserEmail, type DbTeam } from "@/lib/api"
import { REGION_BLOCKS, PREFECTURES_BY_REGION } from "@/lib/regionData"
import { refreshS3Url } from "@/lib/storage"

export default function FavoriteTeamsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedPrefecture, setSelectedPrefecture] = useState("all")
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    loadFavoriteTeams()
  }, [])

  async function loadFavoriteTeams() {
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
      // 画像URLを更新
      const teamsWithRefreshedImages = await Promise.all(
        favorites.teams.map(async (team) => {
          const updatedTeam = { ...team }
          if (updatedTeam.logoUrl && !updatedTeam.logoUrl.startsWith('data:') && !updatedTeam.logoUrl.startsWith('blob:')) {
            try {
              updatedTeam.logoUrl = await refreshS3Url(updatedTeam.logoUrl, true) || updatedTeam.logoUrl
            } catch (error) {
              console.error('Failed to refresh logo URL:', error)
            }
          }
          if (updatedTeam.coverImageUrl && !updatedTeam.coverImageUrl.startsWith('data:') && !updatedTeam.coverImageUrl.startsWith('blob:')) {
            try {
              updatedTeam.coverImageUrl = await refreshS3Url(updatedTeam.coverImageUrl, true) || updatedTeam.coverImageUrl
            } catch (error) {
              console.error('Failed to refresh cover image URL:', error)
            }
          }
          return updatedTeam
        })
      )
      setTeams(teamsWithRefreshedImages)
      console.log(`Loaded ${teamsWithRefreshedImages.length} favorite teams`)
    } catch (error) {
      console.error("Failed to load favorite teams:", error)
      setTeams([])
    } finally {
      setIsLoading(false)
    }
  }

  // 重複を除去（同じIDのチームが複数存在する場合に備える）
  const uniqueTeams = teams.filter((team, index, self) => 
    index === self.findIndex((t) => t.id === team.id)
  )

  const categories = [
    { id: "all", name: "すべて", count: uniqueTeams.length },
    { id: "U12", name: "U12", count: uniqueTeams.filter(t => t.category === "U12").length },
    { id: "U15", name: "U15", count: uniqueTeams.filter(t => t.category === "U15").length },
    { id: "U18", name: "U18", count: uniqueTeams.filter(t => t.category === "U18").length },
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

  const filteredTeams = uniqueTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (team.prefecture && team.prefecture.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (team.category && team.category.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || team.category === selectedCategory
    const matchesRegion = selectedRegion === "all" || team.region === selectedRegion
    const matchesPrefecture = selectedPrefecture === "all" || team.prefecture === selectedPrefecture

    return matchesSearch && matchesCategory && matchesRegion && matchesPrefecture
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "U12":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "U15":
        return <Shield className="w-4 h-4 text-orange-600" />
      case "U18":
        return <Target className="w-4 h-4 text-purple-600" />
      default:
        return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  if (!userEmail && !isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto pt-2 pb-20">
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 px-2 md:px-6">
            <Heart className="w-16 h-16 mb-4" />
            <p className="text-lg">ログインが必要です</p>
            <p className="text-sm mb-4">お気に入りチームを表示するにはログインしてください</p>
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
              <h1 className="text-lg font-bold text-gray-800">お気に入りチーム</h1>
            </div>
            <p className="text-xs text-gray-500">あなたがお気に入りに登録したチーム一覧</p>
          </div>
          <Link href="/teams">
            <Button variant="outline" size="sm" className="border-orange-500 text-orange-500 hover:bg-orange-50 text-xs px-2.5 py-1.5 h-auto">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              チームを探す
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
                placeholder="チーム名、地域で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 bg-white"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 mb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
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

        {/* Teams Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-600">お気に入りチームを読み込み中...</span>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Heart className="w-16 h-16 mb-4" />
            <p className="text-lg">お気に入りチームがありません</p>
            <p className="text-sm mb-4">チームをお気に入りに追加してみましょう</p>
            <Link href="/teams">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                チームを探す
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTeams.map((team) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card className="border-0 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={team.logoUrl || undefined} />
                        <AvatarFallback>
                          {team.name[0] || "T"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-gray-900 truncate">{team.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {team.prefecture && (
                            <p className="text-xs text-gray-500">{team.prefecture}</p>
                          )}
                          {team.category && (
                            <>
                              {team.prefecture && <span className="text-xs text-gray-400">•</span>}
                              <p className="text-xs text-gray-500">{team.category}</p>
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



