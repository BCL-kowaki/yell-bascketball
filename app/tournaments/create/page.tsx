"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { getUserByEmail, createTournament, searchUsers, createTournamentInvitation, getCurrentUserEmail, type DbUser } from "@/lib/api"
import { uploadImageToS3 } from "@/lib/storage"
import { CATEGORIES, REGION_BLOCKS, PREFECTURES_BY_REGION, DISTRICTS_BY_PREFECTURE, DEFAULT_DISTRICTS } from "@/lib/regionData"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Layout } from "@/components/layout"
import { useToast } from "@/hooks/use-toast"
import { Camera, X, Search, UserPlus } from "lucide-react"

export default function CreateTournamentPage() {
  ensureAmplifyConfigured()
  const router = useRouter()
  const { toast } = useToast()

  const [currentUser, setCurrentUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    regionBlock: "",
    prefecture: "",
    district: "",
    description: "",
  })

  const [availablePrefectures, setAvailablePrefectures] = useState<string[]>([])
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])

  // 壁紙画像関連
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  // 共有管理者関連
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<DbUser[]>([])
  const [selectedCoAdmins, setSelectedCoAdmins] = useState<DbUser[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  // 地域ブロックが変更されたら、都道府県リストを更新
  useEffect(() => {
    if (formData.regionBlock) {
      setAvailablePrefectures(PREFECTURES_BY_REGION[formData.regionBlock] || [])
      setFormData(prev => ({ ...prev, prefecture: "", district: "" }))
      setAvailableDistricts([])
    } else {
      setAvailablePrefectures([])
    }
  }, [formData.regionBlock])

  // 都道府県が変更されたら、地区リストを更新
  useEffect(() => {
    if (formData.prefecture) {
      setAvailableDistricts(DISTRICTS_BY_PREFECTURE[formData.prefecture] || DEFAULT_DISTRICTS)
      setFormData(prev => ({ ...prev, district: "" }))
    } else {
      setAvailableDistricts([])
    }
  }, [formData.prefecture])

  const loadCurrentUser = async () => {
    try {
      // Amplifyのauth sessionから直接ユーザー情報を取得
      const email = await getCurrentUserEmail()

      if (!email) {
        toast({
          title: "エラー",
          description: "ログインが必要です",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      const userData = await getUserByEmail(email)
      if (!userData) {
        toast({
          title: "エラー",
          description: "ユーザー情報が見つかりません",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      setCurrentUser(userData)
    } catch (error) {
      console.error('Failed to load user:', error)
      toast({
        title: "エラー",
        description: "ユーザー情報の読み込みに失敗しました",
        variant: "destructive",
      })
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }


  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchUsers(searchTerm)
      // 自分自身と既に選択されているユーザーを除外
      const filtered = results.filter(
        user => user.id !== currentUser?.id &&
          !selectedCoAdmins.some(admin => admin.id === user.id)
      )
      setSearchResults(filtered)
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: "エラー",
        description: "ユーザー検索に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const addCoAdmin = (user: DbUser) => {
    setSelectedCoAdmins([...selectedCoAdmins, user])
    setSearchTerm("")
    setSearchResults([])
  }

  const removeCoAdmin = (userId: string) => {
    setSelectedCoAdmins(selectedCoAdmins.filter(admin => admin.id !== userId))
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCoverFile(file)

    // プレビューを生成
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      toast({
        title: "エラー",
        description: "ユーザー情報が見つかりません",
        variant: "destructive",
      })
      return
    }

    if (!formData.name.trim()) {
      toast({
        title: "エラー",
        description: "大会名を入力してください",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // 壁紙画像をアップロード
      let coverImageUrl: string | null = null
      if (coverFile) {
        try {
          console.log('Uploading cover image to S3...')
          coverImageUrl = await uploadImageToS3(coverFile, currentUser.id)
          console.log('Cover image uploaded successfully:', coverImageUrl)
        } catch (error) {
          console.error('Failed to upload cover image:', error)
          toast({
            title: "警告",
            description: "壁紙画像のアップロードに失敗しましたが、大会の登録は続行します",
            variant: "default",
          })
        }
      }

      // 大会を作成
      const tournamentData = {
        name: formData.name,
        iconUrl: null,
        coverImage: coverImageUrl,
        category: formData.category || null,
        regionBlock: formData.regionBlock || null,
        prefecture: formData.prefecture || null,
        district: formData.district || null,
        description: formData.description || null,
        ownerEmail: currentUser.email,
        coAdminEmails: selectedCoAdmins.map(admin => admin.email),
      }

      console.log('Creating tournament:', tournamentData)
      const tournament = await createTournament(tournamentData)
      console.log('Tournament created:', tournament)

      // 共有管理者に招待を送信
      if (selectedCoAdmins.length > 0) {
        try {
          for (const admin of selectedCoAdmins) {
            await createTournamentInvitation({
              tournamentId: tournament.id,
              tournamentName: tournament.name,
              inviterEmail: currentUser.email,
              inviteeEmail: admin.email,
              status: 'pending',
            })
          }
          console.log('Invitations sent to co-admins')
        } catch (error) {
          console.error('Failed to send invitations:', error)
          // 招待送信エラーは致命的ではないため、続行
        }
      }

      toast({
        title: "成功",
        description: "大会を登録しました",
      })

      router.push('/tournaments')
    } catch (error: any) {
      console.error('Failed to create tournament:', error)
      toast({
        title: "エラー",
        description: error?.message || "大会の登録に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Layout isLoggedIn={true} currentUser={{ name: "読み込み中..." }}>
        <div className="max-w-4xl mx-auto pb-20 p-8 text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </Layout>
    )
  }

  if (!currentUser) {
    return null
  }

  const displayName = `${currentUser.lastName} ${currentUser.firstName}`

  return (
    <Layout isLoggedIn={true} currentUser={{ name: displayName, avatar: currentUser.avatar || undefined }}>
      <div className="max-w-4xl mx-auto pb-20 p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">新規大会登録</h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 壁紙画像 */}
              <div>
                <label className="text-sm font-medium mb-2 block">大会壁紙画像（任意）</label>
                <div className="space-y-3">
                  {coverPreview ? (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setCoverPreview(null)
                          setCoverFile(null)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">壁紙画像をアップロード</p>
                        <p className="text-xs text-gray-400 mt-1">クリックまたはドラッグ&ドロップ</p>
                      </div>
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

              {/* 大会名 */}
              <div>
                <label className="text-sm font-medium mb-2 block">大会名 <span className="text-red-500">*</span></label>
                <Input
                  placeholder="大会名を入力"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* カテゴリ */}
              <div>
                <label className="text-sm font-medium mb-2 block">カテゴリ</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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

              {/* 地域ブロック */}
              <div>
                <label className="text-sm font-medium mb-2 block">地域ブロック</label>
                <Select value={formData.regionBlock} onValueChange={(value) => setFormData({ ...formData, regionBlock: value })}>
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

              {/* 都道府県 */}
              {availablePrefectures.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">都道府県</label>
                  <Select value={formData.prefecture} onValueChange={(value) => setFormData({ ...formData, prefecture: value })}>
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

              {/* 地区 */}
              {availableDistricts.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">地区</label>
                  <Select value={formData.district} onValueChange={(value) => setFormData({ ...formData, district: value })}>
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

              {/* 大会紹介 */}
              <div>
                <label className="text-sm font-medium mb-2 block">大会紹介</label>
                <Textarea
                  placeholder="大会の詳細や参加方法など"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* 管理者情報 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>管理者情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ページ管理者 */}
              <div>
                <label className="text-sm font-medium mb-2 block">ページ管理者</label>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <Avatar>
                    <AvatarImage src={currentUser.avatar || "/placeholder-user.jpg"} alt={displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                  </div>
                  <Badge className="ml-auto">管理者</Badge>
                </div>
              </div>

              {/* 共有管理者 */}
              <div>
                <label className="text-sm font-medium mb-2 block">共有管理者（任意）</label>
                <p className="text-sm text-muted-foreground mb-3">
                  ユーザー名で検索して、共有管理者として招待できます
                </p>

                {/* 検索ボックス */}
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="ユーザー名で検索"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSearch()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* 検索結果 */}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg mb-3 max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                        onClick={() => addCoAdmin(user)}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={`${user.lastName} ${user.firstName}`} />
                          <AvatarFallback>
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{user.lastName} {user.firstName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <UserPlus className="w-4 h-4 text-primary" />
                      </div>
                    ))}
                  </div>
                )}

                {/* 選択された共有管理者 */}
                {selectedCoAdmins.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">選択された共有管理者:</p>
                    {selectedCoAdmins.map((admin) => (
                      <div key={admin.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={admin.avatar || "/placeholder-user.jpg"} alt={`${admin.lastName} ${admin.firstName}`} />
                          <AvatarFallback>
                            {admin.firstName[0]}{admin.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{admin.lastName} {admin.firstName}</p>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCoAdmin(admin.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 登録ボタン */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? "登録中..." : "大会を登録"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/tournaments')}
              disabled={isSaving}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
