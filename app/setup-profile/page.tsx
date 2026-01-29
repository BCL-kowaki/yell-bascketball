"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { signIn } from "aws-amplify/auth"
import { updateUser, getUserByEmail } from "@/lib/api"
import { HeaderNavigation } from "@/components/header-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CATEGORIES, REGION_BLOCKS, PREFECTURES_BY_REGION, DISTRICTS_BY_PREFECTURE, DEFAULT_DISTRICTS } from "@/lib/regionData"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

function SetupProfileForm() {
  ensureAmplifyConfigured()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)

  const [formData, setFormData] = useState({
    bio: "",
    category: "",
    region: "",
    prefecture: "",
    district: "",
    instagramUrl: "",
    teams: [] as string[],
    isEmailPublic: false,
    isRegistrationDatePublic: false,
  })

  const [availablePrefectures, setAvailablePrefectures] = useState<string[]>([])
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])
  const [otherTeamInput, setOtherTeamInput] = useState("")

  // 地域ブロックが変更されたら、都道府県リストを更新
  useEffect(() => {
    if (formData.region && PREFECTURES_BY_REGION[formData.region]) {
      setAvailablePrefectures(PREFECTURES_BY_REGION[formData.region])
    } else {
      setAvailablePrefectures([])
    }
  }, [formData.region])

  // 都道府県が変更されたら、地区リストを更新
  useEffect(() => {
    if (formData.prefecture && DISTRICTS_BY_PREFECTURE[formData.prefecture]) {
      setAvailableDistricts(DISTRICTS_BY_PREFECTURE[formData.prefecture])
    } else {
      setAvailableDistricts(DEFAULT_DISTRICTS)
    }
  }, [formData.prefecture])

  const handleAddOtherTeam = () => {
    if (otherTeamInput.trim() && !formData.teams.includes(otherTeamInput.trim())) {
      setFormData(prev => ({
        ...prev,
        teams: [...prev.teams, otherTeamInput.trim()]
      }))
      setOtherTeamInput("")
    }
  }

  const handleRemoveTeam = (team: string) => {
    setFormData(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t !== team)
    }))
  }

  const handleSave = async () => {
    if (!email) {
      toast({
        title: "エラー",
        description: "メールアドレスが見つかりません",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // ユーザー情報を取得（既にログイン済みのはず）
      const user = await getUserByEmail(email)
      if (!user) {
        throw new Error("ユーザー情報が見つかりません")
      }

      // プロフィール情報を更新
      await updateUser(user.id, {
        bio: formData.bio || null,
        category: formData.category || null,
        region: formData.region || null,
        prefecture: formData.prefecture || null,
        district: formData.district || null,
        instagramUrl: formData.instagramUrl || null,
        teams: formData.teams.length > 0 ? formData.teams : null,
        isEmailPublic: formData.isEmailPublic,
        isRegistrationDatePublic: formData.isRegistrationDatePublic,
      })

      toast({
        title: "プロフィールを保存しました",
        description: "ホームに移動します",
      })

      // セッションを設定してからログイン後のページに遷移
      try {
        const sessionResponse = await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            userId: user.id,
          }),
        })
        if (sessionResponse.ok) {
          router.push("/")
        } else {
          router.push("/")
        }
      } catch (sessionError) {
        console.error('Error setting session:', sessionError)
        router.push("/")
      }
    } catch (error: any) {
      console.error("Profile setup error:", error)
      toast({
        title: "エラー",
        description: error.message || "プロフィールの保存に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    if (!email) {
      toast({
        title: "エラー",
        description: "メールアドレスが見つかりません",
        variant: "destructive",
      })
      return
    }

    setIsSkipping(true)
    try {
      // セッションを設定してからログイン後のページに遷移
      try {
        const user = await getUserByEmail(email)
        if (user) {
          const sessionResponse = await fetch('/api/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              userId: user.id,
            }),
          })
          if (sessionResponse.ok) {
            router.push("/")
          } else {
            router.push("/")
          }
        } else {
          router.push("/")
        }
      } catch (sessionError) {
        console.error('Error setting session:', sessionError)
        router.push("/")
      }
    } catch (error: any) {
      console.error("Skip error:", error)
      toast({
        title: "エラー",
        description: error.message || "エラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsSkipping(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <HeaderNavigation isLoggedIn={false} />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">プロフィール設定</CardTitle>
              <CardDescription className="text-center">
                プロフィール情報を入力してください（任意）。後から変更することもできます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 自己紹介 */}
                <div>
                  <Label htmlFor="bio">自己紹介</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="自己紹介を入力してください"
                    rows={4}
                    className="mt-1"
                  />
                </div>

                {/* カテゴリ */}
                <div>
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
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

                {/* 地域ブロック */}
                <div>
                  <Label htmlFor="region">地域ブロック</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => {
                      setFormData({ ...formData, region: value, prefecture: "", district: "" })
                      setAvailablePrefectures(PREFECTURES_BY_REGION[value] || [])
                      setAvailableDistricts([])
                    }}
                  >
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

                {/* 都道府県 */}
                {availablePrefectures.length > 0 && (
                  <div>
                    <Label htmlFor="prefecture">都道府県</Label>
                    <Select
                      value={formData.prefecture}
                      onValueChange={(value) => {
                        setFormData({ ...formData, prefecture: value, district: "" })
                        setAvailableDistricts(DISTRICTS_BY_PREFECTURE[value] || DEFAULT_DISTRICTS)
                      }}
                    >
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

                {/* 地区 */}
                {availableDistricts.length > 0 && (
                  <div>
                    <Label htmlFor="district">地区</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => setFormData({ ...formData, district: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="地区を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDistricts.map((district) => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Instagram URL */}
                <div>
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="プロフィールURLを入れてください"
                    className="mt-1"
                  />
                </div>

                {/* 出身チーム */}
                <div>
                  <Label>出身チーム</Label>
                  {formData.teams.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                      {formData.teams.map((team) => (
                        <div key={team} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                          <span className="text-sm">{team}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeam(team)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="チーム名を入力..."
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
                      追加
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
                      checked={formData.isEmailPublic}
                      onChange={(e) => setFormData({ ...formData, isEmailPublic: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isEmailPublic" className="text-sm">メールアドレスを公開する</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isRegistrationDatePublic"
                      checked={formData.isRegistrationDatePublic}
                      onChange={(e) => setFormData({ ...formData, isRegistrationDatePublic: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isRegistrationDatePublic" className="text-sm">登録日を公開する</label>
                  </div>
                </div>

                {/* ボタン */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || isSkipping}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      "保存して続ける"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    disabled={isLoading || isSkipping}
                    className="flex-1"
                  >
                    {isSkipping ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        スキップ中...
                      </>
                    ) : (
                      "スキップ"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SetupProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetupProfileForm />
    </Suspense>
  )
}

