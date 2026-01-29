"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Layout } from "@/components/layout"
import { CommentModal } from "@/components/comment-modal"
import {
  ChevronLeft,
  Trophy,
  MapPin,
  Calendar,
  Users,
  Mail,
  Heart,
  Edit2,
  Save,
  X,
  ImageIcon,
  FileText,
  Send,
  MessageCircle,
  Instagram,
  MoreHorizontal,
  Loader2,
  Video,
  Share2,
  Search,
  Plus
} from "lucide-react"
import {
  getTournament,
  updateTournament,
  getCurrentUserEmail,
  getUserByEmail,
  getPostsByTournament,
  createPost,
  toggleLike as toggleDbLike,
  addComment as addDbComment,
  getCommentsByPost,
  updatePostCounts,
  toggleFavoriteTournament,
  checkFavoriteTournament,
  getTournamentTeams,
  addTournamentTeam,
  removeTournamentTeam,
  getTournamentResults,
  createTournamentResult,
  updateTournamentResult,
  deleteTournamentResult,
  checkLikeStatus,
  searchTeams,
  searchUsers,
  type DbTournament,
  type DbUser,
  type DbPost,
  type DbComment,
  type DbTournamentTeam,
  type DbTournamentResult,
  type DbTeam
} from "@/lib/api"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { useToast } from "@/hooks/use-toast"
import { uploadImageToS3, uploadPdfToS3, refreshS3Url } from "@/lib/storage"
import { CATEGORIES, REGION_BLOCKS, PREFECTURES_BY_REGION, DISTRICTS_BY_PREFECTURE, DEFAULT_DISTRICTS } from "@/lib/regionData"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 画像表示コンポーネント（S3のURLを動的に更新）
function ImageWithRefresh({ imageUrl }: { imageUrl: string }) {
  const [refreshedUrl, setRefreshedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const loadImage = async () => {
      if (!imageUrl) return

      if (imageUrl.startsWith('data:')) {
        setRefreshedUrl(imageUrl)
        setIsLoading(false)
        return
      }

      try {
        const newUrl = await refreshS3Url(imageUrl, true)
        setRefreshedUrl(newUrl || imageUrl)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to refresh image URL:', error)
        setRefreshedUrl(imageUrl)
        setIsLoading(false)
      }
    }

    loadImage()
  }, [imageUrl, retryCount])

  const handleImageError = () => {
    if (retryCount < 3) {
      setIsLoading(true)
      setRetryCount(prev => prev + 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!refreshedUrl) {
    return (
      <div className="flex items-center justify-center bg-gray-50 min-h-[200px]">
        <p className="text-gray-500">画像を読み込めませんでした</p>
      </div>
    )
  }

  return (
    <img
      src={refreshedUrl}
      alt="Post content"
      className="w-full h-auto cursor-pointer hover:scale-[1.02] transition-transform duration-300"
      onError={handleImageError}
    />
  )
}

// PDF表示コンポーネント（S3のURLを動的に更新）
function PdfViewer({ pdfUrl, pdfName }: { pdfUrl: string; pdfName?: string }) {
  const [refreshedUrl, setRefreshedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfUrl) return

      if (pdfUrl.startsWith('data:')) {
        setRefreshedUrl(pdfUrl)
        setIsLoading(false)
        return
      }

      try {
        const newUrl = await refreshS3Url(pdfUrl, true)
        setRefreshedUrl(newUrl || pdfUrl)
      } catch (error) {
        console.error('Failed to refresh PDF URL:', error)
        setRefreshedUrl(pdfUrl)
      } finally {
        setIsLoading(false)
      }
    }

    loadPdf()
  }, [pdfUrl])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!refreshedUrl) return null

  if (refreshedUrl.startsWith('data:') || refreshedUrl.startsWith('blob:')) {
    return (
      <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
        <object
          data={refreshedUrl}
          type="application/pdf"
          width="100%"
          height="500px"
          className="w-full"
        >
          <div className="p-4 text-center text-gray-500">
            <p>PDFを表示できませんでした。</p>
            <a
              href={refreshedUrl}
              download={pdfName || "document.pdf"}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              ダウンロードする
            </a>
          </div>
        </object>
      </div>
    )
  }

  return (
    <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(refreshedUrl)}&embedded=true`}
        width="100%"
        height="500px"
        className="w-full"
        title={pdfName || "PDFファイル"}
      ></iframe>
    </div>
  )
}

export default function TournamentDetailPage() {
  ensureAmplifyConfigured()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  // [id]ページまたは[region]ページから呼び出された場合の両方に対応
  // Next.jsのルーティングでは、[region]と[id]の両方がマッチする可能性があるため、
  // params.idが存在しない場合はparams.regionをチェック
  const tournamentId = (params.id || params.region) as string

  const [tournament, setTournament] = useState<DbTournament | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [owner, setOwner] = useState<DbUser | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "",
    regionBlock: "",
    prefecture: "",
    district: "",
    instagramUrl: ""
  })

  // お気に入り関連
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)

  // タイムライン関連
  const [posts, setPosts] = useState<DbPost[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [postContent, setPostContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [isPostFormOpen, setIsPostFormOpen] = useState(false)
  const [currentUserData, setCurrentUserData] = useState<{ name: string; avatar: string } | null>(null)

  // 参加チーム関連
  const [participatingTeams, setParticipatingTeams] = useState<(DbTournamentTeam & { team?: DbTeam | null })[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false)
  const [teamSearchTerm, setTeamSearchTerm] = useState("")
  const [teamSearchResults, setTeamSearchResults] = useState<DbTeam[]>([])
  const [isSearchingTeams, setIsSearchingTeams] = useState(false)

  // 過去大会結果関連
  const [pastResults, setPastResults] = useState<DbTournamentResult[]>([])
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [showAddResultDialog, setShowAddResultDialog] = useState(false)
  const [editingResult, setEditingResult] = useState<DbTournamentResult | null>(null)
  const [resultForm, setResultForm] = useState({
    title: "",
    content: "",
    ranking: [""],
    startDate: "",
    endDate: "",
    imageUrl: "",
    pdfUrl: "",
    pdfName: ""
  })
  const [resultImageFile, setResultImageFile] = useState<File | null>(null)
  const [resultImagePreview, setResultImagePreview] = useState<string | null>(null)
  const [resultPdfFile, setResultPdfFile] = useState<File | null>(null)
  const [resultPdfPreview, setResultPdfPreview] = useState<string | null>(null)
  const resultImageInputRef = useRef<HTMLInputElement>(null)
  const resultPdfInputRef = useRef<HTMLInputElement>(null)
  
  // 順位入力用の検索状態
  const [rankingSearchTerms, setRankingSearchTerms] = useState<Record<number, string>>({})
  const [rankingSearchResults, setRankingSearchResults] = useState<Record<number, DbTeam[]>>({})
  const [selectedRankingTeams, setSelectedRankingTeams] = useState<Record<number, DbTeam | null>>({})

  // メッセージ用の状態（チャット機能で実装予定）
  const [messages, setMessages] = useState<any[]>([])

  // コメント関連
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState<Record<string, DbComment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedPostForComment, setSelectedPostForComment] = useState<DbPost | null>(null)
  const [modalComment, setModalComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [modalComments, setModalComments] = useState<any[]>([])
  const [isLoadingModalComments, setIsLoadingModalComments] = useState(false)
  const [postLikedStates, setPostLikedStates] = useState<Record<string, boolean>>({})

  // Image upload state for tournament editing
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [availablePrefectures, setAvailablePrefectures] = useState<string[]>([])
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])

  // 大会管理者関連
  const [coAdminSearchTerm, setCoAdminSearchTerm] = useState("")
  const [coAdminSearchResults, setCoAdminSearchResults] = useState<DbUser[]>([])
  const [isSearchingCoAdmins, setIsSearchingCoAdmins] = useState(false)
  const [selectedCoAdmins, setSelectedCoAdmins] = useState<DbUser[]>([])
  const [tournamentManagers, setTournamentManagers] = useState<Array<{ email: string; name: string; avatar: string }>>([])

  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log('TournamentDetailPage: Component mounted, tournamentId:', tournamentId)
    if (tournamentId && typeof tournamentId === 'string') {
      console.log('TournamentDetailPage: Valid ID found, loading tournament...')
      loadTournament()
      loadCurrentUser()
      loadPosts()
      loadParticipatingTeams()
      loadPastResults()
    } else {
      console.error('TournamentDetailPage: Invalid tournamentId:', tournamentId)
    }
  }, [tournamentId])

  useEffect(() => {
    if (tournament && currentUserEmail) {
      const isOwner = tournament.ownerEmail === currentUserEmail
      const isCoAdmin = tournament.coAdminEmails?.includes(currentUserEmail) || false
      setCanEdit(isOwner || isCoAdmin)
      checkFavorite()
    }
  }, [tournament, currentUserEmail])

  useEffect(() => {
    if (tournament) {
      setFavoritesCount(tournament.favoritesCount || 0)
      if (isEditing) {
        setEditForm({
          name: tournament.name || "",
          description: tournament.description || "",
          startDate: tournament.startDate ? new Date(tournament.startDate).toISOString().split('T')[0] : "",
          endDate: tournament.endDate ? new Date(tournament.endDate).toISOString().split('T')[0] : "",
          category: tournament.category || "",
          regionBlock: tournament.regionBlock || "",
          prefecture: tournament.prefecture || "",
          district: tournament.district || "",
          instagramUrl: tournament.instagramUrl || ""
        })
        // 画像プレビューを設定
        if (tournament.iconUrl) {
          setIconPreview(tournament.iconUrl)
        }
        if (tournament.coverImage) {
          setCoverImagePreview(tournament.coverImage)
        }
        // 地域ブロックと都道府県に基づいてリストを設定
        if (tournament.regionBlock && PREFECTURES_BY_REGION[tournament.regionBlock]) {
          setAvailablePrefectures(PREFECTURES_BY_REGION[tournament.regionBlock])
        }
        if (tournament.prefecture && DISTRICTS_BY_PREFECTURE[tournament.prefecture]) {
          setAvailableDistricts(DISTRICTS_BY_PREFECTURE[tournament.prefecture])
        } else {
          setAvailableDistricts(DEFAULT_DISTRICTS)
        }
      }
    }
  }, [tournament, isEditing])

  // 地域ブロックが変更されたら、都道府県リストを更新
  useEffect(() => {
    if (editForm.regionBlock && PREFECTURES_BY_REGION[editForm.regionBlock]) {
      setAvailablePrefectures(PREFECTURES_BY_REGION[editForm.regionBlock])
    } else {
      setAvailablePrefectures([])
    }
    if (!editForm.regionBlock || editForm.regionBlock !== tournament?.regionBlock) {
      setEditForm(prev => ({ ...prev, prefecture: "", district: "" }))
      setAvailableDistricts([])
    }
  }, [editForm.regionBlock, tournament?.regionBlock])

  // 都道府県が変更されたら、地区リストを更新
  useEffect(() => {
    if (editForm.prefecture && DISTRICTS_BY_PREFECTURE[editForm.prefecture]) {
      setAvailableDistricts(DISTRICTS_BY_PREFECTURE[editForm.prefecture])
    } else {
      setAvailableDistricts(DEFAULT_DISTRICTS)
    }
    if (!editForm.prefecture || editForm.prefecture !== tournament?.prefecture) {
      setEditForm(prev => ({ ...prev, district: "" }))
    }
  }, [editForm.prefecture, tournament?.prefecture])

  const loadTournament = async () => {
    if (!tournamentId || typeof tournamentId !== 'string') {
      console.error('TournamentDetailPage: Invalid tournamentId:', tournamentId)
      return
    }

    console.log('TournamentDetailPage: Loading tournament with ID:', tournamentId)

    try {
      setIsLoading(true)
      const tournamentData = await getTournament(tournamentId)
      
      console.log('TournamentDetailPage: Tournament data received:', tournamentData)
      
      if (!tournamentData) {
        console.warn('TournamentDetailPage: Tournament not found for ID:', tournamentId)
        toast({
          title: "エラー",
          description: "大会が見つかりません",
          variant: "destructive",
        })
        router.push('/tournaments')
        return
      }

      console.log('TournamentDetailPage: Setting tournament data:', tournamentData.name)
      setTournament(tournamentData)

      // 編集フォームを初期化
      setEditForm({
        name: tournamentData.name || "",
        description: tournamentData.description || "",
        startDate: tournamentData.startDate ? new Date(tournamentData.startDate).toISOString().split('T')[0] : "",
        endDate: tournamentData.endDate ? new Date(tournamentData.endDate).toISOString().split('T')[0] : "",
        category: tournamentData.category || "",
        regionBlock: tournamentData.regionBlock || "",
        prefecture: tournamentData.prefecture || "",
        district: tournamentData.district || "",
        instagramUrl: tournamentData.instagramUrl || ""
      })

      // 大会管理者の情報を取得
      const managerEmails = [tournamentData.ownerEmail, ...(tournamentData.coAdminEmails || [])]
      const managers: Array<{ email: string; name: string; avatar: string }> = []
      
      for (const email of managerEmails) {
        if (email) {
          try {
            const userData = await getUserByEmail(email)
            if (userData) {
              let avatarUrl = userData.avatar || "/placeholder.svg"
              if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('blob:') && !avatarUrl.startsWith('/placeholder')) {
                try {
                  avatarUrl = await refreshS3Url(avatarUrl, true) || avatarUrl
                } catch (error) {
                  console.error('Failed to refresh avatar URL:', error)
                }
              }
              managers.push({
                email,
                name: `${userData.lastName} ${userData.firstName}`,
                avatar: avatarUrl,
              })
            }
          } catch (error) {
            console.error(`Failed to load user ${email}:`, error)
          }
        }
      }
      
      setTournamentManagers(managers)

      // 編集用の管理者リストを初期化（オーナーを除く）
      if (tournamentData.coAdminEmails && tournamentData.coAdminEmails.length > 0) {
        const coAdminUsers: DbUser[] = []
        for (const email of tournamentData.coAdminEmails) {
          try {
            const userData = await getUserByEmail(email)
            if (userData) {
              coAdminUsers.push(userData)
            }
          } catch (error) {
            console.error(`Failed to load co-admin ${email}:`, error)
          }
        }
        setSelectedCoAdmins(coAdminUsers)
      }

      // 主催者の情報を取得
      try {
        console.log('TournamentDetailPage: Loading owner:', tournamentData.ownerEmail)
        const ownerData = await getUserByEmail(tournamentData.ownerEmail)
        console.log('TournamentDetailPage: Owner data received:', ownerData)
        // アバターURLをS3から更新
        if (ownerData && ownerData.avatar) {
          const refreshedAvatar = await refreshS3Url(ownerData.avatar, true)
          ownerData.avatar = refreshedAvatar || ownerData.avatar
        }
        setOwner(ownerData)
      } catch (error) {
        console.error('TournamentDetailPage: Failed to load owner:', error)
      }
    } catch (error) {
      console.error('TournamentDetailPage: Failed to load tournament:', error)
      toast({
        title: "エラー",
        description: "大会の読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCurrentUser = async () => {
    try {
      const email = await getCurrentUserEmail()
      setCurrentUserEmail(email || null)
      
      // ユーザーのアバター情報も取得
      if (email) {
        const userData = await getUserByEmail(email)
        if (userData) {
          let avatarUrl = userData.avatar || "/placeholder.svg"
          if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('blob:') && !avatarUrl.startsWith('/placeholder')) {
            try {
              avatarUrl = await refreshS3Url(avatarUrl, true) || avatarUrl
            } catch (error) {
              console.error('Failed to refresh avatar URL:', error)
            }
          }
          setCurrentUserData({
            name: `${userData.lastName} ${userData.firstName}`,
            avatar: avatarUrl,
          })
        }
      }
    } catch (error) {
      console.error('TournamentDetailPage: Failed to load current user:', error)
    }
  }

  const checkFavorite = async () => {
    if (!tournamentId || !currentUserEmail) return
    try {
      const favorite = await checkFavoriteTournament(tournamentId, currentUserEmail)
      setIsFavorite(favorite)
    } catch (error) {
      console.error('Failed to check favorite:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!tournamentId || !currentUserEmail) {
      toast({
        title: "エラー",
        description: "ログインが必要です",
        variant: "destructive",
      })
      return
    }

    setIsFavoriteLoading(true)
    try {
      const result = await toggleFavoriteTournament(tournamentId, currentUserEmail)
      setIsFavorite(result.isFavorite)
      setFavoritesCount(prev => result.isFavorite ? prev + 1 : Math.max(0, prev - 1))
      toast({
        title: result.isFavorite ? "お気に入りに追加しました" : "お気に入りを解除しました",
      })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      toast({
        title: "エラー",
        description: "お気に入りの更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const loadPosts = async () => {
    if (!tournamentId) return
    try {
      setIsLoadingPosts(true)
      console.log('Loading posts for tournament:', tournamentId)
      const tournamentPosts = await getPostsByTournament(tournamentId)
      console.log('Loaded tournament posts:', tournamentPosts)
      // 投稿にユーザー情報を追加
      const postsWithUsers = await Promise.all(
        tournamentPosts.map(async (post) => {
          if (post.authorEmail) {
            try {
              const author = await getUserByEmail(post.authorEmail)
              let avatarUrl = author?.avatar || null
              // アバターURLをS3から更新
              if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('blob:') && !avatarUrl.startsWith('/placeholder')) {
                try {
                  avatarUrl = await refreshS3Url(avatarUrl, true) || avatarUrl
                } catch (error) {
                  console.error('Failed to refresh avatar URL:', error)
                }
              }
              return {
                ...post,
                authorName: author ? `${author.lastName} ${author.firstName}` : post.authorEmail,
                authorAvatar: avatarUrl
              }
            } catch (error) {
              return {
                ...post,
                authorName: post.authorEmail,
                authorAvatar: null
              }
            }
          }
          return {
            ...post,
            authorName: "匿名ユーザー",
            authorAvatar: null
          }
        })
      )
      setPosts(postsWithUsers as any)
      
      // いいね状態を初期化（現在のユーザーがいいねした投稿を確認）
      if (currentUserEmail) {
        const likedStates: Record<string, boolean> = {}
        await Promise.all(
          postsWithUsers.map(async (post: any) => {
            try {
              const isLiked = await checkLikeStatus(post.id, currentUserEmail)
              likedStates[post.id] = isLiked
            } catch (error) {
              console.error(`Failed to check like status for post ${post.id}:`, error)
              likedStates[post.id] = false
            }
          })
        )
        setPostLikedStates(likedStates)
      }
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedPdf(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPdfPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedVideo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreatePost = async () => {
    if (!currentUserEmail || !tournamentId) {
      toast({
        title: "エラー",
        description: "ログインが必要です",
        variant: "destructive",
      })
      return
    }

    if (!postContent.trim() && !selectedImage && !selectedPdf && !selectedVideo) {
      toast({
        title: "エラー",
        description: "投稿内容を入力してください",
        variant: "destructive",
      })
      return
    }

    setIsPosting(true)
    try {
      let imageUrl: string | null = null
      let pdfUrl: string | null = null
      let pdfName: string | null = null
      let videoUrl: string | null = null

      if (selectedImage) {
        try {
          imageUrl = await uploadImageToS3(selectedImage, currentUserEmail)
        } catch (error) {
          console.error('Failed to upload image:', error)
          if (imagePreview) {
            imageUrl = imagePreview
          }
        }
      }

      if (selectedPdf) {
        try {
          pdfUrl = await uploadPdfToS3(selectedPdf, currentUserEmail)
          pdfName = selectedPdf.name
        } catch (error) {
          console.error('Failed to upload PDF:', error)
          toast({
            title: "警告",
            description: "PDFのアップロードに失敗しました",
            variant: "destructive",
          })
        }
      }

      if (selectedVideo) {
        try {
          videoUrl = await uploadImageToS3(selectedVideo, currentUserEmail)
        } catch (error) {
          console.error('Failed to upload video:', error)
          if (videoPreview) {
            videoUrl = videoPreview
          }
        }
      }

      await createPost({
        content: postContent,
        imageUrl,
        pdfUrl,
        pdfName,
        videoUrl,
        tournamentId,
        authorEmail: currentUserEmail,
        likesCount: 0,
        commentsCount: 0
      })

      toast({
        title: "成功",
        description: "投稿が作成されました",
      })

      setPostContent("")
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedPdf(null)
      setPdfPreview(null)
      setSelectedVideo(null)
      setVideoPreview(null)
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
      if (pdfInputRef.current) {
        pdfInputRef.current.value = ""
      }
      if (videoInputRef.current) {
        videoInputRef.current.value = ""
      }

      await loadPosts()
    } catch (error) {
      console.error('Failed to create post:', error)
      toast({
        title: "エラー",
        description: "投稿の作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsPosting(false)
    }
  }

  // 管理者検索
  const handleCoAdminSearch = async () => {
    if (!coAdminSearchTerm.trim()) {
      setCoAdminSearchResults([])
      return
    }

    setIsSearchingCoAdmins(true)
    try {
      const results = await searchUsers(coAdminSearchTerm)
      // オーナーと既に選択されている管理者を除外
      const filtered = results.filter(
        user => user.email !== tournament?.ownerEmail &&
          !selectedCoAdmins.some(admin => admin.email === user.email)
      )
      setCoAdminSearchResults(filtered)
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: "エラー",
        description: "ユーザー検索に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSearchingCoAdmins(false)
    }
  }

  // 管理者追加
  const handleAddCoAdmin = (user: DbUser) => {
    if (selectedCoAdmins.length < 5 && !selectedCoAdmins.some(admin => admin.email === user.email)) {
      setSelectedCoAdmins([...selectedCoAdmins, user])
      setCoAdminSearchTerm("")
      setCoAdminSearchResults([])
    } else if (selectedCoAdmins.length >= 5) {
      toast({
        title: "エラー",
        description: "管理者は最大5名まで追加できます",
        variant: "destructive",
      })
    }
  }

  // 管理者削除
  const handleRemoveCoAdmin = (userEmail: string) => {
    setSelectedCoAdmins(selectedCoAdmins.filter(admin => admin.email !== userEmail))
  }

  const handleSaveEdit = async () => {
    if (!tournamentId || !tournament) return

    try {
      // 管理者のメールアドレスリストを作成
      const coAdminEmails = selectedCoAdmins.map(admin => admin.email)

      const updated = await updateTournament(tournamentId, {
        name: editForm.name,
        description: editForm.description,
        startDate: editForm.startDate ? new Date(editForm.startDate).toISOString() : null,
        endDate: editForm.endDate ? new Date(editForm.endDate).toISOString() : null,
        category: editForm.category,
        regionBlock: editForm.regionBlock,
        prefecture: editForm.prefecture,
        district: editForm.district,
        instagramUrl: editForm.instagramUrl || null,
        coAdminEmails: coAdminEmails.length > 0 ? coAdminEmails : null
      })

      setTournament(updated)
      setIsEditing(false)
      
      // 管理者リストを更新
      await loadTournament()
      
      toast({
        title: "成功",
        description: "大会情報を更新しました",
      })
    } catch (error) {
      console.error('Failed to update tournament:', error)
      toast({
        title: "エラー",
        description: "更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  function handleIconSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setIconFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setIconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleCoverImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleToggleLike = async (postId: string) => {
    if (!currentUserEmail) {
      toast({
        title: "エラー",
        description: "ログインが必要です",
        variant: "destructive",
      })
      return
    }

    try {
      const post = posts.find(p => p.id === postId)
      const currentLikes = post?.likesCount || 0
      const currentLiked = postLikedStates[postId] || false
      
      // 状態を即座に更新（楽観的更新）
      setPostLikedStates(prev => ({
        ...prev,
        [postId]: !currentLiked
      }))
      
      await toggleDbLike(postId, currentUserEmail, currentLikes)
      await loadPosts()
      
      // 投稿を再読み込みした後、いいね状態を再取得
      const updatedPost = posts.find(p => p.id === postId)
      if (updatedPost) {
        // いいね状態を確認（実際のデータベースから取得する必要がある場合は、別途実装）
        // ここでは楽観的更新を維持
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
      // エラー時は状態を元に戻す
      setPostLikedStates(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }))
    }
  }

  const handleShare = async (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    const url = `${window.location.origin}/posts/${postId}`
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "シェアリンクをコピーしました",
        description: "リンクをクリップボードにコピーしました",
      })
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast({
        title: "エラー",
        description: "リンクのコピーに失敗しました",
        variant: "destructive",
      })
    }
  }

  const toggleComments = async (postId: string) => {
    // モーダルを開く
    const post = posts.find(p => p.id === postId)
    if (post) {
      setSelectedPostForComment(post)
      setModalComment("")
      setCommentModalOpen(true)
      setIsLoadingModalComments(true)
      
      // データベースからコメントを取得
      try {
        const dbComments = await getCommentsByPost(postId)
        
        // コメントのユーザー情報を取得
        const commentsWithUsers = await Promise.all(
          dbComments.map(async (dbComment) => {
            let userName = "匿名ユーザー"
            let userAvatar = "/placeholder.svg"
            
            if (dbComment.authorEmail) {
              try {
                const user = await getUserByEmail(dbComment.authorEmail)
                if (user) {
                  userName = `${user.lastName} ${user.firstName}`
                  if (user.avatar) {
                    try {
                      userAvatar = await refreshS3Url(user.avatar, true) || user.avatar
                    } catch (e) {
                      console.error('Failed to refresh avatar URL:', e)
                    }
                  }
                }
              } catch (e) {
                console.error('Failed to get user for comment:', e)
              }
            }
            
            return {
              id: dbComment.id,
              user: {
                name: userName,
                avatar: userAvatar,
                email: dbComment.authorEmail,
              },
              content: dbComment.content,
              timestamp: new Date(dbComment.createdAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              likesCount: 0,
            }
          })
        )
        
        setModalComments(commentsWithUsers)
      } catch (e) {
        console.error('Failed to load comments:', e)
        setModalComments([])
      } finally {
        setIsLoadingModalComments(false)
      }
    }
  }

  const loadComments = async (postId: string) => {
    try {
      const postComments = await getCommentsByPost(postId)
      setComments((prev) => ({
        ...prev,
        [postId]: postComments,
      }))
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const handleSubmitComment = async (postId: string) => {
    const commentText = newComment[postId]?.trim()
    if (!commentText || !currentUserEmail) {
      toast({
        title: "エラー",
        description: commentText ? "ログインが必要です" : "コメントを入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      await addDbComment(postId, commentText, currentUserEmail)

      // コメントを再読み込み
      await loadComments(postId)

      // 入力をクリア
      setNewComment((prev) => ({
        ...prev,
        [postId]: "",
      }))

      // 投稿一覧を再読み込みしてコメント数を更新
      await loadPosts()
    } catch (error) {
      console.error('Failed to submit comment:', error)
      toast({
        title: "エラー",
        description: "コメントの投稿に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleModalCommentSubmit = async () => {
    if (!selectedPostForComment || !modalComment.trim() || !currentUserEmail) return

    setIsSubmittingComment(true)
    try {
      const commentText = modalComment.trim()
      await addDbComment(selectedPostForComment.id, commentText, currentUserEmail)
      
      // コメントを再取得
      try {
        const dbComments = await getCommentsByPost(selectedPostForComment.id)
        
        // コメントのユーザー情報を取得
        const commentsWithUsers = await Promise.all(
          dbComments.map(async (dbComment) => {
            let userName = "匿名ユーザー"
            let userAvatar = "/placeholder.svg"
            
            if (dbComment.authorEmail) {
              try {
                const user = await getUserByEmail(dbComment.authorEmail)
                if (user) {
                  userName = `${user.lastName} ${user.firstName}`
                  if (user.avatar) {
                    try {
                      userAvatar = await refreshS3Url(user.avatar, true) || user.avatar
                    } catch (e) {
                      console.error('Failed to refresh avatar URL:', e)
                    }
                  }
                }
              } catch (e) {
                console.error('Failed to get user for comment:', e)
              }
            }
            
            return {
              id: dbComment.id,
              user: {
                name: userName,
                avatar: userAvatar,
                email: dbComment.authorEmail,
              },
              content: dbComment.content,
              timestamp: new Date(dbComment.createdAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              likesCount: 0,
            }
          })
        )
        
        setModalComments(commentsWithUsers)
      } catch (e) {
        console.error('Failed to reload comments:', e)
      }

      setModalComment("")
      await updatePostCounts(selectedPostForComment.id, { 
        commentsCount: (selectedPostForComment.commentsCount || 0) + 1 
      })
      
      // 投稿一覧を再読み込み
      await loadPosts()
      
      // モーダル内の投稿も更新
      const updatedPost = posts.find(p => p.id === selectedPostForComment.id)
      if (updatedPost) {
        setSelectedPostForComment({
          ...updatedPost,
          commentsCount: (updatedPost.commentsCount || 0) + 1,
        })
      }
    } catch (e) {
      console.error("add comment failed", e)
      toast({
        title: "エラー",
        description: "コメントの投稿に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const loadParticipatingTeams = async () => {
    if (!tournamentId) return
    try {
      setIsLoadingTeams(true)
      console.log('Loading participating teams for tournament:', tournamentId)
      const teams = await getTournamentTeams(tournamentId)
      console.log('Loaded participating teams:', teams)
      setParticipatingTeams(teams)
    } catch (error) {
      console.error('Failed to load participating teams:', error)
      console.error('Error details:', error)
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const handleSearchTeams = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setTeamSearchResults([])
      return
    }

    setIsSearchingTeams(true)
    try {
      const results = await searchTeams(searchTerm)
      setTeamSearchResults(results)
    } catch (error) {
      console.error('Failed to search teams:', error)
      toast({
        title: "エラー",
        description: "チームの検索に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSearchingTeams(false)
    }
  }

  const handleAddTeam = async (team: DbTeam) => {
    if (!tournamentId) return
    try {
      await addTournamentTeam(tournamentId, team.id, team.name, new Date().getFullYear().toString())
      toast({
        title: "成功",
        description: "チームを追加しました",
      })
      setShowAddTeamDialog(false)
      setTeamSearchTerm("")
      setTeamSearchResults([])
      await loadParticipatingTeams()
    } catch (error) {
      console.error('Failed to add team:', error)
      toast({
        title: "エラー",
        description: "チームの追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleRemoveTeam = async (tournamentTeamId: string) => {
    try {
      await removeTournamentTeam(tournamentTeamId)
      toast({
        title: "成功",
        description: "チームを削除しました",
      })
      await loadParticipatingTeams()
    } catch (error) {
      console.error('Failed to remove team:', error)
      toast({
        title: "エラー",
        description: "チームの削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  const loadPastResults = async () => {
    if (!tournamentId) return
    try {
      setIsLoadingResults(true)
      console.log('Loading past results for tournament:', tournamentId)
      const results = await getTournamentResults(tournamentId)
      console.log('Loaded past results:', results)
      setPastResults(results.sort((a, b) => b.year.localeCompare(a.year))) // 新しい順にソート
    } catch (error) {
      console.error('Failed to load past results:', error)
      console.error('Error details:', error)
    } finally {
      setIsLoadingResults(false)
    }
  }

  const handleSaveResult = async () => {
    if (!tournamentId || !currentUserEmail) return

    if (!resultForm.title || !resultForm.content) {
      toast({
        title: "エラー",
        description: "必須項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      // 画像とPDFをアップロード
      let imageUrl = resultForm.imageUrl || null
      let pdfUrl = resultForm.pdfUrl || null
      let pdfName = resultForm.pdfName || null

      if (resultImageFile) {
        try {
          imageUrl = await uploadImageToS3(resultImageFile, `tournament-results/${tournamentId}/${Date.now()}`)
        } catch (imageError) {
          console.error('Failed to upload image:', imageError)
          toast({
            title: "警告",
            description: "画像のアップロードに失敗しましたが、大会結果は保存されます",
            variant: "default",
          })
        }
      }

      if (resultPdfFile) {
        try {
          pdfUrl = await uploadPdfToS3(resultPdfFile, `tournament-results/${tournamentId}/${Date.now()}`)
          pdfName = resultForm.pdfName || resultPdfFile.name
        } catch (pdfError) {
          console.error('Failed to upload PDF:', pdfError)
          toast({
            title: "警告",
            description: "PDFのアップロードに失敗しましたが、大会結果は保存されます",
            variant: "default",
          })
        }
      }

      // 順位を参加チーム名に変換
      const ranking = resultForm.ranking.map((rank, index) => {
        const selectedTeam = selectedRankingTeams[index]
        return selectedTeam ? selectedTeam.name : rank.trim()
      }).filter(r => r.trim() !== "")

      // スキーマが更新されるまでの間、新しいフィールドはオプショナルとして扱う
      // 開催期間の開始日から年を自動取得
      const year = resultForm.startDate && resultForm.startDate.trim() !== "" 
        ? new Date(resultForm.startDate).getFullYear().toString() 
        : new Date().getFullYear().toString()
      
      const resultData: any = {
        year: year,
          title: resultForm.title,
          content: resultForm.content,
        ranking,
      }

      // 新しいフィールドが存在し、空文字列でない場合のみ追加
      // AWSDateTime型は有効なISO 8601形式の日付文字列またはnullを期待するため、空文字列は送信しない
      if (resultForm.startDate && resultForm.startDate.trim() !== "") {
        // 日付が有効かチェック
        const startDateObj = new Date(resultForm.startDate)
        if (!isNaN(startDateObj.getTime())) {
          resultData.startDate = resultForm.startDate
        }
      }
      if (resultForm.endDate && resultForm.endDate.trim() !== "") {
        // 日付が有効かチェック
        const endDateObj = new Date(resultForm.endDate)
        if (!isNaN(endDateObj.getTime())) {
          resultData.endDate = resultForm.endDate
        }
      }
      if (imageUrl && imageUrl.trim() !== "") {
        resultData.imageUrl = imageUrl
      }
      if (pdfUrl && pdfUrl.trim() !== "") {
        resultData.pdfUrl = pdfUrl
      }
      if (pdfName && pdfName.trim() !== "") {
        resultData.pdfName = pdfName
      }

      // undefinedやnullのオプショナルフィールドを削除（GraphQLがエラーになるため）
      // 必須フィールド（year, title, content, ranking）は削除しない
      const optionalFields = ['startDate', 'endDate', 'imageUrl', 'pdfUrl', 'pdfName']
      optionalFields.forEach(key => {
        if (resultData[key] === undefined || resultData[key] === null || resultData[key] === "") {
          delete resultData[key]
        }
      })

      if (editingResult) {
        await updateTournamentResult(editingResult.id, resultData)
        toast({
          title: "成功",
          description: "大会結果を更新しました",
        })
      } else {
        resultData.tournamentId = tournamentId
        resultData.createdBy = currentUserEmail
        await createTournamentResult(resultData)
        toast({
          title: "成功",
          description: "大会結果を追加しました",
        })
      }

      setShowAddResultDialog(false)
      setEditingResult(null)
      setResultForm({ title: "", content: "", ranking: [""], startDate: "", endDate: "", imageUrl: "", pdfUrl: "", pdfName: "" })
      setResultImageFile(null)
      setResultImagePreview(null)
      setResultPdfFile(null)
      setResultPdfPreview(null)
      setRankingSearchTerms({})
      setRankingSearchResults({})
      setSelectedRankingTeams({})
      await loadPastResults()
    } catch (error) {
      console.error('Failed to save result:', error)
      toast({
        title: "エラー",
        description: "大会結果の保存に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleRankingSearch = (index: number, searchTerm: string) => {
    setRankingSearchTerms(prev => ({ ...prev, [index]: searchTerm }))
    
    if (!searchTerm.trim()) {
      setRankingSearchResults(prev => {
        const newResults = { ...prev }
        delete newResults[index]
        return newResults
      })
      return
    }

    // 参加チームから検索
    const filtered = participatingTeams
      .map(tt => tt.team)
      .filter((team): team is DbTeam => team !== null && team !== undefined)
      .filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.shortName && team.shortName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .slice(0, 5) // 最大5件まで表示

    setRankingSearchResults(prev => ({ ...prev, [index]: filtered }))
  }

  const handleSelectRankingTeam = (index: number, team: DbTeam) => {
    setSelectedRankingTeams(prev => ({ ...prev, [index]: team }))
    const newRanking = [...resultForm.ranking]
    newRanking[index] = team.name
    setResultForm({ ...resultForm, ranking: newRanking })
    setRankingSearchTerms(prev => {
      const newTerms = { ...prev }
      delete newTerms[index]
      return newTerms
    })
    setRankingSearchResults(prev => {
      const newResults = { ...prev }
      delete newResults[index]
      return newResults
    })
  }

  const handleEditResult = (result: DbTournamentResult) => {
    setEditingResult(result)
    setResultForm({
      title: result.title,
      content: result.content,
      ranking: result.ranking && result.ranking.length > 0 ? result.ranking : [""],
      startDate: result.startDate || "",
      endDate: result.endDate || "",
      imageUrl: result.imageUrl || "",
      pdfUrl: result.pdfUrl || "",
      pdfName: result.pdfName || ""
    })
    setResultImagePreview(result.imageUrl || null)
    setResultPdfPreview(result.pdfUrl || null)
    setShowAddResultDialog(true)
  }

  const handleDeleteResult = async (id: string) => {
    if (!confirm("この大会結果を削除しますか？")) return

    try {
      await deleteTournamentResult(id)
      toast({
        title: "成功",
        description: "大会結果を削除しました",
      })
      await loadPastResults()
    } catch (error) {
      console.error('Failed to delete result:', error)
      toast({
        title: "エラー",
        description: "大会結果の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  // 画像URLを正しく処理する関数
  const getCoverImageUrl = () => {
    if (tournament?.coverImage) {
      if (tournament.coverImage.startsWith('data:') || tournament.coverImage.startsWith('http://') || tournament.coverImage.startsWith('https://')) {
        return tournament.coverImage
      }
    }
    return null
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto pb-20 px-4 pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!tournament) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto pb-20 px-4 pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">大会が見つかりません</p>
            <Button onClick={() => router.push('/tournaments')} className="mt-4">
              大会一覧に戻る
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const coverImageUrl = getCoverImageUrl()
  const ownerName = owner ? `${owner.lastName} ${owner.firstName}` : tournament.ownerEmail

  return (
    <Layout>
        {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-2 pt-2">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/tournaments">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              大会一覧に戻る
            </Button>
          </Link>
        </div>
        </div>

      {/* カバー画像 - Full Width */}
      <div className="relative w-screen -mx-[calc((100vw-100%)/2)]">
          <div className="h-48 md:h-64 bg-gradient-to-r from-orange-400 to-red-400 overflow-hidden">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={tournament.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Trophy className="w-24 h-24 text-white/50" />
              </div>
            )}
          </div>
        </div>

      {/* 大会ヘッダー - Full Width */}
      <Tabs defaultValue="timeline" className="w-full">
        <div className="w-screen -mx-[calc((100vw-100%)/2)] bg-card">
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-0">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-2xl font-bold mb-2"
                />
              ) : (
                <h1 className="text-2xl font-bold mb-2">{tournament.name}</h1>
              )}
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {isEditing ? (
                  <Select
                    value={editForm.category}
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="カテゴリ" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  tournament.category && (
                    <Badge variant="secondary" className="text-sm">
                      {tournament.category}
                    </Badge>
                  )
                )}
                {tournament.regionBlock && (
                  <Badge variant="outline" className="text-sm">
                    {tournament.regionBlock}
                  </Badge>
                )}
                {tournament.prefecture && (
                  <Badge variant="outline" className="text-sm">
                    {tournament.prefecture}
                  </Badge>
                )}
                {tournament.district && (
                  <Badge variant="outline" className="text-sm">
                    {tournament.district}
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="説明"
                  className="mb-4"
                  rows={4}
                />
              ) : (
                tournament.description && (
                  <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                    {tournament.description}
                  </p>
                )
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <Input
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                        className="w-40"
                      />
                      <span>〜</span>
                      <Input
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                        className="w-40"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {tournament.startDate && tournament.endDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(tournament.startDate).toLocaleDateString('ja-JP')} 〜 {new Date(tournament.endDate).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    )}
                    {tournament.regionBlock && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{tournament.regionBlock}{tournament.prefecture && ` / ${tournament.prefecture}`}{tournament.district && ` / ${tournament.district}`}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 編集時の追加フィールド */}
              {isEditing && (
                <div className="space-y-4 mb-4">
                  <div>
                    <Label htmlFor="regionBlock">地域ブロック</Label>
                    <Select
                      value={editForm.regionBlock}
                      onValueChange={(value) => setEditForm({ ...editForm, regionBlock: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="地域ブロックを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGION_BLOCKS.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {availablePrefectures.length > 0 && (
                    <div>
                      <Label htmlFor="prefecture">都道府県</Label>
                      <Select
                        value={editForm.prefecture}
                        onValueChange={(value) => setEditForm({ ...editForm, prefecture: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="都道府県を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePrefectures.map((pref) => (
                            <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
                    )}

                  {availableDistricts.length > 0 && (
                    <div>
                      <Label htmlFor="district">エリア</Label>
                      <Select
                        value={editForm.district}
                        onValueChange={(value) => setEditForm({ ...editForm, district: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="エリアを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map((district) => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="instagramUrl">Instagram URL</Label>
                    <Input
                      id="instagramUrl"
                      type="text"
                      value={editForm.instagramUrl}
                      onChange={(e) => setEditForm({ ...editForm, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/username または @username"
                      className="mt-1"
                    />
              </div>

                  {/* 大会管理者 */}
                  <div>
                    <Label>大会管理者（最大5名まで）</Label>
                    <p className="text-sm text-muted-foreground mb-2 mt-1">
                      オーナー以外の管理者を追加できます。現在: {selectedCoAdmins.length}/5名
                    </p>

                    {/* 選択済み管理者 */}
                    {selectedCoAdmins.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {selectedCoAdmins.map((admin) => (
                          <div key={admin.id} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                            <span className="text-sm">{admin.firstName} {admin.lastName}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoAdmin(admin.email)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 管理者検索 */}
                    {selectedCoAdmins.length < 5 && (
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="ユーザー名またはメールアドレスで検索..."
                          value={coAdminSearchTerm}
                          onChange={(e) => setCoAdminSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleCoAdminSearch()
                            }
                          }}
                        />
                <Button
                          type="button"
                          onClick={handleCoAdminSearch}
                          disabled={isSearchingCoAdmins}
                  size="sm"
                        >
                          {isSearchingCoAdmins ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "検索"
                          )}
                </Button>
                      </div>
                    )}

                    {/* 検索結果 */}
                    {coAdminSearchResults.length > 0 && (
                      <div className="mb-3 border rounded-md p-2 max-h-40 overflow-y-auto">
                        {coAdminSearchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded"
                            onClick={() => handleAddCoAdmin(user)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={user.avatar || undefined} alt={`${user.firstName} ${user.lastName}`} />
                                <AvatarFallback>
                                  {user.firstName[0]}{user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddCoAdmin(user)
                              }}
                            >
                              <Users className="w-4 h-4 text-green-500" />
                        </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="icon">アイコン画像</Label>
                    <div className="space-y-2 mt-1">
                      <input
                        ref={iconInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleIconSelect}
                        className="hidden"
                        id="icon"
                      />
                      <div className="flex items-center gap-2">
                <Button
                          type="button"
                          variant="outline"
                          onClick={() => iconInputRef.current?.click()}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          アイコンを選択
                        </Button>
                        {iconPreview && (
                          <div className="relative">
                            <img
                              src={iconPreview}
                              alt="Icon preview"
                              className="w-16 h-16 object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                  size="sm"
                              className="absolute -top-2 -right-2 p-0 h-6 w-6 rounded-full"
                              onClick={() => {
                                setIconFile(null)
                                setIconPreview(null)
                                if (iconInputRef.current) {
                                  iconInputRef.current.value = ''
                                }
                              }}
                            >
                              <X className="w-4 h-4" />
                        </Button>
                      </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="coverImage">カバー画像</Label>
                    <div className="space-y-2 mt-1">
                      <input
                        ref={coverImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageSelect}
                        className="hidden"
                        id="coverImage"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => coverImageInputRef.current?.click()}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          カバー画像を選択
                      </Button>
                        {coverImagePreview && (
                          <div className="relative">
                            <img
                              src={coverImagePreview}
                              alt="Cover preview"
                              className="w-32 h-20 object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute -top-2 -right-2 p-0 h-6 w-6 rounded-full"
                              onClick={() => {
                                setCoverImageFile(null)
                                setCoverImagePreview(null)
                                if (coverImageInputRef.current) {
                                  coverImageInputRef.current.value = ''
                                }
                              }}
                            >
                              <X className="w-4 h-4" />
                        </Button>
                      </div>
                )}
              </div>
            </div>
          </div>
        </div>
              )}

        {/* 主催者情報 */}
              <div className="mt-6 pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <p className="font-medium text-sm text-gray-700">主催者情報</p>
                </div>
              <div className="flex items-center gap-4">
                {owner ? (
                    <Link href={`/users/${encodeURIComponent(tournament.ownerEmail)}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <Avatar className="w-10 h-10">
                      <AvatarImage src={owner.avatar || undefined} alt={ownerName} />
                      <AvatarFallback>
                        {owner.firstName[0]}{owner.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-sm">{ownerName}</p>
                    </div>
                    </Link>
                ) : (
                  <div>
                      <p className="font-medium text-sm">主催者</p>
                  </div>
                )}
              </div>

              {/* 大会管理者 */}
              <div className="mt-4 pt-4">
                <p className="text-sm font-medium mb-2 text-gray-700">大会運営者:</p>
                  <div className="space-y-2">
                  {tournamentManagers.length > 0 ? (
                    tournamentManagers.map((manager, index) => (
                      <Link 
                        key={index} 
                        href={`/users/${encodeURIComponent(manager.email)}`} 
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={manager.avatar || undefined} alt={manager.name} />
                          <AvatarFallback>
                            {manager.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{manager.name}</p>
                      </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">大会管理者が登録されていません</p>
                  )}
                  </div>
              </div>

                {/* Instagram URL */}
                {tournament.instagramUrl && (
                  <div className="mt-4 pt-4">
                    <p className="text-sm font-medium mb-2 text-gray-700">Instagram</p>
                    <a
                      href={tournament.instagramUrl.startsWith('http') ? tournament.instagramUrl : `https://instagram.com/${tournament.instagramUrl.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {tournament.instagramUrl}
                    </a>
                </div>
              )}
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {currentUserEmail && (
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  className={`flex-1 md:flex-initial gap-2 ${isFavorite ? "bg-red-500 hover:bg-red-600" : ""}`}
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "お気に入り済み" : "お気に入り"}
                </Button>
              )}
                {canEdit && (
                  <>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="w-4 h-4 mr-2" />
                          保存
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setIsEditing(false)
                          setIconFile(null)
                          setIconPreview(null)
                          setCoverImageFile(null)
                          setCoverImagePreview(null)
                          setAvailablePrefectures([])
                          setAvailableDistricts([])
                        }}>
                          <X className="w-4 h-4 mr-2" />
                          キャンセル
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        編集
                      </Button>
                    )}
                  </>
                )}
          </div>
        </div>

        {/* タブメニュー */}
          <div className="mt-6 border-t border-border border-b border-border">
            <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0 gap-0">
              <TabsTrigger 
                value="timeline" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 font-medium"
              >
                タイムライン
              </TabsTrigger>
              <TabsTrigger 
                value="teams"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 font-medium"
              >
                参加チーム
              </TabsTrigger>
              <TabsTrigger 
                value="results"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 font-medium"
              >
                過去大会結果
              </TabsTrigger>
              <TabsTrigger 
                value="messages"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 font-medium"
              >
                メッセージ
              </TabsTrigger>
            </TabsList>
                    </div>
                  </div>
              </div>

        <div className="pb-20">
          <div className="w-full max-w-[680px] mx-auto overflow-hidden box-border">
            {/* タイムラインタブ */}
            <TabsContent value="timeline" className="mt-2 space-y-2 w-full overflow-hidden box-border">
              {/* 投稿作成カード - トップページと同じUI */}
              {currentUserEmail && (
                <Card className="w-full border-0 shadow-sm bg-white sm:rounded-lg rounded-none py-2">
                  <CardHeader className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={currentUserData?.avatar || "/placeholder.svg"} alt={currentUserData?.name || 'ユーザー'} />
                        <AvatarFallback className="bg-blue-600 text-white font-semibold">
                          {currentUserData?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {!isPostFormOpen ? (
                        <button
                          onClick={() => setIsPostFormOpen(true)}
                          className="flex-1 h-10 px-4 bg-gray-100 rounded-full text-left text-gray-500 text-sm hover:bg-gray-200"
                        >
                          今何してる？
                        </button>
                      ) : (
                        <div className="flex-1">
                          <Textarea
                            placeholder="大会について投稿しましょう..."
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            className="w-full min-h-[80px] resize-none border border-gray-200 rounded-lg bg-white text-sm focus-visible:ring-1 focus-visible:ring-blue-500 p-3"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0">
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:bg-gray-100 p-2 h-auto" 
                          onClick={() => imageInputRef.current?.click()}
                        >
                          <ImageIcon className="w-5 h-5 text-green-500" />
                        </Button>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          style={{ display: "none" }}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:bg-gray-100 p-2 h-auto" 
                          onClick={() => pdfInputRef.current?.click()}
                        >
                          <FileText className="w-5 h-5 text-red-500" />
                        </Button>
                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfSelect}
                          style={{ display: "none" }}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:bg-gray-100 p-2 h-auto" 
                          onClick={() => videoInputRef.current?.click()}
                        >
                          <Video className="w-5 h-5 text-purple-500" />
                        </Button>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleVideoSelect}
                          style={{ display: "none" }}
                        />
                      </div>
                      <Button
                        onClick={async () => {
                          await handleCreatePost()
                          setIsPostFormOpen(false)
                        }}
                        disabled={isPosting || (!postContent.trim() && !selectedImage && !selectedPdf && !selectedVideo)}
                        className="px-4 h-9 bg-[#DC0000] hover:bg-[#B80000] text-white font-medium text-sm rounded-lg disabled:bg-gray-300"
                      >
                        {isPosting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "投稿"
                        )}
                      </Button>
                    </div>
                    {/* プレビューエリア */}
                    <div className="space-y-2 mt-2">
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
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {pdfPreview && (
                        <div className="relative text-sm text-gray-500 p-2 border rounded-lg flex items-center justify-between">
                          <span>選択中のPDF: {selectedPdf?.name}</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedPdf(null)
                              setPdfPreview(null)
                              if (pdfInputRef.current) {
                                pdfInputRef.current.value = ""
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {videoPreview && (
                        <div className="relative">
                          <video src={videoPreview} controls className="rounded-lg max-h-40 w-auto" />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 rounded-full h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedVideo(null)
                              setVideoPreview(null)
                              if (videoInputRef.current) {
                                videoInputRef.current.value = ""
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 投稿一覧 */}
              {isLoadingPosts ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">読み込み中...</p>
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">まだ投稿がありません</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {posts.map((post: any) => (
                    <Card key={post.id} className="w-full max-w-[680px] mx-auto lg:mx-0 border-0 shadow-sm bg-white sm:rounded-lg rounded-none py-2">
                      <CardHeader className="px-3 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {post.authorEmail ? (
                              <Link href={`/users/${encodeURIComponent(post.authorEmail)}`}>
                                <Avatar className="w-10 h-10 cursor-pointer">
                                  <AvatarImage src={post.authorAvatar || undefined} />
                                  <AvatarFallback className="bg-purple-600 text-white font-semibold">
                                    {post.authorName?.[0] || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                            ) : (
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={post.authorAvatar || undefined} />
                                <AvatarFallback className="bg-purple-600 text-white font-semibold">
                                  {post.authorName?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              {post.authorEmail ? (
                                <Link href={`/users/${encodeURIComponent(post.authorEmail)}`}>
                                  <p className="font-bold text-sm text-black hover:underline cursor-pointer">{post.authorName}</p>
                                </Link>
                              ) : (
                                <p className="font-bold text-sm text-black">{post.authorName}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                {post.createdAt ? new Date(post.createdAt).toLocaleString('ja-JP', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : ""}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem disabled className="text-gray-400 text-xs">
                                編集・削除は投稿作成者のみ可能です
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3">
                        <p className="mb-4 text-sm text-gray-900 whitespace-pre-wrap">{post.content}</p>
                        {post.imageUrl && (
                          <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                            <ImageWithRefresh imageUrl={post.imageUrl} />
                          </div>
                        )}
                        {post.pdfUrl ? (
                          <div className="mb-4">
                            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-3">
                              <FileText className="w-6 h-6 text-red-500" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{post.pdfName || "PDFファイル"}</p>
                              </div>
                            </div>
                            <PdfViewer pdfUrl={post.pdfUrl} pdfName={post.pdfName} />
                          </div>
                        ) : post.pdfName ? (
                          <div className="mb-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                            <div className="flex items-center gap-2 text-yellow-800">
                              <FileText className="w-4 h-4" />
                              <span className="font-medium text-sm">{post.pdfName}</span>
                              <span className="text-xs text-yellow-600">（アップロード失敗）</span>
                            </div>
                          </div>
                        ) : null}
                        {post.videoUrl && (
                          <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                            <video src={post.videoUrl} controls className="w-full h-auto">
                              お使いのブラウザは動画の再生に対応していません。
                            </video>
                          </div>
                        )}
                        {/* アクションボタン */}
                        <div className="flex items-center border-t border-gray-100 pt-2">
                          <button
                              onClick={() => handleToggleLike(post.id)}
                            className="flex items-center gap-2 flex-1 justify-center py-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Heart className={`w-5 h-5 ${postLikedStates[post.id] ? "fill-current text-red-500" : "text-gray-600"}`} />
                            <span className="text-sm text-gray-700">
                              いいね{(post.likesCount || 0) > 0 && ` (${post.likesCount})`}
                            </span>
                          </button>
                          <button
                              onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-2 flex-1 justify-center py-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <MessageCircle className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              コメント ({post.commentsCount || 0})
                            </span>
                          </button>
                          <button
                              onClick={() => handleShare(post.id)}
                            className="flex items-center gap-2 flex-1 justify-center py-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Share2 className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              シェア
                                      </span>
                          </button>
                                    </div>

                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 参加チームタブ */}
            <TabsContent value="teams" className="mt-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>参加チーム</CardTitle>
                    {canEdit && (
                      <Button onClick={() => setShowAddTeamDialog(true)}>
                        <Users className="w-4 h-4 mr-2" />
                        チームを追加
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingTeams ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">読み込み中...</p>
                    </div>
                  ) : participatingTeams.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">参加チームはまだ登録されていません</p>
                  ) : (
                    <div className="space-y-2">
                      {participatingTeams.map((tournamentTeam) => {
                        const team = tournamentTeam.team
                        const teamName = tournamentTeam.teamName || team?.name || "不明なチーム"
                        return (
                          <Card key={tournamentTeam.id} className="hover:bg-gray-50 transition-colors">
                            <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <Link 
                                  href={team?.id ? `/teams/${team.id}` : '#'} 
                                  className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
                                >
                                  <Avatar className="w-12 h-12">
                                    <AvatarImage src={team?.logoUrl || undefined} />
                                    <AvatarFallback>
                                      {teamName[0] || "T"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-base text-gray-900 truncate">{teamName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {team?.prefecture && (
                                        <p className="text-xs text-gray-500">{team.prefecture}</p>
                                      )}
                                      {team?.category && (
                                        <>
                                          {team.prefecture && <span className="text-xs text-gray-400">•</span>}
                                          <p className="text-xs text-gray-500">{team.category}</p>
                                        </>
                                      )}
                                    </div>
                                  {tournamentTeam.participationYear && (
                                      <p className="text-xs text-gray-400 mt-1">{tournamentTeam.participationYear}年参加</p>
                                  )}
                                </div>
                                </Link>
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveTeam(tournamentTeam.id)}
                                    className="ml-2"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* チーム追加ダイアログ */}
              <Dialog open={showAddTeamDialog} onOpenChange={setShowAddTeamDialog}>
                <DialogContent className="!fixed !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%] w-[calc(100%-2rem)] md:w-[680px] max-w-[680px] max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>参加チームを追加</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Input
                        placeholder="チーム名で検索..."
                        value={teamSearchTerm}
                        onChange={(e) => {
                          setTeamSearchTerm(e.target.value)
                          handleSearchTeams(e.target.value)
                        }}
                      />
                    </div>
                    {isSearchingTeams ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">検索中...</p>
                      </div>
                    ) : teamSearchResults.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {teamSearchResults.map((team) => (
                          <Card
                            key={team.id}
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleAddTeam(team)}
                          >
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-3">
                                {team.logoUrl ? (
                                  <Avatar>
                                    <AvatarImage src={team.logoUrl} />
                                    <AvatarFallback>{team.name[0]}</AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <Avatar>
                                    <AvatarFallback>{team.name[0]}</AvatarFallback>
                                  </Avatar>
                                )}
                                <div>
                                  <p className="font-medium">{team.name}</p>
                                  {team.category && (
                                    <p className="text-sm text-muted-foreground">{team.category}</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : teamSearchTerm.trim() ? (
                      <p className="text-muted-foreground text-center py-4">チームが見つかりません</p>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">チーム名を入力して検索してください</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* 過去大会結果タブ */}
            <TabsContent value="results" className="mt-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>過去大会結果</CardTitle>
                    {canEdit && (
                      <Button onClick={() => {
                        setEditingResult(null)
                        setResultForm({ title: "", content: "", ranking: [""], startDate: "", endDate: "", imageUrl: "", pdfUrl: "", pdfName: "" })
                        setResultImageFile(null)
                        setResultImagePreview(null)
                        setResultPdfFile(null)
                        setResultPdfPreview(null)
                        setRankingSearchTerms({})
                        setRankingSearchResults({})
                        setSelectedRankingTeams({})
                        setShowAddResultDialog(true)
                      }}>
                        <Trophy className="w-4 h-4 mr-2" />
                        結果を追加
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingResults ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">読み込み中...</p>
                    </div>
                  ) : pastResults.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">過去の大会結果はまだ登録されていません</p>
                  ) : (
                    <div className="space-y-6">
                      {pastResults.map((result) => (
                        <Card key={result.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">{result.title}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">{result.year}年</p>
                              </div>
                              {canEdit && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditResult(result)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteResult(result.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {(result.startDate || result.endDate) && (
                              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {result.startDate ? new Date(result.startDate).toLocaleDateString('ja-JP') : "未定"}
                                  {result.endDate && ` 〜 ${new Date(result.endDate).toLocaleDateString('ja-JP')}`}
                                </span>
                              </div>
                            )}
                            <div className="whitespace-pre-wrap mb-4">{result.content}</div>
                            {result.imageUrl && (
                              <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                                <ImageWithRefresh imageUrl={result.imageUrl} />
                              </div>
                            )}
                            {result.pdfUrl && (
                              <div className="mb-4">
                                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-3">
                                  <FileText className="w-6 h-6 text-red-500" />
                                  <div className="flex-1">
                                    <a
                                      href={result.pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline font-medium block"
                                    >
                                      {result.pdfName || "PDFファイル"}
                                    </a>
                                  </div>
                                </div>
                                <PdfViewer pdfUrl={result.pdfUrl} pdfName={result.pdfName} />
                              </div>
                            )}
                            {result.ranking && result.ranking.length > 0 && (
                              <div className="border-t pt-4">
                                <p className="font-medium mb-2">順位:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                  {result.ranking.map((rank, index) => (
                                    <li key={index} className="text-muted-foreground">{rank}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 大会結果追加/編集ダイアログ */}
              <Dialog open={showAddResultDialog} onOpenChange={setShowAddResultDialog}>
                <DialogContent className="!fixed !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%] w-[calc(100%-2rem)] md:w-[680px] max-w-[680px] max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>{editingResult ? "大会結果を編集" : "大会結果を追加"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">タイトル</label>
                      <Input
                        value={resultForm.title}
                        onChange={(e) => setResultForm({ ...resultForm, title: e.target.value })}
                        placeholder="例: 2024年度 春季大会"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">開催期間</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={resultForm.startDate}
                          onChange={(e) => setResultForm({ ...resultForm, startDate: e.target.value })}
                          className="flex-1"
                        />
                        <span>〜</span>
                        <Input
                          type="date"
                          value={resultForm.endDate}
                          onChange={(e) => setResultForm({ ...resultForm, endDate: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">結果内容</label>
                      <Textarea
                        value={resultForm.content}
                        onChange={(e) => setResultForm({ ...resultForm, content: e.target.value })}
                        placeholder="大会結果の詳細を入力してください..."
                        rows={8}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                          asChild
                        >
                          <span className="cursor-pointer">
                            <ImageIcon className="w-4 h-4" />
                            画像
                          </span>
                        </Button>
                        <input
                          ref={resultImageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setResultImageFile(file)
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setResultImagePreview(reader.result as string)
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                      <label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                          asChild
                        >
                          <span className="cursor-pointer">
                            <FileText className="w-4 h-4" />
                            PDF
                          </span>
                        </Button>
                        <input
                          ref={resultPdfInputRef}
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setResultPdfFile(file)
                              setResultForm({ ...resultForm, pdfName: file.name })
                            }
                          }}
                        />
                      </label>
                    </div>
                    {resultImagePreview && (
                      <div className="space-y-2">
                        <div className="relative">
                          <img src={resultImagePreview} alt="Preview" className="rounded-lg max-h-40 w-auto" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 rounded-full h-6 w-6 p-0"
                            onClick={() => {
                              setResultImageFile(null)
                              setResultImagePreview(null)
                              setResultForm({ ...resultForm, imageUrl: "" })
                              if (resultImageInputRef.current) {
                                resultImageInputRef.current.value = ""
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {resultPdfFile && (
                      <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-red-500" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{resultPdfFile.name}</p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="rounded-full h-6 w-6 p-0"
                          onClick={() => {
                            setResultPdfFile(null)
                            setResultPdfPreview(null)
                            setResultForm({ ...resultForm, pdfUrl: "", pdfName: "" })
                            if (resultPdfInputRef.current) {
                              resultPdfInputRef.current.value = ""
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium mb-2 block">順位（任意）</label>
                      <div className="space-y-2">
                        {resultForm.ranking.map((rank, index) => {
                          const selectedTeam = selectedRankingTeams[index]
                          const searchTerm = rankingSearchTerms[index] || ""
                          const searchResults = rankingSearchResults[index] || []
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex gap-2">
                                <div className="flex-1 relative">
                            <Input
                                    value={selectedTeam ? selectedTeam.name : rank}
                              onChange={(e) => {
                                      const value = e.target.value
                                      if (selectedTeam && value !== selectedTeam.name) {
                                        // 選択を解除
                                        setSelectedRankingTeams(prev => {
                                          const newTeams = { ...prev }
                                          delete newTeams[index]
                                          return newTeams
                                        })
                                      }
                                const newRanking = [...resultForm.ranking]
                                      newRanking[index] = value
                                setResultForm({ ...resultForm, ranking: newRanking })
                                      handleRankingSearch(index, value)
                                    }}
                                    placeholder={`${index + 1}位: チーム名で検索...`}
                                    disabled={!!selectedTeam}
                                  />
                                  {searchResults.length > 0 && !selectedTeam && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                      {searchResults.map((team) => (
                                        <div
                                          key={team.id}
                                          className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                          onClick={() => handleSelectRankingTeam(index, team)}
                                        >
                                          <p className="font-medium text-sm">{team.name}</p>
                                          {team.prefecture && (
                                            <p className="text-xs text-gray-500">{team.prefecture}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {selectedTeam && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedRankingTeams(prev => {
                                        const newTeams = { ...prev }
                                        delete newTeams[index]
                                        return newTeams
                                      })
                                      const newRanking = [...resultForm.ranking]
                                      newRanking[index] = ""
                                      setResultForm({ ...resultForm, ranking: newRanking })
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                            {index === resultForm.ranking.length - 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setResultForm({ ...resultForm, ranking: [...resultForm.ranking, ""] })}
                              >
                                +
                              </Button>
                            )}
                            {resultForm.ranking.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newRanking = resultForm.ranking.filter((_, i) => i !== index)
                                  setResultForm({ ...resultForm, ranking: newRanking })
                                      setSelectedRankingTeams(prev => {
                                        const newTeams = { ...prev }
                                        delete newTeams[index]
                                        return newTeams
                                      })
                                      setRankingSearchTerms(prev => {
                                        const newTerms = { ...prev }
                                        delete newTerms[index]
                                        return newTerms
                                      })
                                      setRankingSearchResults(prev => {
                                        const newResults = { ...prev }
                                        delete newResults[index]
                                        return newResults
                                      })
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                              {selectedTeam && (
                                <p className="text-xs text-gray-500 ml-1">選択中: {selectedTeam.name}</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {
                        setShowAddResultDialog(false)
                        setEditingResult(null)
                        setResultForm({ title: "", content: "", ranking: [""], startDate: "", endDate: "", imageUrl: "", pdfUrl: "", pdfName: "" })
                        setResultImageFile(null)
                        setResultImagePreview(null)
                        setResultPdfFile(null)
                        setResultPdfPreview(null)
                        setRankingSearchTerms({})
                        setRankingSearchResults({})
                        setSelectedRankingTeams({})
                      }}>
                        キャンセル
                      </Button>
                      <Button onClick={handleSaveResult}>
                        保存
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* メッセージタブ */}
            <TabsContent value="messages" className="mt-2">
              <Card>
                <CardHeader>
                  <CardTitle>メッセージ</CardTitle>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">メッセージはまだありません</p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id}>{message.content}</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
        </div>
      </div>
      </Tabs>

      {/* コメントモーダル */}
      {selectedPostForComment && (
        <CommentModal
          open={commentModalOpen}
          onOpenChange={setCommentModalOpen}
          post={{
            id: selectedPostForComment.id,
            user: {
              name: selectedPostForComment.authorName || "匿名ユーザー",
              avatar: selectedPostForComment.authorAvatar,
              email: selectedPostForComment.authorEmail,
            },
            content: selectedPostForComment.content,
            timestamp: selectedPostForComment.createdAt 
              ? new Date(selectedPostForComment.createdAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : "",
            image: selectedPostForComment.imageUrl,
            video: selectedPostForComment.videoUrl,
            pdf: selectedPostForComment.pdfUrl,
            likesCount: selectedPostForComment.likesCount || 0,
            commentsCount: selectedPostForComment.commentsCount || 0,
            isLiked: postLikedStates[selectedPostForComment.id] || false,
          }}
          comments={modalComments.map((c) => ({
            id: c.id.toString(),
            user: {
              name: c.user.name,
              avatar: c.user.avatar,
              email: c.user.email,
            },
            content: c.content,
            timestamp: c.timestamp,
            likesCount: c.likesCount || 0,
          }))}
          currentUser={currentUserData ? {
            name: currentUserData.name,
            avatar: currentUserData.avatar,
            email: currentUserEmail || undefined,
          } : null}
          newComment={modalComment}
          onCommentChange={setModalComment}
          onCommentSubmit={handleModalCommentSubmit}
          onLike={(postId) => {
            handleToggleLike(postId)
          }}
          isLoading={isSubmittingComment}
          isLoadingComments={isLoadingModalComments}
        />
      )}
    </Layout>
  )
}
