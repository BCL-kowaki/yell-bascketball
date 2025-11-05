"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea, Input } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, ImageIcon, MapPin, MoreHorizontal, Send, FileText, Search, X, Loader2 } from "lucide-react"
import { Layout } from "@/components/layout"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { listPosts, createPost as createDbPost, toggleLike as toggleDbLike, addComment as addDbComment, updatePostCounts, getCurrentUserEmail } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input as DialogInput } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

type Place = {
  id: string
  name: string
  address: string
}

type LinkPreviewData = {
  url: string
  title: string
  description: string
  image: string
}

type Reply = {
  id: number
  user: {
    id: number
    name: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  liked: boolean
}

type Comment = {
  id: number
  user: {
    id: number
    name: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  liked: boolean
  replies: Reply[]
}

type Post = {
  id: number
  dbId?: string
  user: {
    id: number
    name: string
    avatar: string
  }
  content: string
  image?: string
  pdfName?: string
  pdfUrl?: string
  location?: Place
  linkPreview?: LinkPreviewData
  likes: number
  comments: number
  shares: number
  timestamp: string
  liked: boolean
}

// Mock users data
const mockUsers = [
  {
    id: 1,
    name: "田中 太郎",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "佐藤 花子",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "山田 次郎",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "鈴木 美咲",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "高橋 健太",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "伊藤 愛子",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock comments data structure
const mockComments: { [key: number]: Comment[] } = {
  1: [
    {
      id: 1,
      user: mockUsers[2],
      content: "素敵な写真ですね！どちらのカフェですか？",
      timestamp: "25分前",
      likes: 3,
      liked: false,
      replies: [
        {
          id: 101,
          user: mockUsers[1],
          content: "ありがとうございます！これは渋谷の「STREAMER COFFEE COMPANY」ですよ！",
          timestamp: "15分前",
          likes: 2,
          liked: false,
        },
        {
          id: 102,
          user: mockUsers[2],
          content: "そうなんですね！今度行ってみます！",
          timestamp: "10分前",
          likes: 1,
          liked: true,
        },
      ],
    },
    {
      id: 2,
      user: mockUsers[0],
      content: "渋谷の新しいカフェです。とても雰囲気が良かったです！",
      timestamp: "20分前",
      likes: 1,
      liked: true,
      replies: [],
    },
  ],
  2: [
    {
      id: 3,
      user: mockUsers[1],
      content: "頑張ってください！応援しています。",
      timestamp: "1時間前",
      likes: 2,
      liked: false,
      replies: [],
    },
  ],
  3: [
    {
      id: 4,
      user: mockUsers[1],
      content: "家族との時間は大切ですね。素敵な写真です！",
      timestamp: "4時間前",
      likes: 5,
      liked: true,
      replies: [],
    },
    {
      id: 5,
      user: mockUsers[2],
      content: "お子さんたち、とても楽しそうですね！",
      timestamp: "3時間前",
      likes: 2,
      liked: false,
      replies: [],
    },
  ],
  4: [
    {
      id: 6,
      user: mockUsers[4],
      content: "お疲れ様です！素敵な写真ですね。",
      timestamp: "15分前",
      likes: 1,
      liked: false,
      replies: [],
    },
  ],
  5: [
    {
      id: 7,
      user: mockUsers[3],
      content: "素晴らしい演奏ですね！",
      timestamp: "30分前",
      likes: 3,
      liked: true,
      replies: [],
    },
  ],
  6: [
    {
      id: 8,
      user: mockUsers[5],
      content: "おいしそう！レシピを教えてください。",
      timestamp: "1時間前",
      likes: 2,
      liked: false,
      replies: [],
    },
  ],
}

// Mock timeline posts
const mockTimelinePosts: Post[] = [
  {
    id: 1,
    user: mockUsers[1],
    content: "今日は素晴らしい天気でした！渋谷で友達とカフェ巡りを楽しみました。新しいお店を発見できて嬉しいです。",
    image: "/placeholder.svg?height=400&width=600",
    likes: 42,
    comments: 8,
    shares: 3,
    timestamp: "30分前",
    liked: false,
  },
  {
    id: 2,
    user: mockUsers[2],
    content: "新しいプロジェクトが始まりました！チーム一同で頑張ります。技術的な挑戦が多そうですが、とても楽しみです。",
    likes: 28,
    comments: 5,
    shares: 2,
    timestamp: "2時間前",
    liked: true,
  },
  {
    id: 3,
    user: mockUsers[0],
    content: "週末は家族と一緒に公園でピクニックをしました。子供たちがとても喜んでいて、良い思い出になりました。",
    image: "/placeholder.svg?height=400&width=600",
    likes: 56,
    comments: 12,
    shares: 4,
    timestamp: "5時間前",
    liked: false,
  },
  {
    id: 4,
    user: mockUsers[3],
    content: "今日は一日中プログラミングの勉強をしていました。新しいフレームワークを学ぶのは大変ですが、とても楽しいです！",
    likes: 35,
    comments: 4,
    shares: 1,
    timestamp: "1時間前",
    liked: false,
  },
  {
    id: 5,
    user: mockUsers[4],
    content: "久しぶりにギターを弾きました。昔の曲を思い出しながら演奏するのは懐かしくて楽しいですね。",
    image: "/placeholder.svg?height=400&width=600",
    likes: 67,
    comments: 7,
    shares: 5,
    timestamp: "3時間前",
    liked: true,
  },
  {
    id: 6,
    user: mockUsers[5],
    content: "今日は料理に挑戦しました！新しいレシピを試してみて、家族に好評でした。料理は本当に楽しいですね。",
    image: "/placeholder.svg?height=400&width=600",
    likes: 89,
    comments: 18,
    shares: 8,
    timestamp: "4時間前",
    liked: false,
  },
  {
    id: 7,
    user: mockUsers[1],
    content:
      "読書の秋ですね。最近読んだ本がとても面白くて、一気に読み終えてしまいました。おすすめの本があれば教えてください！",
    likes: 19,
    comments: 15,
    shares: 1,
    timestamp: "1日前",
    liked: true,
  },
  {
    id: 8,
    user: mockUsers[2],
    content: "今日はジムでトレーニングをしました。新しいメニューに挑戦して、とても充実した時間でした。",
    likes: 45,
    comments: 6,
    shares: 2,
    timestamp: "6時間前",
    liked: false,
  },
  {
    id: 9,
    user: mockUsers[3],
    content: "夜の散歩が好きです。街の灯りを見ながら歩くのは、とてもリラックスできます。",
    likes: 23,
    comments: 3,
    shares: 1,
    timestamp: "8時間前",
    liked: true,
  },
  {
    id: 10,
    user: mockUsers[4],
    content: "今日は友達と映画を見に行きました。とても感動的な作品で、久しぶりに涙が出ました。",
    likes: 78,
    comments: 22,
    shares: 12,
    timestamp: "1日前",
    liked: false,
  },
]

// Mock location data
const mockPlaces: Place[] = [
  { id: "1", name: "東京タワー", address: "東京都港区芝公園４丁目２−８" },
  { id: "2", name: "東京スカイツリー", address: "東京都墨田区押上１丁目１−２" },
  { id: "3", name: "渋谷スクランブル交差点", address: "東京都渋谷区道玄坂２丁目２" },
  { id: "4", name: "新宿御苑", address: "東京都新宿区内藤町１１" },
  { id: "5", name: "浅草寺", address: "東京都台東区浅草２丁目３−１" },
  { id: "6", name: "東京駅", address: "東京都千代田区丸の内１丁目" },
  { id: "7", name: "皇居", address: "東京都千代田区千代田１−１" },
]

// Mock Link Preview Data
const mockLinkPreviews: { [key: string]: LinkPreviewData } = {
  "https://www.yell-com.com": {
    url: "https://www.yell-com.com",
    title: "Yell-Com",
    description: "スポーツで繋がる新しいコミュニケーションの場",
    image: "/placeholder.svg?height=200&width=400&text=Yell-Com",
  },
  "https://bleague.jp": {
    url: "https://bleague.jp",
    title: "B.LEAGUE（Bリーグ）公式サイト",
    description: "日本のプロバスケットボールリーグ「B.LEAGUE」の公式サイトです。",
    image: "/placeholder.svg?height=200&width=400&text=B.LEAGUE",
  },
}


export default function TimelinePage() {
  ensureAmplifyConfigured()
  const [posts, setPosts] = useState<Post[]>(mockTimelinePosts)
  const [newPost, setNewPost] = useState("")
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [locationResults, setLocationResults] = useState<Place[]>([])
  const [linkPreview, setLinkPreview] = useState<LinkPreviewData | null>(null)
  const [isFetchingPreview, setIsFetchingPreview] = useState(false)

  const [locationError, setLocationError] = useState<string | null>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [comments, setComments] = useState(mockComments)
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({})
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({})
  const [replyingTo, setReplyingTo] = useState<{ postId: number; commentId: number } | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const { toast } = useToast()

  // 初期ロードでDBから投稿を取得
  useEffect(() => {
    ;(async () => {
      try {
        const dbPosts = await listPosts(50)
        const mapped: Post[] = dbPosts.map((p, idx) => ({
          id: idx + 1, // ローカル用の連番ID
          dbId: p.id,
          user: mockUsers[0], // 簡易表示（将来: authorで表示）
          content: p.content,
          image: p.imageUrl ?? undefined,
          pdfName: p.pdfName ?? undefined,
          pdfUrl: p.pdfUrl ?? undefined,
          location: p.locationName ? { id: "-", name: p.locationName, address: p.locationAddress || "" } : undefined,
          linkPreview: p.linkUrl
            ? {
                url: p.linkUrl,
                title: p.linkTitle || "",
                description: p.linkDescription || "",
                image: p.linkImage || "/placeholder.svg?height=200&width=400&text=Link",
              }
            : undefined,
          likes: p.likesCount ?? 0,
          comments: p.commentsCount ?? 0,
          shares: 0,
          timestamp: p.createdAt || "",
          liked: false,
        }))
        if (mapped.length) setPosts(mapped)
      } catch (e) {
        console.error("Failed to load posts", e)
      }
    })()
  }, [])

  const handleLike = async (postId: number) => {
    const target = posts.find(p => p.id === postId)
    if (!target) return
    const email = await getCurrentUserEmail()
    if (!email || !target.dbId) {
      // ローカルのみ反映
      setPosts(posts.map(p => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p))
      return
    }
    try {
      const res = await toggleDbLike(target.dbId, email, target.likes)
      setPosts(posts.map(p => p.id === postId ? { ...p, liked: res.liked, likes: res.likes } : p))
    } catch (e) {
      console.error("toggle like failed", e)
    }
  }

  const handleCommentLike = (postId: number, commentId: number, replyId?: number) => {
    setComments((prevComments) => {
      const updatedCommentsForPost = prevComments[postId]?.map((comment) => {
        if (comment.id === commentId) {
          if (replyId) {
            // Like a reply
            const updatedReplies = comment.replies.map((reply) =>
              reply.id === replyId
                ? { ...reply, liked: !reply.liked, likes: reply.liked ? reply.likes - 1 : reply.likes + 1 }
                : reply
            );
            return { ...comment, replies: updatedReplies };
          } else {
            // Like a comment
            return {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            };
          }
        }
        return comment;
      });

      return {
        ...prevComments,
        [postId]: updatedCommentsForPost || [],
      };
    });
  }

  const toggleComments = (postId: number) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const handleSubmitComment = async (postId: number) => {
    const commentText = newComment[postId]?.trim()
    if (commentText) {
      const newCommentObj: Comment = {
        id: Date.now(),
        user: mockUsers[0],
        content: commentText,
        timestamp: "今",
        likes: 0,
        liked: false,
        replies: [],
      }

      setComments((prevComments) => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), newCommentObj],
      }))

      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments + 1,
              }
            : post,
        ),
      )

      setNewComment((prev) => ({
        ...prev,
        [postId]: "",
      }))

      // DBへ書き込み
      try {
        const post = posts.find(p => p.id === postId)
        if (post?.dbId) {
          const email = await getCurrentUserEmail()
          await addDbComment(post.dbId, commentText, email)
          await updatePostCounts(post.dbId, { commentsCount: post.comments + 1 })
        }
      } catch (e) {
        console.error("add comment failed", e)
      }
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
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

  const handleSubmitReply = (postId: number, commentId: number) => {
    if (replyContent.trim()) {
      const newReplyObj: Reply = {
        id: Date.now(),
        user: mockUsers[0],
        content: replyContent,
        timestamp: "今",
        likes: 0,
        liked: false,
      };

      setComments((prevComments) => ({
        ...prevComments,
        [postId]: prevComments[postId].map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, newReplyObj] }
            : comment
        ),
      }));

      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const fetchLinkPreview = async (url: string) => {
    if (isFetchingPreview) return
    setIsFetchingPreview(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const matchedDomain = Object.keys(mockLinkPreviews).find((domain) => url.includes(domain))
    if (matchedDomain) {
      setLinkPreview(mockLinkPreviews[matchedDomain])
    } else {
      // Generic preview for any other link
      setLinkPreview({
        url,
        title: "プレビューを取得できませんでした",
        description: "指定されたURLのプレビューは表示できません。",
        image: "/placeholder.svg?height=200&width=400&text=No+Preview",
      })
    }
    setIsFetchingPreview(false)
  }

  const handleShare = (postId: number) => {
    const postUrl = `${window.location.origin}#post-${postId}`
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

  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = newPost.match(urlRegex)

    if (urls && urls[0]) {
      if (linkPreview?.url !== urls[0]) {
        fetchLinkPreview(urls[0])
      }
    } else {
      setLinkPreview(null)
    }
  }, [newPost])

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

  const handlePdfButtonClick = () => {
    pdfInputRef.current?.click()
  }

  const handleImageButtonClick = () => {
    imageInputRef.current?.click()
  }

  const handleLocationButtonClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationError(null)
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("位置情報の取得が拒否されました。")
              break
            case error.POSITION_UNAVAILABLE:
              setLocationError("位置情報が利用できません。")
              break
            case error.TIMEOUT:
              setLocationError("位置情報の取得がタイムアウトしました。")
              break
            default:
              setLocationError("位置情報の取得中にエラーが発生しました。")
              break
          }
        },
      )
    } else {
      setLocationError("お使いのブラウザは位置情報取得に対応していません。")
    }
  }

  const handleSubmitPost = async () => {
    if (newPost.trim() || selectedPdf || selectedImage || selectedPlace) {
      // まずDBへ保存
      try {
        const email = await getCurrentUserEmail()
        const created = await createDbPost({
          content: newPost,
          imageUrl: imagePreview || null,
          pdfUrl: pdfPreview || null,
          pdfName: selectedPdf?.name || null,
          locationName: selectedPlace?.name || null,
          locationAddress: selectedPlace?.address || null,
          linkUrl: linkPreview?.url || null,
          linkTitle: linkPreview?.title || null,
          linkDescription: linkPreview?.description || null,
          linkImage: linkPreview?.image || null,
          likesCount: 0,
          commentsCount: 0,
          authorEmail: email,
        })

        const newPostObj: Post = {
          id: Date.now(),
          dbId: created.id,
          user: mockUsers[0],
          content: newPost,
          likes: 0,
          comments: 0,
          shares: 0,
          timestamp: "今",
          liked: false,
        }
        if (selectedPdf && pdfPreview) {
          newPostObj.pdfName = selectedPdf.name
          newPostObj.pdfUrl = pdfPreview
        }
        if (imagePreview) {
          newPostObj.image = imagePreview
        }
        if (selectedPlace) {
          newPostObj.location = selectedPlace
        }
        if (linkPreview) {
          newPostObj.linkPreview = linkPreview
        }
        setPosts([newPostObj, ...posts])
      } catch (e) {
        console.error("create post failed", e)
      }
      setNewPost("")
      setSelectedPdf(null)
      setPdfPreview(null)
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedPlace(null)
      setLinkPreview(null)
      setLocationError(null)
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl pt-2 pb-20 px-2 md:px-6 space-y-4 md:space-y-8">
        {/* Create Post */}
        <Card className="w-full border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12 ring-2 ring-orange-100">
                <AvatarImage src={mockUsers[0].avatar || "/placeholder.svg"} alt={mockUsers[0].name} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold">
                  {mockUsers[0].name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea 
                  placeholder={`${mockUsers[0].name || 'ユーザー'}さん、今何をしていますか？`}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px] resize-none border-none shadow-none focus-visible:ring-0 text-base bg-transparent placeholder:text-gray-400"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full" onClick={handleImageButtonClick}>
                  <ImageIcon className="w-5 h-5 md:mr-2" />
                  <span className="hidden md:inline">写真</span>
                </Button>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full" onClick={handlePdfButtonClick}>
                  <FileText className="w-5 h-5 md:mr-2" />
                  <span className="hidden md:inline">PDF</span>
                </Button>
                <input
                  type="file"
                  ref={pdfInputRef}
                  onChange={handlePdfSelect}
                  accept=".pdf"
                  style={{ display: "none" }}
                />

                <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full">
                      <MapPin className="w-5 h-5 md:mr-2" />
                      <span className="hidden md:inline">場所</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>場所を検索</DialogTitle>
                    </DialogHeader>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <DialogInput 
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
                onClick={handleSubmitPost} 
                disabled={!newPost.trim() && !selectedPdf && !selectedImage && !selectedPlace} 
                className="px-8 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                投稿
              </Button>
            </div>
            <div className="pt-4 space-y-2">
              {isFetchingPreview && (
                <div className="flex items-center gap-2 text-gray-500 text-sm p-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>プレビューを読み込んでいます...</span>
                </div>
              )}
              {linkPreview && !isFetchingPreview && (
                <div className="relative border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white z-10"
                    onClick={() => setLinkPreview(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <a href={linkPreview.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 transition-colors">
                    <img src={linkPreview.image} alt={linkPreview.title} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <div className="font-semibold text-sm text-gray-800 truncate">{linkPreview.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{linkPreview.description}</div>
                    </div>
                  </a>
                </div>
              )}
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Selected preview" className="rounded-lg max-h-40 w-auto" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 rounded-full h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedImage(null)
                      setImagePreview(null)
                      if (imageInputRef.current) {
                        imageInputRef.current.value = ""
                      }
                    }}
                  >
                    X
                  </Button>
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
                  <span>選択中のPDF: {selectedPdf.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedPdf(null)
                      if (pdfPreview) {
                        URL.revokeObjectURL(pdfPreview)
                        setPdfPreview(null)
                      }
                      if (pdfInputRef.current) {
                        pdfInputRef.current.value = ""
                      }
                    }}
                  >
                    X
                  </Button>
                </div>
              )}
              {locationError && <div className="text-sm text-red-500">{locationError}</div>}
            </div>
          </CardContent>
        </Card>

                {/* Timeline Posts */}
        {posts.map((post) => (
          <Card key={post.id} className="w-full border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                    <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold">
                      {post.user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 hover:text-orange-600 cursor-pointer transition-colors">{post.user.name}</div>
                    <div className="text-sm text-gray-500">{post.timestamp}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-4">
              <p className="mb-6 text-gray-800 leading-relaxed">{post.content}</p>
              
              {post.linkPreview && (
                <div className="mb-4 border rounded-lg overflow-hidden">
                   <a href={post.linkPreview.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 transition-colors">
                    <img src={post.linkPreview.image} alt={post.linkPreview.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <div className="font-semibold text-gray-800 truncate">{post.linkPreview.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{post.linkPreview.description}</div>
                    </div>
                  </a>
                </div>
              )}

              {post.location && (
                <div className="mb-4 text-sm text-gray-500 flex items-center gap-2 p-3 rounded-lg bg-gray-50 border">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{post.location.name}</span>
                    <span className="text-xs">{post.location.address}</span>
                  </div>
                </div>
              )}

              {post.pdfUrl && (
                <div className="mb-6">
                  <div className="p-4 rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 flex items-center gap-4">
                    <FileText className="w-8 h-8 text-red-500" />
                    <a
                      href={post.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {post.pdfName}
                    </a>
                  </div>
                  <iframe
                    src={post.pdfUrl}
                    width="100%"
                    height="500px"
                    className="rounded-b-lg border border-gray-200"
                  ></iframe>
                </div>
              )}

              {post.image && (
                <div className="mb-6 rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Post content"
                    className="w-full h-auto cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              )}

              {/* Engagement Stats */}
              <div className="flex items-center justify-between py-3 mb-4 text-sm text-gray-500 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  {post.likes > 0 && (
                    <span className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                        <Heart className="w-3 h-3 text-white fill-current" />
                      </div>
                      <span className="font-medium">{post.likes}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  {post.comments > 0 && (
                    <button onClick={() => toggleComments(post.id)} className="hover:text-orange-600 cursor-pointer font-medium transition-colors">
                      {post.comments}件のコメント
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-around pt-2 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-1 rounded-full py-3 ${post.liked ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-600 hover:text-red-500 hover:bg-red-50"}`}
                  onClick={() => handleLike(post.id)}
                >
                  <Heart className={`w-5 h-5 mr-2 ${post.liked ? "fill-current" : ""}`} />
                  <span className="font-medium">{post.liked ? "いいね済み" : "いいね"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 rounded-full py-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">コメント</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 rounded-full py-3 text-gray-600 hover:text-green-600 hover:bg-green-50"
                  onClick={() => handleShare(post.id)}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  <span className="font-medium">シェア</span>
                </Button>
              </div>

              {showComments[post.id] && (
                <div className="border-t border-gray-100 pt-6">
                  {/* Comment Input */}
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-10 h-10 ring-2 ring-orange-100">
                      <AvatarImage src={mockUsers[0].avatar || "/placeholder.svg"} alt={mockUsers[0].name} />
                      <AvatarFallback className="text-sm bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold">
                        {mockUsers[0].name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-center gap-3">
                      <Input
                        placeholder="コメントを書く..."
                        value={newComment[post.id] || ""}
                        onChange={(e) =>
                          setNewComment((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-full border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSubmitComment(post.id)
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSubmitComment(post.id)}
                        disabled={!newComment[post.id]?.trim()}
                        className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-4">
                        <Avatar className="w-10 h-10 ring-2 ring-gray-100">
                          <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                          <AvatarFallback className="text-sm bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold">
                            {comment.user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-2xl px-4 py-3 shadow-sm">
                            <div className="font-semibold text-sm mb-2 text-gray-900">{comment.user.name}</div>
                            <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-6 mt-2 text-xs text-gray-500">
                            <button
                              onClick={() => handleCommentLike(post.id, comment.id)}
                              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                                comment.liked ? "text-red-500" : ""
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${comment.liked ? "fill-current" : ""}`} />
                              {comment.likes > 0 && <span className="font-medium">{comment.likes}</span>}
                            </button>
                            <button
                              onClick={() => {
                                if (replyingTo?.commentId === comment.id) {
                                  setReplyingTo(null)
                                } else {
                                  setReplyingTo({ postId: post.id, commentId: comment.id })
                                }
                              }}
                              className="hover:text-orange-600 cursor-pointer font-medium"
                            >
                              返信
                            </button>
                            <span className="font-medium">{comment.timestamp}</span>
                          </div>

                          {/* Replies */}
                          <div className="mt-4 pl-8 space-y-4 border-l-2 border-gray-100">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={reply.user.avatar || "/placeholder.svg"} alt={reply.user.name} />
                                  <AvatarFallback className="text-xs">
                                    {reply.user.name.split(" ").map((n: string) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-white rounded-xl px-3 py-2 shadow-sm border">
                                    <div className="font-semibold text-xs mb-1 text-gray-800">{reply.user.name}</div>
                                    <p className="text-xs text-gray-600">{reply.content}</p>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                    <button
                                      onClick={() => handleCommentLike(post.id, comment.id, reply.id)}
                                      className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                                        reply.liked ? "text-red-500" : ""
                                      }`}
                                    >
                                      <Heart className={`w-3 h-3 ${reply.liked ? "fill-current" : ""}`} />
                                      {reply.likes > 0 && <span className="font-medium text-xs">{reply.likes}</span>}
                                    </button>
                                    <span className="font-medium">{reply.timestamp}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Reply Input */}
                          {replyingTo?.postId === post.id && replyingTo?.commentId === comment.id && (
                            <div className="flex items-center gap-2 mt-4 pl-8">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={mockUsers[0].avatar || "/placeholder.svg"} alt={mockUsers[0].name} />
                                <AvatarFallback className="text-xs">
                                  {mockUsers[0].name.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 flex items-center gap-2">
                                <Input
                                  placeholder={`${comment.user.name}に返信...`}
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  className="flex-1 rounded-full text-sm"
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      handleSubmitReply(post.id, comment.id)
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitReply(post.id, comment.id)}
                                  disabled={!replyContent.trim()}
                                  className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
