"use client"
import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  Users, 
  Trophy, 
  MapPin,
  Crown,
  Shield,
  Globe,
  UserPlus,
  UserMinus,
  Settings,
  Share2,
  Heart,
  MessageCircle,
  Send,
  Pin,
  ChevronLeft,
  Phone,
  Mail,
  ExternalLink,
  Flag
} from "lucide-react"
import { Layout } from "@/components/layout"

// Mock team data
const teamData = {
  "albirex-tokyo": {
    id: "albirex-tokyo",
    name: "アルバルク東京",
    shortName: "アルバルク",
    founded: "2024年",
    logo: "/placeholder.svg?height=100&width=100&text=東京",
    coverImage: "/placeholder.svg?height=300&width=800&text=アルバルク東京",
    district: "東京都立川市",
    headcount: "20人",
    category: "u12",
    description: "東京を拠点とするプロバスケットボールチーム。B.LEAGUE B1に所属し、常に優勝争いを繰り広げる強豪チーム。地域密着型の運営で多くのファンに愛されています。",
    isFollowing: true,
    isVerified: true,
    lastActivity: "2時間前",
    contact: {
      phone: "042-123-4567",
      email: "info@albirex-tokyo.jp",
      website: "https://albirex-tokyo.jp",
      address: "東京都立川市泉町935-1"
    },
    privacy: "public",
    socialMedia: {
      twitter: "@albirex_tokyo",
      instagram: "@albirex_tokyo_official",
      youtube: "AlbirexTokyoOfficial"
    }
  }
}

// Mock timeline posts for team
const teamPosts = [
  {
    id: "post-1",
    author: "アルバルク東京",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=東京",
    timestamp: "2024-03-16 15:30",
    content: "🏀 本日の練習お疲れ様でした！\n\n明日の試合に向けて最終調整を行いました。チーム一丸となって勝利を掴みます💪\n\n📅 明日 19:00 キックオフ\n🏟️ アリーナ立川立飛\n🆚 vs 千葉ジェッツ\n\n皆さんの熱い応援をお待ちしています！\n\n#アルバルク東京 #B.LEAGUE #明日は勝つぞ",
    images: ["/placeholder.svg?height=200&width=300&text=練習風景"],
    likes: 234,
    comments: 45,
    shares: 18,
    isPinned: true
  },
  {
    id: "post-2",
    author: "田中大輔",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=田中",
    timestamp: "2024-03-16 12:15",
    content: "今日の練習では新しい戦術の確認を重点的に行いました🏀\n\n明日の試合では必ず結果を出します！\n\nファンの皆さん、応援よろしくお願いします🙏\n\n#アルバルク東京 #PG #がんばります",
    images: [],
    likes: 156,
    comments: 28,
    shares: 12,
    isPinned: false
  },
  {
    id: "post-3",
    author: "アルバルクファン太郎",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=太",
    timestamp: "2024-03-16 10:45",
    content: "昨日の試合、本当に感動しました！🔥\n\n特に最後の逆転劇は鳥肌もの✨\n田中選手のアシストと佐藤選手の決勝シュートは完璧でした👏\n\n明日の試合も絶対応援に行きます！\n\n#アルバルク東京 #最高のチーム #応援してます",
    images: ["/placeholder.svg?height=200&width=300&text=試合観戦"],
    likes: 89,
    comments: 15,
    shares: 7,
    isPinned: false
  },
  {
    id: "post-4",
    type: "official",
    author: "アルバルク東京",
    authorRole: "公式",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=東京",
    timestamp: "2024-03-15 20:30",
    content: "🏆 昨日の試合結果報告\n\nアルバルク東京 85 - 78 横浜ビー・コルセアーズ\n\n素晴らしい試合でした！選手の皆さんお疲れ様でした🙌\n\n📊 試合統計:\n• FG成功率: 52.3%\n• 3P成功率: 38.9%\n• リバウンド: 42本\n• アシスト: 23本\n\n応援ありがとうございました！",
    images: ["/placeholder.svg?height=200&width=300&text=勝利の瞬間"],
    likes: 312,
    comments: 67,
    shares: 34,
    isPinned: false,
    matchResult: {
      homeTeam: "アルバルク東京",
      awayTeam: "横浜ビー・コルセアーズ",
      homeScore: 85,
      awayScore: 78,
      date: "2024-03-15"
    }
  }
]

interface TeamPageProps {
  params: {
    id: string
  }
}

export default function TeamPage({ params }: TeamPageProps) {
  const [newPost, setNewPost] = useState("")
  const [selectedTab, setSelectedTab] = useState("timeline")
  const [userRole, setUserRole] = useState("fan") // fan, member, admin
  
  // Use params directly - Next.js 15 handles this properly in client components
  const team = teamData[params.id as keyof typeof teamData]
  
  if (!team) {
    return (
      <Layout isLoggedIn={true} currentUser={{ name: "ユーザー" }}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">チームが見つかりません</h1>
            <Link href="/teams">
              <Button variant="outline">チーム一覧に戻る</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const handlePost = () => {
    if (newPost.trim()) {
      console.log("New team post:", newPost)
      setNewPost("")
    }
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "official":
        return <Flag className="w-4 h-4 text-blue-600" />
      case "player":
        return <Users className="w-4 h-4 text-green-600" />
      case "fan":
        return <MessageCircle className="w-4 h-4 text-purple-600" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "captain":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "coach":
        return <Shield className="w-4 h-4 text-blue-600" />
      default:
        return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <Layout isLoggedIn={true} currentUser={{ name: "ユーザー" }}>

      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/teams" className="text-gray-500 hover:text-gray-700">
            チーム一覧
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-blue-600 font-medium">{team.name}</span>
        </div>

        {/* Team Header */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <div className="relative overflow-hidden">
              <img 
                src={team.coverImage} 
                alt={team.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Team Info Overlay */}
              <div className="absolute bottom-6 left-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-20 h-20 border-4 border-white">
                    <AvatarImage src={team.logo} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                      {team.shortName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{team.district}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-6 right-6 flex gap-2">
                <Button
                  variant={team.isFollowing ? "outline" : "default"}
                  className={`${team.isFollowing ? "bg-white/90 text-gray-900 hover:bg-white" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {team.isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      フォロー中
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      フォロー
                    </>
                  )}
                </Button>
                <Button variant="outline" className="bg-white/90 text-gray-900 hover:bg-white">
                  <Share2 className="w-4 h-4 mr-2" />
                  シェア
                </Button>
                {userRole === "admin" && (
                  <Button variant="outline" className="bg-white/90 text-gray-900 hover:bg-white">
                    <Settings className="w-4 h-4 mr-2" />
                    設定
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Timeline and Content */}
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm border border-gray-200 mb-6">
                <TabsTrigger value="timeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  タイムライン
                </TabsTrigger>
                <TabsTrigger value="about" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                チーム情報
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-6">
                {/* Post Creation */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40&text=U" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="チームについて投稿する..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="min-h-[100px] resize-none border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex items-center justify-between mt-4">
                          <Button onClick={handlePost} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Send className="w-4 h-4 mr-2" />
                            投稿
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline Posts */}
                {teamPosts.map((post) => (
                  <Card key={post.id} className={`border-0 shadow-lg bg-white/90 backdrop-blur-sm ${post.isPinned ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={post.authorAvatar} />
                          <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{post.author}</span>
                            </div>
                            {post.isPinned && (
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                <Pin className="w-3 h-3 mr-1" />
                                ピン留め
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500 ml-auto">{post.timestamp}</span>
                          </div>
                          
                          <div className="text-gray-800 whitespace-pre-line mb-4">
                            {post.content}
                          </div>

                          {/* Match Result Display */}
                          {post.matchResult && (
                            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 mb-4">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="text-center">
                                    <div className="font-bold text-lg">{post.matchResult.homeTeam}</div>
                                    <div className="text-2xl font-bold text-green-600">{post.matchResult.homeScore}</div>
                                  </div>
                                  <div className="text-center">
                                    <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
                                    <div className="text-sm font-medium">勝利</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-bold text-lg">{post.matchResult.awayTeam}</div>
                                    <div className="text-2xl font-bold text-gray-600">{post.matchResult.awayScore}</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Images */}
                          {post.images.length > 0 && (
                            <div className="grid grid-cols-1 gap-2 mb-4">
                              {post.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`投稿画像 ${index + 1}`}
                                  className="rounded-lg object-cover h-32 w-full"
                                />
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-6 text-gray-500">
                            <button className="flex items-center gap-2 hover:text-red-600 transition-colors">
                              <Heart className="w-4 h-4" />
                              <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.comments}</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-green-600 transition-colors">
                              <Share2 className="w-4 h-4" />
                              <span>{post.shares}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="about" className="space-y-4">
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      チーム情報
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-gray-700">{team.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">基本情報</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">設立年:</span>
                            <span className="font-medium">{team.founded}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">カテゴリ:</span>
                            <span className="font-medium">{team.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">地区:</span>
                            <span className="font-medium">{team.district}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">人数:</span>
                            <span className="font-medium">{team.headcount}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">連絡先</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{team.contact.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>{team.contact.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-gray-500" />
                            <a href={team.contact.website} className="text-blue-600 hover:underline">
                              公式サイト
                            </a>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span>{team.contact.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link href="/teams">
            <Button variant="outline" className="px-6 py-3">
              <ChevronLeft className="w-4 h-4 mr-2" />
              チーム一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}