"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea, Input } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, ImageIcon, Smile, MapPin, MoreHorizontal, Send, Instagram } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Layout } from "@/components/layout"

// Mock users data
const mockUsers = [
  {
    id: 1,
    name: "田中 太郎",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "佐藤 花子",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "山田 次郎",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "鈴木 美咲",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "高橋 健太",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "伊藤 愛子",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock comments data structure
const mockComments: { [key: number]: any[] } = {
  1: [
    {
      id: 1,
      user: mockUsers[2],
      content: "素敵な写真ですね！どちらのカフェですか？",
      timestamp: "25分前",
      likes: 3,
      liked: false,
    },
    {
      id: 2,
      user: mockUsers[0],
      content: "渋谷の新しいカフェです。とても雰囲気が良かったです！",
      timestamp: "20分前",
      likes: 1,
      liked: true,
    },
  ],
  2: [
    {
      id: 3,
      user: mockUsers[1],
      content: "頑張ってください！応援しています。",
      timestamp: "1時間前",
      likes: 2,
      liked: false,
    },
  ],
  3: [
    {
      id: 4,
      user: mockUsers[1],
      content: "家族との時間は大切ですね。素敵な写真です！",
      timestamp: "4時間前",
      likes: 5,
      liked: true,
    },
    {
      id: 5,
      user: mockUsers[2],
      content: "お子さんたち、とても楽しそうですね！",
      timestamp: "3時間前",
      likes: 2,
      liked: false,
    },
  ],
  4: [
    {
      id: 6,
      user: mockUsers[4],
      content: "お疲れ様です！素敵な写真ですね。",
      timestamp: "15分前",
      likes: 1,
      liked: false,
    },
  ],
  5: [
    {
      id: 7,
      user: mockUsers[3],
      content: "素晴らしい演奏ですね！",
      timestamp: "30分前",
      likes: 3,
      liked: true,
    },
  ],
  6: [
    {
      id: 8,
      user: mockUsers[5],
      content: "おいしそう！レシピを教えてください。",
      timestamp: "1時間前",
      likes: 2,
      liked: false,
    },
  ],
}

// Mock timeline posts
const mockTimelinePosts = [
  {
    id: 1,
    user: mockUsers[1],
    content: "今日は素晴らしい天気でした！渋谷で友達とカフェ巡りを楽しみました。新しいお店を発見できて嬉しいです。",
    image: "/placeholder.svg?height=400&width=600",
    likes: 42,
    comments: 8,
    shares: 3,
    timestamp: "30分前",
    liked: false,
  },
  {
    id: 2,
    user: mockUsers[2],
    content: "新しいプロジェクトが始まりました！チーム一同で頑張ります。技術的な挑戦が多そうですが、とても楽しみです。",
    likes: 28,
    comments: 5,
    shares: 2,
    timestamp: "2時間前",
    liked: true,
  },
  {
    id: 3,
    user: mockUsers[0],
    content: "週末は家族と一緒に公園でピクニックをしました。子供たちがとても喜んでいて、良い思い出になりました。",
    image: "/placeholder.svg?height=400&width=600",
    likes: 56,
    comments: 12,
    shares: 4,
    timestamp: "5時間前",
    liked: false,
  },
  {
    id: 4,
    user: mockUsers[3],
    content: "今日は一日中プログラミングの勉強をしていました。新しいフレームワークを学ぶのは大変ですが、とても楽しいです！",
    likes: 35,
    comments: 4,
    shares: 1,
    timestamp: "1時間前",
    liked: false,
  },
  {
    id: 5,
    user: mockUsers[4],
    content: "久しぶりにギターを弾きました。昔の曲を思い出しながら演奏するのは懐かしくて楽しいですね。",
    image: "/placeholder.svg?height=400&width=600",
    likes: 67,
    comments: 7,
    shares: 5,
    timestamp: "3時間前",
    liked: true,
  },
  {
    id: 6,
    user: mockUsers[5],
    content: "今日は料理に挑戦しました！新しいレシピを試してみて、家族に好評でした。料理は本当に楽しいですね。",
    image: "/placeholder.svg?height=400&width=600",
    likes: 89,
    comments: 18,
    shares: 8,
    timestamp: "4時間前",
    liked: false,
  },
  {
    id: 7,
    user: mockUsers[1],
    content:
      "読書の秋ですね。最近読んだ本がとても面白くて、一気に読み終えてしまいました。おすすめの本があれば教えてください！",
    likes: 19,
    comments: 15,
    shares: 1,
    timestamp: "1日前",
    liked: true,
  },
  {
    id: 8,
    user: mockUsers[2],
    content: "今日はジムでトレーニングをしました。新しいメニューに挑戦して、とても充実した時間でした。",
    likes: 45,
    comments: 6,
    shares: 2,
    timestamp: "6時間前",
    liked: false,
  },
  {
    id: 9,
    user: mockUsers[3],
    content: "夜の散歩が好きです。街の灯りを見ながら歩くのは、とてもリラックスできます。",
    likes: 23,
    comments: 3,
    shares: 1,
    timestamp: "8時間前",
    liked: true,
  },
  {
    id: 10,
    user: mockUsers[4],
    content: "今日は友達と映画を見に行きました。とても感動的な作品で、久しぶりに涙が出ました。",
    likes: 78,
    comments: 22,
    shares: 12,
    timestamp: "1日前",
    liked: false,
  },
]

export default function TimelinePage() {
  const [posts, setPosts] = useState(mockTimelinePosts)
  const [newPost, setNewPost] = useState("")
  const [comments, setComments] = useState(mockComments)
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({})
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({})

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const handleCommentLike = (postId: number, commentId: number) => {
    setComments((prevComments) => ({
      ...prevComments,
      [postId]:
        prevComments[postId]?.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                liked: !comment.liked,
                likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
              }
            : comment,
        ) || [],
    }))
  }

  const toggleComments = (postId: number) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const handleSubmitComment = (postId: number) => {
    const commentText = newComment[postId]?.trim()
    if (commentText) {
      const newCommentObj = {
        id: Date.now(),
        user: mockUsers[0],
        content: commentText,
        timestamp: "今",
        likes: 0,
        liked: false,
      }

      setComments((prevComments) => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), newCommentObj],
      }))

      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments + 1,
              }
            : post,
        ),
      )

      setNewComment((prev) => ({
        ...prev,
        [postId]: "",
      }))
    }
  }

  const handleSubmitPost = () => {
    if (newPost.trim()) {
      const newPostObj = {
        id: posts.length + 1,
        user: mockUsers[0],
        content: newPost,
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: "今",
        liked: false,
      }
      setPosts([newPostObj, ...posts])
      setNewPost("")
    }
  }

  return (
    <Layout isLoggedIn={true} currentUser={{ name: "ユーザー" }}>
      <div className="max-w-6xl pt-2 pb-20 px-2 md:px-6 space-y-4 md:space-y-8">
        {/* Create Post */}
        <Card className="w-full border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12 ring-2 ring-orange-100">
                <AvatarImage src={mockUsers[0].avatar || "/placeholder.svg"} alt={mockUsers[0].name} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold">
                  {mockUsers[0].name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea 
                  placeholder={`${mockUsers[0].name || 'ユーザー'}さん、今何をしていますか？`}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px] resize-none border-none shadow-none focus-visible:ring-0 text-base bg-transparent placeholder:text-gray-400"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  写真
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full">
                  <MapPin className="w-5 h-5 mr-2" />
                  場所
                </Button>
              </div>
              <Button 
                onClick={handleSubmitPost} 
                disabled={!newPost.trim()} 
                className="px-8 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                投稿
              </Button>
            </div>
          </CardContent>
        </Card>

                {/* Timeline Posts */}
        {posts.map((post) => (
          <Card key={post.id} className="w-full border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                    <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold">
                      {post.user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 hover:text-orange-600 cursor-pointer transition-colors">{post.user.name}</div>
                    <div className="text-sm text-gray-500">{post.timestamp}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-4">
              <p className="mb-6 text-gray-800 leading-relaxed">{post.content}</p>

              {post.image && (
                <div className="mb-6 rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Post content"
                    className="w-full h-auto cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              )}

              {/* Engagement Stats */}
              <div className="flex items-center justify-between py-3 mb-4 text-sm text-gray-500 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  {post.likes > 0 && (
                    <span className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                        <Heart className="w-3 h-3 text-white fill-current" />
                      </div>
                      <span className="font-medium">{post.likes}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  {post.comments > 0 && (
                    <button onClick={() => toggleComments(post.id)} className="hover:text-orange-600 cursor-pointer font-medium transition-colors">
                      {post.comments}件のコメント
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-around pt-2 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-1 rounded-full py-3 ${post.liked ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-600 hover:text-red-500 hover:bg-red-50"}`}
                  onClick={() => handleLike(post.id)}
                >
                  <Heart className={`w-5 h-5 mr-2 ${post.liked ? "fill-current" : ""}`} />
                  <span className="font-medium">{post.liked ? "いいね済み" : "いいね"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 rounded-full py-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">コメント</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 rounded-full py-3 text-gray-600 hover:text-green-600 hover:bg-green-50"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  <span className="font-medium">シェア</span>
                </Button>
              </div>

              {showComments[post.id] && (
                <div className="border-t border-gray-100 pt-6">
                  {/* Comment Input */}
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-10 h-10 ring-2 ring-orange-100">
                      <AvatarImage src={mockUsers[0].avatar || "/placeholder.svg"} alt={mockUsers[0].name} />
                      <AvatarFallback className="text-sm bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold">
                        {mockUsers[0].name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-center gap-3">
                      <Input
                        placeholder="コメントを書く..."
                        value={newComment[post.id] || ""}
                        onChange={(e) =>
                          setNewComment((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-full border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSubmitComment(post.id)
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSubmitComment(post.id)}
                        disabled={!newComment[post.id]?.trim()}
                        className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-4">
                        <Avatar className="w-10 h-10 ring-2 ring-gray-100">
                          <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                          <AvatarFallback className="text-sm bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold">
                            {comment.user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-2xl px-4 py-3 shadow-sm">
                            <div className="font-semibold text-sm mb-2 text-gray-900">{comment.user.name}</div>
                            <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-6 mt-2 text-xs text-gray-500">
                            <button
                              onClick={() => handleCommentLike(post.id, comment.id)}
                              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                                comment.liked ? "text-red-500" : ""
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${comment.liked ? "fill-current" : ""}`} />
                              {comment.likes > 0 && <span className="font-medium">{comment.likes}</span>}
                            </button>
                            <span className="hover:text-orange-600 cursor-pointer font-medium">返信</span>
                            <span className="font-medium">{comment.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
