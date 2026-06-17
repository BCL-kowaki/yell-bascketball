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
import { PhoneVerificationModal } from "@/components/phone-verification-modal"
import { ChevronLeft, Info, Upload, X, Loader2, Search, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTeam, getCurrentUserEmail, getUserByEmail, searchUsers, notifyAdminsForApproval, checkTeamNameDuplicate, setUserPhone, HEADCOUNT_OPTIONS } from "@/lib/api"
import { uploadImageToS3 } from "@/lib/storage"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DISTRICTS_BY_PREFECTURE, DEFAULT_DISTRICTS, CATEGORIES } from "@/lib/regionData"

// チームエディタ用ユーザー表示型（searchUsers 戻りの DbUser を受けるためのスーパーセット）
type EditorUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string | null
  region?: string | null
  prefecture?: string | null
}

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
  const [currentUserName, setCurrentUserName] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 2段階認証用の電話番号と認証モーダルの表示状態
  const [phone, setPhone] = useState("")
  const [showVerifyModal, setShowVerifyModal] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    founded: "",
    region: "",
    prefecture: "",
    district: "",
    headcount: "",
    category: "",
    description: "",
    website: "",
    instagramUrl: "",
    logo: null as File | null,
    coverImage: null as File | null,
    editors: [] as EditorUser[],
    showAdminName: true, // 管理者名を公開するか（デフォルト公開）
  })
  const [prefectures, setPrefectures] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<EditorUser[]>([])
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
    setFormData(prev => ({ ...prev, prefecture: "", district: "" }))
    setDistricts([])
  }, [formData.region])

  // 都道府県が変わったら地区リストを更新
  useEffect(() => {
    if (formData.prefecture) {
      setDistricts(DISTRICTS_BY_PREFECTURE[formData.prefecture] || DEFAULT_DISTRICTS)
    } else {
      setDistricts([])
    }
    setFormData(prev => ({ ...prev, district: "" }))
  }, [formData.prefecture])

  async function loadCurrentUser() {
    try {
      const email = await getCurrentUserEmail()
      if (email) {
        setCurrentUserEmail(email)
        // プロフィールに電話番号が登録されていれば認証欄へ初期入力（編集可）
        try {
          const userData = await getUserByEmail(email)
          if (userData) {
            setCurrentUserName(`${userData.lastName ?? ""} ${userData.firstName ?? ""}`.trim())
            if (userData.phoneNumber) setPhone(userData.phoneNumber)
          }
        } catch (err) {
          console.error("電話番号の取得に失敗:", err)
        }
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

  const handleAddEditor = (user: EditorUser) => {
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

    // 電話番号(2段階認証用)の入力チェック
    if (!phone.trim()) {
      toast({
        title: "エラー",
        description: "認証用の電話番号を入力してください",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // チーム名重複チェック(同じ「チーム名 + 都道府県 + 地区」の組み合わせを防ぐ)
      // SMS送信前に確認し、無駄な認証を防ぐ
      const isDuplicate = await checkTeamNameDuplicate(
        formData.name.trim(),
        formData.prefecture || null,
        formData.district || null
      )
      if (isDuplicate) {
        toast({
          title: "重複エラー",
          description: `同じ地区に「${formData.name}」というチームが既に登録されています。チーム名・都道府県・地区のいずれかを変更してください。`,
          variant: "destructive",
        })
        return
      }

      // バリデーション通過 → SMS認証モーダルを開く（実際の作成は認証成功後）
      setShowVerifyModal(true)
    } catch (error: any) {
      console.error("チーム名重複チェックに失敗:", error)
      toast({
        title: "エラー",
        description: error?.message || "登録前チェックに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // SMS認証成功後に実行される実際のチーム作成処理（成功で true、失敗で false を返す）
  const performCreate = async (): Promise<boolean> => {
    if (!currentUserEmail) return false
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

      // 管理者一覧を作成（作成者を必ず含める）
      const editorEmailList = formData.editors.map(e => e.email)
      if (!editorEmailList.includes(currentUserEmail)) {
        editorEmailList.unshift(currentUserEmail) // 作成者を先頭に追加
      }

      // チームをデータベースに作成
      const teamData = {
        name: formData.name.trim(),
        logoUrl,
        coverImageUrl,
        category: formData.category || undefined,
        region: formData.region || undefined,
        prefecture: formData.prefecture || undefined,
        district: formData.district || undefined,
        founded: formData.founded || undefined,
        headcount: formData.headcount ? parseInt(formData.headcount) : undefined,
        description: formData.description || undefined,
        website: formData.website || undefined,
        instagramUrl: formData.instagramUrl || undefined,
        ownerEmail: currentUserEmail,
        editorEmails: editorEmailList, // 作成者を含む全管理者
        showAdminName: formData.showAdminName,
        isApproved: false,
      }

      console.log('Creating team with data:', teamData)
      const createdTeam = await createTeam(teamData)
      console.log('Team created:', createdTeam)

      // SMS認証済みの電話番号を管理者(作成者)に紐づけて保存（非ブロッキング）
      if (phone.trim()) {
        setUserPhone(currentUserEmail, phone.trim())
          .catch(e => console.error('電話番号の保存に失敗:', e))
      }

      // 管理者へ承認待ち通知を送信
      notifyAdminsForApproval({
        type: 'approval_request',
        title: 'チーム承認リクエスト',
        message: `新しいチーム「${formData.name}」が登録されました。承認をお願いします。`,
        senderName: currentUserEmail,
        relatedId: createdTeam.id,
        relatedType: 'team',
      }).catch(e => console.error('管理者通知送信エラー:', e))

      // 成功（モーダル側で申請完了表示に切り替わる）
      return true
    } catch (error: any) {
      console.error("Failed to create team:", error)
      toast({
        title: "エラー",
        description: error?.message || "チームの作成に失敗しました",
        variant: "destructive",
      })
      return false
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
            {/* 承認待ち案内 */}
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <Info className="w-4 h-4 text-amber-600" />
              <AlertTitle className="text-amber-800">登録後の流れ</AlertTitle>
              <AlertDescription className="text-amber-700 text-sm">
                <ul className="list-disc pl-4 space-y-1">
                  <li>チーム登録は管理者による承認後に公開されます。承認待ち中はチーム一覧に表示されませんのでご了承ください。</li>
                  <li>管理者様は、ご本人様確認のため登録時にSMS認証を行わせていただいております。</li>
                </ul>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">基本情報</h2>

                {/* 画像（アイコン／壁紙） */}
                <div>
                  <label className="text-sm font-medium mb-2 block">画像（アイコン／壁紙）（任意）</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="shrink-0">
                      <p className="text-xs text-muted-foreground mb-1">アイコン</p>
                      <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden" onClick={() => !isSubmitting && document.getElementById('logo')?.click()}>
                        {logoPreview ? <img src={logoPreview} alt="アイコン" className="w-full h-full object-cover rounded-full" /> : <Upload className="w-6 h-6 text-gray-400" />}
                      </div>
                      <Input id="logo" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} className="hidden" disabled={isSubmitting} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">壁紙</p>
                      <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden" onClick={() => !isSubmitting && document.getElementById('coverImage')?.click()}>
                        {coverPreview ? <img src={coverPreview} alt="壁紙" className="w-full h-full object-cover rounded-lg" /> : <Upload className="w-8 h-8 text-gray-400" />}
                      </div>
                      <Input id="coverImage" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "coverImage")} className="hidden" disabled={isSubmitting} />
                    </div>
                  </div>
                </div>

                {/* チーム名 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">チーム名 <span className="text-red-500">*</span></label>
                  <Input id="name" value={formData.name} onChange={handleInputChange} required className="bg-white" disabled={isSubmitting} />
                </div>

                {/* カテゴリ */}
                <div>
                  <label className="text-sm font-medium mb-2 block">カテゴリ</label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)} disabled={isSubmitting}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="カテゴリを選択" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                {/* 地域ブロック */}
                <div>
                  <label className="text-sm font-medium mb-2 block">地域ブロック</label>
                  <Select onValueChange={(value) => handleSelectChange("region", value)} value={formData.region} disabled={isSubmitting}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="地域ブロックを選択" /></SelectTrigger>
                    <SelectContent>{Object.keys(regions).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                {/* 都道府県 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">都道府県</label>
                  <Select onValueChange={(value) => handleSelectChange("prefecture", value)} value={formData.prefecture} disabled={!formData.region || isSubmitting}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="都道府県を選択" /></SelectTrigger>
                    <SelectContent>{prefectures.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                {/* 地区 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">地区</label>
                  <Select onValueChange={(value) => handleSelectChange("district", value)} value={formData.district} disabled={!formData.prefecture || isSubmitting}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder={formData.prefecture ? "地区を選択" : "都道府県を先に選択"} /></SelectTrigger>
                    <SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">チーム名は「都道府県＋地区」単位で重複登録できません。表示時は「チーム名（地区）」のように地区が併記されます。</p>
                </div>

                {/* 設立年 / 人数 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">設立年</label>
                    <Select value={formData.founded} onValueChange={(value) => handleSelectChange("founded", value)} disabled={isSubmitting}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="設立年を選択" /></SelectTrigger>
                      <SelectContent>{years.map((year) => <SelectItem key={year} value={year.toString()}>{year}年</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">人数</label>
                    <Select value={formData.headcount} onValueChange={(value) => handleSelectChange("headcount", value)} disabled={isSubmitting}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="人数を選択" /></SelectTrigger>
                      <SelectContent>{HEADCOUNT_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                {/* チーム紹介 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">チーム紹介</label>
                  <Textarea id="description" value={formData.description} onChange={handleInputChange} rows={5} className="bg-white" disabled={isSubmitting} />
                </div>

                {/* Instagram URL */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Instagram URL</label>
                  <Input id="instagramUrl" type="text" value={formData.instagramUrl} onChange={handleInputChange} placeholder="プロフィールURLを入れてください" className="bg-white" disabled={isSubmitting} />
                </div>

                {/* その他SNS */}
                <div>
                  <label className="text-sm font-medium mb-2 block">その他SNS</label>
                  <Input id="website" type="url" value={formData.website} onChange={handleInputChange} placeholder="WEBサイト・SNSのURL" className="bg-white" disabled={isSubmitting} />
                </div>
              </div>

              {/* 管理者情報 */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">管理者情報</h2>

                {/* ページ管理者 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">ページ管理者</label>
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(currentUserName || currentUserEmail || "?").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{currentUserName || currentUserEmail}</p>
                      <p className="text-sm text-muted-foreground">あなた</p>
                    </div>
                    <Badge className="ml-auto">管理者</Badge>
                  </div>
                </div>

                {/* 管理者名の公開設定 */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="pr-3">
                    <p className="font-medium text-sm">管理者の名前を公開する</p>
                    <p className="text-sm text-muted-foreground">
                      オフにすると、チームページで管理者の名前を一般ユーザーに表示しません
                    </p>
                  </div>
                  <Switch
                    checked={formData.showAdminName}
                    onCheckedChange={(checked) => setFormData({ ...formData, showAdminName: checked })}
                  />
                </div>

                {/* 共有管理者 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium block">共有管理者（任意・最大5名）</label>
                  <p className="text-sm text-muted-foreground">ユーザー名で検索して、共有管理者として招待できます</p>
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
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.lastName} {user.firstName}</p>
                              {(user.prefecture || user.region) && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {[user.region, user.prefecture].filter(Boolean).join(" / ")}
                                </p>
                              )}
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
                          <div className="min-w-0">
                            <p className="font-medium truncate">{editor.lastName} {editor.firstName}</p>
                            {(editor.prefecture || editor.region) && (
                              <p className="text-sm text-muted-foreground truncate">
                                {[editor.region, editor.prefecture].filter(Boolean).join(" / ")}
                              </p>
                            )}
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

                {/* 認証用電話番号（SMS 2段階認証） */}
                <div>
                  <label className="text-sm font-medium mb-2 block">認証用電話番号</label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="例: 09012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    管理者様は、ご本人様確認のためSMS認証を設けさせていただいております。電話番号登録後SMSへ認証コードが届きますので、次ページのコード入力欄へ入力してください。
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="submit"
                  className="bg-brand-gradient text-white"
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

      {/* SMS 2段階認証モーダル（認証成功後に実際の作成処理を実行） */}
      <PhoneVerificationModal
        open={showVerifyModal}
        phone={phone}
        onVerified={performCreate}
        onClose={() => setShowVerifyModal(false)}
        completeMessage={"運営本部にチーム登録の申請いたしました。\n運営本部にて確認を行い、承認されるまで今しばらくお待ちください。"}
        backToTopLabel="チームトップへ戻る"
        onBackToTop={() => router.push('/teams')}
      />
    </Layout>
  )
}
