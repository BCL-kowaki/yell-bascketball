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
import { ChevronLeft, Info, Upload, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTeam, getCurrentUserEmail } from "@/lib/api"
import { uploadImageToS3 } from "@/lib/storage"

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
    shortName: "",
    founded: "",
    region: "",
    prefecture: "",
    headcount: "",
    category: "",
    description: "",
    website: "",
    logo: null as File | null,
    coverImage: null as File | null,
    editors: [] as string[],
  })
  const [prefectures, setPrefectures] = useState<string[]>([])
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [currentEditor, setCurrentEditor] = useState("")

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

  const handleAddEditor = () => {
    if (currentEditor && formData.editors.length < 5 && !formData.editors.includes(currentEditor)) {
      setFormData(prev => ({ ...prev, editors: [...prev.editors, currentEditor] }))
      setCurrentEditor("")
    }
  }

  const handleRemoveEditor = (editorToRemove: string) => {
    setFormData(prev => ({ ...prev, editors: prev.editors.filter(e => e !== editorToRemove) }))
  }

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
      // GraphQLスキーマに存在するフィールドのみを使用: id, name, category, region, prefecture, district, description, createdAt
      const teamData = {
        name: formData.name,
        category: formData.category || undefined,
        region: formData.region || undefined,
        prefecture: formData.prefecture || undefined,
        district: undefined, // 必要に応じて追加
        description: formData.description || undefined,
        // 以下のフィールドはスキーマに存在しないため、コメントアウト
        // shortName: formData.shortName || undefined,
        // logoUrl,
        // coverImageUrl,
        // founded: formData.founded || undefined,
        // headcount: formData.headcount ? parseInt(formData.headcount) : undefined,
        // website: formData.website || undefined,
        // ownerEmail: currentUserEmail,
        // editorEmails: formData.editors.length > 0 ? formData.editors : undefined,
        // isApproved: true,
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
        shortName: "",
        founded: "",
        region: "",
        prefecture: "",
        headcount: "",
        category: "",
        description: "",
        website: "",
        logo: null,
        coverImage: null,
        editors: [],
      })
      setLogoPreview(null)
      setCoverPreview(null)

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                 <div className="space-y-2">
                  <Label htmlFor="shortName">チーム略称</Label>
                  <Input
                    id="shortName"
                    value={formData.shortName}
                    onChange={handleInputChange}
                    className="bg-white"
                    disabled={isSubmitting}
                  />
                </div>
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
                  <Input
                    id="founded"
                    value={formData.founded}
                    onChange={handleInputChange}
                    className="bg-white"
                    disabled={isSubmitting}
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="headcount">人数</Label>
                  <Input
                    id="headcount"
                    type="number"
                    value={formData.headcount}
                    onChange={handleInputChange}
                    className="bg-white"
                    disabled={isSubmitting}
                  />
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
                <Label>編集権限を付与するユーザー (最大5名)</Label>
                {formData.editors.length < 5 && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="ユーザーのメールアドレス"
                      value={currentEditor}
                      onChange={(e) => setCurrentEditor(e.target.value)}
                      className="bg-white"
                      disabled={isSubmitting}
                    />
                    <Button type="button" onClick={handleAddEditor} disabled={isSubmitting}>追加</Button>
                  </div>
                )}
                <div className="space-y-2">
                  {formData.editors.map((editor) => (
                    <div key={editor} className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm">
                      <span>{editor}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEditor(editor)}
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
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
