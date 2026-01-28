"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, X, FileText } from "lucide-react"
import { refreshS3Url } from "@/lib/storage"
import Link from "next/link"

interface Comment {
  id: string
  user: {
    name: string
    avatar?: string
    email?: string
  }
  content: string
  timestamp: string
  likesCount?: number
}

interface Post {
  id: string
  user: {
    name: string
    avatar?: string
    email?: string
  }
  content: string
  timestamp: string
  image?: string
  video?: string
  pdf?: string
  likesCount?: number
  commentsCount?: number
  isLiked?: boolean
}

interface CommentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: Post | null
  comments: Comment[]
  currentUser: {
    name: string
    avatar?: string
    email?: string
  } | null
  newComment: string
  onCommentChange: (value: string) => void
  onCommentSubmit: () => void
  onLike?: (postId: string) => void
  isLoading?: boolean
}

export function CommentModal({
  open,
  onOpenChange,
  post,
  comments,
  currentUser,
  newComment,
  onCommentChange,
  onCommentSubmit,
  onLike,
  isLoading = false,
}: CommentModalProps) {
  const [refreshedPostImage, setRefreshedPostImage] = useState<string | null>(null)
  const [refreshedPostVideo, setRefreshedPostVideo] = useState<string | null>(null)

  useEffect(() => {
    if (post?.image) {
      refreshS3Url(post.image, true).then((url) => {
        setRefreshedPostImage(url || post.image || null)
      })
    }
    if (post?.video) {
      refreshS3Url(post.video, true).then((url) => {
        setRefreshedPostVideo(url || post.video || null)
      })
    }
  }, [post?.image, post?.video])

  if (!post) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{post.user.name}さんの投稿</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          {/* 投稿者情報 */}
          <div className="flex items-center gap-3">
            {post.user.email ? (
              <Link href={`/users/${encodeURIComponent(post.user.email)}`}>
                <Avatar className="w-10 h-10 cursor-pointer">
                  <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {post.user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {post.user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              {post.user.email ? (
                <Link href={`/users/${encodeURIComponent(post.user.email)}`}>
                  <div className="font-semibold text-sm hover:underline cursor-pointer">{post.user.name}</div>
                </Link>
              ) : (
                <div className="font-semibold text-sm">{post.user.name}</div>
              )}
              <div className="text-xs text-gray-500">{post.timestamp}</div>
            </div>
          </div>

          {/* 投稿内容 */}
          {post.content && (
            <div className="text-sm text-gray-900 whitespace-pre-wrap">{post.content}</div>
          )}

          {/* 画像 */}
          {refreshedPostImage && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={refreshedPostImage}
                alt="Post content"
                className="w-full h-auto max-h-[500px] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* 動画 */}
          {refreshedPostVideo && (
            <div className="rounded-lg overflow-hidden">
              <video
                src={refreshedPostVideo}
                controls
                className="w-full h-auto max-h-[500px]"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* PDF */}
          {post.pdf && (
            <div className="border rounded-lg p-4">
              <a
                href={post.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <FileText className="w-5 h-5" />
                <span>PDFファイルを開く</span>
              </a>
            </div>
          )}

          {/* リアクションとコメントの概要 */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              <span>{post.likesCount || 0}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{post.commentsCount || 0}件のコメント</span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center justify-around border-t border-gray-100 pt-2">
            <button
              onClick={() => onLike?.(post.id)}
              className="flex items-center gap-2 flex-1 justify-center py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current text-red-500" : "text-gray-600"}`} />
              <span className="text-sm text-gray-700">いいね!</span>
            </button>
            <button className="flex items-center gap-2 flex-1 justify-center py-2 hover:bg-gray-50 rounded-lg transition-colors">
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">コメントする</span>
            </button>
            <button className="flex items-center gap-2 flex-1 justify-center py-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">シェア</span>
            </button>
          </div>

          {/* コメント一覧 */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-semibold text-sm mb-4">コメント ({comments.length})</h4>
            
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">まだコメントがありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    {comment.user.email ? (
                      <Link href={`/users/${encodeURIComponent(comment.user.email)}`}>
                        <Avatar className="w-8 h-8 cursor-pointer flex-shrink-0">
                          <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {comment.user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    ) : (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {comment.user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        {comment.user.email ? (
                          <Link href={`/users/${encodeURIComponent(comment.user.email)}`}>
                            <div className="font-semibold text-sm hover:underline cursor-pointer mb-1">
                              {comment.user.name}
                            </div>
                          </Link>
                        ) : (
                          <div className="font-semibold text-sm mb-1">{comment.user.name}</div>
                        )}
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 px-1">{comment.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* コメント入力 */}
          {currentUser && (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {currentUser.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <Textarea
                      placeholder={`${currentUser.name}としてコメント`}
                      value={newComment}
                      onChange={(e) => onCommentChange(e.target.value)}
                      className="resize-none border-none shadow-none focus-visible:ring-0 text-sm bg-transparent p-0 min-h-[60px]"
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={onCommentSubmit}
                      disabled={!newComment.trim() || isLoading}
                      size="sm"
                      className="px-4 bg-[#dc0000] hover:bg-[#B80000] text-white disabled:bg-gray-300"
                    >
                      {isLoading ? "投稿中..." : "投稿"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

