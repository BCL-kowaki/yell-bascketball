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
  MapPin, 
  Trophy, 
  Users, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  Clock,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Pin,
  Award,
  Target,
  TrendingUp,
  Eye,
  UserPlus,
  Building2,
  Flag,
  Zap,
  Bell,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  MoreHorizontal,
  FileText,
  ImageIcon,
  Search,
  X,
} from "lucide-react"
import { Layout } from "@/components/layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

// Type Definitions
type Place = {
  id: string
  name: string
  address: string
}

// Post Type Definition
type Post = {
  id: string
  type: "official" | "team" | "user"
  author: string
  authorRole: string
  authorAvatar: string
  timestamp: string
  content: string
  images: string[]
  pdfName?: string
  pdfUrl?: string
  location?: Place
  likes: number
  comments: number
  shares: number
  isPinned: boolean
  matchInfo?: {
    team1: string
    team2: string
    score1: number | null
    score2: number | null
    status: string
  }
  matchResult?: {
    winner: string
    loser: string
    score: string
    round: string
  }
}

// Mock tournament data
const tournamentData = {
  "tokyo-spring-championship": {
    id: "tokyo-spring-championship",
    title: "東京春季バスケットボール選手権",
    organizer: "東京都バスケットボール協会",
    organizerAvatar: "/placeholder.svg?height=40&width=40&text=協会",
    location: "東京体育館",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    registrationDeadline: "2024-03-01",
    status: "ongoing",
    category: "一般男子",
    level: "プロ・社会人",
    maxTeams: 32,
    currentTeams: 32,
    entryFee: "¥50,000",
    prize: "優勝: ¥500,000",
    description: "東京都最大級の春季バスケットボール大会。プロチームから社会人チームまで幅広く参加可能。",
    image: "/placeholder.svg?height=300&width=600&text=春季選手権",
    bracket: "トーナメント形式（32チーム）",
    currentRound: "準々決勝",
    nextMatch: "2024-03-16 14:00",
    liveStream: "https://youtube.com/live/example",
    editors: ["admin@yell.com", "user1@example.com"],
  }
}

// Mock location data
const mockPlaces: Place[] = [
  { id: "1", name: "東京体育館", address: "東京都渋谷区千駄ケ谷１丁目１７−１" },
  { id: "2", name: "駒沢オリンピック公園総合運動場体育館", address: "東京都世田谷区駒沢公園１−１" },
  { id: "3", "name": "代々木第一体育館", "address": "東京都渋谷区神南２丁目１−１" },
]


// Mock timeline posts
const timelinePosts: Post[] = [
  {
    id: "post-1",
    type: "official", // official, team, user
    author: "東京都バスケットボール協会",
    authorRole: "大会主催者",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=協会",
    timestamp: "2024-03-16 13:45",
    content: "🏀 準々決勝第2試合が間もなく開始します！\n\n📍 東京体育館 メインコート\n⏰ 14:00 キックオフ\n🆚 アルバルク東京 vs 横浜ビー・コルセアーズ\n\n両チームとも調子が良く、白熱した試合が期待されます！\n\n#東京春季選手権 #準々決勝 #ライブ配信中",
    images: ["/placeholder.svg?height=200&width=300&text=試合前"],
    likes: 45,
    comments: 12,
    shares: 8,
    isPinned: true,
    matchInfo: {
      team1: "アルバルク東京",
      team2: "横浜ビー・コルセアーズ",
      score1: null,
      score2: null,
      status: "upcoming"
    }
  },
  {
    id: "post-2",
    type: "team",
    author: "千葉ジェッツ",
    authorRole: "参加チーム",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=千葉",
    timestamp: "2024-03-16 12:30",
    content: "準々決勝進出ありがとうございました！🙏\n\n第1試合では埼玉ブロンコスさんと激戦を繰り広げ、89-85で勝利することができました。\n\n次戦は準決勝！チーム一丸となって頑張ります💪\n\n応援ありがとうございます！\n\n#千葉ジェッツ #準々決勝突破 #感謝",
    images: ["/placeholder.svg?height=200&width=300&text=勝利の瞬間"],
    likes: 128,
    comments: 34,
    shares: 19,
    isPinned: false,
    matchResult: {
      winner: "千葉ジェッツ",
      loser: "埼玉ブロンコス",
      score: "89-85",
      round: "準々決勝第1試合"
    }
  },
  {
    id: "post-3",
    type: "user",
    author: "バスケファン太郎",
    authorRole: "観戦者",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=太",
    timestamp: "2024-03-16 11:15",
    content: "第1試合、めちゃくちゃ面白かった！🔥\n\n千葉ジェッツの最後の逆転劇は鳥肌もの！特に田中選手の3ポイントシュートは神がかってた✨\n\n埼玉ブロンコスも最後まで諦めない姿勢が素晴らしかった👏\n\n次の試合も楽しみ！\n\n#バスケ最高 #感動した",
    images: [],
    likes: 67,
    comments: 23,
    shares: 5,
    isPinned: false
  },
  {
    id: "post-4",
    type: "official",
    author: "東京都バスケットボール協会",
    authorRole: "大会主催者",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=協会",
    timestamp: "2024-03-16 10:00",
    content: "🏆 準々決勝第1試合結果発表\n\n千葉ジェッツ 89 - 85 埼玉ブロンコス\n\n素晴らしい試合でした！両チームお疲れ様でした🙌\n\n千葉ジェッツは準決勝進出おめでとうございます！\n埼玉ブロンコスも最後まで諦めない素晴らしいプレーでした👏\n\n次戦は14:00からです！",
    images: ["/placeholder.svg?height=200&width=300&text=試合結果"],
    likes: 89,
    comments: 15,
    shares: 12,
    isPinned: false,
    matchResult: {
      winner: "千葉ジェッツ",
      loser: "埼玉ブロンコス",
      score: "89-85",
      round: "準々決勝第1試合"
    }
  },
  {
    id: "post-5",
    type: "team",
    author: "アルバルク東京",
    authorRole: "参加チーム",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=東京",
    timestamp: "2024-03-16 09:30",
    content: "準々決勝に向けて最終調整完了！💪\n\n今日は横浜ビー・コルセアーズさんとの対戦です。\n\n相手は強豪チームですが、これまでの練習の成果を発揮して全力で戦います🔥\n\n応援よろしくお願いします！\n\n#アルバルク東京 #準々決勝 #全力で戦います",
    images: ["/placeholder.svg?height=200&width=300&text=練習風景"],
    likes: 156,
    comments: 28,
    shares: 14,
    isPinned: false
  }
]

// Mock participating teams
const participatingTeams = [
  { id: "1", name: "アルバルク東京", logo: "/placeholder.svg?height=40&width=40&text=東京", status: "準々決勝", wins: 3, losses: 0 },
  { id: "2", name: "千葉ジェッツ", logo: "/placeholder.svg?height=40&width=40&text=千葉", status: "準決勝進出", wins: 4, losses: 0 },
  { id: "3", name: "横浜ビー・コルセアーズ", logo: "/placeholder.svg?height=40&width=40&text=横浜", status: "準々決勝", wins: 3, losses: 0 },
  { id: "4", name: "埼玉ブロンコス", logo: "/placeholder.svg?height=40&width=40&text=埼玉", status: "敗退", wins: 3, losses: 1 },
  { id: "5", name: "茨城ロボッツ", logo: "/placeholder.svg?height=40&width=40&text=茨城", status: "敗退", wins: 2, losses: 1 },
  { id: "6", name: "群馬クレインサンダーズ", logo: "/placeholder.svg?height=40&width=40&text=群馬", status: "敗退", wins: 1, losses: 1 },
  { id: "7", name: "栃木ブレックス", logo: "/placeholder.svg?height=40&width=40&text=栃木", status: "敗退", wins: 1, losses: 1 },
  { id: "8", name: "サンロッカーズ渋谷", logo: "/placeholder.svg?height=40&width=40&text=渋谷", status: "敗退", wins: 0, losses: 1 }
]

interface TournamentTimelinePageProps {
  params: {
    tournamentId: string
  }
}

export default function TournamentTimelinePage({ params }: TournamentTimelinePageProps) {
  const [posts, setPosts] = useState<Post[]>(timelinePosts)
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
  const [userRole, setUserRole] = useState("user") // user, team, organizer
  
  const tournament = tournamentData[params.tournamentId as keyof typeof tournamentData]
  
  if (!tournament) {
    return <div>大会が見つかりません</div>
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
        type: "user",
        author: "ユーザー",
        authorRole: "観戦者",
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
        return <Flag className="w-4 h-4 text-red-600" />
      case "team":
        return <Users className="w-4 h-4 text-orange-600" />
      case "user":
        return <MessageCircle className="w-4 h-4 text-gray-600" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ongoing":
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
    <Layout isLoggedIn={true} currentUser={{ name: "ユーザー" }}>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs md:text-sm flex-wrap">
          <Link href="/tournaments" className="text-gray-500 hover:text-gray-700">
            大会トップ
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/tournaments/kanto" className="text-gray-500 hover:text-gray-700">
            関東エリア
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/tournaments/kanto/tokyo" className="text-gray-500 hover:text-gray-700">
            東京都
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-orange-600 font-medium">{tournament.title}</span>
        </div>

        {/* Tournament Header */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <div className="relative overflow-hidden">
              <img 
                src={tournament.image} 
                alt={tournament.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 w-[90%] left-1/2 -translate-x-1/2 text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{tournament.title}</h1>
                <div className="flex items-center gap-4 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{tournament.startDate} - {tournament.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{tournament.currentTeams}チーム参加</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tournament Stats */}
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              {/* <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm border border-gray-200 mb-6">
                <TabsTrigger value="timeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white">
                  タイムライン
                </TabsTrigger>
                <TabsTrigger value="results" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white">
                  試合結果
                </TabsTrigger>
                <TabsTrigger value="bracket" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white">
                  トーナメント表
                </TabsTrigger>
              </TabsList> */}
              
              <TabsContent value="info">
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>大会情報</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{tournament.description}</p>
                    {/* Other info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">編集権限を持つユーザー</h3>
                      <div className="space-y-2 text-sm">
                        {tournament.editors.map((editor) => (
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
                          placeholder="大会について投稿する..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="min-h-[100px] resize-none border-gray-200 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <div className="flex items-center justify-between mt-4">
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
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
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

                      {/* Images */}
                      {post.images.length > 0 && (
                        <div className="grid gap-2 mb-4">
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

              <TabsContent value="results" className="space-y-4">
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-orange-600" />
                      試合結果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-green-100 text-green-800">準々決勝第1試合</Badge>
                          <span className="text-sm text-gray-500">2024-03-16 10:00 終了</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="font-bold text-lg">千葉ジェッツ</div>
                            <div className="text-2xl font-bold text-green-600">89</div>
                          </div>
                          <div className="text-center">
                            <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                            <div className="text-sm">勝利</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg">埼玉ブロンコス</div>
                            <div className="text-2xl font-bold text-gray-600">85</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-blue-100 text-blue-800">準々決勝第2試合</Badge>
                          <span className="text-sm text-gray-500">2024-03-16 14:00 開始予定</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="font-bold text-lg">アルバルク東京</div>
                            <div className="text-lg text-gray-500">-</div>
                          </div>
                          <div className="text-center">
                            <Clock className="w-6 h-6 text-orange-600 mx-auto" />
                            <div className="text-sm">開始前</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg">横浜ビー・コルセアーズ</div>
                            <div className="text-lg text-gray-500">-</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bracket" className="space-y-4">
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-600" />
                      トーナメント表
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-4">
                        <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">トーナメント表</p>
                        <p className="text-sm">現在準備中です</p>
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
          <Link href="/tournaments/kanto/tokyo">
            <Button variant="outline" className="px-6 py-3">
              <ChevronLeft className="w-4 h-4 mr-2" />
              大会一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}