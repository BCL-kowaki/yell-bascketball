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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layout } from "@/components/layout"
import { CommentModal } from "@/components/comment-modal"
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
  Trash2,
  Search,
  Plus
} from "lucide-react"
import { getTeam, getCurrentUserEmail, updateTeam, type DbTeam, getPostsByTeam, createPost, type DbPost, toggleFavoriteTeam, checkFavoriteTeam, getUserByEmail, deletePost, toggleLike as toggleDbLike, addComment as addDbComment, getCommentsByPost, updatePostCounts, checkLikeStatus, searchUsers, type DbUser } from "@/lib/api"
import { uploadImageToS3, uploadPdfToS3, uploadVideoToS3, refreshS3Url } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { CATEGORIES, REGION_BLOCKS, PREFECTURES_BY_REGION, DISTRICTS_BY_PREFECTURE, DEFAULT_DISTRICTS } from "@/lib/regionData"

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
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedPostForComment, setSelectedPostForComment] = useState<DbPost | null>(null)
  const [modalComment, setModalComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [modalComments, setModalComments] = useState<any[]>([])
  const [isLoadingModalComments, setIsLoadingModalComments] = useState(false)
  const [teamManagers, setTeamManagers] = useState<Array<{ email: string; name: string; avatar: string }>>([])
  
  // チーム管理者編集関連
  const [editorSearchTerm, setEditorSearchTerm] = useState("")
  const [editorSearchResults, setEditorSearchResults] = useState<DbUser[]>([])
  const [isSearchingEditors, setIsSearchingEditors] = useState(false)
  const [selectedEditors, setSelectedEditors] = useState<DbUser[]>([])
  
  // Image upload state for team editing
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [availablePrefectures, setAvailablePrefectures] = useState<string[]>([])
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])
  
  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)

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

  // 地域ブロックが変更されたら、都道府県リストを更新
  useEffect(() => {
    if (editedTeam.region && PREFECTURES_BY_REGION[editedTeam.region]) {
      setAvailablePrefectures(PREFECTURES_BY_REGION[editedTeam.region])
    } else {
      setAvailablePrefectures([])
    }
    if (!editedTeam.region || editedTeam.region !== team?.region) {
      setEditedTeam(prev => ({ ...prev, prefecture: "" }))
      setAvailableDistricts([])
    }
  }, [editedTeam.region, team?.region])

  // 都道府県が変更されたら、地区リストを更新
  useEffect(() => {
    if (editedTeam.prefecture && DISTRICTS_BY_PREFECTURE[editedTeam.prefecture]) {
      setAvailableDistricts(DISTRICTS_BY_PREFECTURE[editedTeam.prefecture])
    } else {
      setAvailableDistricts(DEFAULT_DISTRICTS)
    }
    // Team型にはdistrictフィールドがないため、この処理は不要
  }, [editedTeam.prefecture, team?.prefecture])

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
          // ロゴとカバー画像のS3 URLを更新
          if (teamData.logoUrl && !teamData.logoUrl.startsWith('data:') && !teamData.logoUrl.startsWith('blob:')) {
            try {
              teamData.logoUrl = await refreshS3Url(teamData.logoUrl, true) || teamData.logoUrl
            } catch (error) {
              console.error('Failed to refresh logo URL:', error)
            }
          }
          if (teamData.coverImageUrl && !teamData.coverImageUrl.startsWith('data:') && !teamData.coverImageUrl.startsWith('blob:')) {
            try {
              teamData.coverImageUrl = await refreshS3Url(teamData.coverImageUrl, true) || teamData.coverImageUrl
            } catch (error) {
              console.error('Failed to refresh cover image URL:', error)
            }
          }
          
          setTeam(teamData)
          setEditedTeam(teamData)
          
          // チーム管理者（オーナーと編集者）のユーザー情報を取得
          const managerEmails = [teamData.ownerEmail, ...(teamData.editorEmails || [])]
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
          
          setTeamManagers(managers)
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

  async function handleEditClick() {
    setEditedTeam(team || {})
    setIsEditing(true)
    // 画像プレビューを設定
    if (team?.logoUrl) {
      setLogoPreview(team.logoUrl)
    }
    if (team?.coverImageUrl) {
      setCoverImagePreview(team.coverImageUrl)
    }
    // 地域ブロックと都道府県に基づいてリストを設定
    if (team?.region && PREFECTURES_BY_REGION[team.region]) {
      setAvailablePrefectures(PREFECTURES_BY_REGION[team.region])
    }
    if (team?.prefecture && DISTRICTS_BY_PREFECTURE[team.prefecture]) {
      setAvailableDistricts(DISTRICTS_BY_PREFECTURE[team.prefecture])
    } else {
      setAvailableDistricts(DEFAULT_DISTRICTS)
    }
    // 編集用の管理者リストを初期化（オーナーを除く）
    if (team?.editorEmails && team.editorEmails.length > 0) {
      const editorUsers: DbUser[] = []
      for (const email of team.editorEmails) {
        try {
          const userData = await getUserByEmail(email)
          if (userData) {
            editorUsers.push(userData)
          }
        } catch (error) {
          console.error(`Failed to load editor ${email}:`, error)
        }
      }
      setSelectedEditors(editorUsers)
    } else {
      setSelectedEditors([])
    }
  }

  async function handleCancelEdit() {
    setEditedTeam(team || {})
    setIsEditing(false)
    setLogoFile(null)
    setLogoPreview(null)
    setCoverImageFile(null)
    setCoverImagePreview(null)
    setAvailablePrefectures([])
    setAvailableDistricts([])
    setEditorSearchTerm("")
    setEditorSearchResults([])
    // 管理者リストをリセット
    if (team?.editorEmails && team.editorEmails.length > 0) {
      const editorUsers: DbUser[] = []
      for (const email of team.editorEmails) {
        try {
          const userData = await getUserByEmail(email)
          if (userData) {
            editorUsers.push(userData)
          }
        } catch (error) {
          console.error(`Failed to load editor ${email}:`, error)
        }
      }
      setSelectedEditors(editorUsers)
    } else {
      setSelectedEditors([])
    }
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
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

  // 管理者検索
  const handleEditorSearch = async () => {
    if (!editorSearchTerm.trim()) {
      setEditorSearchResults([])
      return
    }

    setIsSearchingEditors(true)
    try {
      const results = await searchUsers(editorSearchTerm)
      // オーナーと既に選択されている管理者を除外
      const filtered = results.filter(
        user => user.email !== team?.ownerEmail &&
          !selectedEditors.some(editor => editor.email === user.email)
      )
      setEditorSearchResults(filtered)
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: "エラー",
        description: "ユーザー検索に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSearchingEditors(false)
    }
  }

  // 管理者追加
  const handleAddEditor = (user: DbUser) => {
    if (selectedEditors.length < 5 && !selectedEditors.some(editor => editor.email === user.email)) {
      setSelectedEditors([...selectedEditors, user])
      setEditorSearchTerm("")
      setEditorSearchResults([])
    } else if (selectedEditors.length >= 5) {
      toast({
        title: "エラー",
        description: "管理者は最大5名まで追加できます",
        variant: "destructive",
      })
    }
  }

  // 管理者削除
  const handleRemoveEditor = (userEmail: string) => {
    setSelectedEditors(selectedEditors.filter(editor => editor.email !== userEmail))
  }

  async function handleSaveEdit() {
    if (!team || !params.id || typeof params.id !== 'string') return

    setIsSaving(true)
    try {
      let logoUrl = editedTeam.logoUrl
      let coverImageUrl = editedTeam.coverImageUrl

      // ロゴ画像をアップロード
      if (logoFile) {
        try {
          logoUrl = await uploadImageToS3(logoFile, `teams/${params.id}/logo`)
        } catch (error) {
          console.error("Failed to upload logo:", error)
          toast({
            title: "警告",
            description: "ロゴ画像のアップロードに失敗しました",
            variant: "destructive",
          })
        }
      }

      // カバー画像をアップロード
      if (coverImageFile) {
        try {
          coverImageUrl = await uploadImageToS3(coverImageFile, `teams/${params.id}/cover`)
        } catch (error) {
          console.error("Failed to upload cover image:", error)
          toast({
            title: "警告",
            description: "カバー画像のアップロードに失敗しました",
            variant: "destructive",
          })
        }
      }

      // 管理者のメールアドレスリストを作成
      const editorEmails = selectedEditors.map(editor => editor.email)

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
        instagramUrl: editedTeam.instagramUrl,
        logoUrl: logoUrl || undefined,
        coverImageUrl: coverImageUrl || undefined,
        editorEmails: editorEmails.length > 0 ? editorEmails : null
      }

      await updateTeam(params.id, updatedData)

      toast({
        title: "保存しました",
        description: "チーム情報を更新しました",
      })

      // データを再読み込み
      await loadTeamData()
      setIsEditing(false)
      setLogoFile(null)
      setLogoPreview(null)
      setCoverImageFile(null)
      setCoverImagePreview(null)
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
      
      // いいね状態を初期化（現在のユーザーがいいねした投稿を確認）
      if (currentUserEmail) {
        const likedStates: Record<string, boolean> = {}
        await Promise.all(
          teamPosts.map(async (post) => {
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
      await loadTeamPosts()
      
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

          {canEdit && !isEditing && (
              <div className="absolute right-0 bottom-2 md:bottom-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-card text-xs md:text-sm gap-2"
                onClick={() => {
                  setIsEditing(true)
                  handleEditClick()
                  setTimeout(() => {
                    coverImageInputRef.current?.click()
                  }, 100)
                }}
              >
                <Camera className="w-4 h-4" />
                カバー写真を変更
              </Button>
            </div>
          )}
          </div>
        </div>
        </div>

      {/* チームヘッダー - Full Width */}
      <Tabs defaultValue="timeline" className="w-full">
        <div className="w-screen -mx-[calc((100vw-100%)/2)] bg-card">
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-20 pb-0">
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

          {/* タブメニュー */}
          <div className="mt-6 order-t border-border border-b border-border">
            <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0 gap-0">
              <TabsTrigger 
                value="timeline"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 font-medium"
              >
                タイムライン
              </TabsTrigger>
              <TabsTrigger 
                value="about"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 font-medium"
              >
                基本データ
              </TabsTrigger>
              <TabsTrigger 
                value="photos"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 font-medium"
              >
                写真
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

      <div className="max-w-6xl pb-20">
        <div className="w-full max-w-[680px] mx-auto px-0 overflow-hidden box-border">

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
                        <Card key={post.id} className="w-full max-w-[680px] mx-auto lg:mx-0 border-0 shadow-sm bg-white sm:rounded-lg rounded-none py-2">
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
                              <div className="flex items-center gap-2 flex-1 justify-center">
                                      <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-auto hover:bg-transparent"
                                  onClick={() => {
                                    const url = `${window.location.origin}/posts/${post.id}`
                                    navigator.clipboard.writeText(url).then(() => {
                                      toast({
                                        title: "シェアリンクをコピーしました",
                                        description: "リンクをクリップボードにコピーしました",
                                      })
                                    }).catch(() => {
                                      toast({
                                        title: "エラー",
                                        description: "リンクのコピーに失敗しました",
                                        variant: "destructive",
                                      })
                                    })
                                  }}
                                >
                                  <Share2 className="w-[30px] h-[30px] text-black" />
                                      </Button>
                                <span className="text-[15px] text-black font-medium">
                                  シェア
                                </span>
                                    </div>
                                  </div>

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
                        <Select
                          value={editedTeam.category || ''}
                          onValueChange={(value) => handleInputChange('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="カテゴリを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          value={editedTeam.region || ''}
                          onValueChange={(value) => handleInputChange('region', value)}
                        >
                          <SelectTrigger>
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
                            value={editedTeam.prefecture || ''}
                            onValueChange={(value) => handleInputChange('prefecture', value)}
                          >
                            <SelectTrigger>
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

                      <div>
                        <Label htmlFor="instagramUrl">Instagram URL</Label>
                        <Input
                          id="instagramUrl"
                          type="text"
                          value={editedTeam.instagramUrl || ''}
                          onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                          placeholder="https://instagram.com/username または @username"
                        />
                      </div>

                      {/* チーム管理者 */}
                      <div>
                        <Label>チーム管理者（最大5名まで）</Label>
                        <p className="text-sm text-muted-foreground mb-2 mt-1">
                          オーナー以外の管理者を追加できます。現在: {selectedEditors.length}/5名
                        </p>

                        {/* 選択済み管理者 */}
                        {selectedEditors.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {selectedEditors.map((editor) => (
                              <div key={editor.id} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                                <span className="text-sm">{editor.firstName} {editor.lastName}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEditor(editor.email)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 管理者検索 */}
                        {selectedEditors.length < 5 && (
                          <div className="flex gap-2 mb-3">
                            <Input
                              placeholder="ユーザー名またはメールアドレスで検索..."
                              value={editorSearchTerm}
                              onChange={(e) => setEditorSearchTerm(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleEditorSearch()
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={handleEditorSearch}
                              disabled={isSearchingEditors}
                              size="sm"
                            >
                              {isSearchingEditors ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "検索"
                              )}
                            </Button>
                          </div>
                        )}

                        {/* 検索結果 */}
                        {editorSearchResults.length > 0 && (
                          <div className="mb-3 border rounded-md p-2 max-h-40 overflow-y-auto">
                            {editorSearchResults.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded"
                                onClick={() => handleAddEditor(user)}
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
                                    handleAddEditor(user)
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
                        <Label htmlFor="logo">ロゴ画像</Label>
                        <div className="space-y-2">
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoSelect}
                            className="hidden"
                            id="logo"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => logoInputRef.current?.click()}
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              ロゴを選択
                            </Button>
                            {logoPreview && (
                              <div className="relative">
                                <img
                                  src={logoPreview}
                                  alt="Logo preview"
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute -top-2 -right-2 p-0 h-6 w-6 rounded-full"
                                  onClick={() => {
                                    setLogoFile(null)
                                    setLogoPreview(null)
                                    if (logoInputRef.current) {
                                      logoInputRef.current.value = ''
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
                        <div className="space-y-2">
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
                              <Camera className="w-4 h-4 mr-2" />
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

                      {team.instagramUrl && (
                        <div>
                          <h4 className="font-medium mb-2">Instagram</h4>
                          <a
                            href={team.instagramUrl.startsWith('http') ? team.instagramUrl : `https://instagram.com/${team.instagramUrl.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-600 underline break-all"
                          >
                            {team.instagramUrl}
                          </a>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">チーム管理者</h4>
                        <div className="space-y-2">
                          {teamManagers.length > 0 ? (
                            teamManagers.map((manager, index) => (
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
                            <p className="text-muted-foreground text-sm">チーム管理者が登録されていません</p>
                      )}
                        </div>
                      </div>

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
        </div>
      </div>
      </Tabs>

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

      {/* コメントモーダル */}
      {selectedPostForComment && (
        <CommentModal
          open={commentModalOpen}
          onOpenChange={setCommentModalOpen}
          post={{
            id: selectedPostForComment.id,
            user: (() => {
              const postUser = postUsers.get(selectedPostForComment.authorEmail || "")
              return {
                name: postUser?.name || "匿名ユーザー",
                avatar: postUser?.avatar || "/placeholder.svg",
                email: selectedPostForComment.authorEmail || undefined,
              }
            })(),
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
            image: selectedPostForComment.imageUrl || undefined,
            video: selectedPostForComment.videoUrl || undefined,
            pdf: selectedPostForComment.pdfUrl || undefined,
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
            handleLike(postId)
          }}
          isLoading={isSubmittingComment}
          isLoadingComments={isLoadingModalComments}
        />
      )}
    </Layout>
  )
}
