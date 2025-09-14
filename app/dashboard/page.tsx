"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  Bell, 
  MessageCircle, 
  Heart, 
  Calendar,
  Clock,
  Star,
  Target,
  Activity,
  Plus,
  Search,
  Settings
} from "lucide-react"
import { Layout } from "@/components/layout"

// Mock user data
const mockUser = {
  name: "田中 太郎",
  avatar: "/placeholder.svg?height=80&width=80",
  level: 15,
  experience: 2840,
  nextLevel: 3000,
  rank: "エリート",
  joinDate: "2023年1月",
  totalPosts: 42,
  totalLikes: 1280,
  totalFollowers: 245,
  totalFollowing: 180,
}

// Mock recent activities
const mockRecentActivities = [
  {
    id: 1,
    type: "post",
    content: "新しいプロジェクトが始まりました！",
    timestamp: "2時間前",
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    type: "like",
    content: "佐藤花子さんの投稿にいいねしました",
    timestamp: "4時間前",
  },
  {
    id: 3,
    type: "comment",
    content: "山田次郎さんの投稿にコメントしました",
    timestamp: "6時間前",
  },
  {
    id: 4,
    type: "follow",
    content: "鈴木美咲さんをフォローしました",
    timestamp: "1日前",
  },
]

// Mock upcoming events
const mockUpcomingEvents = [
  {
    id: 1,
    title: "春のフレンドリーカップ",
    date: "2024年3月15日",
    time: "14:00",
    participants: 128,
    status: "参加中",
  },
  {
    id: 2,
    title: "エリートチャンピオンシップ",
    date: "2024年4月1日",
    time: "10:00",
    participants: 64,
    status: "予約済み",
  },
]

// Mock quick stats
const mockQuickStats = [
  {
    title: "今週の投稿",
    value: "8",
    change: "+2",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "獲得いいね",
    value: "156",
    change: "+23",
    trend: "up",
    icon: Heart,
  },
  {
    title: "参加大会",
    value: "3",
    change: "+1",
    trend: "up",
    icon: Trophy,
  },
  {
    title: "新規フォロワー",
    value: "12",
    change: "+5",
    trend: "up",
    icon: Users,
  },
]

export default function HomePage() {
  const [isLoggedIn] = useState(true) // ログイン状態を管理

  const getProgressPercentage = () => {
    return (mockUser.experience / mockUser.nextLevel) * 100
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "post":
        return <Plus className="w-4 h-4 text-orange-600" />
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />
      case "comment":
        return <MessageCircle className="w-4 h-4 text-green-600" />
      case "follow":
        return <Users className="w-4 h-4 text-purple-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  if (!isLoggedIn) {
    return (
      <Layout isLoggedIn={false}>
        <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="font-serif text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
              SocialConnect
            </h1>
            <p className="text-gray-600 text-lg">友達や世界中の人々とつながろう</p>
          </div>

          <div className="space-y-4">
            <Link href="/login" className="block">
              <Button className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                ログイン
              </Button>
            </Link>

            <Link href="/register" className="block">
              <Button variant="outline" className="w-full h-12 text-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50">
                新しいアカウントを作成
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <Link href="/timeline" className="text-orange-600 hover:text-blue-700 hover:underline">
              ゲストとしてタイムラインを見る
            </Link>
          </div>
        </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout isLoggedIn={true} currentUser={{ name: mockUser.name }}>

      <div className="max-w-6xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                おかえりなさい、{mockUser.name}さん！
              </h1>
              <p className="text-gray-600">今日も素晴らしい一日を過ごしましょう。</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Search className="w-4 h-4 mr-2" />
                検索
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Profile & Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-blue-100">
                    <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xl font-semibold">
                      {mockUser.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{mockUser.name}</h2>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      {mockUser.rank}
                    </Badge>
                    <Badge variant="outline" className="border-orange-200 text-orange-600">
                      Lv.{mockUser.level}
                    </Badge>
                  </div>
                  
                  {/* Experience Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>経験値</span>
                      <span>{mockUser.experience} / {mockUser.nextLevel}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{mockUser.totalPosts}</p>
                    <p className="text-sm text-gray-600">投稿</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{mockUser.totalLikes}</p>
                    <p className="text-sm text-gray-600">いいね</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{mockUser.totalFollowers}</p>
                    <p className="text-sm text-gray-600">フォロワー</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{mockUser.totalFollowing}</p>
                    <p className="text-sm text-gray-600">フォロー中</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  今週の統計
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockQuickStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <stat.icon className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Recent Activities */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  最近のアクティビティ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRecentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.content}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        {activity.likes && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {activity.likes}
                          </span>
                        )}
                        {activity.comments && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {activity.comments}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">クイックアクション</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/timeline">
                  <Button variant="ghost" className="w-full justify-start text-left h-auto p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Plus className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">新しい投稿を作成</p>
                        <p className="text-sm text-gray-500">今の気持ちを共有しよう</p>
                      </div>
                    </div>
                  </Button>
                </Link>
                <Link href="/cupmatch">
                  <Button variant="ghost" className="w-full justify-start text-left h-auto p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Trophy className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">大会に参加</p>
                        <p className="text-sm text-gray-500">新しいチャレンジを見つけよう</p>
                      </div>
                    </div>
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="w-full justify-start text-left h-auto p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">友達を探す</p>
                        <p className="text-sm text-gray-500">新しいつながりを作ろう</p>
                      </div>
                    </div>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Upcoming Events & Notifications */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Events */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  今後のイベント
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockUpcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <Badge className={`${
                        event.status === "参加中" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{event.date} {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span>{event.participants}人参加</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  通知
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full">
                      <Trophy className="w-3 h-3 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">大会の結果</p>
                      <p className="text-xs text-blue-700">春のフレンドリーカップで3位になりました！</p>
                      <p className="text-xs text-orange-600 mt-1">1時間前</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-green-100 rounded-full">
                      <Users className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">新しいフォロワー</p>
                      <p className="text-xs text-green-700">高橋健太さんがあなたをフォローしました</p>
                      <p className="text-xs text-green-600 mt-1">3時間前</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-purple-100 rounded-full">
                      <Heart className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900">いいね</p>
                      <p className="text-xs text-purple-700">佐藤花子さんがあなたの投稿にいいねしました</p>
                      <p className="text-xs text-purple-600 mt-1">5時間前</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
