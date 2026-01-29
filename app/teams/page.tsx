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
  Target,
  ChevronRight,
  Filter,
  Plus,
  Crown,
  Shield,
  Globe,
  Lock,
  UserPlus,
  PlusCircle,
  Loader2
} from "lucide-react"
import { Layout } from "@/components/layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listTeams, type DbTeam } from "@/lib/api"
import { refreshS3Url } from "@/lib/storage"

// Area and Prefecture data
const areaData = {
  hokkaido: {
    name: "北海道",
    prefectures: ["北海道"]
  },
  tohoku: {
    name: "東北",
    prefectures: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"]
  },
  kanto: {
    name: "関東",
    prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"]
  },
  hokushinetsu: {
    name: "北信越",
    prefectures: ["新潟県", "富山県", "石川県", "福井県", "長野県"]
  },
  tokai: {
    name: "東海",
    prefectures: ["岐阜県", "静岡県", "愛知県", "三重県"]
  },
  kinki: {
    name: "近畿",
    prefectures: ["滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"]
  },
  chugoku: {
    name: "中国",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"]
  },
  shikoku: {
    name: "四国",
    prefectures: ["徳島県", "香川県", "愛媛県", "高知県"]
  },
  kyushu: {
    name: "九州・沖縄",
    prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"]
  }
}

// Mock teams data
const mockTeams = [
  {
    id: "albirex-tokyo",
    name: "アルバルク東京",
    shortName: "アルバルク",
    logo: "/placeholder.svg?height=80&width=80&text=東京",
    coverImage: "/placeholder.svg?height=200&width=400&text=アルバルク東京",
    location: "東京都",
    area: "kanto",
    prefecture: "東京都",
    league: "U12",
    isFollowing: true,
    isVerified: true,
    lastActivity: "2時間前",
    category: "u12",
    privacy: "public",
    status: "approved",
    editors: ["user@example.com"],
  },
  {
    id: "chiba-jets",
    name: "千葉ジェッツ",
    shortName: "ジェッツ",
    logo: "/placeholder.svg?height=80&width=80&text=千葉",
    coverImage: "/placeholder.svg?height=200&width=400&text=千葉ジェッツ",
    location: "千葉県",
    area: "kanto",
    prefecture: "千葉県",
    league: "U12",
    isFollowing: false,
    isVerified: true,
    lastActivity: "30分前",
    category: "u12",
    privacy: "public",
    status: "approved",
    editors: ["user@example.com"],
  },
  {
    id: "yokohama-corsairs",
    name: "横浜ビー・コルセアーズ",
    shortName: "コルセアーズ",
    logo: "/placeholder.svg?height=80&width=80&text=横浜",
    coverImage: "/placeholder.svg?height=200&width=400&text=横浜コルセアーズ",
    location: "神奈川県",
    area: "kanto",
    prefecture: "神奈川県",
    league: "U12",
    isFollowing: true,
    isVerified: true,
    lastActivity: "1時間前",
    category: "u12",
    privacy: "public",
    status: "approved",
    editors: ["user@example.com"],
  },
  {
    id: "tokyo-university",
    name: "東京大学バスケットボール部",
    shortName: "東大バスケ部",
    logo: "/placeholder.svg?height=80&width=80&text=東大",
    coverImage: "/placeholder.svg?height=200&width=400&text=東大バスケ部",
    location: "東京都",
    area: "kanto",
    prefecture: "東京都",
    league: "U15",
    isFollowing: false,
    isVerified: false,
    lastActivity: "3時間前",
    category: "u15",
    privacy: "public",
    status: "approved",
    editors: ["user@example.com"],
  },
  {
    id: "shibuya-streetball",
    name: "渋谷ストリートボーラーズ",
    shortName: "渋谷SB",
    logo: "/placeholder.svg?height=80&width=80&text=渋谷",
    coverImage: "/placeholder.svg?height=200&width=400&text=渋谷ストリート",
    location: "東京都渋谷区",
    area: "kanto",
    prefecture: "東京都",
    league: "U18",
    isFollowing: true,
    isVerified: false,
    lastActivity: "5時間前",
    category: "u18",
    privacy: "public",
    status: "approved",
    editors: ["user@example.com"],
  },
  {
    id: "waseda-basketball",
    name: "早稲田大学バスケットボール部",
    shortName: "早大バスケ部",
    logo: "/placeholder.svg?height=80&width=80&text=早大",
    coverImage: "/placeholder.svg?height=200&width=400&text=早大バスケ部",
    location: "東京都",
    area: "kanto",
    prefecture: "東京都",
    league: "U15",
    isFollowing: false,
    isVerified: true,
    lastActivity: "1時間前",
    category: "u15",
    privacy: "public",
    status: "approved",
    editors: ["user@example.com"],
  },
  // 大阪のチーム（近畿エリア）
  {
    id: "osaka-evessa",
    name: "大阪エヴェッサ",
    shortName: "エヴェッサ",
    logo: "/placeholder.svg?height=80&width=80&text=大阪",
    coverImage: "/placeholder.svg?height=200&width=400&text=大阪エヴェッサ",
    location: "大阪府",
    area: "kinki",
    prefecture: "大阪府",
    league: "U12",
    isFollowing: false,
    isVerified: true,
    lastActivity: "4時間前",
    category: "u12",
    privacy: "public",
    status: "approved",
    editors: ["user@example.com"],
  },
  // 福岡のチーム（九州・沖縄エリア）
  {
    id: "fukuoka-rising",
    name: "福岡ライジングゼファー",
    shortName: "ライジング",
    logo: "/placeholder.svg?height=80&width=80&text=福岡",
    coverImage: "/placeholder.svg?height=200&width=400&text=福岡ライジング",
    location: "福岡県",
    area: "kyushu",
    prefecture: "福岡県",
    league: "U12",
    isFollowing: true,
    isVerified: true,
    lastActivity: "1時間前",
    category: "u12",
    privacy: "public",
    status: "approved",
    editors: ["user@example.com"],
  },
  // 北海道のチーム
  {
    id: "hokkaido-levanga",
    name: "レバンガ北海道",
    shortName: "レバンガ",
    logo: "/placeholder.svg?height=80&width=80&text=北海道",
    coverImage: "/placeholder.svg?height=200&width=400&text=レバンガ北海道",
    location: "北海道",
    area: "hokkaido",
    prefecture: "北海道",
    league: "U12",
    isFollowing: false,
    isVerified: true,
    lastActivity: "6時間前",
    category: "u12",
    privacy: "public",
    status: "approved",
    editors: ["user@example.com"],
  },
  {
    id: "pending-team-example",
    name: "（承認待ち）未来のスターズ",
    shortName: "未来",
    logo: "/placeholder.svg?height=80&width=80&text=未",
    coverImage: "/placeholder.svg?height=200&width=400&text=承認待ちチーム",
    location: "東京都",
    area: "kanto",
    prefecture: "東京都",
    league: "U12",
    isFollowing: false,
    isVerified: false,
    lastActivity: "N/A",
    category: "u12",
    privacy: "private",
    status: "pending_approval",
    editors: ["creator@example.com"],
  }
]

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedArea, setSelectedArea] = useState("all")
  const [selectedPrefecture, setSelectedPrefecture] = useState("all")
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTeams()
  }, [])

  async function loadTeams() {
    setIsLoading(true)
    try {
      console.log('🔍 Loading teams with filter: isApproved=true')
      // isApproved=trueのチームのみ取得
      const approvedTeams = await listTeams(100, { isApproved: true })
      console.log(`✅ Loaded ${approvedTeams.length} approved teams`)
      
      // 画像URLを更新
      const teamsWithRefreshedImages = await Promise.all(
        approvedTeams.map(async (team) => {
          const updatedTeam = { ...team }
          
          // ロゴ画像のURLを更新
          if (updatedTeam.logoUrl && !updatedTeam.logoUrl.startsWith('data:') && !updatedTeam.logoUrl.startsWith('blob:')) {
            try {
              updatedTeam.logoUrl = await refreshS3Url(updatedTeam.logoUrl, true) || updatedTeam.logoUrl
            } catch (error) {
              console.error('Failed to refresh logo URL:', error)
            }
          }
          
          // カバー画像のURLを更新
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
      
      console.log('📋 Team details:', teamsWithRefreshedImages.map(t => ({ 
        id: t.id, 
        name: t.name, 
        isApproved: t.isApproved,
        category: t.category,
        region: t.region,
        prefecture: t.prefecture
      })))
      setTeams(teamsWithRefreshedImages)
    } catch (error) {
      console.error("❌ Failed to load teams:", error)
      setTeams([])
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    { id: "all", name: "すべて", count: teams.length },
    { id: "U12", name: "U12", count: teams.filter(t => t.category === "U12").length },
    { id: "U15", name: "U15", count: teams.filter(t => t.category === "U15").length },
    { id: "U18", name: "U18", count: teams.filter(t => t.category === "U18").length },
  ]

  // エリア選択時に都道府県リストを更新
  const availablePrefectures = selectedArea === "all" 
    ? []
    : (areaData as any)[selectedArea]?.prefectures || []

  // エリア変更時に都道府県選択をリセット
  const handleAreaChange = (area: string) => {
    setSelectedArea(area)
    setSelectedPrefecture("all")
  }

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (team.prefecture && team.prefecture.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (team.category && team.category.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || team.category === selectedCategory
    const matchesArea = selectedArea === "all" ||
      (team.region && (areaData as any)[selectedArea]?.name === team.region)
    const matchesPrefecture = selectedPrefecture === "all" || team.prefecture === selectedPrefecture

    return matchesSearch && matchesCategory && matchesArea && matchesPrefecture
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

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "u12":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">U12</Badge>
      case "u15":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">U15</Badge>
      case "u18":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">U18</Badge>
      default:
        return <Badge variant="outline">その他</Badge>
    }
  }

  const getPrivacyIcon = (privacy: string) => {
    return privacy === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pt-4 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-2 gap-4 px-2 md:px-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">チームを探す</h1>
            <p className="text-sm sm:text-base text-gray-500">あなたの地域やお気に入りのチームを見つけよう</p>
          </div>
          <Link href="/teams/create" className="w-full sm:w-auto">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-full sm:w-auto">
              <PlusCircle className="w-4 h-4 mr-2" />
              新規チーム作成
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 px-2 md:px-6">
          <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
            <div className="relative w-full md:flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="チーム名、地域、リーグで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-gray-200 rounded-lg focus:ring-orange-500 focus:border-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-4">
              {/* The "チーム作成" button is now handled by the Link component above */}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Area and Prefecture Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 flex-shrink-0">エリア:</span>
              <Select value={selectedArea} onValueChange={handleAreaChange}>
                <SelectTrigger className="flex-1 sm:w-48 bg-white">
                  <SelectValue placeholder="エリアを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのエリア</SelectItem>
                  {Object.entries(areaData).map(([key, area]) => (
                    <SelectItem key={key} value={key}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedArea !== "all" && availablePrefectures.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-600 flex-shrink-0">都道府県:</span>
                <Select value={selectedPrefecture} onValueChange={setSelectedPrefecture}>
                  <SelectTrigger className="flex-1 sm:w-48">
                    <SelectValue placeholder="都道府県を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべての都道府県</SelectItem>
                    {availablePrefectures.map((prefecture: string) => (
                      <SelectItem key={prefecture} value={prefecture}>
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
            <span className="ml-3 text-gray-600">チームを読み込み中...</span>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Users className="w-16 h-16 mb-4" />
            <p className="text-lg">チームが見つかりませんでした</p>
            <p className="text-sm">別の検索条件をお試しください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card className="border-0 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105">
                  <div className="relative overflow-hidden">
                    <img
                      src={team.coverImageUrl || "/placeholder.svg?height=200&width=400&text=No+Cover"}
                      alt={team.name}
                      className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Team Logo */}
                    <div className="absolute bottom-4 left-4">
                      <Avatar className="w-12 h-12 border-2 border-white">
                        <AvatarImage src={team.logoUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold">
                          {(team.shortName || team.name).slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <CardHeader className="pt-3 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {team.name}
                      </CardTitle>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{team.prefecture || team.region || "未設定"}</span>
                      {team.category && (
                        <>
                          <span>•</span>
                          <span>{team.category}</span>
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Team Info */}
                    {team.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{team.description}</p>
                    )}

                    {/* Category Badge */}
                    {team.category && (
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(team.category)}
                        <Badge variant="outline" className="text-xs">
                          {team.category}
                        </Badge>
                        {team.headcount && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {team.headcount}名
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Follow Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      {team.founded && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>設立: {team.founded}</span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        onClick={(e) => {
                          e.preventDefault()
                          // Handle follow/unfollow
                        }}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        詳細を見る
                      </Button>
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