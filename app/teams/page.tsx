"use client"
import { useState } from "react"
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
  PlusCircle
} from "lucide-react"
import { Layout } from "@/components/layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    name: "九州",
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
  // 福岡のチーム（九州エリア）
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

  const categories = [
    { id: "all", name: "すべて", count: mockTeams.length },
    { id: "u12", name: "U12", count: mockTeams.filter(t => t.category === "u12").length },
    { id: "u15", name: "U15", count: mockTeams.filter(t => t.category === "u15").length },
    { id: "u18", name: "U18", count: mockTeams.filter(t => t.category === "u18").length },
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

  const filteredTeams = mockTeams.filter(team => {
    const matchesStatus = team.status === "approved"
    const matchesSearch = (team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.league.toLowerCase().includes(searchTerm.toLowerCase())) &&
                         matchesStatus
    
    const matchesCategory = selectedCategory === "all" || team.category === selectedCategory
    const matchesArea = selectedArea === "all" || team.area === selectedArea
    const matchesPrefecture = selectedPrefecture === "all" || team.prefecture === selectedPrefecture
    
    return matchesSearch && matchesCategory && matchesArea && matchesPrefecture
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "u12":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "u15":
        return <Shield className="w-4 h-4 text-orange-600" />
      case "u18":
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
      <div className="max-w-7xl mx-auto pt-2 pb-20 px-2 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-800">チームを探す</h1>
            <p className="text-gray-500">あなたの地域やお気に入りのチームを見つけよう</p>
          </div>
          <Link href="/teams/create" target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              新規チーム作成
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
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
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">カテゴリー</span>
              </div>
              {/* The "チーム作成" button is now handled by the Link component above */}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">エリア:</span>
              <Select value={selectedArea} onValueChange={handleAreaChange}>
                <SelectTrigger className="w-48 bg-white">
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">都道府県:</span>
                <Select value={selectedPrefecture} onValueChange={setSelectedPrefecture}>
                  <SelectTrigger className="w-48">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105">
                <div className="relative overflow-hidden">
                  <img 
                    src={team.coverImage} 
                    alt={team.name}
                    className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Team Logo */}
                  <div className="absolute bottom-4 left-4">
                    <Avatar className="w-12 h-12 border-2 border-white">
                      <AvatarImage src={team.logo} />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold">
                        {team.shortName.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {team.name}
                    </CardTitle>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{team.location}</span>
                    <span>•</span>
                    <span>{team.league}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">

                  {/* Follow Button and Activity */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>最終活動: {team.lastActivity}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={team.isFollowing ? "outline" : "default"}
                      className={team.isFollowing ? "" : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"}
                      onClick={(e) => {
                        e.preventDefault()
                        // Handle follow/unfollow
                      }}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      {team.isFollowing ? "フォロー中" : "フォロー"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">該当するチームが見つかりませんでした</p>
              <p className="text-sm">検索条件を変更してお試しください</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}