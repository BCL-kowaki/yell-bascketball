"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { getUserByEmail, updateUser, type DbUser } from "@/lib/api"
import { CATEGORIES, REGION_BLOCKS, PREFECTURES_BY_REGION, DISTRICTS_BY_PREFECTURE, DEFAULT_DISTRICTS } from "@/lib/regionData"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Camera, MapPin, Calendar, Edit2, Save, X } from "lucide-react"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  ensureAmplifyConfigured()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    category: "",
    regionBlock: "",
    prefecture: "",
    district: "",
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [availablePrefectures, setAvailablePrefectures] = useState<string[]>([])
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])

  useEffect(() => {
    loadUserProfile()
  }, [])

  // 地域ブロックが変更されたら、都道府県リストを更新
  useEffect(() => {
    if (editForm.regionBlock) {
      setAvailablePrefectures(PREFECTURES_BY_REGION[editForm.regionBlock] || [])
      // 地域ブロック変更時は都道府県と地区をリセット
      setEditForm(prev => ({ ...prev, prefecture: "", district: "" }))
      setAvailableDistricts([])
    } else {
      setAvailablePrefectures([])
    }
  }, [editForm.regionBlock])

  // 都道府県が変更されたら、地区リストを更新
  useEffect(() => {
    if (editForm.prefecture) {
      setAvailableDistricts(DISTRICTS_BY_PREFECTURE[editForm.prefecture] || DEFAULT_DISTRICTS)
      // 都道府県変更時は地区をリセット
      setEditForm(prev => ({ ...prev, district: "" }))
    } else {
      setAvailableDistricts([])
    }
  }, [editForm.prefecture])

  const loadUserProfile = async () => {
    try {
      // セッションを確認してメールアドレスを取得
      const sessionRes = await fetch('/api/session')
      if (!sessionRes.ok) {
        console.log('Session not found, redirecting to login')
        router.push('/login')
        return
      }

      const sessionData = await sessionRes.json()
      const email = sessionData.email
      
      if (!email) {
        console.error('Could not get email from session')
        toast({
          title: "エラー",
          description: "ユーザー情報の取得に失敗しました。ログインし直してください。",
          variant: "destructive",
        })
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      console.log('Loading profile for email:', email)
      const userData = await getUserByEmail(email)
      
      if (!userData) {
        console.error('User not found in DynamoDB for email:', email)
        toast({
          title: "エラー",
          description: "ユーザー情報が見つかりません。ログインし直してください。",
          variant: "destructive",
        })
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      console.log('User profile loaded successfully:', userData)
      setUser(userData)
      setEditForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio || "",
        location: userData.location || "",
        category: userData.category || "",
        regionBlock: userData.regionBlock || "",
        prefecture: userData.prefecture || "",
        district: userData.district || "",
      })
      
      // 既存データに基づいて選択肢を設定
      if (userData.regionBlock) {
        setAvailablePrefectures(PREFECTURES_BY_REGION[userData.regionBlock] || [])
      }
      if (userData.prefecture) {
        setAvailableDistricts(DISTRICTS_BY_PREFECTURE[userData.prefecture] || DEFAULT_DISTRICTS)
      }
    } catch (error: any) {
      console.error("Failed to load user profile:", error)
      // 認証エラーの場合はログインページにリダイレクト
      if (
        error?.name === 'NotAuthorizedException' || 
        error?.name === 'UserNotFoundException' ||
        error?.name === 'UserUnAuthenticatedException'
      ) {
        toast({
          title: "認証エラー",
          description: "ログインが必要です",
          variant: "destructive",
        })
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      await updateUser(user.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        bio: editForm.bio || null,
        location: editForm.location || null,
        avatar: avatarPreview || user.avatar,
        coverImage: coverPreview || user.coverImage,
        category: editForm.category || null,
        regionBlock: editForm.regionBlock || null,
        prefecture: editForm.prefecture || null,
        district: editForm.district || null,
      })

      toast({
        title: "成功",
        description: "プロフィールを更新しました",
      })

      setIsEditing(false)
      setAvatarPreview(null)
      setCoverPreview(null)
      await loadUserProfile()
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "エラー",
        description: "プロフィールの更新に失敗しました",
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
        bio: user.bio || "",
        location: user.location || "",
        category: user.category || "",
        regionBlock: user.regionBlock || "",
        prefecture: user.prefecture || "",
        district: user.district || "",
      })
    }
    setAvatarPreview(null)
    setCoverPreview(null)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <Layout isLoggedIn={true} currentUser={{ name: "読み込み中..." }}>
        <div className="max-w-6xl mx-auto pb-20 p-8 text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout isLoggedIn={false} currentUser={undefined}>
        <div className="max-w-6xl mx-auto pb-20 p-8 text-center">
          <p className="text-muted-foreground">ユーザー情報が見つかりません</p>
        </div>
      </Layout>
    )
  }

  const displayName = `${user.lastName} ${user.firstName}`

  return (
    <Layout isLoggedIn={true} currentUser={{ name: displayName, avatar: user.avatar || undefined }}>
      <div className="max-w-6xl mx-auto pb-20">
        {/* Cover Photo & Profile Info */}
        <div className="relative">
          <div className="h-48 md:h-64 bg-gradient-to-r from-orange-400 to-red-400 overflow-hidden">
            <img 
              src={coverPreview || user.coverImage || "/placeholder.svg?height=300&width=800"} 
              alt="Cover" 
              className="w-full h-full object-cover" 
            />
          </div>

          <div className="absolute -bottom-12 md:-bottom-16 left-4 md:left-8">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-card">
                <AvatarImage 
                  src={avatarPreview || user.avatar || "/placeholder-user.jpg"} 
                  alt={displayName} 
                />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4">
            {isEditing && (
              <label className="inline-block">
                <Button size="sm" variant="outline" className="bg-card text-xs md:text-sm" asChild>
                  <span className="cursor-pointer">
                    <Camera className="w-4 h-4 mr-1 md:mr-2" />
                    カバー写真を変更
                  </span>
                </Button>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-card px-4 md:px-8 pt-16 md:pt-20 pb-6 border-b border-border">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="flex-1 mb-4 md:mb-0">
              {isEditing ? (
                <div className="space-y-4 mb-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="姓"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      placeholder="名"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                  <Textarea
                    placeholder="自己紹介"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                  />
                  <Input
                    placeholder="場所（例：東京, 日本）"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                  
                  {/* カテゴリ選択 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">カテゴリ</label>
                    <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
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

                  {/* 地域ブロック選択 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">地域ブロック</label>
                    <Select value={editForm.regionBlock} onValueChange={(value) => setEditForm({ ...editForm, regionBlock: value })}>
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

                  {/* 都道府県選択 */}
                  {availablePrefectures.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">都道府県</label>
                      <Select value={editForm.prefecture} onValueChange={(value) => setEditForm({ ...editForm, prefecture: value })}>
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

                  {/* 地区選択 */}
                  {availableDistricts.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">地区</label>
                      <Select value={editForm.district} onValueChange={(value) => setEditForm({ ...editForm, district: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="地区を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map((dist) => (
                            <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2">{displayName}</h1>
                  <p className="text-muted-foreground mb-4 text-sm md:text-base">
                    {user.bio || "自己紹介がまだ設定されていません"}
                  </p>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 text-sm text-muted-foreground mb-4">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {user.location}
                      </div>
                    )}
                    {user.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}に参加
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="flex-1 md:flex-initial"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="flex-1 md:flex-initial"
                  >
                    <X className="w-4 h-4 mr-2" />
                    キャンセル
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex-1 md:flex-initial"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  プロフィールを編集
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
              <Card className="w-full border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <h3 className="font-semibold text-lg">基本情報</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">名前</h4>
                    <p className="text-muted-foreground">{displayName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">メールアドレス</h4>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
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
                  {user.location && (
                    <div>
                      <h4 className="font-medium mb-2">場所</h4>
                      <p className="text-muted-foreground">{user.location}</p>
                    </div>
                  )}
                  {(user.regionBlock || user.prefecture || user.district) && (
                    <div>
                      <h4 className="font-medium mb-2">地域情報</h4>
                      <div className="text-muted-foreground space-y-1">
                        {user.regionBlock && <p>地域ブロック: {user.regionBlock}</p>}
                        {user.prefecture && <p>都道府県: {user.prefecture}</p>}
                        {user.district && <p>地区: {user.district}</p>}
                      </div>
                    </div>
                  )}
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4 md:mt-6">
              <Card className="w-full border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">アクティビティ履歴は近日公開予定です</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  )
}
