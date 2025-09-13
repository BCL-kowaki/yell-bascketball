"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Instagram,
  Link2,
  Upload,
  Settings,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Navigation from "@/components/navigation"

interface InstagramPost {
  id: string
  caption: string
  imageUrl: string
  permalink: string
  timestamp: string
  likes: number
  comments: number
  isShared: boolean
}

export default function InstagramPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState("connect")
  const [autoShare, setAutoShare] = useState(false)
  const [shareToStories, setShareToStories] = useState(true)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])

  // Mock Instagram posts data
  const instagramPosts: InstagramPost[] = [
    {
      id: "1",
      caption: "Beautiful sunset at the beach today! 🌅 #sunset #beach #photography",
      imageUrl: "/placeholder.svg?height=400&width=400",
      permalink: "https://instagram.com/p/example1",
      timestamp: "2時間前",
      likes: 245,
      comments: 18,
      isShared: false,
    },
    {
      id: "2",
      caption: "Delicious homemade pasta for dinner 🍝 #cooking #pasta #homemade",
      imageUrl: "/placeholder.svg?height=400&width=400",
      permalink: "https://instagram.com/p/example2",
      timestamp: "1日前",
      likes: 156,
      comments: 12,
      isShared: true,
    },
    {
      id: "3",
      caption: "Morning coffee and coding session ☕️ #coffee #coding #developer",
      imageUrl: "/placeholder.svg?height=400&width=400",
      permalink: "https://instagram.com/p/example3",
      timestamp: "2日前",
      likes: 89,
      comments: 7,
      isShared: false,
    },
  ]

  const handleConnectInstagram = () => {
    console.log("[v0] Connecting to Instagram...")
    // Here you would implement the actual Instagram OAuth flow
    setIsConnected(true)
    setActiveTab("posts")
  }

  const handleDisconnectInstagram = () => {
    console.log("[v0] Disconnecting from Instagram...")
    setIsConnected(false)
    setActiveTab("connect")
  }

  const handleSharePost = (postId: string) => {
    console.log(`[v0] Sharing Instagram post ${postId} to timeline`)
    // Here you would implement the actual sharing logic
  }

  const handleBulkShare = () => {
    console.log(`[v0] Bulk sharing posts: ${selectedPosts}`)
    // Here you would implement bulk sharing logic
    setSelectedPosts([])
  }

  const togglePostSelection = (postId: string) => {
    setSelectedPosts((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]))
  }

  const InstagramPostCard = ({ post }: { post: InstagramPost }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <img
              src={post.imageUrl || "/placeholder.svg"}
              alt="Instagram post"
              className="w-20 h-20 rounded-lg object-cover"
            />
            {post.isShared && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 mb-2 line-clamp-2">{post.caption}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
              <span className="flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                {post.likes}
              </span>
              <span className="flex items-center">
                <MessageCircle className="w-3 h-3 mr-1" />
                {post.comments}
              </span>
              <span>{post.timestamp}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={post.isShared ? "outline" : "default"}
                  className={!post.isShared ? "bg-facebook-blue hover:bg-facebook-blue/90" : ""}
                  onClick={() => handleSharePost(post.id)}
                  disabled={post.isShared}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  {post.isShared ? "シェア済み" : "シェア"}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              <input
                type="checkbox"
                checked={selectedPosts.includes(post.id)}
                onChange={() => togglePostSelection(post.id)}
                className="w-4 h-4 text-facebook-blue"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Instagram className="h-6 w-6 text-pink-500" />
              <span>Instagram連動</span>
              {isConnected && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  接続済み
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="connect">接続設定</TabsTrigger>
                <TabsTrigger value="posts" disabled={!isConnected}>
                  投稿管理
                </TabsTrigger>
                <TabsTrigger value="settings" disabled={!isConnected}>
                  自動化設定
                </TabsTrigger>
              </TabsList>

              {/* Connection Tab */}
              <TabsContent value="connect" className="mt-6">
                <div className="text-center space-y-6">
                  {!isConnected ? (
                    <>
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Instagram className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Instagramアカウントを連携</h3>
                        <p className="text-gray-600 mb-6">
                          Instagramの投稿をSNSアプリに自動で共有したり、
                          <br />
                          クロスポスティングを簡単に行えます。
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-left">
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Link2 className="w-4 h-4 mr-2 text-facebook-blue" />
                          連携でできること
                        </h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Instagram投稿の自動インポート</li>
                          <li>• SNSアプリへの自動クロスポスト</li>
                          <li>• ストーリーズの共有</li>
                          <li>• 統合された投稿管理</li>
                        </ul>
                      </div>
                      <Button
                        onClick={handleConnectInstagram}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
                      >
                        <Instagram className="w-5 h-5 mr-2" />
                        Instagramと連携する
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">連携完了</h3>
                        <p className="text-gray-600 mb-6">
                          Instagramアカウントが正常に連携されました。
                          <br />
                          投稿の管理と自動化設定を行えます。
                        </p>
                      </div>
                      <div className="flex justify-center space-x-4">
                        <Button
                          onClick={() => setActiveTab("posts")}
                          className="bg-facebook-blue hover:bg-facebook-blue/90"
                        >
                          投稿を管理
                        </Button>
                        <Button variant="outline" onClick={handleDisconnectInstagram}>
                          連携を解除
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Posts Tab */}
              <TabsContent value="posts" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Instagram投稿</h3>
                    <div className="flex space-x-2">
                      {selectedPosts.length > 0 && (
                        <Button
                          size="sm"
                          onClick={handleBulkShare}
                          className="bg-facebook-blue hover:bg-facebook-blue/90"
                        >
                          選択した投稿をシェア ({selectedPosts.length})
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Upload className="w-4 h-4 mr-1" />
                        同期
                      </Button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">注意事項</p>
                      <p className="text-yellow-700">
                        Instagram投稿をシェアする際は、元の投稿者のクレジットが自動で含まれます。
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {instagramPosts.map((post) => (
                      <InstagramPostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-facebook-blue" />
                      自動化設定
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">新しい投稿の自動シェア</p>
                          <p className="text-sm text-gray-500">
                            Instagramに新しい投稿をした際、自動的にSNSアプリにもシェアします
                          </p>
                        </div>
                        <Switch checked={autoShare} onCheckedChange={setAutoShare} />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">ストーリーズの共有</p>
                          <p className="text-sm text-gray-500">
                            Instagramストーリーズを24時間限定でSNSアプリにも投稿します
                          </p>
                        </div>
                        <Switch checked={shareToStories} onCheckedChange={setShareToStories} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">シェア時の設定</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">デフォルトのハッシュタグ</label>
                        <Input placeholder="#instagram #crosspost" className="w-full" />
                        <p className="text-xs text-gray-500 mt-1">
                          Instagram投稿をシェアする際に自動で追加されるハッシュタグ
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">投稿プレフィックス</label>
                        <Input placeholder="📸 Instagramより:" className="w-full" />
                        <p className="text-xs text-gray-500 mt-1">シェアした投稿の先頭に追加されるテキスト</p>
                      </div>
                    </div>
                  </div>

                  <Button className="bg-facebook-blue hover:bg-facebook-blue/90">設定を保存</Button>
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
