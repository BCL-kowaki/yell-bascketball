"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, FileText, MoreHorizontal, Loader2, Edit, Trash2 } from "lucide-react"
import { type DbPost, getUserByEmail } from "@/lib/api"
import { refreshS3Url } from "@/lib/storage"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 画像表示コンポーネント（S3のURLを動的に更新）
function ImageWithRefresh({ imageUrl }: { imageUrl: string }) {
  const [refreshedUrl, setRefreshedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const loadImage = async () => {
      if (!imageUrl) return

      if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
        setRefreshedUrl(imageUrl)
        setIsLoading(false)
        return
      }

      try {
        const newUrl = await refreshS3Url(imageUrl, true)
        setRefreshedUrl(newUrl || imageUrl)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to refresh image URL:', error)
        setRefreshedUrl(imageUrl)
        setIsLoading(false)
      }
    }

    loadImage()
  }, [imageUrl, retryCount])

  const handleImageError = () => {
    if (retryCount < 3) {
      setIsLoading(true)
      setRetryCount(prev => prev + 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!refreshedUrl) {
    return (
      <div className="flex items-center justify-center bg-gray-50 min-h-[200px]">
        <p className="text-gray-500">画像を読み込めませんでした</p>
      </div>
    )
  }

  return (
    <img
      src={refreshedUrl}
      alt="Post content"
      className="w-full h-auto cursor-pointer hover:scale-[1.02] transition-transform duration-300"
      onError={handleImageError}
    />
  )
}

// アバター画像コンポーネント（S3のURLを動的に更新）
function AvatarWithRefresh({ avatarUrl, fallbackText, className }: { avatarUrl: string; fallbackText: string; className?: string }) {
  const [refreshedUrl, setRefreshedUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadAvatar = async () => {
      if (!avatarUrl || avatarUrl === "/placeholder.svg" || avatarUrl === "/placeholder-user.jpg") {
        setRefreshedUrl(null)
        return
      }

      if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('blob:')) {
        setRefreshedUrl(avatarUrl)
        return
      }

      try {
        const newUrl = await refreshS3Url(avatarUrl, true)
        setRefreshedUrl(newUrl || avatarUrl)
      } catch (error) {
        console.error('Failed to refresh avatar URL:', error)
        setRefreshedUrl(avatarUrl)
      }
    }

    loadAvatar()
  }, [avatarUrl])

  return (
    <Avatar className={className}>
      <AvatarImage src={refreshedUrl || undefined} />
      <AvatarFallback className="bg-purple-600 text-white font-semibold">
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  )
}

// PDF表示コンポーネント（S3のURLを動的に更新）
function PdfViewer({ pdfUrl, pdfName }: { pdfUrl: string; pdfName?: string | null }) {
  const [refreshedUrl, setRefreshedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfUrl) return

      if (pdfUrl.startsWith('data:') || pdfUrl.startsWith('blob:')) {
        setRefreshedUrl(pdfUrl)
        setIsLoading(false)
        return
      }

      try {
        const newUrl = await refreshS3Url(pdfUrl, true)
        setRefreshedUrl(newUrl || pdfUrl)
      } catch (error) {
        console.error('Failed to refresh PDF URL:', error)
        setRefreshedUrl(pdfUrl)
      } finally {
        setIsLoading(false)
      }
    }

    loadPdf()
  }, [pdfUrl])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!refreshedUrl) return null

  if (refreshedUrl.startsWith('data:') || refreshedUrl.startsWith('blob:')) {
    return (
      <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
        <object
          data={refreshedUrl}
          type="application/pdf"
          width="100%"
          height="500px"
          className="w-full"
        >
          <div className="p-4 text-center text-gray-500">
            <p>PDFを表示できませんでした。</p>
            <a
              href={refreshedUrl}
              download={pdfName || "document.pdf"}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              ダウンロードする
            </a>
          </div>
        </object>
      </div>
    )
  }

  return (
    <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(refreshedUrl)}&embedded=true`}
        width="100%"
        height="500px"
        className="w-full"
        title={pdfName || "PDFファイル"}
      ></iframe>
    </div>
  )
}

// 投稿者情報の型
export interface PostAuthor {
  name: string
  avatar: string | null
  email?: string
}

// コンポーネントのProps型
interface TimelinePostCardProps {
  post: DbPost
  author?: PostAuthor
  currentUserEmail?: string | null
  isLiked?: boolean
  showComments?: boolean
  comments?: Array<{
    id: string
    user: { name: string; avatar: string }
    content: string
    timestamp: string
  }>
  newCommentValue?: string
  currentUserAvatar?: string
  currentUserName?: string
  onLike?: (postId: string) => void
  onToggleComments?: (postId: string) => void
  onEdit?: (postId: string, content: string) => void
  onDelete?: (postId: string) => void
  onCommentChange?: (postId: string, value: string) => void
  onCommentSubmit?: (postId: string) => void
}

export function TimelinePostCard({
  post,
  author,
  currentUserEmail,
  isLiked = false,
  showComments = false,
  comments = [],
  newCommentValue = "",
  currentUserAvatar,
  currentUserName,
  onLike,
  onToggleComments,
  onEdit,
  onDelete,
  onCommentChange,
  onCommentSubmit,
}: TimelinePostCardProps) {
  const [loadedAuthor, setLoadedAuthor] = useState<PostAuthor | null>(author || null)

  // 投稿者情報を取得（authorが渡されていない場合）
  useEffect(() => {
    const loadAuthor = async () => {
      if (!author && post.authorEmail) {
        try {
          const userData = await getUserByEmail(post.authorEmail)
          if (userData) {
            setLoadedAuthor({
              name: `${userData.lastName} ${userData.firstName}`,
              avatar: userData.avatar || null,
              email: userData.email,
            })
          }
        } catch (error) {
          console.error('Failed to load author:', error)
        }
      }
    }
    loadAuthor()
  }, [author, post.authorEmail])

  const displayAuthor = loadedAuthor || author || {
    name: "不明なユーザー",
    avatar: null,
    email: post.authorEmail || undefined,
  }

  const timestamp = post.createdAt
    ? new Date(post.createdAt).toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const isOwner = post.authorEmail && currentUserEmail && post.authorEmail === currentUserEmail

  // イニシャルを取得
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
  }

  return (
    <Card className="w-full border-0 shadow-sm bg-white sm:rounded-lg rounded-none py-2">
      <CardHeader className="px-3 py-3 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {post.authorEmail ? (
              <Link href={`/users/${encodeURIComponent(post.authorEmail)}`}>
                <AvatarWithRefresh
                  avatarUrl={displayAuthor.avatar || "/placeholder.svg"}
                  fallbackText={getInitials(displayAuthor.name)}
                  className="w-10 h-10 sm:w-12 sm:h-12 cursor-pointer"
                />
              </Link>
            ) : (
              <AvatarWithRefresh
                avatarUrl={displayAuthor.avatar || "/placeholder.svg"}
                fallbackText={getInitials(displayAuthor.name)}
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
            )}
            <div className="min-w-0">
              {post.authorEmail ? (
                <Link href={`/users/${encodeURIComponent(post.authorEmail)}`}>
                  <div className="font-bold text-sm sm:text-[15px] text-black hover:underline cursor-pointer mb-0.5 truncate">
                    {displayAuthor.name}
                  </div>
                </Link>
              ) : (
                <div className="font-bold text-sm sm:text-[15px] text-black mb-0.5 truncate">
                  {displayAuthor.name}
                </div>
              )}
              <div className="text-[11px] sm:text-xs text-gray-500">{timestamp}</div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner ? (
                <>
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(post.id, post.content || "")}
                      className="cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      編集
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(post.id)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      削除
                    </DropdownMenuItem>
                  )}
                </>
              ) : (
                <DropdownMenuItem disabled className="text-gray-400 text-xs">
                  編集・削除は投稿作成者のみ可能です
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 pb-3">
        <p className="mb-3 text-black text-sm sm:text-[15px] leading-6 sm:leading-7 break-words">
          {post.content}
        </p>

        {/* リンクプレビュー */}
        {post.linkUrl && post.linkTitle && (
          <div className="mb-4 border rounded-lg overflow-hidden">
            <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 transition-colors">
              {post.linkImage && (
                <img src={post.linkImage} alt={post.linkTitle} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <div className="font-semibold text-gray-800 truncate">{post.linkTitle}</div>
                {post.linkDescription && (
                  <div className="text-sm text-gray-500 line-clamp-2">{post.linkDescription}</div>
                )}
              </div>
            </a>
          </div>
        )}

        {/* 画像 */}
        {post.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
            <ImageWithRefresh imageUrl={post.imageUrl} />
          </div>
        )}

        {/* PDF */}
        {post.pdfUrl ? (
          <div className="mb-4">
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-3">
              <FileText className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <a
                  href={post.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium block truncate"
                >
                  {post.pdfName || "PDFファイル"}
                </a>
              </div>
            </div>
            <PdfViewer pdfUrl={post.pdfUrl} pdfName={post.pdfName} />
          </div>
        ) : post.pdfName ? (
          <div className="mb-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50">
            <div className="flex items-center gap-2 text-yellow-800">
              <FileText className="w-5 h-5" />
              <span className="font-medium truncate">{post.pdfName}</span>
              <span className="text-sm text-yellow-600 flex-shrink-0">（アップロード失敗）</span>
            </div>
          </div>
        ) : null}

        {/* 動画 */}
        {post.videoUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
            <video src={post.videoUrl} controls className="w-full h-auto">
              お使いのブラウザは動画の再生に対応していません。
            </video>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex items-center border-t border-gray-100 pt-2">
          <button
            onClick={() => onLike?.(post.id)}
            className="flex items-center gap-2 flex-1 justify-center py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current text-red-500" : "text-gray-600"}`} />
            <span className="text-[12px] sm:text-sm text-gray-700">
              いいね{(post.likesCount ?? 0) > 0 && ` (${post.likesCount})`}
            </span>
          </button>
          <button
            onClick={() => onToggleComments?.(post.id)}
            className="flex items-center gap-2 flex-1 justify-center py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <span className="text-[12px] sm:text-sm text-gray-700">
              コメント ({post.commentsCount || 0})
            </span>
          </button>
        </div>

        {/* コメントセクション */}
        {showComments && (
          <div className="border-t border-gray-100 pt-4 mt-2">
            {/* コメント入力 */}
            <div className="flex items-start gap-3 mb-4">
              <AvatarWithRefresh
                avatarUrl={currentUserAvatar || "/placeholder.svg"}
                fallbackText={currentUserName?.charAt(0) || "U"}
                className="w-8 h-8"
              />
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <Textarea
                    placeholder="コメントを入力..."
                    value={newCommentValue}
                    onChange={(e) => onCommentChange?.(post.id, e.target.value)}
                    className="resize-none border-none shadow-none focus-visible:ring-0 text-sm bg-transparent p-0 min-h-[40px]"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={() => onCommentSubmit?.(post.id)}
                    disabled={!newCommentValue?.trim()}
                    size="sm"
                    className="px-4 bg-[#dc0000] hover:bg-[#B80000] text-white"
                  >
                    投稿
                  </Button>
                </div>
              </div>
            </div>

            {/* コメント一覧 */}
            {comments.length > 0 && (
              <>
                <h4 className="font-bold text-sm text-black mb-3 border-t border-gray-100 pt-4">
                  ▼コメント一覧
                </h4>
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <AvatarWithRefresh
                        avatarUrl={comment.user.avatar || "/placeholder.svg"}
                        fallbackText={getInitials(comment.user.name)}
                        className="w-8 h-8"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <div className="font-semibold text-sm">{comment.user.name}</div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 px-1">
                          {comment.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// エクスポートする補助関数
export { AvatarWithRefresh, ImageWithRefresh, PdfViewer }

