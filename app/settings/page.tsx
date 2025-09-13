"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Bell, Shield, Eye, Moon, Globe, Smartphone, Lock, Trash2, Camera, Save, LogOut } from "lucide-react"
import Navigation from "@/components/navigation"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState({
    name: "田中太郎",
    email: "tanaka@example.com",
    phone: "090-1234-5678",
    bio: "プログラマーです。技術について投稿しています。",
    location: "東京, 日本",
    website: "https://tanaka.dev",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    likes: true,
    comments: true,
    friendRequests: true,
    messages: true,
    mentions: true,
    events: false,
    marketing: false,
    emailNotifications: true,
    pushNotifications: true,
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    postVisibility: "friends",
    friendListVisibility: "friends",
    emailVisibility: "private",
    phoneVisibility: "private",
    locationVisibility: "friends",
  })

  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    language: "ja",
    autoPlay: true,
    dataUsage: "standard",
  })

  const handleSaveProfile = () => {
    console.log("[v0] Saving profile data:", profileData)
    // Here you would implement the actual save logic
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handlePrivacyChange = (key: string, value: string) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleAppSettingChange = (key: string, value: any) => {
    setAppSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleLogout = () => {
    console.log("[v0] Logging out user")
    // Here you would implement the actual logout logic
  }

  const handleDeleteAccount = () => {
    console.log("[v0] Deleting account")
    // Here you would implement the actual account deletion logic
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-facebook-blue" />
              <span>設定</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">プロフィール</TabsTrigger>
                <TabsTrigger value="notifications">通知</TabsTrigger>
                <TabsTrigger value="privacy">プライバシー</TabsTrigger>
                <TabsTrigger value="app">アプリ</TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder.svg?height=80&width=80" alt="プロフィール画像" />
                      <AvatarFallback>田</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" className="mb-2 bg-transparent">
                        <Camera className="h-4 w-4 mr-2" />
                        写真を変更
                      </Button>
                      <p className="text-sm text-gray-500">JPG、PNG形式、最大5MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">名前</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">メールアドレス</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">電話番号</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">場所</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">自己紹介</Label>
                    <textarea
                      id="bio"
                      className="w-full p-3 border border-gray-300 rounded-md resize-none"
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="自己紹介を入力してください..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">ウェブサイト</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} className="bg-facebook-blue hover:bg-facebook-blue/90">
                    <Save className="h-4 w-4 mr-2" />
                    変更を保存
                  </Button>
                </div>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-facebook-blue" />
                      アクティビティ通知
                    </h3>
                    <div className="space-y-4">
                      {[
                        { key: "likes", label: "いいね", description: "投稿にいいねされた時" },
                        { key: "comments", label: "コメント", description: "投稿にコメントされた時" },
                        { key: "mentions", label: "メンション", description: "投稿でメンションされた時" },
                        {
                          key: "friendRequests",
                          label: "友達リクエスト",
                          description: "新しい友達リクエストを受信した時",
                        },
                        { key: "messages", label: "メッセージ", description: "新しいメッセージを受信した時" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <Switch
                            checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                            onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Smartphone className="h-5 w-5 mr-2 text-facebook-blue" />
                      配信方法
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">プッシュ通知</p>
                          <p className="text-sm text-gray-500">モバイルアプリでの通知</p>
                        </div>
                        <Switch
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">メール通知</p>
                          <p className="text-sm text-gray-500">重要な通知をメールで受信</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Privacy Settings */}
              <TabsContent value="privacy" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-facebook-blue" />
                      公開設定
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "profileVisibility",
                          label: "プロフィールの公開範囲",
                          description: "プロフィール情報を見ることができる人",
                        },
                        { key: "postVisibility", label: "投稿の公開範囲", description: "投稿を見ることができる人" },
                        {
                          key: "friendListVisibility",
                          label: "友達リストの公開範囲",
                          description: "友達リストを見ることができる人",
                        },
                      ].map((item) => (
                        <div key={item.key} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                          </div>
                          <Select
                            value={privacySettings[item.key as keyof typeof privacySettings]}
                            onValueChange={(value) => handlePrivacyChange(item.key, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">全員</SelectItem>
                              <SelectItem value="friends">友達のみ</SelectItem>
                              <SelectItem value="private">自分のみ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-facebook-blue" />
                      セキュリティ
                    </h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Lock className="h-4 w-4 mr-2" />
                        パスワードを変更
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Shield className="h-4 w-4 mr-2" />
                        二段階認証を設定
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Smartphone className="h-4 w-4 mr-2" />
                        ログイン履歴を確認
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* App Settings */}
              <TabsContent value="app" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Moon className="h-5 w-5 mr-2 text-facebook-blue" />
                      表示設定
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">ダークモード</p>
                          <p className="text-sm text-gray-500">暗いテーマを使用</p>
                        </div>
                        <Switch
                          checked={appSettings.darkMode}
                          onCheckedChange={(checked) => handleAppSettingChange("darkMode", checked)}
                        />
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">言語</p>
                            <p className="text-sm text-gray-500">アプリの表示言語</p>
                          </div>
                        </div>
                        <Select
                          value={appSettings.language}
                          onValueChange={(value) => handleAppSettingChange("language", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ja">日本語</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ko">한국어</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-facebook-blue" />
                      データ使用量
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">動画の自動再生</p>
                          <p className="text-sm text-gray-500">フィードの動画を自動再生</p>
                        </div>
                        <Switch
                          checked={appSettings.autoPlay}
                          onCheckedChange={(checked) => handleAppSettingChange("autoPlay", checked)}
                        />
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">画質設定</p>
                            <p className="text-sm text-gray-500">画像・動画の画質</p>
                          </div>
                        </div>
                        <Select
                          value={appSettings.dataUsage}
                          onValueChange={(value) => handleAppSettingChange("dataUsage", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">高画質</SelectItem>
                            <SelectItem value="standard">標準</SelectItem>
                            <SelectItem value="low">低画質（データ節約）</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-red-600">危険な操作</h3>
                    <div className="space-y-3">
                      <Button variant="outline" onClick={handleLogout} className="w-full justify-start bg-transparent">
                        <LogOut className="h-4 w-4 mr-2" />
                        ログアウト
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAccount} className="w-full justify-start">
                        <Trash2 className="h-4 w-4 mr-2" />
                        アカウントを削除
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  )
}
