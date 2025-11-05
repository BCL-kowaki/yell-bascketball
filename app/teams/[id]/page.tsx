"use client"
import { useState, useRef, useEffect } from "react"
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
  ExternalLink,
  Flag,
  MoreHorizontal,
  ImageIcon,
  FileText,
  Search,
  X,
} from "lucide-react"
import { Layout } from "@/components/layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

type Place = {
  id: string
  name: string
  address: string
}

type Post = {
  id: string
  author: string
  authorAvatar: string
  timestamp: string
  content: string
  images?: string[]
  pdfName?: string
  pdfUrl?: string
  location?: Place
  likes: number
  comments: number
  shares: number
  isPinned: boolean
  type?: "official"
  authorRole?: "公式"
  matchResult?: {
    homeTeam: string
    awayTeam: string
    homeScore: number
    awayScore: number
    date: string
  }
}

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
      website: "https://albirex-tokyo.jp",
    },
    privacy: "public",
    socialMedia: {
      twitter: "@albirex_tokyo",
      instagram: "@albirex_tokyo_official",
      youtube: "AlbirexTokyoOfficial"
    },
    editors: [
      "admin@yell.com",
      "user1@example.com",
      "user2@example.com",
    ]
  }
}

// Mock location data
const mockPlaces: Place[] = [
  { id: "1", name: "アリーナ立川立飛", address: "東京都立川市泉町５００−４" },
  { id: "2", name: "武蔵野の森総合スポーツプラザ", address: "東京都調布市西町２９０−１１" },
  { id: "3", name: "エスフォルタアリーナ八王子", address: "東京都八王子市狭間町１４５３−１" },
]

// Mock timeline posts for team
const teamPosts: Post[] = [
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
  const [posts, setPosts] = useState<Post[]>(teamPosts)
  const [newPost, setNewPost] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [locationResults, setLocationResults] = useState<Place[]>([])
  const [locationError, setLocationError] = useState<string | null>(null)
  const { toast } = useToast()

  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const [selectedTab, setSelectedTab] = useState("timeline")
  const [userRole, setUserRole] = useState("fan") // fan, member, admin
  
  // Use params directly - Next.js 15 handles this properly in client components
  const team = teamData[params.id as keyof typeof teamData]
  
  if (!team) {
    return (
      <Layout>
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

  useEffect(() => {
    if (locationSearch.trim() === "") {
      setLocationResults([])
      return
    }
    const results = mockPlaces.filter((place) =>
      place.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      place.address.toLowerCase().includes(locationSearch.toLowerCase())
    )
    setLocationResults(results)
  }, [locationSearch])

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handlePdfSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedPdf(file)
      if (pdfPreview) {
        URL.revokeObjectURL(pdfPreview)
      }
      setPdfPreview(URL.createObjectURL(file))
    }
  }

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationError(null)
        },
        (error) => {
          setLocationError("位置情報の取得に失敗しました。")
        }
      )
    } else {
      setLocationError("お使いのブラウザは位置情報をサポートしていません。")
    }
  }

  const handlePost = () => {
    if (newPost.trim() || selectedImage || selectedPdf || selectedPlace) {
      const newPostObj: Post = {
        id: `post-${Date.now()}`,
        author: "ユーザー",
        authorAvatar: "/placeholder.svg?height=40&width=40&text=U",
        timestamp: new Date().toISOString(),
        content: newPost,
        images: imagePreview ? [imagePreview] : [],
        pdfName: selectedPdf?.name,
        pdfUrl: pdfPreview || undefined,
        location: selectedPlace || undefined,
        likes: 0,
        comments: 0,
        shares: 0,
        isPinned: false,
      }

      setPosts([newPostObj, ...posts])
      
      // Reset form
      setNewPost("")
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedPdf(null)
      setPdfPreview(null)
      setSelectedPlace(null)
      setLocationError(null)
      if (imageInputRef.current) imageInputRef.current.value = ""
      if (pdfInputRef.current) pdfInputRef.current.value = ""
    }
  }

  const handleShare = (postId: string) => {
    const postUrl = `${window.location.href.split('#')[0]}#post-${postId}`
    navigator.clipboard.writeText(postUrl).then(() => {
      toast({
        title: "リンクをコピーしました",
        description: "投稿へのリンクがクリップボードにコピーされました。",
      })
    }).catch(err => {
      console.error("リンクのコピーに失敗しました:", err)
      toast({
        title: "コピーに失敗しました",
        variant: "destructive",
      })
    })
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "official":
        return <Flag className="w-4 h-4 text-orange-600" />
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
        return <Shield className="w-4 h-4 text-orange-600" />
      default:
        return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs md:text-sm flex-wrap">
          <Link href="/teams" className="text-gray-500 hover:text-gray-700">
            チーム一覧
          </Link>
          <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
          <span className="text-orange-600 font-medium">{team.name}</span>
        </div>

        {/* Team Header */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <div className="relative overflow-hidden">
              <img 
                src={team.coverImage} 
                alt={team.name}
                className="w-full h-48 md:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute bottom-6 w-[90%] left-1/2 -translate-x-1/2 text-white">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <Avatar className="w-20 h-20 border-4 border-white">
                    <AvatarImage src={team.logo} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-2xl font-bold">
                      {team.shortName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{team.name}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{team.district}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant={team.isFollowing ? "outline" : "default"}
                  className={`${team.isFollowing ? "bg-white/90 text-gray-900 hover:bg-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}
                  size="sm"
                >
                  {team.isFollowing ? <UserMinus className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  {team.isFollowing ? "フォロー中" : "フォロー"}
                </Button>
                {userRole === "admin" && (
                  <Button variant="outline" size="sm" className="bg-white/90 text-gray-900 hover:bg-white">
                    <Settings className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm border border-gray-200 mb-6">
                <TabsTrigger value="timeline">タイムライン</TabsTrigger>
                <TabsTrigger value="about">チーム情報</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-6">
                {/* Post Creation */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-2">
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
                          className="min-h-[100px] resize-none border-gray-200 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()}>
                              <ImageIcon className="w-5 h-5 text-gray-600" />
                            </Button>
                            <input type="file" ref={imageInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />

                            <Button variant="ghost" size="icon" onClick={() => pdfInputRef.current?.click()}>
                              <FileText className="w-5 h-5 text-gray-600" />
                            </Button>
                            <input type="file" ref={pdfInputRef} onChange={handlePdfSelect} accept=".pdf" className="hidden" />
                            
                            <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MapPin className="w-5 h-5 text-gray-600" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>場所を検索</DialogTitle>
                                </DialogHeader>
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  <Input 
                                    placeholder="場所を検索..." 
                                    value={locationSearch}
                                    onChange={(e) => setLocationSearch(e.target.value)}
                                    className="pl-10"
                                  />
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {locationResults.map((place) => (
                                    <div 
                                      key={place.id} 
                                      className="p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                                      onClick={() => {
                                        setSelectedPlace(place)
                                        setIsLocationDialogOpen(false)
                                        setLocationSearch("")
                                      }}
                                    >
                                      <div className="font-semibold">{place.name}</div>
                                      <div className="text-sm text-gray-500">{place.address}</div>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <Button 
                            onClick={handlePost} 
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                            disabled={!newPost.trim() && !selectedImage && !selectedPdf && !selectedPlace}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            投稿
                          </Button>
                        </div>
                         <div className="pt-2 space-y-2">
                          {imagePreview && (
                            <div className="relative w-fit">
                              <img src={imagePreview} alt="Preview" className="h-20 rounded-md" />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-5 w-5 p-0 rounded-full"
                                onClick={() => {
                                  setImagePreview(null)
                                  setSelectedImage(null)
                                  if (imageInputRef.current) imageInputRef.current.value = ""
                                }}
                              >X</Button>
                            </div>
                          )}
                          {selectedPlace && (
                            <div className="relative text-sm text-green-600 p-2 border border-green-200 bg-green-50 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{selectedPlace.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full hover:bg-green-100"
                                onClick={() => setSelectedPlace(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {selectedPdf && (
                            <div className="relative text-sm text-gray-500 p-2 border rounded-lg flex items-center justify-between">
                              <span>PDF: {selectedPdf.name}</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-5 w-5 p-0 rounded-full"
                                onClick={() => {
                                  setSelectedPdf(null)
                                  if (pdfPreview) URL.revokeObjectURL(pdfPreview)
                                  setPdfPreview(null)
                                  if (pdfInputRef.current) pdfInputRef.current.value = ""
                                }}
                              >X</Button>
                            </div>
                          )}
                          {locationError && <div className="text-sm text-red-500">{locationError}</div>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline Posts */}
                {posts.map((post) => (
                  <Card key={post.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardHeader className="p-4 flex flex-row items-start gap-3">
                      <Avatar>
                        <AvatarImage src={post.authorAvatar} />
                        <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{post.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.isPinned && (
                          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 font-normal text-xs">
                            <Pin className="w-3 h-3 mr-1" />
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="text-gray-500 w-8 h-8">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="px-4 pt-0 pb-2">
                      <div className="text-gray-800 whitespace-pre-line mb-4">
                        {post.content}
                      </div>

                      {/* Location */}
                      {post.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 p-2 rounded-lg bg-gray-50 border">
                          <MapPin className="w-4 h-4 text-orange-500" />
                           <div>
                            <div className="font-semibold text-gray-800">{post.location.name}</div>
                            <div className="text-xs">{post.location.address}</div>
                          </div>
                        </div>
                      )}

                      {/* PDF Preview */}
                      {post.pdfUrl && (
                        <div className="mb-4">
                          <div className="p-2 rounded-t-lg border border-b-0 bg-gray-50 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-red-500" />
                            <a href={post.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium">
                              {post.pdfName}
                            </a>
                          </div>
                          <iframe src={post.pdfUrl} width="100%" height="400px" className="rounded-b-lg border"></iframe>
                        </div>
                      )}

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
                      {post.images && post.images.length > 0 && (
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
                    </CardContent>

                    <div className="px-4 pb-2 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" /> 
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>{post.comments}件のコメント</span>
                      </div>
                    </div>
                    
                    <div className="mx-4 border-t border-gray-200"></div>

                    <div className="p-1 flex items-center justify-around text-gray-600 font-medium text-sm">
                      <button className="flex items-center justify-center gap-2 hover:bg-gray-100 rounded-md p-2 flex-1 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span>いいね！</span>
                      </button>
                      <button className="flex items-center justify-center gap-2 hover:bg-gray-100 rounded-md p-2 flex-1 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span>コメント</span>
                      </button>
                      <button 
                        className="flex items-center justify-center gap-2 hover:bg-gray-100 rounded-md p-2 flex-1 transition-colors"
                        onClick={() => handleShare(post.id)}
                      >
                        <Share2 className="w-5 h-5" />
                        <span>シェア</span>
                      </button>
                    </div>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="about" className="space-y-4">
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-orange-600" />
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
                            <ExternalLink className="w-4 h-4 text-gray-500" />
                            <a href={team.contact.website} className="text-orange-600 hover:underline">
                              SNSアカウントなど
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">編集権限を持つユーザー</h3>
                      <div className="space-y-2 text-sm">
                        {team.editors.map((editor) => (
                          <div key={editor} className="flex items-center gap-2">
                             <Avatar className="w-6 h-6">
                              <AvatarImage src={`/placeholder.svg?height=24&width=24&text=${editor.charAt(0).toUpperCase()}`} />
                              <AvatarFallback>{editor.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{editor}</span>
                          </div>
                        ))}
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