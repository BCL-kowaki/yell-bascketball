"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, MapPin, Calendar, Users, Heart, MessageCircle, Share2 } from "lucide-react"
import Link from "next/link"
import { Layout } from "@/components/layout"

// Mock user data
const mockUser = {
  id: 1,
  name: "田中 太郎",
  email: "tanaka@example.com",
  bio: "東京のバスケットボールチームに所属",
  location: "東京, 日本",
  joinDate: "2023年1月",
  followers: 245,
  following: 180,
  posts: 42,
  avatar: "/placeholder.svg?height=120&width=120",
  coverImage: "/placeholder.svg?height=300&width=800",
}

// Mock posts data
const mockPosts = [
  {
    id: 1,
    content: "今日は素晴らしい天気でした！新宿公園で写真を撮ってきました。",
    image: "/placeholder.svg?height=400&width=600",
    likes: 24,
    comments: 5,
    timestamp: "2時間前",
  },
  {
    id: 2,
    content: "新しいプロジェクトが始まりました。チーム一同頑張ります！",
    likes: 18,
    comments: 3,
    timestamp: "1日前",
  },
  {
    id: 3,
    content: "週末は友達と美味しいラーメンを食べに行きました。",
    image: "/placeholder.svg?height=400&width=600",
    likes: 31,
    comments: 8,
    timestamp: "3日前",
  },
]

export default function ProfilePage() {
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <Layout isLoggedIn={true} currentUser={{ name: "田中 太郎" }}>
      <div className="max-w-6xl mx-auto pb-20">
        {/* Cover Photo & Profile Info */}
        <div className="relative">
          <div className="h-48 md:h-64 bg-muted overflow-hidden">
            <img src={mockUser.coverImage || "/placeholder.svg"} alt="Cover" className="w-full h-full object-cover" />
          </div>

          <div className="absolute -bottom-12 md:-bottom-16 left-4 md:left-8">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-card">
              <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
              <AvatarFallback className="text-2xl">
                {mockUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4">
            <Button size="sm" variant="outline" className="bg-card text-xs md:text-sm">
              <Camera className="w-4 h-4 mr-1 md:mr-2" />
              カバー写真を変更
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-card px-4 md:px-8 pt-16 md:pt-20 pb-6 border-b border-border">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="flex-1 mb-4 md:mb-0">
              <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2">{mockUser.name}</h1>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">{mockUser.bio}</p>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {mockUser.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {mockUser.joinDate}に参加
                </div>
              </div>

              <div className="flex items-center gap-4 md:gap-6">
                <div className="text-center">
                  <div className="font-semibold text-base md:text-lg">{mockUser.posts}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">投稿</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base md:text-lg">{mockUser.followers}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">フォロワー</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base md:text-lg">{mockUser.following}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">フォロー中</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button variant={isFollowing ? "outline" : "default"} onClick={() => setIsFollowing(!isFollowing)} className="flex-1 md:flex-initial">
                <Users className="w-4 h-4 mr-2" />
                {isFollowing ? "フォロー中" : "フォローする"}
              </Button>
              <Button variant="outline" className="flex-1 md:flex-initial">メッセージ</Button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-2 md:p-6">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white">
              <TabsTrigger value="posts">投稿</TabsTrigger>
              <TabsTrigger value="about">基本情報</TabsTrigger>
              <TabsTrigger value="photos">写真</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
              {mockPosts.map((post) => (
                <Card key={post.id} className="w-full border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                        <AvatarFallback>
                          {mockUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{mockUser.name}</div>
                        <div className="text-sm text-muted-foreground">{post.timestamp}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{post.content}</p>
                    {post.image && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img src={post.image || "/placeholder.svg"} alt="Post content" className="w-full h-auto" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 md:gap-6 pt-3 border-t border-border">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        <Heart className="w-4 h-4 mr-2" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {post.comments}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="about" className="mt-4 md:mt-6">
              <Card className="w-full border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <h3 className="font-semibold text-lg">基本情報</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">職業</h4>
                    <p className="text-muted-foreground">ソフトウェアエンジニア</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">出身地</h4>
                    <p className="text-muted-foreground">大阪, 日本</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">趣味</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">写真撮影</Badge>
                      <Badge variant="secondary">旅行</Badge>
                      <Badge variant="secondary">プログラミング</Badge>
                      <Badge variant="secondary">読書</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="mt-4 md:mt-6">
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={`/placeholder.svg?height=200&width=200&query=photo+${i}`}
                      alt={`Photo ${i}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  )
}
