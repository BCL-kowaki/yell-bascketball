"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { getUserByEmail, updateUser, listPosts, createPost as createDbPost, getCurrentUserEmail, searchTeams, followUser, unfollowUser, checkFollowStatus, getFollowCounts, getUserFavorites, getCommentsByPost, addComment as addDbComment, updatePostCounts, toggleLike as toggleDbLike, getMyManagedTournaments, getMyTeams, getMyTeamTournaments, getSiteBanners, type DbUser, type DbPost, type DbTeam, type DbTournament, type SponsorBanner } from "@/lib/api"
import { uploadImageToS3, uploadPdfToS3, uploadVideoToS3, refreshS3Url } from "@/lib/storage"
import SponsorSidebar from "@/components/sponsor-sidebar"
import { CATEGORIES, REGION_BLOCKS, PREFECTURES_BY_REGION, DISTRICTS_BY_PREFECTURE, DEFAULT_DISTRICTS } from "@/lib/regionData"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, MapPin, Calendar, Edit2, Save, X, Search, Plus, XCircle, UserPlus, Users, Heart, Instagram, Trophy, Settings, Loader2, Clock, ChevronRight, ImageIcon, FileText, Video, Send } from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"
import { ProfilePostCard } from "@/components/profile-post-card"
import { CommentModal } from "@/components/comment-modal"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    category: "",
    region: "",
    prefecture: "",
    district: "",
    teams: [] as string[],
    isEmailPublic: false,
    isRegistrationDatePublic: false,
    instagramUrl: "",
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [availablePrefectures, setAvailablePrefectures] = useState<string[]>([])
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])
  const [userPosts, setUserPosts] = useState<DbPost[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [visiblePosts, setVisiblePosts] = useState<Set<string>>(new Set())
  const postRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // チーム検索関連
  const [teamSearchTerm, setTeamSearchTerm] = useState("")
  const [teamSearchResults, setTeamSearchResults] = useState<DbTeam[]>([])
  const [isSearchingTeams, setIsSearchingTeams] = useState(false)
  const [otherTeamInput, setOtherTeamInput] = useState("")

  // フォロー機能関連
  const [isFollowing, setIsFollowing] = useState(false)
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [isLoadingFollow, setIsLoadingFollow] = useState(false)
  const [activeTab, setActiveTab] = useState("tournaments")

  // お気に入り関連
  const [favoriteTeams, setFavoriteTeams] = useState<DbTeam[]>([])
  const [favoriteTournaments, setFavoriteTournaments] = useState<DbTournament[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)

  // 運営関連
  const [managedTournaments, setManagedTournaments] = useState<DbTournament[]>([])
  const [managedTeams, setManagedTeams] = useState<DbTeam[]>([])
  const [isLoadingManaged, setIsLoadingManaged] = useState(false)

  // チーム参加大会関連
  const [upcomingTournaments, setUpcomingTournaments] = useState<(DbTournament & { teamName?: string })[]>([])
  const [pastTournaments, setPastTournaments] = useState<(DbTournament & { teamName?: string })[]>([])
  const [isLoadingTeamTournaments, setIsLoadingTeamTournaments] = useState(false)

  // コメントモーダル関連
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedPostForComment, setSelectedPostForComment] = useState<DbPost | null>(null)
  const [modalComment, setModalComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [modalComments, setModalComments] = useState<any[]>([])
  const [isLoadingModalComments, setIsLoadingModalComments] = useState(false)
  const [currentUserData, setCurrentUserData] = useState<{ name: string; avatar: string } | null>(null)

  // 現在のユーザーのメールアドレス
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  // 画像URLリフレッシュ用のstate
  const [refreshedAvatarUrl, setRefreshedAvatarUrl] = useState<string | null>(null)
  const [refreshedCoverUrl, setRefreshedCoverUrl] = useState<string | null>(null)

  // 運営バナー
  const [siteBanners, setSiteBanners] = useState<SponsorBanner[]>([])

  // 投稿フォーム関連
  const [isPostFormOpen, setIsPostFormOpen] = useState(false)
  const [newPost, setNewPost] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ensureAmplifyConfigured()
    loadUserProfile()
    // 運営バナーを取得
    getSiteBanners().then(setSiteBanners).catch(() => {})
  }, [])

  // フォロー状態とお気に入りを読み込む
  useEffect(() => {
    if (user) {
      loadFollowStatus()
      loadFollowCounts()
      loadFavorites()
      loadManagedData()
      loadTeamTournaments()
    }
  }, [user])

  // 地域ブロックが変更されたら、都道府県リストを更新
  useEffect(() => {
    if (editForm.region) {
      setAvailablePrefectures(PREFECTURES_BY_REGION[editForm.region] || [])
      setEditForm(prev => ({ ...prev, prefecture: "", district: "" }))
      setAvailableDistricts([])
    } else {
      setAvailablePrefectures([])
    }
  }, [editForm.region])

  // 都道府県が変更されたら、地区リストを更新
  useEffect(() => {
    if (editForm.prefecture) {
      setAvailableDistricts(DISTRICTS_BY_PREFECTURE[editForm.prefecture] || DEFAULT_DISTRICTS)
      setEditForm(prev => ({ ...prev, district: "" }))
    } else {
      setAvailableDistricts([])
    }
  }, [editForm.prefecture])

  // Intersection Observerでスクロールアニメーションを実装
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute('data-post-id')
            if (postId) {
              setVisiblePosts((prev) => new Set([...prev, postId]))
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    postRefs.current.forEach((element) => {
      observer.observe(element)
    })

    return () => {
      observer.disconnect()
    }
  }, [userPosts])

  const loadUserProfile = async () => {
    try {
      const email = await getCurrentUserEmail()

      if (!email) {
        console.error('Could not get email from session')
        router.push('/login')
        return
      }

      setCurrentUserEmail(email)
      console.log('Loading profile for email:', email)
      const userData = await getUserByEmail(email)

      if (!userData) {
        console.log('User not found in DynamoDB, creating...', email)
        // DB未登録の場合は自動作成を試みる
        try {
          const { generateClient } = await import("aws-amplify/api")
          const { createUser } = await import("@/src/graphql/mutations")
          const apiClient = generateClient({ authMode: 'apiKey' })
          await apiClient.graphql({
            query: createUser,
            variables: { input: { email: email, firstName: '', lastName: '' } },
            authMode: 'apiKey'
          })
          console.log('User created in DynamoDB, redirecting to setup-profile')
        } catch (createError) {
          console.error('Failed to create user in DB:', createError)
        }
        // プロフィール設定ページへ
        window.location.href = '/setup-profile'
        return
      }
      
      // 現在のユーザー情報を設定
      let avatarUrl = userData.avatar || "/placeholder.svg"
      if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('blob:') && !avatarUrl.startsWith('/placeholder')) {
        try {
          avatarUrl = await refreshS3Url(avatarUrl, true) || avatarUrl
        } catch (e) {
          console.error('Failed to refresh avatar URL:', e)
        }
      }
      setCurrentUserData({
        name: `${userData.lastName} ${userData.firstName}`,
        avatar: avatarUrl,
      })

      console.log('User profile loaded successfully:', userData)

      // アバター画像とカバー画像のS3 URLを更新（ダウンロードモードを使用）
      if (userData.avatar && !userData.avatar.startsWith('data:') && !userData.avatar.startsWith('blob:')) {
        try {
          const refreshedAvatar = await refreshS3Url(userData.avatar, true)
          userData.avatar = refreshedAvatar || userData.avatar
        } catch (error) {
          console.error('Failed to refresh avatar URL:', error)
        }
      }

      if (userData.coverImage && !userData.coverImage.startsWith('data:') && !userData.coverImage.startsWith('blob:')) {
        try {
          const refreshedCover = await refreshS3Url(userData.coverImage, true)
          userData.coverImage = refreshedCover || userData.coverImage
        } catch (error) {
          console.error('Failed to refresh cover image URL:', error)
        }
      }

      setUser(userData)

      setEditForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio || "",
        category: userData.category || "",
        region: userData.region || "",
        prefecture: userData.prefecture || "",
        district: userData.district || "",
        teams: userData.teams || [],
        isEmailPublic: userData.isEmailPublic || false,
        isRegistrationDatePublic: userData.isRegistrationDatePublic || false,
        instagramUrl: userData.instagramUrl || "",
      })

      // 既存データに基づいて選択肢を設定
      if (userData.region) {
        setAvailablePrefectures(PREFECTURES_BY_REGION[userData.region] || [])
      }
      if (userData.prefecture) {
        setAvailableDistricts(DISTRICTS_BY_PREFECTURE[userData.prefecture] || DEFAULT_DISTRICTS)
      }

      // ユーザーの投稿を読み込む
      await loadUserPosts(email)
    } catch (error: any) {
      console.error("Failed to load user profile:", error)
      if (
        error?.name === 'NotAuthorizedException' ||
        error?.name === 'UserNotFoundException' ||
        error?.name === 'UserUnAuthenticatedException'
      ) {
        router.push('/login')
        return
      }
      toast({
        title: "エラー",
        description: "プロフィールの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserPosts = async (email: string) => {
    setIsLoadingPosts(true)
    try {
      console.log('Loading posts for user:', email)
      const posts = await listPosts(100, { authorEmail: email })
      const sortedPosts = posts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
      setUserPosts(sortedPosts)
      console.log('User posts loaded:', sortedPosts.length)
    } catch (error) {
      console.error('Failed to load user posts:', error)
      toast({
        title: "エラー",
        description: "投稿の読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPosts(false)
    }
  }

  // 投稿フォーム: ファイル選択ハンドラー
  const handlePostImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handlePostPdfSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedPdf(file)
      if (pdfPreview) URL.revokeObjectURL(pdfPreview)
      setPdfPreview(URL.createObjectURL(file))
    }
  }

  const handlePostVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedVideo(file)
      if (videoPreview) URL.revokeObjectURL(videoPreview)
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  // 投稿フォーム: 投稿送信
  const handleSubmitPost = async () => {
    if (!newPost.trim() && !selectedPdf && !selectedImage && !selectedVideo) return
    if (!currentUserEmail) {
      toast({ title: "エラー", description: "ログインが必要です", variant: "destructive" })
      return
    }

    setIsSubmittingPost(true)
    try {
      // 画像、動画、PDFをS3にアップロード
      let imageUrl: string | null = null
      let videoUrl: string | null = null
      let pdfUrl: string | null = null

      if (selectedImage) {
        try {
          imageUrl = await uploadImageToS3(selectedImage, currentUserEmail)
        } catch (error) {
          console.error('Failed to upload image:', error)
          imageUrl = imagePreview || null
        }
      }

      if (selectedVideo) {
        try {
          videoUrl = await uploadVideoToS3(selectedVideo, currentUserEmail)
        } catch (error) {
          console.error('Failed to upload video:', error)
          videoUrl = videoPreview || null
        }
      }

      if (selectedPdf) {
        try {
          pdfUrl = await uploadPdfToS3(selectedPdf, currentUserEmail)
        } catch (error) {
          console.error('Failed to upload PDF:', error)
          pdfUrl = null
        }
      }

      // blob: URLは保存不可
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        toast({ title: "エラー", description: "PDFのURLが無効です。再度アップロードしてください。", variant: "destructive" })
        setIsSubmittingPost(false)
        return
      }

      const postInput = {
        content: newPost || '',
        imageUrl,
        videoUrl,
        videoName: selectedVideo?.name || null,
        pdfUrl,
        pdfName: selectedPdf?.name || null,
        linkUrl: null,
        linkTitle: null,
        linkDescription: null,
        linkImage: null,
        likesCount: 0,
        commentsCount: 0,
        authorEmail: currentUserEmail,
      }

      await createDbPost(postInput)

      toast({ title: "成功", description: "投稿が作成されました" })

      // フォームをリセット
      setNewPost("")
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedPdf(null)
      if (pdfPreview) URL.revokeObjectURL(pdfPreview)
      setPdfPreview(null)
      setSelectedVideo(null)
      if (videoPreview) URL.revokeObjectURL(videoPreview)
      setVideoPreview(null)
      setIsPostFormOpen(false)

      // 投稿一覧を再読み込み
      await loadUserPosts(currentUserEmail)
    } catch (error: any) {
      console.error("create post failed", error)
      toast({ title: "エラー", description: error?.message || "投稿の作成に失敗しました", variant: "destructive" })
    } finally {
      setIsSubmittingPost(false)
    }
  }

  const handleToggleComments = async (postId: string) => {
    // モーダルを開く
    const post = userPosts.find(p => p.id === postId)
    if (post && currentUserEmail) {
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
                const commentUser = await getUserByEmail(dbComment.authorEmail)
                if (commentUser) {
                  userName = `${commentUser.lastName} ${commentUser.firstName}`
                  if (commentUser.avatar) {
                    try {
                      userAvatar = await refreshS3Url(commentUser.avatar, true) || commentUser.avatar
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

  const handleLike = async (postId: string) => {
    if (!currentUserEmail) {
      toast({
        title: "エラー",
        description: "ログインが必要です",
        variant: "destructive",
      })
      return
    }

    try {
      const post = userPosts.find(p => p.id === postId)
      const currentLikes = post?.likesCount || 0
      await toggleDbLike(postId, currentUserEmail, currentLikes)
      
      // 投稿一覧を再読み込み
      if (currentUserEmail) {
        await loadUserPosts(currentUserEmail)
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
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
                const commentUser = await getUserByEmail(dbComment.authorEmail)
                if (commentUser) {
                  userName = `${commentUser.lastName} ${commentUser.firstName}`
                  if (commentUser.avatar) {
                    try {
                      userAvatar = await refreshS3Url(commentUser.avatar, true) || commentUser.avatar
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
      if (currentUserEmail) {
        await loadUserPosts(currentUserEmail)
      }
      
      // モーダル内の投稿も更新
      const updatedPost = userPosts.find(p => p.id === selectedPostForComment.id)
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

  // チーム検索
  const handleTeamSearch = async () => {
    if (!teamSearchTerm.trim()) return

    setIsSearchingTeams(true)
    try {
      const results = await searchTeams(teamSearchTerm)
      setTeamSearchResults(results)
    } catch (error) {
      console.error('Failed to search teams:', error)
      toast({
        title: "エラー",
        description: "チーム検索に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSearchingTeams(false)
    }
  }

  // チームを追加
  const handleAddTeam = (teamName: string) => {
    if (editForm.teams.includes(teamName)) {
      toast({
        title: "既に追加済み",
        description: "このチームは既に追加されています",
      })
      return
    }

    setEditForm(prev => ({
      ...prev,
      teams: [...prev.teams, teamName]
    }))
    setTeamSearchTerm("")
    setTeamSearchResults([])
  }

  // その他のチームを追加
  const handleAddOtherTeam = () => {
    if (!otherTeamInput.trim()) return

    if (editForm.teams.includes(otherTeamInput)) {
      toast({
        title: "既に追加済み",
        description: "このチームは既に追加されています",
      })
      return
    }

    setEditForm(prev => ({
      ...prev,
      teams: [...prev.teams, otherTeamInput]
    }))
    setOtherTeamInput("")
  }

  // チームを削除
  const handleRemoveTeam = (teamName: string) => {
    setEditForm(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t !== teamName)
    }))
  }

  // フォロー状態を読み込む
  const loadFollowStatus = async () => {
    if (!user) return
    try {
      const currentEmail = await getCurrentUserEmail()
      if (!currentEmail || currentEmail === user.email) return

      const status = await checkFollowStatus(currentEmail, user.email)
      setIsFollowing(status)
    } catch (error) {
      console.error("Failed to load follow status:", error)
    }
  }

  // フォロー数を読み込む
  const loadFollowCounts = async () => {
    if (!user) return
    try {
      const counts = await getFollowCounts(user.email)
      setFollowCounts(counts)
    } catch (error) {
      console.error("Failed to load follow counts:", error)
    }
  }

  // フォローボタンのハンドラー
  const handleFollow = async () => {
    if (!user) return
    try {
      setIsLoadingFollow(true)
      const currentEmail = await getCurrentUserEmail()
      if (!currentEmail) {
        toast({
          title: "エラー",
          description: "ログインが必要です",
          variant: "destructive",
        })
        return
      }

      if (isFollowing) {
        await unfollowUser(currentEmail, user.email)
        setIsFollowing(false)
        setFollowCounts(prev => ({ ...prev, followers: prev.followers - 1 }))
        toast({
          title: "フォロー解除",
          description: `${user.firstName} ${user.lastName}のフォローを解除しました`,
        })
      } else {
        await followUser(currentEmail, user.email)
        setIsFollowing(true)
        setFollowCounts(prev => ({ ...prev, followers: prev.followers + 1 }))
        toast({
          title: "フォロー",
          description: `${user.firstName} ${user.lastName}をフォローしました`,
        })
      }
    } catch (error: any) {
      console.error("Failed to toggle follow:", error)
      toast({
        title: "エラー",
        description: error?.message || "フォロー操作に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoadingFollow(false)
    }
  }

  // お気に入りを読み込む
  const loadFavorites = async () => {
    if (!user) return
    setIsLoadingFavorites(true)
    try {
      const favorites = await getUserFavorites(user.email)
      setFavoriteTeams(favorites.teams)
      setFavoriteTournaments(favorites.tournaments)
    } catch (error) {
      console.error("Failed to load favorites:", error)
    } finally {
      setIsLoadingFavorites(false)
    }
  }

  // 運営データを読み込む
  const loadManagedData = async () => {
    if (!user) return
    setIsLoadingManaged(true)
    try {
      const [tournaments, teams] = await Promise.all([
        getMyManagedTournaments(user.email),
        getMyTeams(user.email),
      ])
      setManagedTournaments(tournaments)
      setManagedTeams(teams)
    } catch (error) {
      console.error("Failed to load managed data:", error)
    } finally {
      setIsLoadingManaged(false)
    }
  }

  // チーム参加大会を読み込む
  const loadTeamTournaments = async () => {
    if (!user) return
    setIsLoadingTeamTournaments(true)
    try {
      const { upcoming, past } = await getMyTeamTournaments(user.email)
      setUpcomingTournaments(upcoming)
      setPastTournaments(past)
    } catch (error) {
      console.error("Failed to load team tournaments:", error)
    } finally {
      setIsLoadingTeamTournaments(false)
    }
  }

  const convertTransparentToWhite = (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        const dataUrl = canvas.toDataURL('image/png')
        resolve(dataUrl)
      }
      img.onerror = reject
      img.src = imageSrc
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)

      const reader = new FileReader()
      reader.onloadend = async () => {
        const originalDataUrl = reader.result as string
        try {
          const convertedDataUrl = await convertTransparentToWhite(originalDataUrl)
          setAvatarPreview(convertedDataUrl)
        } catch (error) {
          console.error('Failed to convert image:', error)
          setAvatarPreview(originalDataUrl)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)

      const reader = new FileReader()
      reader.onloadend = async () => {
        const originalDataUrl = reader.result as string
        try {
          const convertedDataUrl = await convertTransparentToWhite(originalDataUrl)
          setCoverPreview(convertedDataUrl)
        } catch (error) {
          console.error('Failed to convert image:', error)
          setCoverPreview(originalDataUrl)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      let avatarUrl = user.avatar || null
      let coverImageUrl = user.coverImage || null

      if (avatarFile) {
        try {
          console.log('Uploading avatar to S3...')
          avatarUrl = await uploadImageToS3(avatarFile, user.id)
          console.log('Avatar uploaded successfully:', avatarUrl)
        } catch (error: any) {
          console.error('Failed to upload avatar:', error)
          toast({
            title: "エラー",
            description: `アバター画像のアップロードに失敗しました: ${error?.message || '不明なエラー'}`,
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      if (coverFile) {
        try {
          console.log('Uploading cover image to S3...')
          coverImageUrl = await uploadImageToS3(coverFile, user.id)
          console.log('Cover image uploaded successfully:', coverImageUrl)
        } catch (error: any) {
          console.error('Failed to upload cover image:', error)
          toast({
            title: "エラー",
            description: `カバー画像のアップロードに失敗しました: ${error?.message || '不明なエラー'}`,
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      const updateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        bio: editForm.bio || null,
        avatar: avatarUrl,
        coverImage: coverImageUrl,
        category: editForm.category || null,
        region: editForm.region || null,
        prefecture: editForm.prefecture || null,
        district: editForm.district || null,
        teams: editForm.teams.length > 0 ? editForm.teams : null,
        isEmailPublic: editForm.isEmailPublic,
        isRegistrationDatePublic: editForm.isRegistrationDatePublic,
        instagramUrl: editForm.instagramUrl || null,
      }

      console.log('Updating user profile:', { userId: user.id, updateData })

      const updatedUser = await updateUser(user.id, updateData)

      console.log('Profile updated successfully:', updatedUser)

      toast({
        title: "成功",
        description: "プロフィールを更新しました",
      })

      setIsEditing(false)
      setAvatarPreview(null)
      setCoverPreview(null)
      setAvatarFile(null)
      setCoverFile(null)
      await loadUserProfile()
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      console.error("Error details:", {
        message: error?.message,
        name: error?.name,
        errors: error?.errors,
      })
      toast({
        title: "エラー",
        description: error?.message || "プロフィールの更新に失敗しました。コンソールを確認してください。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
        instagramUrl: user.instagramUrl || "",
        bio: user.bio || "",
        category: user.category || "",
        region: user.region || "",
        prefecture: user.prefecture || "",
        district: user.district || "",
        teams: user.teams || [],
        isEmailPublic: user.isEmailPublic || false,
        isRegistrationDatePublic: user.isRegistrationDatePublic || false,
      })
    }
    setAvatarPreview(null)
    setCoverPreview(null)
    setAvatarFile(null)
    setCoverFile(null)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <Layout isLoggedIn={true} currentUser={{ name: "読み込み中..." }}>
        <div className="max-w-[1152px] mx-auto pb-20 p-8 text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout isLoggedIn={false} currentUser={undefined}>
        <div className="max-w-[1152px] mx-auto pb-20 p-8 text-center">
          <p className="text-muted-foreground">ユーザー情報が見つかりません</p>
        </div>
      </Layout>
    )
  }

  const displayName = `${user.lastName} ${user.firstName}`
  const isOwnProfile = user && currentUserEmail ? user.email === currentUserEmail : false

  // 画像URLを正しく処理する関数
  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview
    if (refreshedAvatarUrl) return refreshedAvatarUrl
    if (user.avatar) {
      // Base64データURL、Blob URL、またはS3のURLをそのまま返す
      if (user.avatar.startsWith('data:') || user.avatar.startsWith('blob:') || user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
        return user.avatar
      }
    }
    return "/placeholder-user.jpg"
  }

  const getCoverImageUrl = () => {
    if (coverPreview) return coverPreview
    if (refreshedCoverUrl) return refreshedCoverUrl
    if (user.coverImage) {
      // Base64データURL、Blob URL、またはS3のURLをそのまま返す
      if (user.coverImage.startsWith('data:') || user.coverImage.startsWith('blob:') || user.coverImage.startsWith('http://') || user.coverImage.startsWith('https://')) {
        return user.coverImage
      }
    }
    return "/placeholder.svg?height=300&width=800"
  }

  // 画像の読み込みエラー時にS3 URLをリフレッシュ
  const handleAvatarError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    const currentSrc = target.src
    
    // 既にプレースホルダーを表示している場合は何もしない
    if (currentSrc.includes('placeholder')) return
    
    // S3のURLの場合、リフレッシュを試行
    if (user.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://'))) {
      try {
        console.log('Avatar image failed to load, attempting to refresh S3 URL...')
        const refreshed = await refreshS3Url(user.avatar, true)
        if (refreshed) {
          setRefreshedAvatarUrl(refreshed)
          target.src = refreshed
          return
        }
      } catch (error) {
        console.error('Failed to refresh avatar URL on error:', error)
      }
    }
    
    // リフレッシュに失敗した場合はプレースホルダーを表示
    target.src = "/placeholder-user.jpg"
  }

  const handleCoverImageError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    const currentSrc = target.src
    
    // 既にプレースホルダーを表示している場合は何もしない
    if (currentSrc.includes('placeholder')) return
    
    // S3のURLの場合、リフレッシュを試行
    if (user.coverImage && (user.coverImage.startsWith('http://') || user.coverImage.startsWith('https://'))) {
      try {
        console.log('Cover image failed to load, attempting to refresh S3 URL...')
        const refreshed = await refreshS3Url(user.coverImage, true)
        if (refreshed) {
          setRefreshedCoverUrl(refreshed)
          target.src = refreshed
          return
        }
      } catch (error) {
        console.error('Failed to refresh cover image URL on error:', error)
      }
    }
    
    // リフレッシュに失敗した場合はプレースホルダーを表示
    target.src = "/placeholder.svg?height=300&width=800"
  }

  return (
    <Layout isLoggedIn={true} currentUser={{ name: displayName, avatar: getAvatarUrl() || undefined }}>
      {/* Cover Photo - Full Width */}
      <div className="relative w-screen -mx-[calc((100vw-100%)/2)]">
          <div className="h-48 md:h-64 bg-gradient-to-r from-orange-400 to-red-400 overflow-hidden">
            <img
              src={getCoverImageUrl()}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={handleCoverImageError}
            />
          </div>

        {/* Avatar and Cover Edit Button - Positioned relative to max-w-[1152px] container */}
        <div className="absolute -bottom-12 md:-bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[1152px] px-4 md:px-8">
          <div className="relative">
            <div className="absolute left-0 -bottom-0">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-card">
                <AvatarImage
                  src={getAvatarUrl()}
                  alt={displayName}
                  className="object-contain"
                  onError={handleAvatarError}
                />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-screen -mx-[calc((100vw-100%)/2)] bg-card">
          <div className="max-w-[1152px] mx-auto px-4 md:px-8 pt-16 md:pt-20 pb-0">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="flex-1 mb-4 md:mb-0">
              <>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{displayName}</h1>
                  <p className="text-muted-foreground mb-4 text-sm md:text-base">
                    {user.bio || "自己紹介がまだ設定されていません"}
                  </p>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 text-sm text-muted-foreground mb-4">
                    {(isOwnProfile || user.isRegistrationDatePublic) && user.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}に参加
                      </div>
                    )}
                    {/* フォロー/フォロワー数 */}
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/list/following?user=${encodeURIComponent(user.email)}`}
                        className="hover:underline cursor-pointer"
                      >
                        <span className="font-semibold text-foreground">{followCounts.following}</span>
                        <span className="ml-1">フォロー中</span>
                      </Link>
                      <Link
                        href={`/list/followers?user=${encodeURIComponent(user.email)}`}
                        className="hover:underline cursor-pointer"
                      >
                        <span className="font-semibold text-foreground">{followCounts.followers}</span>
                        <span className="ml-1">フォロワー</span>
                      </Link>
                    </div>
                  </div>

                  {/* お気に入りチーム・大会 */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link
                      href={`/list/favorite-teams?user=${encodeURIComponent(user.email)}`}
                      className="hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-semibold text-foreground">{favoriteTeams.length}</span>
                      <span>お気に入りチーム</span>
                    </Link>
                    <Link
                      href={`/list/favorite-tournaments?user=${encodeURIComponent(user.email)}`}
                      className="hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-semibold text-foreground">{favoriteTournaments.length}</span>
                      <span>お気に入り大会</span>
                    </Link>
                  </div>

                  {/* インスタグラムリンク */}
                  {user.instagramUrl && (() => {
                    const getInstagramAccountId = (url: string): string => {
                      if (!url) return ''
                      let accountId = url.replace(/^@/, '')
                      const match = accountId.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^\/\?]+)/)
                      if (match) {
                        accountId = match[1]
                      }
                      accountId = accountId.split('/')[0].split('?')[0]
                      return accountId
                    }
                    const accountId = getInstagramAccountId(user.instagramUrl)
                    const instagramUrl = user.instagramUrl.startsWith('http') ? user.instagramUrl : `https://instagram.com/${accountId}`
                    return (
                      <div className="mb-4">
                        <a
                          href={instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 transition-colors"
                          style={{
                            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          <Instagram className="w-5 h-5" style={{ color: '#E4405F' }} />
                          <span className="text-sm font-medium">{accountId}</span>
                        </a>
                      </div>
                    )
                  })()}
                </>
            </div>

            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              {isOwnProfile ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex-1 md:flex-initial"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  プロフィールを編集
                </Button>
              ) : (
                <Button
                  onClick={handleFollow}
                  disabled={isLoadingFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className="flex-1 md:flex-initial"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isFollowing ? "フォロー解除" : "フォローする"}
                </Button>
              )}
          </div>
        </div>

          {/* タブメニュー */}
          <div className="mt-6 border-t border-border border-b border-border">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0 gap-0">
              <TabsTrigger
                value="tournaments"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 font-medium text-sm"
              >
                大会
              </TabsTrigger>
              <TabsTrigger
                value="management"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 font-medium text-sm"
              >
                運営
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 font-medium text-sm"
              >
                投稿
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3 font-medium text-sm"
              >
                基本情報
              </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          </div>
        </div>

      <div className="max-w-[1080px] mx-auto pb-20 px-0 lg:px-4">
        <div className="flex justify-center gap-3">
        <div className="w-full max-w-[720px] px-0 overflow-hidden box-border">
          <TabsContent value="timeline" className="mt-2 space-y-2 w-full overflow-hidden box-border">
              {/* 投稿フォーム（自分のプロフィールのみ） */}
              {isOwnProfile && user && (
                <Card className="w-full border-0 shadow-sm bg-white sm:rounded-lg rounded-none">
                  <CardHeader className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={refreshedAvatarUrl || user.avatar || "/placeholder.svg"} alt={`${user.lastName} ${user.firstName}`} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
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
                            placeholder="今何してる？"
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="w-full min-h-[80px] resize-none border border-gray-200 rounded-lg bg-white text-sm focus-visible:ring-1 focus-visible:ring-[#f06a4e]/30 p-3"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0">
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 p-2 h-auto" onClick={() => imageInputRef.current?.click()}>
                          <ImageIcon className="w-5 h-5 text-green-500" />
                        </Button>
                        <input type="file" ref={imageInputRef} onChange={handlePostImageSelect} accept="image/*" style={{ display: "none" }} />
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 p-2 h-auto" onClick={() => pdfInputRef.current?.click()}>
                          <FileText className="w-5 h-5 text-red-500" />
                        </Button>
                        <input type="file" ref={pdfInputRef} onChange={handlePostPdfSelect} accept=".pdf" style={{ display: "none" }} />
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 p-2 h-auto" onClick={() => videoInputRef.current?.click()}>
                          <Video className="w-5 h-5 text-purple-500" />
                        </Button>
                        <input type="file" ref={videoInputRef} onChange={handlePostVideoSelect} accept="video/*" style={{ display: "none" }} />
                      </div>
                      <Button
                        onClick={handleSubmitPost}
                        disabled={isSubmittingPost || (!newPost.trim() && !selectedPdf && !selectedImage && !selectedVideo)}
                        className="px-4 h-9 bg-gradient-to-r from-[#f7931e] via-[#f06a4e] to-[#e84b8a] hover:opacity-90 text-white font-medium text-sm rounded-lg disabled:bg-gray-300 disabled:opacity-50"
                      >
                        {isSubmittingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : "投稿"}
                      </Button>
                    </div>
                    {/* プレビューエリア */}
                    <div className="space-y-2 mt-2">
                      {imagePreview && (
                        <div className="relative">
                          <img src={imagePreview} alt="選択した画像のプレビュー" className="rounded-lg max-h-40 w-auto" />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 rounded-full h-6 w-6 p-0"
                            onClick={() => { setSelectedImage(null); setImagePreview(null); if (imageInputRef.current) imageInputRef.current.value = "" }}
                          >
                            X
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
                            onClick={() => { setSelectedPdf(null); if (pdfPreview) { URL.revokeObjectURL(pdfPreview); setPdfPreview(null) }; if (pdfInputRef.current) pdfInputRef.current.value = "" }}
                          >
                            X
                          </Button>
                        </div>
                      )}
                      {selectedVideo && videoPreview && (
                        <div className="relative">
                          <video src={videoPreview} controls className="rounded-lg max-h-40 w-auto" />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 rounded-full h-6 w-6 p-0"
                            onClick={() => { setSelectedVideo(null); if (videoPreview) { URL.revokeObjectURL(videoPreview); setVideoPreview(null) }; if (videoInputRef.current) videoInputRef.current.value = "" }}
                          >
                            X
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoadingPosts ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">読み込み中...</p>
                </div>
              ) : userPosts.length === 0 ? (
                <Card className="border-0 shadow-sm bg-white sm:rounded-lg rounded-none">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">まだ投稿がありません</p>
                    {isOwnProfile && (
                      <p className="text-sm text-gray-400 mt-2">上のフォームから最初の投稿を作成してみましょう！</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post) => {
                    if (!user) return null
                    return (
                      <div
                        key={post.id}
                        ref={(el) => {
                          if (el) postRefs.current.set(post.id, el)
                          else postRefs.current.delete(post.id)
                        }}
                        data-post-id={post.id}
                        className={`transition-opacity duration-500 ${
                          visiblePosts.has(post.id) ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <ProfilePostCard
                          post={post}
                          user={user}
                          isVisible={visiblePosts.has(post.id)}
                          onToggleComments={() => {
                            setSelectedPostForComment(post)
                            setCommentModalOpen(true)
                          }}
                          onLike={async () => {
                            if (!currentUserEmail) return
                            try {
                              const currentLikes = post.likesCount || 0
                              await toggleDbLike(post.id, currentUserEmail, currentLikes)
                              // 投稿を再読み込み
                              const posts = await listPosts(50, { authorEmail: user.email })
                              setUserPosts(posts)
                            } catch (error) {
                              console.error('Failed to toggle like:', error)
                            }
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-2 space-y-2 w-full overflow-hidden box-border">
              <Card className="w-full border-0 shadow-sm bg-white sm:rounded-lg rounded-none">
                <CardHeader>
                  <h3 className="font-semibold text-lg">基本情報</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">名前</h4>
                    <p className="text-muted-foreground">{displayName}</p>
                  </div>
                  {(isOwnProfile || user.isEmailPublic) && (
                    <div>
                      <h4 className="font-medium mb-2">メールアドレス</h4>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  )}
                  {user.bio && (
                    <div>
                      <h4 className="font-medium mb-2">自己紹介</h4>
                      <p className="text-muted-foreground">{user.bio}</p>
                    </div>
                  )}
                  {user.category && (
                    <div>
                      <h4 className="font-medium mb-2">カテゴリ</h4>
                      <p className="text-muted-foreground">{user.category}</p>
                    </div>
                  )}
                  {(user.region || user.prefecture || user.district) && (
                    <div>
                      <h4 className="font-medium mb-2">地域情報</h4>
                      <div className="text-muted-foreground space-y-1">
                        {user.region && <p>地域ブロック: {user.region}</p>}
                        {user.prefecture && <p>都道府県: {user.prefecture}</p>}
                        {user.district && <p>エリア: {user.district}</p>}
                      </div>
                    </div>
                  )}
                  {user.teams && user.teams.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">出身チーム</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.teams.map((team) => (
                          <span key={team} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {team}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(isOwnProfile || user.isRegistrationDatePublic) && (
                    <div>
                      <h4 className="font-medium mb-2">登録日</h4>
                      <p className="text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : "不明"}
                      </p>
                    </div>
                  )}
                  {user.instagramUrl && (() => {
                    const getInstagramAccountId = (url: string): string => {
                      if (!url) return ''
                      let accountId = url.replace(/^@/, '')
                      const match = accountId.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^\/\?]+)/)
                      if (match) {
                        accountId = match[1]
                      }
                      accountId = accountId.split('/')[0].split('?')[0]
                      return accountId
                    }
                    const accountId = getInstagramAccountId(user.instagramUrl)
                    const instagramUrl = user.instagramUrl.startsWith('http') ? user.instagramUrl : `https://instagram.com/${accountId}`
                    return (
                      <div>
                        <h4 className="font-medium mb-2">Instagram</h4>
                        <a 
                          href={instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 transition-colors"
                          style={{
                            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          <Instagram className="w-5 h-5" style={{ color: '#E4405F' }} />
                          <span className="break-all">{accountId}</span>
                        </a>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 大会タブ */}
            <TabsContent value="tournaments" className="mt-2 space-y-4 w-full overflow-hidden box-border">
              {isLoadingTeamTournaments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {/* 参加予定大会 */}
                  <Card className="w-full border-0 shadow-sm bg-white sm:rounded-lg rounded-none">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#f7931e]" />
                        <h3 className="font-semibold text-lg">参加予定大会</h3>
                        <span className="text-sm text-muted-foreground">({upcomingTournaments.length})</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {upcomingTournaments.length === 0 ? (
                        <div className="text-center py-8">
                          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-muted-foreground text-sm">参加予定の大会はありません</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {upcomingTournaments.map((tournament) => (
                            <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  {tournament.iconUrl ? (
                                    <img
                                      src={tournament.iconUrl}
                                      alt={tournament.name}
                                      className="w-full h-full object-cover"
                                      onError={async (e) => {
                                        if (tournament.iconUrl && !tournament.iconUrl.startsWith('data:')) {
                                          try {
                                            const refreshed = await refreshS3Url(tournament.iconUrl, true)
                                            if (refreshed) (e.target as HTMLImageElement).src = refreshed
                                          } catch {}
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Trophy className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{tournament.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {tournament.teamName && (
                                      <span className="text-xs text-[#e84b8a] font-medium">{tournament.teamName}</span>
                                    )}
                                    {tournament.category && (
                                      <span className="text-xs text-gray-500">{tournament.category}</span>
                                    )}
                                  </div>
                                  {tournament.startDate && (
                                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(tournament.startDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
                                      {tournament.endDate && ` ~ ${new Date(tournament.endDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}`}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 過去参加した大会 */}
                  <Card className="w-full border-0 shadow-sm bg-white sm:rounded-lg rounded-none">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <h3 className="font-semibold text-lg">過去参加した大会</h3>
                        <span className="text-sm text-muted-foreground">({pastTournaments.length})</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {pastTournaments.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-muted-foreground text-sm">過去に参加した大会はありません</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pastTournaments.map((tournament) => (
                            <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  {tournament.iconUrl ? (
                                    <img
                                      src={tournament.iconUrl}
                                      alt={tournament.name}
                                      className="w-full h-full object-cover"
                                      onError={async (e) => {
                                        if (tournament.iconUrl && !tournament.iconUrl.startsWith('data:')) {
                                          try {
                                            const refreshed = await refreshS3Url(tournament.iconUrl, true)
                                            if (refreshed) (e.target as HTMLImageElement).src = refreshed
                                          } catch {}
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Trophy className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate text-gray-600">{tournament.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {tournament.teamName && (
                                      <span className="text-xs text-gray-500 font-medium">{tournament.teamName}</span>
                                    )}
                                    {tournament.category && (
                                      <span className="text-xs text-gray-400">{tournament.category}</span>
                                    )}
                                  </div>
                                  {(tournament.startDate || tournament.endDate) && (
                                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {tournament.startDate && new Date(tournament.startDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
                                      {tournament.endDate && ` ~ ${new Date(tournament.endDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}`}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* 運営タブ */}
            <TabsContent value="management" className="mt-2 space-y-4 w-full overflow-hidden box-border">
              {isLoadingManaged ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {/* 運営中の大会 */}
                  <Card className="w-full border-0 shadow-sm bg-white sm:rounded-lg rounded-none">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-[#e84b8a]" />
                        <h3 className="font-semibold text-lg">運営中の大会</h3>
                        <span className="text-sm text-muted-foreground">({managedTournaments.length})</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {managedTournaments.length === 0 ? (
                        <div className="text-center py-8">
                          <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-muted-foreground text-sm">運営中の大会はありません</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {managedTournaments.map((tournament) => (
                            <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  {tournament.iconUrl ? (
                                    <img
                                      src={tournament.iconUrl}
                                      alt={tournament.name}
                                      className="w-full h-full object-cover"
                                      onError={async (e) => {
                                        if (tournament.iconUrl && !tournament.iconUrl.startsWith('data:')) {
                                          try {
                                            const refreshed = await refreshS3Url(tournament.iconUrl, true)
                                            if (refreshed) {
                                              (e.target as HTMLImageElement).src = refreshed
                                            }
                                          } catch (err) {
                                            console.error('Failed to refresh icon URL:', err)
                                          }
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Trophy className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{tournament.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {tournament.category && (
                                      <span className="text-xs text-gray-500">{tournament.category}</span>
                                    )}
                                    {tournament.prefecture && (
                                      <span className="text-xs text-gray-500">{tournament.prefecture}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    運営者
                                  </p>
                                </div>
                                <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 運営中のチーム */}
                  <Card className="w-full border-0 shadow-sm bg-white sm:rounded-lg rounded-none">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#e84b8a]" />
                        <h3 className="font-semibold text-lg">運営中のチーム</h3>
                        <span className="text-sm text-muted-foreground">({managedTeams.length})</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {managedTeams.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-muted-foreground text-sm">運営中のチームはありません</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {managedTeams.map((team) => (
                            <Link key={team.id} href={`/teams/${team.id}`}>
                              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  {team.logoUrl ? (
                                    <img
                                      src={team.logoUrl}
                                      alt={team.name}
                                      className="w-full h-full object-cover"
                                      onError={async (e) => {
                                        if (team.logoUrl && !team.logoUrl.startsWith('data:')) {
                                          try {
                                            const refreshed = await refreshS3Url(team.logoUrl, true)
                                            if (refreshed) {
                                              (e.target as HTMLImageElement).src = refreshed
                                            }
                                          } catch (err) {
                                            console.error('Failed to refresh logo URL:', err)
                                          }
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Users className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{team.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {team.category && (
                                      <span className="text-xs text-gray-500">{team.category}</span>
                                    )}
                                    {team.prefecture && (
                                      <span className="text-xs text-gray-500">{team.prefecture}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    運営者
                                  </p>
                                </div>
                                <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* モバイル用 公式SNSリンク（lg未満で表示） */}
            <div className="lg:hidden mt-2 mb-4">
              <div className="bg-white sm:rounded-lg rounded-none shadow-sm border-0 p-4">
                <h4 className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-3">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  YeLL 公式SNS
                </h4>
                <div className="space-y-2">
                  {/* LINE */}
                  <a
                    href="https://line.me/R/ti/p/@578rcrwd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-green-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#06C755' }}>
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700">公式LINE</p>
                      <p className="text-[10px] text-gray-400">友だち追加はこちら</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </a>
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/yell_basket?igsh=MTczYXl5djR1M2lxcw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-pink-50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}
                    >
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700">@yell_basket</p>
                      <p className="text-[10px] text-gray-400">フォローはこちら</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </a>
                </div>
              </div>
            </div>
        </div>
        {/* 運営バナーサイドバー（デスクトップのみ） */}
        <SponsorSidebar sponsors={siteBanners} title="YeLL 運営" showDefaultSns={true} />
      </div>
      </div>
      </Tabs>

      {/* コメントモーダル */}
      {selectedPostForComment && user && (
        <CommentModal
          open={commentModalOpen}
          onOpenChange={setCommentModalOpen}
          post={{
            id: selectedPostForComment.id,
            user: {
              name: `${user.lastName} ${user.firstName}`,
              avatar: user.avatar || "/placeholder.svg",
              email: user.email,
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
            image: selectedPostForComment.imageUrl || undefined,
            video: selectedPostForComment.videoUrl || undefined,
            pdf: selectedPostForComment.pdfUrl || undefined,
            likesCount: selectedPostForComment.likesCount || 0,
            commentsCount: selectedPostForComment.commentsCount || 0,
            isLiked: false, // TODO: いいね状態を取得
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

      {/* プロフィール編集モーダル */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[720px] sm:max-w-[720px] md:w-[720px] bg-white !fixed !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>プロフィールを編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* アバター画像 */}
            <div>
              <Label>アバター画像</Label>
              <div className="space-y-2 mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  id="avatar-upload"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    アバターを選択
                  </Button>
                  {avatarPreview && (
                    <div className="relative">
                      <img
                        src={avatarPreview || ""}
                        alt="Avatar preview"
                        className="w-16 h-16 object-cover rounded-full"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 p-0 h-6 w-6 rounded-full"
                        onClick={() => {
                          setAvatarFile(null)
                          setAvatarPreview(null)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
            </div>
          </div>

            {/* カバー画像 */}
            <div>
              <Label>カバー画像</Label>
              <div className="space-y-2 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                  id="cover-upload"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('cover-upload')?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    カバー画像を選択
                  </Button>
                  {coverPreview && (
                    <div className="relative">
                      <img
                        src={coverPreview || ""}
                        alt="Cover preview"
                        className="w-32 h-20 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 p-0 h-6 w-6 rounded-full"
                        onClick={() => {
                          setCoverFile(null)
                          setCoverPreview(null)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
          </div>
        </div>

            {/* 名前 */}
                  <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="lastName">姓</Label>
                    <Input
                  id="lastName"
                      placeholder="姓"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="mt-1"
                    />
              </div>
              <div className="flex-1">
                <Label htmlFor="firstName">名</Label>
                    <Input
                  id="firstName"
                      placeholder="名"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="mt-1"
                    />
                  </div>
            </div>

            {/* 自己紹介 */}
            <div>
              <Label htmlFor="bio">自己紹介</Label>
                  <Textarea
                id="bio"
                    placeholder="自己紹介"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                className="mt-1"
                  />
            </div>

                  {/* カテゴリ選択 */}
                  <div>
              <Label>カテゴリ</Label>
                    <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                <SelectTrigger className="mt-1">
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 地域ブロック選択 */}
                  <div>
              <Label>地域ブロック</Label>
                    <Select value={editForm.region} onValueChange={(value) => setEditForm({ ...editForm, region: value })}>
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

                  {/* 都道府県選択 */}
                  {availablePrefectures.length > 0 && (
                    <div>
                <Label>都道府県</Label>
                      <Select value={editForm.prefecture} onValueChange={(value) => setEditForm({ ...editForm, prefecture: value })}>
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

                  {/* 地区選択（任意） */}
                  {availableDistricts.length > 0 && (
                    <div>
                <Label>エリア（任意）</Label>
                      <Select value={editForm.district} onValueChange={(value) => setEditForm({ ...editForm, district: value })}>
                  <SelectTrigger className="mt-1">
                          <SelectValue placeholder="エリアを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map((dist) => (
                            <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* 出身チーム選択 */}
                  <div>
              <Label>出身チーム（複数選択可）</Label>

                    {/* 選択済みチーム */}
                    {editForm.teams.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2 mt-2">
                        {editForm.teams.map((team) => (
                          <div key={team} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                            <span className="text-sm">{team}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTeam(team)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* チーム検索 */}
              <div className="flex gap-2 mb-3 mt-2">
                      <Input
                        placeholder="チーム名を検索..."
                        value={teamSearchTerm}
                        onChange={(e) => setTeamSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleTeamSearch()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleTeamSearch}
                        disabled={isSearchingTeams}
                        size="sm"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* 検索結果 */}
                    {teamSearchResults.length > 0 && (
                      <div className="mb-3 border rounded-md p-2 max-h-40 overflow-y-auto">
                        {teamSearchResults.map((team) => (
                          <div
                            key={team.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded"
                            onClick={() => handleAddTeam(team.name)}
                          >
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-xs text-gray-500">
                                {team.category && `${team.category} / `}
                                {team.prefecture || team.region}
                              </p>
                            </div>
                            <Plus className="w-4 h-4 text-green-500" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* その他のチーム手入力 */}
              <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="その他のチーム名を入力..."
                        value={otherTeamInput}
                        onChange={(e) => setOtherTeamInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddOtherTeam()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddOtherTeam}
                        disabled={!otherTeamInput.trim()}
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* プライバシー設定 */}
                  <div className="space-y-2 pt-4 border-t">
              <Label>公開設定</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isEmailPublic"
                        checked={editForm.isEmailPublic}
                        onChange={(e) => setEditForm({ ...editForm, isEmailPublic: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="isEmailPublic" className="text-sm">メールアドレスを公開する</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isRegistrationDatePublic"
                        checked={editForm.isRegistrationDatePublic}
                        onChange={(e) => setEditForm({ ...editForm, isRegistrationDatePublic: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="isRegistrationDatePublic" className="text-sm">登録日を公開する</label>
                    </div>
                  </div>

            {/* Instagram URL */}
            <div>
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                value={editForm.instagramUrl}
                onChange={(e) => setEditForm({ ...editForm, instagramUrl: e.target.value })}
                placeholder="プロフィールURLを入れてください"
                className="mt-1"
              />
            </div>

            {/* 保存・キャンセルボタン */}
            <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    キャンセル
                  </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
