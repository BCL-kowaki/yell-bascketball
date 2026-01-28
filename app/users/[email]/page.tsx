"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { getUserByEmail, listPosts, getCurrentUserEmail, followUser, unfollowUser, checkFollowStatus, getFollowers, getFollowing, getFollowCounts, getUserFavorites, type DbUser, type DbPost, type DbTeam, type DbTournament } from "@/lib/api"
import { refreshS3Url } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, MapPin, Calendar, FileText, UserPlus, Edit2 } from "lucide-react"
import { Layout } from "@/components/layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ProfilePostCard } from "@/components/profile-post-card"

export default function UserPage() {
  ensureAmplifyConfigured()
  const params = useParams()
  const router = useRouter()
  const email = decodeURIComponent(params.email as string)
  
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | undefined>(undefined)
  const { toast } = useToast()

  // 投稿関連
  const [userPosts, setUserPosts] = useState<DbPost[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [visiblePosts, setVisiblePosts] = useState<Set<string>>(new Set())
  const postRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // フォロー機能関連
  const [isFollowing, setIsFollowing] = useState(false)
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [isLoadingFollow, setIsLoadingFollow] = useState(false)

  // お気に入り関連
  const [favoriteTeams, setFavoriteTeams] = useState<DbTeam[]>([])
  const [favoriteTournaments, setFavoriteTournaments] = useState<DbTournament[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [email])

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

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      
      // ユーザー情報を取得
      const userData = await getUserByEmail(email)
      if (!userData) {
        console.error('User not found:', email)
        router.push('/')
        return
      }
      
      // アバターURLとカバー画像URLをS3からリフレッシュ
      if (userData.avatar && !userData.avatar.startsWith('data:') && !userData.avatar.startsWith('blob:') && !userData.avatar.startsWith('/placeholder')) {
        try {
          userData.avatar = await refreshS3Url(userData.avatar, true) || userData.avatar
        } catch (error) {
          console.error('Failed to refresh avatar URL:', error)
        }
      }
      if (userData.coverImage && !userData.coverImage.startsWith('data:') && !userData.coverImage.startsWith('blob:') && !userData.coverImage.startsWith('/placeholder')) {
        try {
          userData.coverImage = await refreshS3Url(userData.coverImage, true) || userData.coverImage
        } catch (error) {
          console.error('Failed to refresh cover image URL:', error)
        }
      }
      
      setUser(userData)
      
      // 現在のユーザーのメールアドレスを取得（編集・削除の判定用）
      try {
        const currentEmail = await getCurrentUserEmail()
        if (currentEmail) {
          setCurrentUserEmail(currentEmail)
          // フォロー状態を確認
          if (currentEmail !== email) {
            const status = await checkFollowStatus(currentEmail, email)
            setIsFollowing(status)
          }
        }
      } catch (e) {
        console.error('Failed to get current user email:', e)
      }

      // フォロー数とお気に入りを読み込む
      const counts = await getFollowCounts(email)
      setFollowCounts(counts)
      const favorites = await getUserFavorites(email)
      setFavoriteTeams(favorites.teams)
      setFavoriteTournaments(favorites.tournaments)
      
      // このユーザーの投稿を取得
      const posts = await listPosts(50, { authorEmail: email })
      console.log(`Loaded ${posts.length} posts for user ${email}`)
      
      // 投稿を新しい順にソート
      const sortedPosts = [...posts].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
      
      setUserPosts(sortedPosts)
    } catch (error) {
      console.error('Failed to load user data:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto pb-20">
          <div className="text-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto pb-20 p-8 text-center">
          <p className="text-muted-foreground">ユーザー情報が見つかりません</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            ホームに戻る
          </Button>
        </div>
      </Layout>
    )
  }

  const displayName = `${user.lastName} ${user.firstName}`
  const isOwnProfile = currentUserEmail === email

  // 画像URLを正しく処理する関数
  const getAvatarUrl = () => {
    if (user.avatar) {
      // Base64データURL、Blob URL、またはS3のURLをそのまま返す
      if (user.avatar.startsWith('data:') || user.avatar.startsWith('blob:') || user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
        return user.avatar
      }
    }
    return "/placeholder-user.jpg"
  }

  const getCoverImageUrl = () => {
    if (user.coverImage) {
      // Base64データURL、Blob URL、またはS3のURLをそのまま返す
      if (user.coverImage.startsWith('data:') || user.coverImage.startsWith('blob:') || user.coverImage.startsWith('http://') || user.coverImage.startsWith('https://')) {
        return user.coverImage
      }
    }
    return "/placeholder.svg?height=300&width=800"
  }

  // フォローボタンのハンドラー
  const handleFollow = async () => {
    if (!user || !currentUserEmail) {
      toast({
        title: "エラー",
        description: "ログインが必要です",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoadingFollow(true)
      if (isFollowing) {
        await unfollowUser(currentUserEmail, user.email)
        setIsFollowing(false)
        setFollowCounts(prev => ({ ...prev, followers: prev.followers - 1 }))
        toast({
          title: "フォロー解除",
          description: `${user.firstName} ${user.lastName}のフォローを解除しました`,
        })
      } else {
        await followUser(currentUserEmail, user.email)
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

  return (
    <Layout isLoggedIn={!!currentUserEmail} currentUser={currentUserEmail ? { name: displayName, avatar: getAvatarUrl() || undefined } : undefined}>
      <div className="max-w-6xl mx-auto pb-20">
        {/* Cover Photo & Profile Info */}
        <div className="relative">
          <div className="h-48 md:h-64 bg-gradient-to-r from-orange-400 to-red-400 overflow-hidden">
            <img
              src={getCoverImageUrl()}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=300&width=800"
              }}
            />
          </div>

          <div className="absolute -bottom-12 md:-bottom-16 left-4 md:left-8">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-card">
                <AvatarImage
                  src={getAvatarUrl()}
                  alt={displayName}
                />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-card px-4 md:px-8 pt-16 md:pt-20 pb-6 border-b border-border">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="flex-1 mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{displayName}</h1>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                {user.bio || "自己紹介がまだ設定されていません"}
              </p>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 text-sm text-muted-foreground mb-4">
                {user.isRegistrationDatePublic && user.createdAt && (
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
            </div>

            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              {isOwnProfile ? (
                <Link href="/profile">
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-initial"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    プロフィールを編集
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleFollow}
                  disabled={isLoadingFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className={isFollowing ? "flex-1 md:flex-initial" : "flex-1 md:flex-initial bg-gradient-to-r from-orange-500 to-red-500 text-white"}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isFollowing ? "フォロー解除" : "フォローする"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-2 md:p-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white">
              <TabsTrigger value="about">基本情報</TabsTrigger>
              <TabsTrigger value="activity">アクティビティ</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-4 md:mt-6">
              <Card className="w-full border-0 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <h3 className="font-semibold text-lg">基本情報</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">名前</h4>
                    <p className="text-muted-foreground">{displayName}</p>
                  </div>
                  {user.isEmailPublic && (
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
                  {user.isRegistrationDatePublic && (
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4 md:mt-6">
              <Card className="w-full border-0 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">アクティビティ履歴は近日公開予定です</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 投稿一覧セクション */}
          <div className="mt-8">

            {isLoadingPosts ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">読み込み中...</p>
              </div>
            ) : userPosts.length === 0 ? (
              <Card className="border-0 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">まだ投稿がありません</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userPosts.slice(0, 10).map((post, index) => (
                  <div
                    key={post.id}
                    ref={(el) => {
                      if (el) {
                        postRefs.current.set(post.id, el)
                      } else {
                        postRefs.current.delete(post.id)
                      }
                    }}
                    data-post-id={post.id}
                    style={{
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    <ProfilePostCard
                      post={post}
                      user={user}
                      isVisible={visiblePosts.has(post.id)}
                    />
                  </div>
                ))}

                {userPosts.length > 10 && (
                  <Card className="border-0 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        {userPosts.length - 10}件の投稿がさらにあります
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
