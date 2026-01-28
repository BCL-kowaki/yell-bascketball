"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Layout } from "@/components/layout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ChevronLeft,
  Globe,
  Users,
  Calendar,
  MapPin,
  Edit,
  Loader2,
  Camera,
  MessageCircle,
  Save,
  X,
  Image as ImageIcon,
  FileText,
  Video,
  Paperclip,
  Heart,
  Share2,
  MoreHorizontal,
  Trash2
} from "lucide-react"
import { getTeam, getCurrentUserEmail, updateTeam, type DbTeam, getPostsByTeam, createPost, type DbPost, toggleFavoriteTeam, checkFavoriteTeam, getUserByEmail, deletePost, toggleLike as toggleDbLike, addComment as addDbComment } from "@/lib/api"
import { uploadImageToS3, uploadPdfToS3, uploadVideoToS3, refreshS3Url } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [team, setTeam] = useState<DbTeam | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedTeam, setEditedTeam] = useState<Partial<DbTeam>>({})
  const [isFavorite, setIsFavorite] = useState(false)

  // Post related state
  const [posts, setPosts] = useState<DbPost[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [postUsers, setPostUsers] = useState<Map<string, { name: string; avatar: string }>>(new Map())
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({})
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})
  const [postLikedStates, setPostLikedStates] = useState<{ [key: string]: boolean }>({})
  const [isPostFormOpen, setIsPostFormOpen] = useState(false)
  const [currentUserData, setCurrentUserData] = useState<{ name: string; avatar: string } | null>(null)
  
  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadTeamData()
    loadCurrentUser()
  }, [params.id])

  useEffect(() => {
    if (team && currentUserEmail) {
      const isOwner = team.ownerEmail === currentUserEmail
      const isEditor = team.editorEmails?.includes(currentUserEmail) || false
      setCanEdit(isOwner || isEditor)
    }
  }, [team, currentUserEmail])

  useEffect(() => {
    if (params.id && currentUserEmail && typeof params.id === 'string') {
      checkFavoriteTeam(params.id, currentUserEmail).then(setIsFavorite)
    }
  }, [params.id, currentUserEmail])

  async function loadCurrentUser() {
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
      console.error("Failed to load current user:", error)
    }
  }

  async function loadTeamData() {
    setIsLoading(true)
    try {
      if (typeof params.id === 'string') {
        const teamData = await getTeam(params.id)
        if (teamData) {
          setTeam(teamData)
          setEditedTeam(teamData)
        } else {
          toast({
            title: "エラー",
            description: "チームが見つかりませんでした",
            variant: "destructive",
          })
          router.push('/teams')
        }
      }
    } catch (error) {
      console.error("Failed to load team:", error)
      toast({
        title: "エラー",
        description: "チーム情報の取得に失敗しました",
        variant: "destructive",
      })
      router.push('/teams')
    } finally {
      setIsLoading(false)
    }
  }

  function handleEditClick() {
    setEditedTeam(team || {})
    setIsEditing(true)
  }

  function handleCancelEdit() {
    setEditedTeam(team || {})
    setIsEditing(false)
  }

  async function handleSaveEdit() {
    if (!team || !params.id || typeof params.id !== 'string') return

    setIsSaving(true)
    try {
      const updatedData: Partial<DbTeam> = {
        name: editedTeam.name,
        shortName: editedTeam.shortName,
        founded: editedTeam.founded,
        region: editedTeam.region,
        prefecture: editedTeam.prefecture,
        headcount: editedTeam.headcount,
        category: editedTeam.category,
        description: editedTeam.description,
        website: editedTeam.website,
      }

      await updateTeam(params.id, updatedData)

      toast({
        title: "保存しました",
        description: "チーム情報を更新しました",
      })

      // データを再読み込み
      await loadTeamData()
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update team:", error)
      toast({
        title: "エラー",
        description: "チーム情報の更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  function handleInputChange(field: keyof DbTeam, value: any) {
    setEditedTeam(prev => ({ ...prev, [field]: value }))
  }

  async function loadTeamPosts() {
    if (!params.id || typeof params.id !== 'string') return

    setIsLoadingPosts(true)
    try {
      const teamPosts = await getPostsByTeam(params.id)
      setPosts(teamPosts)
      
      // 投稿者のユーザー情報を取得
      const userMap = new Map<string, { name: string; avatar: string }>()
      for (const post of teamPosts) {
        if (post.authorEmail && !userMap.has(post.authorEmail)) {
          try {
            const user = await getUserByEmail(post.authorEmail)
            if (user) {
              // アバターURLをS3からリフレッシュ
              let avatarUrl = user.avatar || "/placeholder.svg"
              if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('blob:') && !avatarUrl.startsWith('/placeholder')) {
                try {
                  avatarUrl = await refreshS3Url(avatarUrl, true) || avatarUrl
                } catch (error) {
                  console.error('Failed to refresh avatar URL:', error)
                }
              }
              userMap.set(post.authorEmail, {
                name: `${user.lastName} ${user.firstName}`,
                avatar: avatarUrl
              })
            }
          } catch (error) {
            console.error(`Failed to load user for ${post.authorEmail}:`, error)
          }
        }
      }
      setPostUsers(userMap)
    } catch (error) {
      console.error("Failed to load team posts:", error)
      toast({
        title: "エラー",
        description: "投稿の読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const handleLike = async (postId: string) => {
    const target = posts.find(p => p.id === postId)
    if (!target || !currentUserEmail) return
    
    try {
      const res = await toggleDbLike(postId, currentUserEmail, target.likesCount || 0)
      setPosts(posts.map(p => p.id === postId ? { ...p, likesCount: res.likes } : p))
      setPostLikedStates(prev => ({ ...prev, [postId]: res.liked }))
    } catch (e) {
      console.error("toggle like failed", e)
      toast({
        title: "エラー",
        description: "いいねの更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const handleSubmitComment = async (postId: string) => {
    const commentText = newComment[postId]?.trim()
    if (!commentText || !currentUserEmail) return

    try {
      await addDbComment(postId, commentText, currentUserEmail)
      toast({
        title: "成功",
        description: "コメントを投稿しました",
      })
      setNewComment(prev => ({ ...prev, [postId]: "" }))
      // 投稿リストを更新
      await loadTeamPosts()
    } catch (error) {
      console.error("Failed to submit comment:", error)
      toast({
        title: "エラー",
        description: "コメントの投稿に失敗しました",
        variant: "destructive",
      })
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
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

  function handlePdfSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedPdf(file)
    }
  }

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedVideo(file)
    }
  }

  function clearAttachments() {
    setSelectedImage(null)
    setSelectedPdf(null)
    setSelectedVideo(null)
    setImagePreview(null)
  }

  async function handleCreatePost() {
    if (!newPostContent.trim() || !currentUserEmail || !params.id || typeof params.id !== 'string') {
      toast({
        title: "エラー",
        description: "投稿内容を入力してください",
        variant: "destructive",
      })
      return
    }

    setIsSubmittingPost(true)
    setIsUploadingFiles(true)

    try {
      let imageUrl: string | undefined
      let pdfUrl: string | undefined
      let pdfName: string | undefined
      let videoUrl: string | undefined
      let videoName: string | undefined

      // 画像のアップロード
      if (selectedImage) {
        try {
          toast({
            title: "画像をアップロード中...",
            description: "しばらくお待ちください",
          })
          imageUrl = await uploadImageToS3(selectedImage, currentUserEmail)
        } catch (error) {
          console.error("Image upload failed:", error)
          toast({
            title: "画像のアップロードに失敗しました",
            description: error instanceof Error ? error.message : "不明なエラー",
            variant: "destructive",
          })
          setIsSubmittingPost(false)
          setIsUploadingFiles(false)
          return
        }
      }

      // PDFのアップロード
      if (selectedPdf) {
        try {
          toast({
            title: "PDFをアップロード中...",
            description: "しばらくお待ちください",
          })
          pdfUrl = await uploadPdfToS3(selectedPdf, currentUserEmail)
          pdfName = selectedPdf.name
        } catch (error) {
          console.error("PDF upload failed:", error)
          toast({
            title: "PDFのアップロードに失敗しました",
            description: error instanceof Error ? error.message : "不明なエラー",
            variant: "destructive",
          })
          setIsSubmittingPost(false)
          setIsUploadingFiles(false)
          return
        }
      }

      // 動画のアップロード
      if (selectedVideo) {
        try {
          toast({
            title: "動画をアップロード中...",
            description: "しばらくお待ちください",
          })
          videoUrl = await uploadVideoToS3(selectedVideo, currentUserEmail)
          videoName = selectedVideo.name
        } catch (error) {
          console.error("Video upload failed:", error)
          toast({
            title: "動画のアップロードに失敗しました",
            description: error instanceof Error ? error.message : "不明なエラー",
            variant: "destructive",
          })
          setIsSubmittingPost(false)
          setIsUploadingFiles(false)
          return
        }
      }

      setIsUploadingFiles(false)

      // 投稿を作成
      await createPost({
        content: newPostContent.trim(),
        teamId: typeof params.id === 'string' ? params.id : undefined,
        authorEmail: currentUserEmail || undefined,
        likesCount: 0,
        commentsCount: 0,
        imageUrl: imageUrl || undefined,
        pdfUrl: pdfUrl || undefined,
        pdfName: pdfName || undefined,
        videoUrl: videoUrl || undefined,
        videoName: videoName || undefined,
      } as any)

      toast({
        title: "投稿しました",
        description: "チームタイムラインに投稿されました",
      })

      setNewPostContent("")
      clearAttachments()
      await loadTeamPosts()
    } catch (error) {
      console.error("Failed to create post:", error)
      toast({
        title: "エラー",
        description: "投稿に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingPost(false)
      setIsUploadingFiles(false)
    }
  }

  async function handleToggleFavorite() {
    if (!currentUserEmail || !params.id || typeof params.id !== 'string') {
      toast({
        title: "エラー",
        description: "ログインが必要です",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await toggleFavoriteTeam(params.id, currentUserEmail)
      setIsFavorite(result.isFavorite)
      toast({
        title: result.isFavorite ? "お気に入りに追加しました" : "お気に入りを解除しました",
        description: result.isFavorite ? "このチームをお気に入りに追加しました" : "このチームのお気に入りを解除しました",
      })
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
      toast({
        title: "エラー",
        description: "お気に入りの更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  // Load posts when team is loaded
  useEffect(() => {
    if (team && params.id) {
      loadTeamPosts()
    }
  }, [team, params.id])

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        </div>
      </Layout>
    )
  }

  if (!team) {
    return null
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-1 pt-2">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/teams">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              チーム一覧に戻る
            </Button>
          </Link>
        </div>
      </div>

      {/* カバー画像 - Full Width */}
      <div className="relative w-screen -mx-[calc((100vw-100%)/2)]">
        <div className="h-48 md:h-64 bg-gradient-to-r from-orange-400 to-red-400 overflow-hidden">
          {team.coverImageUrl ? (
            <img
              src={team.coverImageUrl}
              alt={team.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-24 h-24 text-white/50" />
            </div>
          )}
        </div>

        {/* Logo and Cover Edit Button - Positioned relative to max-w-6xl container */}
        <div className="absolute -bottom-12 md:-bottom-16 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 md:px-8">
          <div className="relative">
            <div className="absolute left-0 -bottom-0">
              <div className="relative">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-card">
                  <AvatarImage src={team.logoUrl || undefined} alt={team.name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold">
                    {(team.shortName || team.name).slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {canEdit && (
              <div className="absolute right-0 bottom-2 md:bottom-4">
                <Button size="sm" variant="outline" className="bg-card text-xs md:text-sm gap-2">
                  <Camera className="w-4 h-4" />
                  カバー写真を変更
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* チームヘッダー - Full Width */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)] bg-card">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-20 pb-6 border-b border-border">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="flex-1 mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{team.name}</h1>
              {team.shortName && (
                <p className="text-lg text-muted-foreground mb-2">{team.shortName}</p>
              )}
              {team.category && (
                <Badge className="mb-4">{team.category}</Badge>
              )}

              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                {team.description || "チームの説明はまだ登録されていません"}
              </p>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 text-sm text-muted-foreground mb-4">
                {team.prefecture && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {team.region && `${team.region} / `}{team.prefecture}
                  </div>
                )}
                {team.founded && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    設立: {team.founded}
                  </div>
                )}
                {team.headcount && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {team.headcount}名
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
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "お気に入り済み" : "お気に入り"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pb-20">
        {/* タブコンテンツ */}
        <div className="w-full max-w-[680px] mx-auto px-0">
          <Tabs defaultValue="timeline" className="flex flex-col mt-2 w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white">
              <TabsTrigger value="timeline">タイムライン</TabsTrigger>
              <TabsTrigger value="about">基本データ</TabsTrigger>
              <TabsTrigger value="photos">写真</TabsTrigger>
              <TabsTrigger value="messages">メッセージ</TabsTrigger>
            </TabsList>

            {/* タイムラインタブ */}
            <TabsContent value="timeline" className="mt-2 space-y-2">
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
                            placeholder="チームについて投稿しましょう..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
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
                          type="file"
                          ref={imageInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
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
                          type="file"
                          ref={pdfInputRef}
                          onChange={handlePdfSelect}
                          accept=".pdf"
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
                          type="file"
                          ref={videoInputRef}
                          onChange={handleVideoSelect}
                          accept="video/*"
                          style={{ display: "none" }}
                        />
                      </div>
                      <Button
                        onClick={async () => {
                          await handleCreatePost()
                          setIsPostFormOpen(false)
                        }}
                        disabled={isSubmittingPost || isUploadingFiles || !newPostContent.trim()}
                        className="px-4 h-9 bg-[#DC0000] hover:bg-[#B80000] text-white font-medium text-sm rounded-lg disabled:bg-gray-300"
                      >
                        {isSubmittingPost || isUploadingFiles ? (
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
                      {selectedPdf && (
                        <div className="relative text-sm text-gray-500 p-2 border rounded-lg flex items-center justify-between">
                          <span>選択中のPDF: {selectedPdf.name}</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedPdf(null)
                              if (pdfInputRef.current) {
                                pdfInputRef.current.value = ""
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {selectedVideo && (
                        <div className="relative">
                          <video src={URL.createObjectURL(selectedVideo)} controls className="rounded-lg max-h-40 w-auto" />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 rounded-full h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedVideo(null)
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
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                  <p className="text-muted-foreground mt-4">読み込み中...</p>
                </div>
              ) : posts.length === 0 ? (
                <Card className="w-full border-0 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-sm">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <p className="text-muted-foreground">まだ投稿がありません</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        最初の投稿を作成してみましょう
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {[...posts]
                    .sort((a, b) => {
                      const dateA = new Date(a.createdAt || 0).getTime()
                      const dateB = new Date(b.createdAt || 0).getTime()
                      return dateB - dateA
                    })
                    .map((post) => {
                      const user = post.authorEmail ? postUsers.get(post.authorEmail) : null
                      const userName = user?.name || post.authorEmail || "不明なユーザー"
                      const userAvatar = user?.avatar || "/placeholder.svg"
                      const timestamp = post.createdAt 
                        ? new Date(post.createdAt).toLocaleString('ja-JP', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : ''

                      return (
                        <Card key={post.id} className="w-full border-0 shadow-sm bg-white sm:rounded-lg rounded-none py-2">
                          <CardHeader className="px-3 sm:px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {post.authorEmail ? (
                                  <Link href={`/users/${encodeURIComponent(post.authorEmail)}`}>
                                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 cursor-pointer">
                                      <AvatarImage src={userAvatar} alt={userName} />
                                      <AvatarFallback className="bg-purple-600 text-white font-semibold">
                                        {userName
                                          .split(" ")
                                          .map((n: string) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                  </Link>
                                ) : (
                                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                                    <AvatarImage src={userAvatar} alt={userName} />
                                    <AvatarFallback className="bg-purple-600 text-white font-semibold">
                                      {userName
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div className="min-w-0">
                                  {post.authorEmail ? (
                                    <Link href={`/users/${encodeURIComponent(post.authorEmail)}`}>
                                      <div className="font-bold text-sm sm:text-[15px] text-black hover:underline cursor-pointer mb-0.5 truncate">{userName}</div>
                                    </Link>
                                  ) : (
                                    <div className="font-bold text-sm sm:text-[15px] text-black mb-0.5 truncate">{userName}</div>
                                  )}
                                  <div className="text-[11px] sm:text-xs text-gray-500">{timestamp}</div>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {post.authorEmail && currentUserEmail && post.authorEmail === currentUserEmail ? (
                                    <>
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        編集
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setDeletePostId(post.id)
                                          setIsDeleteDialogOpen(true)
                                        }}
                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        削除
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <DropdownMenuItem disabled className="text-gray-400 text-xs">
                                      編集・削除は投稿作成者のみ可能です
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>
                          <CardContent className="px-3 sm:px-4 pb-3">
                            <p className="mb-3 text-black text-sm sm:text-[15px] leading-6 sm:leading-7 break-words">{post.content}</p>

                            {post.imageUrl && (
                              <div className="mb-6 rounded-lg overflow-hidden border border-gray-100">
                                <img
                                  src={post.imageUrl}
                                  alt="Post content"
                                  className="w-full h-auto cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                                />
                              </div>
                            )}

                            {post.pdfUrl ? (
                              <div className="mb-6">
                                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-4">
                                  <FileText className="w-8 h-8 text-red-500" />
                                  <div className="flex-1">
                                    <a
                                      href={post.pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline font-medium block mb-2"
                                    >
                                      {post.pdfName || "PDFファイル"}
                                    </a>
                                    <p className="text-sm text-gray-500">
                                      PDFを表示するには、上記のリンクをクリックしてください
                                    </p>
                                  </div>
                                </div>
                                {post.pdfUrl.startsWith('data:') ? (
                                  <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
                                    <object
                                      data={post.pdfUrl}
                                      type="application/pdf"
                                      width="100%"
                                      height="500px"
                                      className="w-full"
                                    >
                                      <div className="p-4 text-center text-gray-500">
                                        <p>PDFを表示できませんでした。</p>
                                        <a
                                          href={post.pdfUrl}
                                          download={post.pdfName || "document.pdf"}
                                          className="text-blue-600 hover:underline mt-2 inline-block"
                                        >
                                          ダウンロードする
                                        </a>
                                      </div>
                                    </object>
                                  </div>
                                ) : (
                                  <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
                                    <iframe
                                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(post.pdfUrl)}&embedded=true`}
                                      width="100%"
                                      height="500px"
                                      className="w-full"
                                      title={post.pdfName || "PDFファイル"}
                                    ></iframe>
                                  </div>
                                )}
                              </div>
                            ) : post.pdfName ? (
                              <div className="mb-6 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                                <div className="flex items-center gap-2 text-yellow-800">
                                  <FileText className="w-5 h-5" />
                                  <span className="font-medium">{post.pdfName}</span>
                                  <span className="text-sm text-yellow-600">（PDFのアップロードに失敗しました）</span>
                                </div>
                              </div>
                            ) : null}

                            {post.videoUrl && (
                              <div className="mb-6 rounded-lg overflow-hidden border border-gray-100">
                                <video
                                  src={post.videoUrl}
                                  controls
                                  className="w-full h-auto"
                                >
                                  お使いのブラウザは動画の再生に対応していません。
                                </video>
                              </div>
                            )}

                            <div className="flex items-center gap-8 pt-2 border-t border-[#e1e1e1]">
                              <div className="flex items-center gap-2 flex-1 justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-auto hover:bg-transparent"
                                  onClick={() => handleLike(post.id)}
                                >
                                  <Heart className={`w-[26px] h-[26px] ${postLikedStates[post.id] ? "fill-current text-red-500" : "text-black"}`} />
                                </Button>
                                <span className="text-[15px] text-black font-medium">
                                  いいね {post.likesCount > 0 && <span className="font-normal">({post.likesCount})</span>}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-1 justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-auto hover:bg-transparent"
                                  onClick={() => toggleComments(post.id)}
                                >
                                  <MessageCircle className="w-[30px] h-[30px] text-black" />
                                </Button>
                                <span className="text-[15px] text-black font-medium">
                                  コメント <span className="font-normal">({post.commentsCount || 0})</span>
                                </span>
                              </div>
                            </div>

                            {showComments[post.id] && (
                              <div className="border-t border-gray-100 pt-6">
                                <div className="flex items-start gap-4 mb-6">
                                  <Avatar className="w-[43px] h-[43px]">
                                    <AvatarImage src={currentUserEmail ? (postUsers.get(currentUserEmail)?.avatar || "/placeholder.svg") : "/placeholder.svg"} alt="ユーザー" />
                                    <AvatarFallback className="text-[20px] bg-blue-600 text-white font-normal">
                                      {currentUserEmail && postUsers.get(currentUserEmail) ? postUsers.get(currentUserEmail)!.name.split(" ").map((n: string) => n[0]).join("") : "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-[#ececec] rounded-[10px] px-4 py-3">
                                      <Textarea
                                        placeholder="コメントを入力..."
                                        value={newComment[post.id] || ""}
                                        onChange={(e) => setNewComment((prev) => ({
                                          ...prev,
                                          [post.id]: e.target.value
                                        }))}
                                        className="resize-none border-none border-0 shadow-none !focus-visible:ring-0 !focus-visible:ring-offset-0 !focus:ring-0 !focus:ring-offset-0 !focus:outline-none !outline-none !ring-0 !ring-offset-0 text-[15px] bg-transparent rounded-[10px] placeholder:text-gray-400 p-0 min-h-[60px]"
                                        style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                                      />
                                    </div>
                                    <div className="flex justify-end mt-2">
                                      <Button
                                        onClick={() => handleSubmitComment(post.id)}
                                        disabled={!newComment[post.id]?.trim()}
                                        className="px-4 py-2 bg-[#dc0000] hover:bg-[#B80000] text-white font-bold text-[15px] rounded-[10px] disabled:bg-gray-300"
                                      >
                                        投稿
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              )}
            </TabsContent>

            {/* 基本データタブ */}
            <TabsContent value="about" className="mt-2">
              <Card className="w-full border-0 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">基本データ</h3>
                    {canEdit && !isEditing && (
                      <Button onClick={handleEditClick} variant="outline" size="sm" className="gap-2">
                        <Edit className="w-4 h-4" />
                        編集
                      </Button>
                    )}
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button onClick={handleCancelEdit} variant="outline" size="sm" className="gap-2">
                          <X className="w-4 h-4" />
                          キャンセル
                        </Button>
                        <Button onClick={handleSaveEdit} size="sm" className="gap-2" disabled={isSaving}>
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          保存
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="name">チーム名 *</Label>
                        <Input
                          id="name"
                          value={editedTeam.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="shortName">略称</Label>
                        <Input
                          id="shortName"
                          value={editedTeam.shortName || ''}
                          onChange={(e) => handleInputChange('shortName', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">カテゴリ</Label>
                        <Input
                          id="category"
                          value={editedTeam.category || ''}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          placeholder="例: U12, U15, U18"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">チーム紹介</Label>
                        <Textarea
                          id="description"
                          value={editedTeam.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={5}
                        />
                      </div>

                      <div>
                        <Label htmlFor="founded">設立年</Label>
                        <Input
                          id="founded"
                          value={editedTeam.founded || ''}
                          onChange={(e) => handleInputChange('founded', e.target.value)}
                          placeholder="例: 2020"
                        />
                      </div>

                      <div>
                        <Label htmlFor="region">地域ブロック</Label>
                        <Input
                          id="region"
                          value={editedTeam.region || ''}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="prefecture">都道府県</Label>
                        <Input
                          id="prefecture"
                          value={editedTeam.prefecture || ''}
                          onChange={(e) => handleInputChange('prefecture', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="headcount">人数</Label>
                        <Input
                          id="headcount"
                          type="number"
                          value={editedTeam.headcount || ''}
                          onChange={(e) => handleInputChange('headcount', parseInt(e.target.value) || undefined)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="website">ウェブサイト</Label>
                        <Input
                          id="website"
                          type="url"
                          value={editedTeam.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-medium mb-2">チーム名</h4>
                        <p className="text-muted-foreground">{team.name}</p>
                      </div>

                      {team.shortName && (
                        <div>
                          <h4 className="font-medium mb-2">略称</h4>
                          <p className="text-muted-foreground">{team.shortName}</p>
                        </div>
                      )}

                      {team.category && (
                        <div>
                          <h4 className="font-medium mb-2">カテゴリ</h4>
                          <p className="text-muted-foreground">{team.category}</p>
                        </div>
                      )}

                      {team.description && (
                        <div>
                          <h4 className="font-medium mb-2">チーム紹介</h4>
                          <p className="text-muted-foreground whitespace-pre-wrap">{team.description}</p>
                        </div>
                      )}

                      {team.founded && (
                        <div>
                          <h4 className="font-medium mb-2">設立</h4>
                          <p className="text-muted-foreground">{team.founded}</p>
                        </div>
                      )}

                      {(team.region || team.prefecture) && (
                        <div>
                          <h4 className="font-medium mb-2">活動地域</h4>
                          <div className="text-muted-foreground space-y-1">
                            {team.region && <p>地域ブロック: {team.region}</p>}
                            {team.prefecture && <p>都道府県: {team.prefecture}</p>}
                          </div>
                        </div>
                      )}

                      {team.headcount && (
                        <div>
                          <h4 className="font-medium mb-2">人数</h4>
                          <p className="text-muted-foreground">{team.headcount}名</p>
                        </div>
                      )}

                      {team.website && (
                        <div>
                          <h4 className="font-medium mb-2">ウェブサイト</h4>
                          <a
                            href={team.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-600 underline break-all"
                          >
                            {team.website}
                          </a>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">オーナー</h4>
                        <p className="text-muted-foreground">{team.ownerEmail}</p>
                      </div>

                      {team.editorEmails && team.editorEmails.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">編集者</h4>
                          <div className="space-y-1">
                            {team.editorEmails.map((email, index) => (
                              <p key={index} className="text-muted-foreground text-sm">{email}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">登録日</h4>
                        <p className="text-muted-foreground">
                          {team.createdAt
                            ? new Date(team.createdAt).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : "不明"}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 写真タブ */}
            <TabsContent value="photos" className="mt-2">
              <Card className="w-full border-0 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <h3 className="font-semibold text-lg">写真ギャラリー</h3>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">まだ写真がアップロードされていません</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      タイムラインに投稿された写真がここに表示されます
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* メッセージタブ */}
            <TabsContent value="messages" className="mt-2">
              <Card className="w-full border-0 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <h3 className="font-semibold text-lg">チームへのメッセージ</h3>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">メッセージ機能は準備中です</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      チームへのお問い合わせやメッセージを送信できるようになります
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。投稿が完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deletePostId === null) return
                
                try {
                  await deletePost(deletePostId)
                  toast({
                    title: "成功",
                    description: "投稿を削除しました",
                  })
                  
                  // 投稿リストを更新
                  await loadTeamPosts()
                  setIsDeleteDialogOpen(false)
                  setDeletePostId(null)
                } catch (error) {
                  console.error("Failed to delete post:", error)
                  toast({
                    title: "エラー",
                    description: "投稿の削除に失敗しました",
                    variant: "destructive",
                  })
                }
              }}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  )
}
