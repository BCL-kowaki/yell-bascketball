"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Layout } from "@/components/layout"
import { ChevronLeft, Info, Upload, X, Loader2, Search, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTeam, getCurrentUserEmail, searchUsers } from "@/lib/api"
import { uploadImageToS3 } from "@/lib/storage"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const regions = {
  北海道: ["北海道"],
  東北: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  関東: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  中部: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  近畿: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  中国: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  四国: ["徳島県", "香川県", "愛媛県", "高知県"],
  "九州・沖縄": ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
}

export default function CreateTeamPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [currentUserEmail, setCurrentUserEmail] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    founded: "",
    region: "",
    prefecture: "",
    headcount: "",
    category: "",
    description: "",
    website: "",
    instagramUrl: "",
    logo: null as File | null,
    coverImage: null as File | null,
    editors: [] as Array<{ id: string; email: string; firstName: string; lastName: string; avatar?: string }>,
  })
  const [prefectures, setPrefectures] = useState<string[]>([])
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ id: string; email: string; firstName: string; lastName: string; avatar?: string }>>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (formData.region && regions[formData.region as keyof typeof regions]) {
      setPrefectures(regions[formData.region as keyof typeof regions])
    } else {
      setPrefectures([])
    }
    setFormData(prev => ({ ...prev, prefecture: "" }))
  }, [formData.region])

  async function loadCurrentUser() {
    try {
      const email = await getCurrentUserEmail()
      if (email) {
        setCurrentUserEmail(email)
      } else {
        toast({
          title: "ログインが必要です",
          description: "チームを作成するにはログインしてください",
          variant: "destructive",
        })
        router.push('/login')
      }
    } catch (error) {
      console.error("Failed to load current user:", error)
      toast({
        title: "エラー",
        description: "ユーザー情報の取得に失敗しました",
        variant: "destructive",
      })
      router.push('/login')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: "logo" | "coverImage") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData((prev) => ({ ...prev, [fileType]: file }))
      if (fileType === "logo") {
        setLogoPreview(URL.createObjectURL(file))
      } else {
        setCoverPreview(URL.createObjectURL(file))
      }
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
      // 既に選択されているユーザーを除外
      const filtered = results.filter(
        user => !formData.editors.some(editor => editor.id === user.id)
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

  const handleAddEditor = (user: { id: string; email: string; firstName: string; lastName: string; avatar?: string }) => {
    if (formData.editors.length < 5 && !formData.editors.some(e => e.id === user.id)) {
      setFormData(prev => ({ ...prev, editors: [...prev.editors, user] }))
      setSearchTerm("")
      setSearchResults([])
    }
  }

  const handleRemoveEditor = (editorId: string) => {
    setFormData(prev => ({ ...prev, editors: prev.editors.filter(e => e.id !== editorId) }))
  }

  // 年リストを生成（1900年から現在年まで）
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i)

  // 人数リストを生成（1-100人）
  const headcounts = Array.from({ length: 100 }, (_, i) => i + 1)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentUserEmail) {
      toast({
        title: "エラー",
        description: "ログインが必要です",
        variant: "destructive",
      })
      return
    }

    if (!formData.name) {
      toast({
        title: "エラー",
        description: "チーム名は必須です",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 画像をS3にアップロード
      let logoUrl: string | undefined = undefined
      let coverImageUrl: string | undefined = undefined

      if (formData.logo) {
        console.log('Uploading logo...')
        logoUrl = await uploadImageToS3(formData.logo, `team-${Date.now()}`)
        console.log('Logo uploaded:', logoUrl)
      }

      if (formData.coverImage) {
        console.log('Uploading cover image...')
        coverImageUrl = await uploadImageToS3(formData.coverImage, `team-${Date.now()}`)
        console.log('Cover image uploaded:', coverImageUrl)
      }

      // チームをデータベースに作成
      const teamData = {
        name: formData.name,
        logoUrl,
        coverImageUrl,
        category: formData.category || undefined,
        region: formData.region || undefined,
        prefecture: formData.prefecture || undefined,
        district: undefined, // 必要に応じて追加
        founded: formData.founded || undefined,
        headcount: formData.headcount ? parseInt(formData.headcount) : undefined,
        description: formData.description || undefined,
        website: formData.website || undefined,
        instagramUrl: formData.instagramUrl || undefined,
        ownerEmail: currentUserEmail,
        editorEmails: formData.editors.length > 0 ? formData.editors.map(e => e.email) : undefined,
        isApproved: true,
      }

      console.log('Creating team with data:', teamData)
      const createdTeam = await createTeam(teamData)
      console.log('Team created:', createdTeam)

      toast({
        title: "チームを作成しました",
        description: "チームが正常に作成され、公開されました。",
      })

      // フォームをリセット
      setFormData({
        name: "",
        founded: "",
        region: "",
        prefecture: "",
        headcount: "",
        category: "",
        description: "",
        website: "",
        instagramUrl: "",
        logo: null,
        coverImage: null,
        editors: [],
      })
      setLogoPreview(null)
      setCoverPreview(null)
      setSearchTerm("")
      setSearchResults([])

      // チーム一覧ページにリダイレクト
      router.push('/teams')

    } catch (error: any) {
      console.error("Failed to create team:", error)
      toast({
        title: "エラー",
        description: error?.message || "チームの作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-2 py-4">
        <div className="mb-2">
          <Link href="/teams">
            <Button variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              チーム一覧に戻る
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">新しいチームを作成</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">チーム名 <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-white"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>ロゴ画像</Label>
                   <div className="w-32 h-32 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50" onClick={() => !isSubmitting && document.getElementById('logo')?.click()}>
                     {logoPreview ? <img src={logoPreview} alt="ロゴ" className="w-full h-full object-cover rounded-full" /> : <Upload className="w-8 h-8 text-gray-400" />}
                  </div>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "logo")}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                   <Label>カバー画像</Label>
                   <div className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50" onClick={() => !isSubmitting && document.getElementById('coverImage')?.click()}>
                     {coverPreview ? <img src={coverPreview} alt="カバー画像" className="w-full h-full object-cover rounded-lg" /> : <Upload className="w-8 h-8 text-gray-400" />}
                  </div>
                   <Input
                     id="coverImage"
                     type="file"
                     accept="image/*"
                     onChange={(e) => handleFileChange(e, "coverImage")}
                     className="hidden"
                     disabled={isSubmitting}
                   />
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>地区</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("region", value)}
                    value={formData.region}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-white"><SelectValue placeholder="地区を選択" /></SelectTrigger>
                    <SelectContent>{Object.keys(regions).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>都道府県</Label>
                   <Select
                     onValueChange={(value) => handleSelectChange("prefecture", value)}
                     value={formData.prefecture}
                     disabled={!formData.region || isSubmitting}
                   >
                    <SelectTrigger className="bg-white"><SelectValue placeholder="都道府県を選択" /></SelectTrigger>
                    <SelectContent>{prefectures.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

               <div className="space-y-2">
                <Label>カテゴリ</Label>
                <RadioGroup
                  value={formData.category}
                  onValueChange={(v) => handleSelectChange("category", v)}
                  className="flex items-center gap-6"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2"><RadioGroupItem value="U12" id="u12" disabled={isSubmitting} /><Label htmlFor="u12">U12</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="U15" id="u15" disabled={isSubmitting} /><Label htmlFor="u15">U15</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="U18" id="u18" disabled={isSubmitting} /><Label htmlFor="u18">U18</Label></div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="founded">設立年</Label>
                  <Select
                    value={formData.founded}
                    onValueChange={(value) => handleSelectChange("founded", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="設立年を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}年
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headcount">人数</Label>
                  <Select
                    value={formData.headcount}
                    onValueChange={(value) => handleSelectChange("headcount", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="人数を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {headcounts.map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          {count}人
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="website">ウェブサイト・SNSリンク</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="bg-white"
                    disabled={isSubmitting}
                  />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    type="text"
                    value={formData.instagramUrl}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/username または @username"
                    className="bg-white"
                    disabled={isSubmitting}
                  />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">チーム紹介</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="bg-white"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-4">
                <Label>チーム管理者 (最大5名)</Label>
                {formData.editors.length < 5 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="ユーザー名で検索"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSearch()
                          }
                        }}
                        className="bg-white"
                        disabled={isSubmitting || isSearching}
                      />
                      <Button type="button" onClick={handleSearch} disabled={isSubmitting || isSearching}>
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </Button>
                    </div>
                    {/* 検索結果 */}
                    {searchResults.length > 0 && (
                      <div className="border rounded-lg max-h-48 overflow-y-auto">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleAddEditor(user)}
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
                  </div>
                )}
                {/* 選択されたユーザー */}
                {formData.editors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">選択されたユーザー:</p>
                    {formData.editors.map((editor) => (
                      <div key={editor.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={editor.avatar || "/placeholder-user.jpg"} alt={`${editor.lastName} ${editor.firstName}`} />
                            <AvatarFallback>
                              {editor.firstName[0]}{editor.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{editor.lastName} {editor.firstName}</p>
                            <p className="text-sm text-muted-foreground">{editor.email}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEditor(editor.id)}
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    "チームを作成"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
