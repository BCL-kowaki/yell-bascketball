"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Layout } from "@/components/layout"
import { ChevronLeft, Info, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const regions = {
  北海道: ["北海道"],
  東北: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  関東: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  中部: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  近畿: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  中国: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  四国: ["徳島県", "香川県", "愛媛県", "高知県"],
  九州沖縄: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
}

export default function CreateTournamentPage() {
  const { toast } = useToast()
  const currentUser = { name: "管理者" } // Mock current user

  const [formData, setFormData] = useState({
    title: "",
    organizer: currentUser.name,
    region: "",
    prefecture: "",
    startDate: "",
    endDate: "",
    category: "",
    description: "",
    image: null as File | null,
    editors: [] as string[],
  })
  const [prefectures, setPrefectures] = useState<string[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentEditor, setCurrentEditor] = useState("")

  useEffect(() => {
    if (formData.region && regions[formData.region as keyof typeof regions]) {
      setPrefectures(regions[formData.region as keyof typeof regions])
    } else {
      setPrefectures([])
    }
    setFormData(prev => ({ ...prev, prefecture: "" }))
  }, [formData.region])


  const handleAddEditor = () => {
    if (currentEditor && formData.editors.length < 5 && !formData.editors.includes(currentEditor)) {
      setFormData(prev => ({ ...prev, editors: [...prev.editors, currentEditor] }))
      setCurrentEditor("")
    }
  }

  const handleRemoveEditor = (editorToRemove: string) => {
    setFormData(prev => ({ ...prev, editors: prev.editors.filter(e => e !== editorToRemove) }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData((prev) => ({ ...prev, image: file }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.title || !formData.startDate || !formData.image) {
      toast({
        title: "必須項目を入力してください",
        description: "大会名、開始日、画像を選択してください。",
        variant: "destructive",
      })
      return
    }

    // ここにフォームデータを送信する処理を追加
    console.log("Tournament Creation Data:", formData)
    toast({
      title: "作成申請を送信しました",
      description: "運営者の承認をお待ちください。承認されると大会ページが公開されます。",
    })
    // Here you would typically send data to your backend API
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/tournaments/kanto/tokyo">
            <Button variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              大会一覧に戻る
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">新しい大会を作成</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-700" />
              <AlertTitle className="text-blue-800">管理者による承認が必要です</AlertTitle>
              <AlertDescription className="text-blue-700">
                フォームから送信された内容は、Yell運営者による確認・承認を経てから公開されます。
              </AlertDescription>
            </Alert>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">大会名</Label>
                <Input id="title" value={formData.title} onChange={handleInputChange} required className="bg-white" />
              </div>

              <div className="space-y-2">
                <Label>主催者</Label>
                <Input value={formData.organizer} disabled className="bg-gray-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>地区</Label>
                  <Select onValueChange={(value) => handleSelectChange("region", value)} value={formData.region}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="地区を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(regions).map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>都道府県</Label>
                   <Select onValueChange={(value) => handleSelectChange("prefecture", value)} value={formData.prefecture} disabled={!formData.region}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="都道府県を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {prefectures.map((pref) => (
                        <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>カテゴリ</Label>
                <RadioGroup
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="U12" id="u12" />
                    <Label htmlFor="u12">U12</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="U15" id="u15" />
                    <Label htmlFor="u15">U15</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="U18" id="u18" />
                    <Label htmlFor="u18">U18</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>大会メイン画像</Label>
                <div
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="大会画像プレビュー" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8" />
                      <p>クリックして画像を選択</p>
                    </div>
                  )}
                </div>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">開始日</Label>
                  <Input id="startDate" type="date" value={formData.startDate} onChange={handleInputChange} required className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">終了日</Label>
                  <Input id="endDate" type="date" value={formData.endDate} onChange={handleInputChange} required className="bg-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">大会詳細</Label>
                <Textarea id="description" value={formData.description} onChange={handleInputChange} rows={5} className="bg-white" />
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
                    />
                    <Button type="button" onClick={handleAddEditor}>追加</Button>
                  </div>
                )}
                 <div className="space-y-2">
                  {formData.editors.map((editor) => (
                    <div key={editor} className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm">
                      <span>{editor}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveEditor(editor)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
                  承認をリクエスト
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
