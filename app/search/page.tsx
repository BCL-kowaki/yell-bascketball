"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Users, Hash, MapPin, Calendar, UserPlus, Heart, MessageCircle, Share } from "lucide-react"
import Navigation from "@/components/navigation"

interface SearchResult {
  id: string
  type: "user" | "post" | "hashtag" | "place" | "event"
  title: string
  subtitle?: string
  avatar?: string
  content?: string
  stats?: {
    likes?: number
    comments?: number
    shares?: number
    followers?: number
    posts?: number
  }
  timestamp?: string
  isFollowing?: boolean
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Mock trending topics
  const trendingTopics = [
    { id: "1", hashtag: "#東京オリンピック", posts: "1.2M" },
    { id: "2", hashtag: "#プログラミング", posts: "856K" },
    { id: "3", hashtag: "#料理", posts: "743K" },
    { id: "4", hashtag: "#旅行", posts: "621K" },
    { id: "5", hashtag: "#写真", posts: "589K" },
  ]

  // Mock search results
  const searchResults: SearchResult[] = [
    {
      id: "1",
      type: "user",
      title: "田中太郎",
      subtitle: "@tanaka_taro",
      avatar: "/placeholder.svg?height=40&width=40",
      stats: { followers: 1234, posts: 89 },
      isFollowing: false,
    },
    {
      id: "2",
      type: "post",
      title: "佐藤花子",
      subtitle: "2時間前",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "今日は素晴らしい天気ですね！公園で桜を見てきました。春の訪れを感じます。 #桜 #春 #公園",
      stats: { likes: 45, comments: 12, shares: 3 },
    },
    {
      id: "3",
      type: "hashtag",
      title: "#プログラミング",
      subtitle: "856K件の投稿",
      stats: { posts: 856000 },
    },
    {
      id: "4",
      type: "place",
      title: "東京スカイツリー",
      subtitle: "東京都墨田区",
      avatar: "/placeholder.svg?height=40&width=40",
      stats: { posts: 12500 },
    },
    {
      id: "5",
      type: "event",
      title: "技術勉強会 2024",
      subtitle: "3月15日 19:00 - 21:00",
      avatar: "/placeholder.svg?height=40&width=40",
      stats: { followers: 234 },
    },
  ]

  const handleFollow = (userId: string) => {
    console.log(`[v0] Following user: ${userId}`)
    // Here you would implement the actual follow logic
  }

  const filteredResults = searchResults.filter((result) => {
    const matchesSearch = searchQuery === "" || result.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "users" && result.type === "user") ||
      (activeTab === "posts" && result.type === "post") ||
      (activeTab === "hashtags" && result.type === "hashtag") ||
      (activeTab === "places" && result.type === "place")
    return matchesSearch && matchesTab
  })

  const getResultIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="h-4 w-4 text-blue-500" />
      case "post":
        return <MessageCircle className="h-4 w-4 text-green-500" />
      case "hashtag":
        return <Hash className="h-4 w-4 text-purple-500" />
      case "place":
        return <MapPin className="h-4 w-4 text-red-500" />
      case "event":
        return <Calendar className="h-4 w-4 text-orange-500" />
      default:
        return <Search className="h-4 w-4 text-gray-500" />
    }
  }

  const SearchResultCard = ({ result }: { result: SearchResult }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            {result.avatar ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={result.avatar || "/placeholder.svg"} alt={result.title} />
                <AvatarFallback>{result.title.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                {getResultIcon(result.type)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{result.title}</h3>
                {result.subtitle && <p className="text-sm text-gray-500">{result.subtitle}</p>}
                {result.content && <p className="text-sm text-gray-700 mt-2">{result.content}</p>}

                {result.stats && (
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    {result.stats.followers && <span>{result.stats.followers.toLocaleString()} フォロワー</span>}
                    {result.stats.posts && <span>{result.stats.posts.toLocaleString()} 投稿</span>}
                    {result.stats.likes && (
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {result.stats.likes}
                      </span>
                    )}
                    {result.stats.comments && (
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {result.stats.comments}
                      </span>
                    )}
                    {result.stats.shares && (
                      <span className="flex items-center">
                        <Share className="h-3 w-3 mr-1" />
                        {result.stats.shares}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {result.type === "user" && (
                <Button
                  size="sm"
                  variant={result.isFollowing ? "outline" : "default"}
                  className={!result.isFollowing ? "bg-facebook-blue hover:bg-facebook-blue/90" : ""}
                  onClick={() => handleFollow(result.id)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  {result.isFollowing ? "フォロー中" : "フォロー"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const TrendingCard = ({ topic }: { topic: { id: string; hashtag: string; posts: string } }) => (
    <Card className="mb-2 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-purple-500" />
            <span className="font-semibold text-gray-900">{topic.hashtag}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {topic.posts}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-facebook-blue" />
              <span>検索・発見</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ユーザー、投稿、ハッシュタグを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchQuery === "" && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-facebook-blue" />
                  <h3 className="font-semibold text-gray-900">トレンド</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {trendingTopics.map((topic) => (
                    <TrendingCard key={topic.id} topic={topic} />
                  ))}
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">すべて</TabsTrigger>
                <TabsTrigger value="users">ユーザー</TabsTrigger>
                <TabsTrigger value="posts">投稿</TabsTrigger>
                <TabsTrigger value="hashtags">ハッシュタグ</TabsTrigger>
                <TabsTrigger value="places">場所</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-2">
                  {filteredResults.map((result) => (
                    <SearchResultCard key={result.id} result={result} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-4">
                <div className="space-y-2">
                  {filteredResults
                    .filter((r) => r.type === "user")
                    .map((result) => (
                      <SearchResultCard key={result.id} result={result} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="posts" className="mt-4">
                <div className="space-y-2">
                  {filteredResults
                    .filter((r) => r.type === "post")
                    .map((result) => (
                      <SearchResultCard key={result.id} result={result} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="hashtags" className="mt-4">
                <div className="space-y-2">
                  {filteredResults
                    .filter((r) => r.type === "hashtag")
                    .map((result) => (
                      <SearchResultCard key={result.id} result={result} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="places" className="mt-4">
                <div className="space-y-2">
                  {filteredResults
                    .filter((r) => r.type === "place")
                    .map((result) => (
                      <SearchResultCard key={result.id} result={result} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  )
}
