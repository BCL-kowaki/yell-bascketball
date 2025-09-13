"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, Target, Calendar, Star, Award, Zap, Heart } from "lucide-react"
import Link from "next/link"
import { HeaderNavigation } from "@/components/header-navigation"

// Mock cup match data
const mockCupMatches = [
  {
    id: 1,
    title: "春のフレンドリーカップ",
    status: "active",
    participants: 128,
    maxParticipants: 256,
    startDate: "2024年3月15日",
    endDate: "2024年3月30日",
    prize: "優勝賞金 ¥50,000",
    description: "春の訪れを祝うフレンドリーな対戦大会です。初心者から上級者まで参加可能！",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    title: "エリートチャンピオンシップ",
    status: "upcoming",
    participants: 64,
    maxParticipants: 64,
    startDate: "2024年4月1日",
    endDate: "2024年4月15日",
    prize: "優勝賞金 ¥100,000",
    description: "エリートプレイヤーによる最高峰の対戦大会。実力者限定の激戦が繰り広げられます。",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    title: "新人王決定戦",
    status: "completed",
    participants: 32,
    maxParticipants: 32,
    startDate: "2024年2月1日",
    endDate: "2024年2月15日",
    prize: "優勝賞金 ¥30,000",
    description: "新規プレイヤー限定の大会。初めての対戦を楽しもう！",
    image: "/placeholder.svg?height=200&width=400",
  },
]

// Mock leaderboard data
const mockLeaderboard = [
  {
    rank: 1,
    name: "田中 太郎",
    points: 2850,
    wins: 28,
    losses: 5,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 2,
    name: "佐藤 花子",
    points: 2720,
    wins: 25,
    losses: 8,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 3,
    name: "山田 次郎",
    points: 2580,
    wins: 22,
    losses: 10,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 4,
    name: "鈴木 美咲",
    points: 2450,
    wins: 20,
    losses: 12,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    rank: 5,
    name: "高橋 健太",
    points: 2320,
    wins: 18,
    losses: 14,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock recent matches
const mockRecentMatches = [
  {
    id: 1,
    player1: { name: "田中 太郎", avatar: "/placeholder.svg?height=40&width=40", score: 3 },
    player2: { name: "佐藤 花子", avatar: "/placeholder.svg?height=40&width=40", score: 2 },
    winner: "田中 太郎",
    date: "2時間前",
    duration: "15分",
  },
  {
    id: 2,
    player1: { name: "山田 次郎", avatar: "/placeholder.svg?height=40&width=40", score: 1 },
    player2: { name: "鈴木 美咲", avatar: "/placeholder.svg?height=40&width=40", score: 3 },
    winner: "鈴木 美咲",
    date: "4時間前",
    duration: "12分",
  },
  {
    id: 3,
    player1: { name: "高橋 健太", avatar: "/placeholder.svg?height=40&width=40", score: 3 },
    player2: { name: "伊藤 愛子", avatar: "/placeholder.svg?height=40&width=40", score: 0 },
    winner: "高橋 健太",
    date: "6時間前",
    duration: "8分",
  },
]

export default function CupMatchPage() {
  const [selectedTab, setSelectedTab] = useState("tournaments")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">開催中</Badge>
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">開催予定</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">終了</Badge>
      default:
        return <Badge>不明</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Navigation */}
      <HeaderNavigation isLoggedIn={true} />

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              カップマッチ
            </h1>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            仲間と競い合い、実力を試そう！様々な大会に参加して、チャンピオンを目指しましょう。
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">総大会数</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">参加者数</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">進行中</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">総賞金</p>
                  <p className="text-2xl font-bold text-gray-900">¥2.5M</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm border border-gray-200">
            <TabsTrigger value="tournaments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              大会一覧
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              ランキング
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              最近の対戦
            </TabsTrigger>
          </TabsList>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCupMatches.map((match) => (
                <Card key={match.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img src={match.image} alt={match.title} className="w-full h-48 object-cover" />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(match.status)}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">{match.title}</CardTitle>
                    <p className="text-gray-600 text-sm">{match.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">参加者</span>
                      <span className="font-semibold">{match.participants}/{match.maxParticipants}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">期間</span>
                      <span className="font-semibold">{match.startDate} - {match.endDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">賞金</span>
                      <span className="font-semibold text-green-600">{match.prize}</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
                      {match.status === "active" ? "参加する" : match.status === "upcoming" ? "予約する" : "詳細を見る"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  ランキング
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeaderboard.map((player, index) => (
                    <div key={player.rank} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg">
                        {player.rank}
                      </div>
                      <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                        <AvatarImage src={player.avatar} alt={player.name} />
                        <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-700 text-white font-semibold">
                          {player.name.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{player.name}</h3>
                        <p className="text-sm text-gray-500">{player.wins}勝 {player.losses}敗</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-gray-900">{player.points.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">ポイント</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-orange-500" />
                  最近の対戦
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockRecentMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                          <AvatarImage src={match.player1.avatar} alt={match.player1.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {match.player1.name.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{match.player1.name}</p>
                          <p className="text-2xl font-bold text-gray-900">{match.player1.score}</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">VS</p>
                        <p className="text-xs text-gray-400">{match.duration}</p>
                        <p className="text-xs text-gray-400">{match.date}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{match.player2.name}</p>
                          <p className="text-2xl font-bold text-gray-900">{match.player2.score}</p>
                        </div>
                        <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                          <AvatarImage src={match.player2.avatar} alt={match.player2.name} />
                          <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-700 text-white font-semibold">
                            {match.player2.name.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">勝者</p>
                        <p className="font-semibold text-green-600">{match.winner}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 