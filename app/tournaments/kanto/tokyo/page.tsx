"use client"
import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  PlusCircle,
} from "lucide-react"
import { Layout } from "@/components/layout"

// 東京都の大会データ
const tokyoTournaments = [
  {
    id: "tokyo-spring-championship",
    title: "東京春季バスケットボール選手権",
    organizer: "東京都バスケットボール協会",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    level: "U12",
    image: "/placeholder.svg?height=200&width=400&text=春季選手権",
    featured: true,
    status: "approved",
  },
  {
    id: "shibuya-street-ball",
    title: "渋谷ストリートボール大会",
    organizer: "渋谷区スポーツ振興会",
    startDate: "2024-04-20",
    endDate: "2024-04-21",
    level: "U12",
    image: "/placeholder.svg?height=200&width=400&text=ストリートボール",
    featured: true,
    status: "approved",
  },
  {
    id: "tokyo-women-league",
    title: "東京女子バスケットリーグ",
    organizer: "東京女子バスケット連盟",
    startDate: "2024-05-10",
    endDate: "2024-05-12",
    level: "U12",
    image: "/placeholder.svg?height=200&width=400&text=女子リーグ",
    featured: false,
    status: "approved",
  },
  {
    id: "junior-development-cup",
    title: "ジュニア育成カップ",
    organizer: "東京ジュニアバスケット協会",
    startDate: "2024-06-01",
    endDate: "2024-06-02",
    level: "U12",
    image: "/placeholder.svg?height=200&width=400&text=ジュニア育成",
    featured: false,
    status: "approved",
  },
  {
    id: "veteran-masters-tournament",
    title: "ベテランマスターズ大会",
    organizer: "東京ベテランバスケット会",
    startDate: "2024-07-15",
    endDate: "2024-07-16",
    level: "U12",
    image: "/placeholder.svg?height=200&width=400&text=ベテラン大会",
    featured: false,
    status: "approved",
    editors: ["user@example.com"],
  },
  {
    id: "corporate-league",
    title: "企業対抗バスケットリーグ",
    organizer: "東京企業スポーツ連盟",
    startDate: "2024-08-10",
    endDate: "2024-08-11",
    level: "U12",
    image: "/placeholder.svg?height=200&width=400&text=ベテラン大会",
    featured: false,
    status: "approved",
  },
  {
    id: "pending-tournament-example",
    title: "（承認待ち）未来のスター発掘トーナメント",
    organizer: "Yellジュニア委員会",
    startDate: "2024-09-01",
    endDate: "2024-09-02",
    level: "U12",
    image: "/placeholder.svg?height=200&width=400&text=承認待ち",
    featured: false,
    status: "pending_approval",
    editors: ["creator@example.com"],
  }
]

export default function TokyoTournamentsPage() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const getLevelColor = (level: string) => {
    switch (level) {
      case "U12":
        return "bg-red-100 text-red-800"
      case "U15":
        return "bg-blue-100 text-blue-800"
      case "U18":
    }
  }

  const filteredTournaments = tokyoTournaments.filter(tournament => {
    const matchesStatus = tournament.status === "approved"
    const matchesSearch = (tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.organizer.toLowerCase().includes(searchTerm.toLowerCase())) &&
                         matchesStatus
    
    if (selectedTab === "all") return matchesSearch
    if (selectedTab === "featured") return matchesSearch && tournament.featured
    return matchesSearch
  })

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/tournaments" className="text-gray-500 hover:text-gray-700">
            大会トップ
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/tournaments/kanto" className="text-gray-500 hover:text-gray-700">
            関東エリア
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-red-600 font-medium">東京都</span>
        </div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">東京都の大会</h1>
          <Link href="/tournaments/create" target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              大会を作成
            </Button>
          </Link>
        </div>

        {/* Statistics */}
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="大会名や主催者で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">フィルター</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsContent value={selectedTab} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <Link key={tournament.id} href={`/tournaments/kanto/tokyo/${tournament.id}`}>
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105">
                    <div className="relative overflow-hidden">
                      <img 
                        src={tournament.image} 
                        alt={tournament.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute bottom-4 right-4">
                        <Badge className={getLevelColor(tournament.level)}>
                          {tournament.level}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                        {tournament.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{tournament.organizer}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Tournament Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{tournament.startDate} - {tournament.endDate}</span>
                        </div>
                      </div>
                      {/* Participation Info */}
                      {/* Prize and Stats */}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* No Results */}
        {filteredTournaments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">該当する大会が見つかりませんでした</p>
              <p className="text-sm">検索条件を変更してお試しください</p>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link href="/tournaments/kanto">
            <Button variant="outline" className="px-6 py-3">
              <ChevronLeft className="w-4 h-4 mr-2" />
              関東エリアに戻る
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}