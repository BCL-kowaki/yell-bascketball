"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea, Input } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, ImageIcon, MoreHorizontal, Send, FileText, Search, X, Loader2, Video, Edit, Trash2, Trophy, Users } from "lucide-react"
import { Layout } from "@/components/layout"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { listPosts, getTimelinePosts, createPost as createDbPost, toggleLike as toggleDbLike, addComment as addDbComment, updatePostCounts, getCurrentUserEmail, getUserByEmail, updatePost, deletePost } from "@/lib/api"
import { uploadImageToS3, uploadPdfToS3, uploadVideoToS3, refreshS3Url } from "@/lib/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input as DialogInput } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type LinkPreviewData = {
  url: string
  title: string
  description: string
  image: string
}

type Place = {
  id: string
  name: string
  address: string
}

type Reply = {
  id: number
  user: {
    id: number
    name: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  liked: boolean
}

type Comment = {
  id: number
  user: {
    id: number
    name: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  liked: boolean
  replies: Reply[]
}

type Post = {
  id: number
  dbId?: string
  authorEmail?: string // 投稿作成者のメールアドレス
  user: {
    id: number
    name: string
    avatar: string
  }
  content: string
  image?: string
  videoUrl?: string
  videoName?: string
  pdfName?: string
  pdfUrl?: string
  location?: Place
  linkPreview?: LinkPreviewData
  likes: number
  comments: number
  shares: number
  timestamp: string
  liked: boolean
}

// デフォルトユーザー（データベースからユーザー情報を取得できない場合のフォールバック）
const defaultUser = {
  id: 0,
  name: "匿名ユーザー",
  avatar: "/placeholder.svg?height=40&width=40",
}

// コメントデータ（将来的にはデータベースから取得する予定）
const mockComments: { [key: number]: Comment[] } = {}


// 画像表示コンポーネント（S3のURLを動的に更新）
function ImageWithRefresh({ imageUrl }: { imageUrl: string }) {
  const [refreshedUrl, setRefreshedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    console.log('🎬 ImageWithRefresh: useEffect triggered', {
      imageUrl: imageUrl.substring(0, 100),
      retryCount,
    })

    const loadImage = async () => {
      console.log('📸 ImageWithRefresh: loadImage() called')

      if (!imageUrl) {
        console.warn('⚠️ ImageWithRefresh: imageUrl is empty')
        return
      }

      // Base64データURLの場合はそのまま使用
      if (imageUrl.startsWith('data:')) {
        console.log('📦 ImageWithRefresh: Using Base64 data URL')
        setRefreshedUrl(imageUrl)
        setIsLoading(false)
        return
      }

      // S3のURLを更新（ダウンロードモードを使用）
      try {
        console.log('🔄 ImageWithRefresh: Refreshing image URL with download mode...')
        const newUrl = await refreshS3Url(imageUrl, true) // ダウンロードモードを強制
        console.log('✅ ImageWithRefresh: Image URL refreshed successfully!')
        console.log('🔗 ImageWithRefresh: New URL type:', newUrl?.startsWith('blob:') ? 'Blob URL' : 'Other')
        console.log('🔗 ImageWithRefresh: New URL preview:', newUrl?.substring(0, 100))
        setRefreshedUrl(newUrl || imageUrl)
        setIsLoading(false)
      } catch (error) {
        console.error('❌ ImageWithRefresh: Failed to refresh image URL:', error)
        console.error('❌ ImageWithRefresh: Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })
        setRefreshedUrl(imageUrl) // エラー時は元のURLを使用
        setIsLoading(false)
      }
    }

    loadImage()
  }, [imageUrl, retryCount])

  const handleImageError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imgElement = e.target as HTMLImageElement
    console.error('Image load error details:', {
      originalUrl: imageUrl.substring(0, 150),
      currentSrc: imgElement.src.substring(0, 150),
      retryCount,
      naturalWidth: imgElement.naturalWidth,
      naturalHeight: imgElement.naturalHeight,
    })

    // エラー時に再度URLを更新して再試行（最大3回まで）
    if (retryCount < 3) {
      console.log(`Image load failed, retrying... (attempt ${retryCount + 1}/3)`)
      setIsLoading(true)
      setRetryCount(prev => prev + 1)
    } else {
      console.error('Failed to load image after 3 attempts:', imageUrl.substring(0, 150))
      console.error('⚠️ Possible causes:')
      console.error('1. S3 CORS configuration may be missing or incorrect')
      console.error('2. S3 bucket policy may not allow access from this origin')
      console.error('3. IAM role for authenticated users may lack S3 read permissions')
      console.error('4. Object may not exist in S3')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 min-h-[200px]">
        <div className="text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>画像を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!refreshedUrl) {
    return (
      <div className="flex items-center justify-center bg-gray-50 min-h-[200px] p-4 text-center text-gray-500">
        <p>画像を読み込めませんでした</p>
      </div>
    )
  }

  return (
    <img
      key={refreshedUrl} // URLが変更されたときに再読み込み
      src={refreshedUrl}
      alt="Post content"
      className="w-full h-auto cursor-pointer hover:scale-[1.02] transition-transform duration-300"
      onError={handleImageError}
      onLoad={() => {
        console.log('Image loaded successfully:', refreshedUrl.substring(0, 100))
      }}
    />
  )
}

// PDF表示コンポーネント（S3のURLを動的に更新）
function PdfViewer({ pdfUrl, pdfName }: { pdfUrl: string; pdfName?: string }) {
  const [refreshedUrl, setRefreshedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfUrl) return
      
      // Base64データURLの場合はそのまま使用
      if (pdfUrl.startsWith('data:')) {
        setRefreshedUrl(pdfUrl)
        setIsLoading(false)
        return
      }
      
      // S3のURLを更新（ダウンロードモードを使用）
      try {
        console.log('🔄 PdfViewer: Refreshing PDF URL with download mode...')
        const newUrl = await refreshS3Url(pdfUrl, true) // ダウンロードモードを強制
        console.log('✅ PdfViewer: PDF URL refreshed successfully!')
        console.log('🔗 PdfViewer: New URL type:', newUrl?.startsWith('blob:') ? 'Blob URL' : 'Other')
        setRefreshedUrl(newUrl || pdfUrl)
      } catch (error) {
        console.error('❌ PdfViewer: Failed to refresh PDF URL:', error)
        setRefreshedUrl(pdfUrl) // エラー時は元のURLを使用
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPdf()
  }, [pdfUrl])

  if (isLoading) {
    return (
      <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center" style={{ height: '500px' }}>
        <div className="text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>PDFを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!refreshedUrl) {
    return (
      <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 p-4 text-center text-gray-500">
        <p>PDFを読み込めませんでした</p>
      </div>
    )
  }

  // PDFを直接表示（Google Docs ViewerのCSP問題を回避）
  // objectタグを使用してPDFを直接表示（embedタグより互換性が高い）
  return (
    <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
      <object
        key={refreshedUrl} // URLが変更されたときに再読み込み
        data={refreshedUrl}
        type="application/pdf"
        width="100%"
        height="500px"
        className="w-full"
        style={{ minHeight: '500px' }}
      >
        {/* フォールバック: PDFが表示できない場合 */}
        <div className="p-8 text-center bg-gray-50">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">PDFを表示できませんでした</p>
          <a
            href={refreshedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-2 font-medium"
          >
            <FileText className="w-4 h-4" />
            {pdfName || "PDFファイル"}を新しいタブで開く
          </a>
        </div>
      </object>
    </div>
  )
}

export default function TimelinePage() {
  ensureAmplifyConfigured()
  const [posts, setPosts] = useState<Post[]>([]) // データベースから取得した投稿のみを使用
  const [newPost, setNewPost] = useState("")
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [linkPreview, setLinkPreview] = useState<LinkPreviewData | null>(null)
  const [isFetchingPreview, setIsFetchingPreview] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar?: string; email?: string } | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | undefined>(undefined)

  const pdfInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [comments, setComments] = useState(mockComments)
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({})
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({})
  const [replyingTo, setReplyingTo] = useState<{ postId: number; commentId: number } | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const { toast } = useToast()
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deletePostId, setDeletePostId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPostFormOpen, setIsPostFormOpen] = useState(false)

  // ログインユーザー情報を取得
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        // Amplifyのauth sessionから直接ユーザー情報を取得
        const email = await getCurrentUserEmail()
        if (email) {
          setCurrentUserEmail(email)
          console.log('Current user email set:', email)

          const userData = await getUserByEmail(email)
          if (userData) {
            // アバターURLをS3からリフレッシュ
            let avatarUrl = userData.avatar || undefined
            if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('blob:') && !avatarUrl.startsWith('/placeholder')) {
              try {
                avatarUrl = await refreshS3Url(avatarUrl, true) || avatarUrl
              } catch (error) {
                console.error('Failed to refresh current user avatar URL:', error)
              }
            }
            setCurrentUser({
              name: `${userData.lastName} ${userData.firstName}`,
              avatar: avatarUrl,
              email: email,
            })
          }
        }
      } catch (error) {
        console.error('Failed to load current user:', error)
      }
    }

    loadCurrentUser()
  }, [])

  // 初期ロードでDBから投稿を取得
  useEffect(() => {
    ;(async () => {
      try {
        console.log('TimelinePage: Loading posts from database...')
        
        // ログインユーザーがいる場合はフォローベースのタイムラインを取得
        // いない場合は全投稿を取得
        let dbPosts
        if (currentUserEmail) {
          console.log('TimelinePage: Loading personalized timeline for:', currentUserEmail)
          dbPosts = await getTimelinePosts(currentUserEmail, 50)
        } else {
          console.log('TimelinePage: Loading all posts (user not logged in)')
          dbPosts = await listPosts(50)
        }
        console.log('TimelinePage: Received posts from database:', dbPosts.length)
        console.log('TimelinePage: Posts with authorEmail:', dbPosts.filter(p => p.authorEmail).length)
        
        if (dbPosts.length === 0) {
          console.warn('TimelinePage: No posts found in database')
          setPosts([])
          return
        }
        
        // 投稿を新しい順にソート（createdAtの降順）
        const sortedPosts = [...dbPosts].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA // 新しい順
        })
        console.log('TimelinePage: Sorted posts by createdAt (newest first):', sortedPosts.map(p => ({
          id: p.id,
          createdAt: p.createdAt,
          content: p.content?.substring(0, 20)
        })))
        
        const mapped: Post[] = await Promise.all(
          sortedPosts.map(async (p, idx) => {
            console.log(`TimelinePage: Processing post ${idx + 1}/${sortedPosts.length}:`, {
              id: p.id,
              content: p.content?.substring(0, 30),
              authorEmail: p.authorEmail || 'NO AUTHOR EMAIL'
            })
            
            // 投稿者のユーザー情報を取得
            let user = defaultUser // デフォルトユーザー
            if (p.authorEmail) {
              try {
                console.log(`TimelinePage: Fetching user for email: ${p.authorEmail}`)
                const author = await getUserByEmail(p.authorEmail)
                if (author) {
                  // アバターURLをS3からリフレッシュ
                  let avatarUrl = author.avatar || "/placeholder.svg?height=40&width=40"
                  if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('blob:') && !avatarUrl.startsWith('/placeholder')) {
                    try {
                      avatarUrl = await refreshS3Url(avatarUrl, true) || avatarUrl
                    } catch (error) {
                      console.error('Failed to refresh avatar URL:', error)
                    }
                  }
                  user = {
                    id: idx + 1,
                    name: `${author.lastName} ${author.firstName}`,
                    avatar: avatarUrl,
                  }
                  console.log(`TimelinePage: Found user: ${user.name}`)
                } else {
                  console.warn(`TimelinePage: User not found for email: ${p.authorEmail}`)
                }
              } catch (e) {
                console.error("TimelinePage: Failed to load user for post:", e)
                console.error("TimelinePage: Post details:", { id: p.id, authorEmail: p.authorEmail })
              }
            } else {
              console.warn(`TimelinePage: Post ${p.id} has no authorEmail, using default user`)
            }

            // PDF情報をログ出力（デバッグ用）
            if (p.pdfUrl || p.pdfName) {
              console.log(`Post ${p.id} PDF info:`, {
                pdfUrl: p.pdfUrl ? (p.pdfUrl.length > 100 ? p.pdfUrl.substring(0, 100) + '...' : p.pdfUrl) : null,
                pdfName: p.pdfName,
                pdfUrlType: p.pdfUrl ? (p.pdfUrl.startsWith('data:') ? 'Base64' : 'S3 URL') : 'null'
              })
            }

            // S3のURLを更新（期限切れの場合に新しいURLを生成）
            let imageUrl = p.imageUrl ?? undefined
            let pdfUrl = p.pdfUrl ?? undefined
            
            // S3のURLが期限切れの場合に新しいURLを生成
            if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('blob:')) {
              try {
                imageUrl = await refreshS3Url(imageUrl, true) || undefined  // ダウンロードモードを使用
              } catch (error) {
                console.error('Failed to refresh image URL:', error)
                // エラーが発生した場合は、元のURLを使用
              }
            }
            
            if (pdfUrl && !pdfUrl.startsWith('data:') && !pdfUrl.startsWith('blob:')) {
              try {
                pdfUrl = await refreshS3Url(pdfUrl, true) || undefined  // ダウンロードモードを使用
              } catch (error) {
                console.error('Failed to refresh PDF URL:', error)
                // エラーが発生した場合は、元のURLを使用
              }
            }

            return {
          id: idx + 1, // ローカル用の連番ID
          dbId: p.id,
          authorEmail: p.authorEmail || undefined, // 投稿作成者のメールアドレスを保存（nullをundefinedに変換）
              user: user,
          content: p.content,
          image: imageUrl,
              videoUrl: p.videoUrl ?? undefined,
              videoName: p.videoName ?? undefined,
          pdfName: p.pdfName ?? undefined,
          pdfUrl: pdfUrl,
          location: p.locationName ? { id: "-", name: p.locationName, address: p.locationAddress || "" } : undefined,
          linkPreview: p.linkUrl
            ? {
                url: p.linkUrl,
                title: p.linkTitle || "",
                description: p.linkDescription || "",
                image: p.linkImage || "/placeholder.svg?height=200&width=400&text=Link",
              }
            : undefined,
          likes: p.likesCount ?? 0,
          comments: p.commentsCount ?? 0,
          shares: 0,
              timestamp: p.createdAt ? (() => {
                const date = new Date(p.createdAt)
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                const hours = String(date.getHours()).padStart(2, '0')
                const minutes = String(date.getMinutes()).padStart(2, '0')
                return `${year}-${month}-${day} ${hours}:${minutes}`
              })() : "",
          liked: false,
            }
          })
        )
        // データベースから取得した投稿を設定（空の場合も空配列を設定）
        setPosts(mapped)
        console.log('TimelinePage: Loaded posts from database:', mapped.length)
        console.log('TimelinePage: Posts state updated:', mapped.map(p => ({ id: p.dbId, content: p.content?.substring(0, 20) })))
      } catch (e: any) {
        console.error("TimelinePage: Failed to load posts", e)
        console.error("TimelinePage: Error details:", {
          message: e?.message,
          errors: e?.errors,
          stack: e?.stack
        })
        // エラーが発生した場合は空配列を設定
        setPosts([])
        toast({
          title: "エラー",
          description: "投稿の読み込みに失敗しました。ページをリロードしてください。",
          variant: "destructive",
        })
      }
    })()
  }, [currentUserEmail])

  const handleLike = async (postId: number) => {
    const target = posts.find(p => p.id === postId)
    if (!target) return

    // Amplifyのauth sessionから直接メールアドレスを取得
    let email: string | undefined
    try {
      email = await getCurrentUserEmail()
    } catch (error) {
      console.error('Failed to get current user email:', error)
    }

    if (!email || !target.dbId) {
      // ローカルのみ反映
      setPosts(posts.map(p => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p))
      return
    }
    try {
      const res = await toggleDbLike(target.dbId, email, target.likes)
      setPosts(posts.map(p => p.id === postId ? { ...p, liked: res.liked, likes: res.likes } : p))
    } catch (e) {
      console.error("toggle like failed", e)
    }
  }

  const handleCommentLike = (postId: number, commentId: number, replyId?: number) => {
    setComments((prevComments) => {
      const updatedCommentsForPost = prevComments[postId]?.map((comment) => {
        if (comment.id === commentId) {
          if (replyId) {
            // Like a reply
            const updatedReplies = comment.replies.map((reply) =>
              reply.id === replyId
                ? { ...reply, liked: !reply.liked, likes: reply.liked ? reply.likes - 1 : reply.likes + 1 }
                : reply
            );
            return { ...comment, replies: updatedReplies };
          } else {
            // Like a comment
            return {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            };
          }
        }
        return comment;
      });

      return {
        ...prevComments,
        [postId]: updatedCommentsForPost || [],
      };
    });
  }

  const toggleComments = (postId: number) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const handleSubmitComment = async (postId: number) => {
    const commentText = newComment[postId]?.trim()
    if (commentText) {
      // 現在のユーザー情報を取得（ログインしている場合）
      const userForComment = currentUser ? {
        id: Date.now(),
        name: currentUser.name,
        avatar: currentUser.avatar || "/placeholder.svg",
      } : defaultUser

      const newCommentObj: Comment = {
        id: Date.now(),
        user: userForComment,
        content: commentText,
        timestamp: "今",
        likes: 0,
        liked: false,
        replies: [],
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

      // DBへ書き込み
      try {
        const post = posts.find(p => p.id === postId)
        if (post?.dbId) {
          // Amplifyのauth sessionから直接メールアドレスを取得
          let email: string | undefined
          try {
            email = await getCurrentUserEmail()
          } catch (error) {
            console.error('Failed to get current user email:', error)
          }

          if (email) {
          await addDbComment(post.dbId, commentText, email)
          await updatePostCounts(post.dbId, { commentsCount: post.comments + 1 })
          }
        }
      } catch (e) {
        console.error("add comment failed", e)
      }
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePdfSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedPdf(file)
      if (pdfPreview) {
        URL.revokeObjectURL(pdfPreview)
      }
      setPdfPreview(URL.createObjectURL(file))
    }
  }

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedVideo(file)
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview)
      }
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmitReply = (postId: number, commentId: number) => {
    if (replyContent.trim()) {
      const newReplyObj: Reply = {
        id: Date.now(),
        user: defaultUser,
        content: replyContent,
        timestamp: "今",
        likes: 0,
        liked: false,
      };

      setComments((prevComments) => ({
        ...prevComments,
        [postId]: prevComments[postId].map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, newReplyObj] }
            : comment
        ),
      }));

      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const fetchLinkPreview = async (url: string) => {
    if (isFetchingPreview) return
    setIsFetchingPreview(true)

    // リンクプレビューの取得（将来的には実際のAPIを使用）
    await new Promise((resolve) => setTimeout(resolve, 800))

    // 汎用プレビュー
    setLinkPreview({
      url,
      title: "リンクプレビュー",
      description: url,
      image: "/placeholder.svg?height=200&width=400&text=Link+Preview",
    })

    setIsFetchingPreview(false)
  }

  const handleShare = (postId: number) => {
    const postUrl = `${window.location.origin}#post-${postId}`
    navigator.clipboard.writeText(postUrl).then(() => {
      toast({
        title: "リンクをコピーしました",
        description: "投稿へのリンクがクリップボードにコピーされました。",
      })
    }).catch(err => {
      console.error("リンクのコピーに失敗しました:", err)
      toast({
        title: "コピーに失敗しました",
        variant: "destructive",
      })
    })
  }

  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = newPost.match(urlRegex)

    if (urls && urls[0]) {
      if (linkPreview?.url !== urls[0]) {
        fetchLinkPreview(urls[0])
      }
    } else {
      setLinkPreview(null)
    }
  }, [newPost])


  const handlePdfButtonClick = () => {
    pdfInputRef.current?.click()
  }

  const handleImageButtonClick = () => {
    imageInputRef.current?.click()
  }

  const handleVideoButtonClick = () => {
    videoInputRef.current?.click()
  }


  const handleSubmitPost = async () => {
    if (newPost.trim() || selectedPdf || selectedImage || selectedVideo) {
      // まずDBへ保存
      try {
        // Amplifyのauth sessionから直接メールアドレスを取得
        let email: string | undefined
        try {
          email = await getCurrentUserEmail()
        } catch (error) {
          console.error('Failed to get current user email:', error)
        }

        if (!email) {
          toast({
            title: "エラー",
            description: "ログインが必要です。ログインページに移動してください。",
            variant: "destructive",
          })
          return
        }

        // 画像、動画、PDFをS3にアップロード（またはBase64フォールバック）
        let imageUrl: string | null = null
        let videoUrl: string | null = null
        let pdfUrl: string | null = null

        if (selectedImage) {
          try {
            imageUrl = await uploadImageToS3(selectedImage, email)
            console.log('Image uploaded:', imageUrl)
          } catch (error) {
            console.error('Failed to upload image:', error)
            // エラーが発生した場合は、プレビュー（Base64）を使用
            imageUrl = imagePreview || null
          }
        } else if (imagePreview) {
          imageUrl = imagePreview
        }

        if (selectedVideo) {
          try {
            videoUrl = await uploadVideoToS3(selectedVideo, email)
            console.log('Video uploaded:', videoUrl)
          } catch (error) {
            console.error('Failed to upload video:', error)
            // エラーが発生した場合は、プレビュー（Blob URL）を使用
            videoUrl = videoPreview || null
          }
        } else if (videoPreview) {
          videoUrl = videoPreview
        }

        if (selectedPdf) {
          console.log('PDF file selected:', {
            name: selectedPdf.name,
            size: `${(selectedPdf.size / 1024 / 1024).toFixed(2)}MB`,
            type: selectedPdf.type
          })
          try {
            pdfUrl = await uploadPdfToS3(selectedPdf, email)
            console.log('PDF uploaded successfully:', {
              url: pdfUrl ? (pdfUrl.length > 100 ? pdfUrl.substring(0, 100) + '...' : pdfUrl) : 'null',
              urlType: pdfUrl ? (pdfUrl.startsWith('data:') ? 'Base64' : 'S3 URL') : 'null'
            })
          } catch (error: any) {
            console.error('Failed to upload PDF:', error)
            console.error('PDF upload error details:', {
              message: error?.message,
              name: error?.name,
              stack: error?.stack
            })
            
            // S3設定エラーの場合は、投稿を中止する
            const isS3ConfigError = error?.message?.includes('S3ストレージが設定されていません') ||
                                   error?.message?.includes('bucket') ||
                                   error?.name === 'NoBucket'
            
            if (isS3ConfigError) {
              toast({
                title: "S3ストレージが設定されていません",
                description: "PDFをアップロードするには、AWS AmplifyでS3ストレージを設定する必要があります。設定後、再度お試しください。",
                variant: "destructive",
              })
              // S3設定エラーの場合は投稿を中止
              return
            }
            
            // その他のエラーの場合
            const fileSizeMB = selectedPdf ? (selectedPdf.size / 1024 / 1024).toFixed(2) : '不明'
            toast({
              title: "PDFのアップロードに失敗しました",
              description: `PDFファイル（${fileSizeMB}MB）のアップロードに失敗しました。300KB以下のPDFは自動的に保存されますが、それ以上のサイズはS3ストレージの設定が必要です。`,
              variant: "destructive",
            })
            // PDFのアップロードに失敗した場合は、PDFなしで投稿を続行
            pdfUrl = null
            console.warn('Continuing post creation without PDF due to upload failure.')
          }
        } else {
          console.log('No PDF file selected')
        }

        console.log('Creating post with data:', {
          content: newPost,
          imageUrl: imageUrl ? (imageUrl.length > 100 ? imageUrl.substring(0, 100) + '...' : imageUrl) : null,
          videoUrl: videoUrl ? (videoUrl.length > 100 ? videoUrl.substring(0, 100) + '...' : videoUrl) : null,
          videoName: selectedVideo?.name,
          pdfUrl: pdfUrl ? (pdfUrl.length > 100 ? pdfUrl.substring(0, 100) + '...' : pdfUrl) : null,
          pdfName: selectedPdf?.name,
          pdfUrlType: pdfUrl ? (pdfUrl.startsWith('data:') ? 'Base64' : 'S3 URL') : 'null',
          authorEmail: email,
        })

        if (!email) {
          toast({
            title: "エラー",
            description: "ログインが必要です。ログインページに移動してください。",
            variant: "destructive",
          })
          return
        }
        
        console.log('Calling createDbPost with:', {
          content: newPost,
          imageUrl: imageUrl ? (imageUrl.length > 100 ? imageUrl.substring(0, 100) + '...' : imageUrl) : null,
          videoUrl: videoUrl ? (videoUrl.length > 100 ? videoUrl.substring(0, 100) + '...' : videoUrl) : null,
          pdfUrl: pdfUrl ? (pdfUrl.length > 100 ? pdfUrl.substring(0, 100) + '...' : pdfUrl) : null,
          authorEmail: email,
          hasAuthorEmail: !!email
        })
        
        // PDFが選択されているがURLがnullの場合、警告を表示
        if (selectedPdf && !pdfUrl) {
          console.warn('PDF file was selected but upload failed:', {
            fileName: selectedPdf.name,
            fileSize: `${(selectedPdf.size / 1024 / 1024).toFixed(2)}MB`,
            pdfUrl: null
          })
        }

        // blob: URLが誤って保存されないようにチェック
        if (pdfUrl && pdfUrl.startsWith('blob:')) {
          console.error('⚠️ blob: URL detected in pdfUrl! This is a temporary URL and cannot be saved. Rejecting save.')
          toast({
            title: "エラー",
            description: "PDFのURLが無効です。再度アップロードしてください。",
            variant: "destructive",
          })
          return // 投稿を中止
        }

        const postInput = {
          content: newPost || '', // 空文字列でも許可
          imageUrl: imageUrl,
          videoUrl: videoUrl,
          videoName: selectedVideo?.name || null,
          pdfUrl: pdfUrl, // blob: URLは上記のチェックで除外される
          pdfName: selectedPdf?.name || null,
          linkUrl: linkPreview?.url || null,
          linkTitle: linkPreview?.title || null,
          linkDescription: linkPreview?.description || null,
          linkImage: linkPreview?.image || null,
          likesCount: 0,
          commentsCount: 0,
          authorEmail: email, // 必須: 投稿者のメールアドレス
        }
        
        console.log('Post input (full):', JSON.stringify(postInput, null, 2))
        
        const created = await createDbPost(postInput)
        
        console.log('Post created successfully:', {
          id: created.id,
          authorEmail: created.authorEmail,
          hasAuthorEmail: !!created.authorEmail,
          content: created.content?.substring(0, 50),
          fullData: created
        })

        toast({
          title: "成功",
          description: "投稿が作成されました",
        })
        
        // 投稿後、DBから最新の投稿を再取得して表示を更新（ローカルステートは使用しない）
        try {
          console.log('Refreshing posts from database after creation...')
          const latestPosts = await listPosts(50)
          console.log('Refreshed posts count:', latestPosts.length)
          
          if (latestPosts.length > 0) {
            // 投稿を新しい順にソート（createdAtの降順）
            const sortedLatestPosts = [...latestPosts].sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
              return dateB - dateA // 新しい順
            })
            console.log('TimelinePage: Sorted refreshed posts by createdAt (newest first)')
            
            // DBから取得した投稿をマッピング
            const mapped: Post[] = await Promise.all(
              sortedLatestPosts.map(async (p, idx) => {
                let user = defaultUser // デフォルトユーザー
                if (p.authorEmail) {
                  try {
                    const author = await getUserByEmail(p.authorEmail)
                    if (author) {
                      // アバターURLをS3からリフレッシュ
                      let avatarUrl = author.avatar || "/placeholder.svg?height=40&width=40"
                      if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('blob:') && !avatarUrl.startsWith('/placeholder')) {
                        try {
                          avatarUrl = await refreshS3Url(avatarUrl, true) || avatarUrl
                        } catch (error) {
                          console.error('Failed to refresh avatar URL:', error)
                        }
                      }
                      user = {
                        id: idx + 1,
                        name: `${author.lastName} ${author.firstName}`,
                        avatar: avatarUrl,
                      }
                    }
                  } catch (e) {
                    console.error("Failed to load user for refreshed post:", e)
                  }
                }

                return {
                  id: idx + 1,
                  dbId: p.id,
                  authorEmail: p.authorEmail || undefined, // 投稿作成者のメールアドレスを保存（nullをundefinedに変換）
                  user: user,
                  content: p.content,
                  image: p.imageUrl ?? undefined,
                  videoUrl: p.videoUrl ?? undefined,
                  videoName: p.videoName ?? undefined,
                  pdfName: p.pdfName ?? undefined,
                  pdfUrl: p.pdfUrl ?? undefined,
                  location: p.locationName ? { id: "-", name: p.locationName, address: p.locationAddress || "" } : undefined,
                  linkPreview: p.linkUrl
                    ? {
                        url: p.linkUrl,
                        title: p.linkTitle || "",
                        description: p.linkDescription || "",
                        image: p.linkImage || "/placeholder.svg?height=200&width=400&text=Link",
                      }
                    : undefined,
                  likes: p.likesCount ?? 0,
                  comments: p.commentsCount ?? 0,
                  shares: 0,
                  timestamp: p.createdAt ? (() => {
                    const date = new Date(p.createdAt)
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    const hours = String(date.getHours()).padStart(2, '0')
                    const minutes = String(date.getMinutes()).padStart(2, '0')
                    return `${year}-${month}-${day} ${hours}:${minutes}`
                  })() : "",
                  liked: false,
                }
              })
            )
            
            // DBから取得した投稿のみを表示（ローカルステートは使用しない）
            setPosts(mapped)
            console.log('Posts refreshed from database:', mapped.length)
            
            // 最新の投稿が作成した投稿と一致するか確認
            const latestPost = latestPosts[0]
            if (latestPost.id === created.id || latestPost.authorEmail === email) {
              console.log('Post confirmed in database:', latestPost)
            }
          } else {
            console.warn('No posts found after creation, clearing local state')
            setPosts([])
          }
        } catch (refreshError) {
          console.error('Failed to refresh posts:', refreshError)
          // エラーが発生した場合も、ローカルステートは更新しない（DBから取得できたもののみ表示）
        }
      } catch (e: any) {
        console.error("create post failed", e)
        toast({
          title: "エラー",
          description: e?.message || "投稿の作成に失敗しました",
          variant: "destructive",
        })
      }
      setNewPost("")
      setSelectedPdf(null)
      setPdfPreview(null)
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedVideo(null)
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview)
      }
      setVideoPreview(null)
      setLinkPreview(null)
      setIsPostFormOpen(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#F0F2F5] overflow-x-hidden w-full max-w-full">
        <div className="w-full max-w-[680px] mx-auto px-0 overflow-hidden box-border">
          {/* Main Content */}
          <div className="space-y-2 pb-4 w-full overflow-hidden box-border">
            {/* Create Post */}
            <Card className="w-full border-0 shadow-sm bg-white sm:rounded-lg rounded-none py-2">
          <CardHeader className="px-3 py-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.name || 'ユーザー'} />
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  {currentUser?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {!isPostFormOpen ? (
                <button
                  onClick={() => setIsPostFormOpen(true)}
                  className="flex-1 h-10 px-4 bg-gray-100 rounded-full text-left text-gray-500 text-sm hover:bg-gray-200"
                >
                  今何してる？
                </button>
              ) : (
                <div className="flex-1">
                  <Textarea
                    id="post-textarea"
                    placeholder="今何してる？"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="w-full min-h-[80px] resize-none border border-gray-200 rounded-lg bg-white text-sm focus-visible:ring-1 focus-visible:ring-blue-500 p-3"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 p-2 h-auto" onClick={handleImageButtonClick}>
                  <ImageIcon className="w-5 h-5 text-green-500" />
                </Button>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 p-2 h-auto" onClick={handlePdfButtonClick}>
                  <FileText className="w-5 h-5 text-red-500" />
                </Button>
                <input
                  type="file"
                  ref={pdfInputRef}
                  onChange={handlePdfSelect}
                  accept=".pdf"
                  style={{ display: "none" }}
                />
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 p-2 h-auto" onClick={handleVideoButtonClick}>
                  <Video className="w-5 h-5 text-purple-500" />
                </Button>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoSelect}
                  accept="video/*"
                  style={{ display: "none" }}
                />
              </div>
              <Button
                onClick={handleSubmitPost}
                disabled={!newPost.trim() && !selectedPdf && !selectedImage && !selectedVideo}
                className="px-4 h-9 bg-[#DC0000] hover:bg-[#B80000] text-white font-medium text-sm rounded-lg disabled:bg-gray-300"
              >
                投稿
              </Button>
            </div>
            {/* プレビューエリア */}
            <div className="space-y-2 mt-2">
              {isFetchingPreview && (
                <div className="flex items-center gap-2 text-gray-500 text-sm p-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>プレビューを読み込んでいます...</span>
                </div>
              )}
              {linkPreview && !isFetchingPreview && (
                <div className="relative border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white z-10"
                    onClick={() => setLinkPreview(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <a href={linkPreview.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 transition-colors">
                    <img src={linkPreview.image} alt={linkPreview.title} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <div className="font-semibold text-sm text-gray-800 truncate">{linkPreview.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{linkPreview.description}</div>
                    </div>
                  </a>
                </div>
              )}
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Selected preview" className="rounded-lg max-h-40 w-auto" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 rounded-full h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedImage(null)
                      setImagePreview(null)
                      if (imageInputRef.current) {
                        imageInputRef.current.value = ""
                      }
                    }}
                  >
                    X
                  </Button>
                </div>
              )}
              {selectedPdf && (
                <div className="relative text-sm text-gray-500 p-2 border rounded-lg flex items-center justify-between">
                  <span>選択中のPDF: {selectedPdf.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedPdf(null)
                      if (pdfPreview) {
                        URL.revokeObjectURL(pdfPreview)
                        setPdfPreview(null)
                      }
                      if (pdfInputRef.current) {
                        pdfInputRef.current.value = ""
                      }
                    }}
                  >
                    X
                  </Button>
                </div>
              )}
              {selectedVideo && videoPreview && (
                <div className="relative">
                  <video src={videoPreview} controls className="rounded-lg max-h-40 w-auto" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 rounded-full h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedVideo(null)
                      if (videoPreview) {
                        URL.revokeObjectURL(videoPreview)
                        setVideoPreview(null)
                      }
                      if (videoInputRef.current) {
                        videoInputRef.current.value = ""
                      }
                    }}
                  >
                    X
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Posts */}
        {posts.length === 0 ? (
          <Card className="w-full max-w-[680px] mx-auto lg:mx-0 border-0 shadow-sm bg-white sm:rounded-lg rounded-none py-2">
            <CardContent className="py-8 sm:py-12 text-center">
              <p className="text-gray-500 text-base sm:text-lg">まだ投稿がありません</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">最初の投稿を作成してみましょう！</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
          <Card key={post.id} className="w-full max-w-[680px] mx-auto lg:mx-0 border-0 shadow-sm bg-white sm:rounded-lg rounded-none py-2">
            <CardHeader className="px-3 sm:px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4">
                  {post.authorEmail ? (
                    <Link href={`/users/${encodeURIComponent(post.authorEmail)}`}>
                      <Avatar className="w-10 h-10 sm:w-[50px] sm:h-[50px] cursor-pointer flex-shrink-0">
                        <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                        <AvatarFallback className="bg-purple-600 text-white font-semibold text-base sm:text-[22px]">
                          {post.user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  ) : (
                    <Avatar className="w-10 h-10 sm:w-[50px] sm:h-[50px] flex-shrink-0">
                      <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                      <AvatarFallback className="bg-purple-600 text-white font-semibold text-base sm:text-[22px]">
                        {post.user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="min-w-0">
                    {post.authorEmail ? (
                      <Link href={`/users/${encodeURIComponent(post.authorEmail)}`}>
                        <div className="font-bold text-sm sm:text-[15px] text-black hover:underline cursor-pointer mb-1 truncate">{post.user.name}</div>
                      </Link>
                    ) : (
                      <div className="font-bold text-sm sm:text-[15px] text-black mb-1 truncate">{post.user.name}</div>
                    )}
                    <div className="text-[10px] sm:text-[12px] text-[#9d9d9d] font-bold">{post.timestamp}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* 投稿の作成者のみ編集・削除を表示 */}
                    {post.authorEmail && currentUserEmail && post.authorEmail === currentUserEmail ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingPostId(post.id)
                            setEditContent(post.content || "")
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeletePostId(post.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          削除
                        </DropdownMenuItem>
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
            <CardContent className="px-3 sm:px-4">
              <p className="mb-3 sm:mb-4 text-black text-sm sm:text-[15px] leading-6 sm:leading-7 break-words">{post.content}</p>
              
              {post.linkPreview && (
                <div className="mb-4 border rounded-lg overflow-hidden">
                   <a href={post.linkPreview.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 transition-colors">
                    <img src={post.linkPreview.image} alt={post.linkPreview.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <div className="font-semibold text-gray-800 truncate">{post.linkPreview.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{post.linkPreview.description}</div>
                    </div>
                  </a>
                </div>
              )}


              {post.pdfUrl ? (
                <div className="mb-6">
                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-4">
                    <FileText className="w-8 h-8 text-red-500" />
                    <div className="flex-1">
                      <a
                        href={post.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium block mb-2"
                      >
                        {post.pdfName || "PDFファイル"}
                      </a>
                      <p className="text-sm text-gray-500">
                        PDFを表示するには、上記のリンクをクリックしてください
                      </p>
                    </div>
                  </div>
                  {post.pdfUrl.startsWith('data:') ? (
                    // Base64データURLの場合はobjectタグを使用（より安全）
                    <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
                      <object
                        data={post.pdfUrl}
                        type="application/pdf"
                        width="100%"
                        height="500px"
                        className="w-full"
                      >
                        <div className="p-4 text-center text-gray-500">
                          <p>PDFを表示できませんでした。</p>
                          <a
                            href={post.pdfUrl}
                            download={post.pdfName || "document.pdf"}
                            className="text-blue-600 hover:underline mt-2 inline-block"
                          >
                            ダウンロードする
                          </a>
                        </div>
                      </object>
                    </div>
                  ) : (
                    // S3 URLの場合は、動的にURLを更新してGoogle Docs Viewerを使用
                    <PdfViewer pdfUrl={post.pdfUrl} pdfName={post.pdfName} />
                  )}
                </div>
              ) : post.pdfName ? (
                // PDF名はあるがURLがない場合（アップロード失敗など）
                <div className="mb-6 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">{post.pdfName}</span>
                    <span className="text-sm text-yellow-600">（PDFのアップロードに失敗しました）</span>
                  </div>
                </div>
              ) : null}

              {post.videoUrl && (
                <div className="mb-6 rounded-lg overflow-hidden border border-gray-100">
                  <video
                    src={post.videoUrl}
                    controls
                    className="w-full h-auto"
                  >
                    お使いのブラウザは動画の再生に対応していません。
                  </video>
                </div>
              )}

              {post.image && (
                <div className="mb-6 rounded-lg overflow-hidden border border-gray-100">
                  <ImageWithRefresh imageUrl={post.image} />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-8 pt-2 border-t border-[#e1e1e1]">
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto hover:bg-transparent"
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className={`w-[26px] h-[26px] ${post.liked ? "fill-current text-red-500" : "text-black"}`} />
                  </Button>
                  <span className="text-[15px] text-black font-medium">
                    いいね {post.likes > 0 && <span className="font-normal">({post.likes})</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto hover:bg-transparent"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageCircle className="w-[30px] h-[30px] text-black" />
                  </Button>
                  <span className="text-[15px] text-black font-medium">
                    コメント <span className="font-normal">({post.comments || 0})</span>
                  </span>
                </div>
              </div>

              {showComments[post.id] && (
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="w-[43px] h-[43px]">
                      <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.name || 'ユーザー'} />
                      <AvatarFallback className="text-[20px] bg-blue-600 text-white font-normal">
                        {currentUser?.name
                          ? currentUser.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-[#ececec] rounded-[10px] px-4 py-3">
                        <Textarea
                          placeholder="コメントを入力..."
                          value={newComment[post.id] || ""}
                          onChange={(e) => setNewComment((prev) => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))}
                          className="resize-none border-none border-0 shadow-none !focus-visible:ring-0 !focus-visible:ring-offset-0 !focus:ring-0 !focus:ring-offset-0 !focus:outline-none !outline-none !ring-0 !ring-offset-0 text-[15px] bg-transparent rounded-[10px] placeholder:text-gray-400 p-0 min-h-[60px]"
                          style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                        />
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button
                          onClick={() => handleSubmitComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                          className="px-4 py-2 bg-[#dc0000] hover:bg-[#B80000] text-white font-bold text-[15px] rounded-[10px] disabled:bg-gray-300"
                        >
                          投稿
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Comment Header */}
                  <h4 className="font-bold text-[15px] text-black mb-4 border-t border-gray-100 pt-6">▼コメント一覧</h4>

                  {/* Comments List */}
                  <div className="space-y-4 mb-6">

                  {/* Comment Input */}
                 
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-4">
                        <Avatar className="w-[43px] h-[43px]">
                          <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                          <AvatarFallback className="text-[20px] bg-blue-600 text-white font-normal">
                            {comment.user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-[#ececec] rounded-[10px] px-5 py-3">
                            <div className="font-bold text-[15px] mb-2 text-black">{comment.user.name}</div>
                            <p className="text-[15px] text-black leading-[24px] font-light">{comment.content}</p>
                          </div>
                          <div className="text-[12px] text-[#9d9d9d] font-bold mt-2">{comment.timestamp}</div>

                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </CardContent>
          </Card>
          ))
        )}
          </div>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。投稿が完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deletePostId === null) return
                
                const post = posts.find(p => p.id === deletePostId)
                if (!post?.dbId) {
                  toast({
                    title: "エラー",
                    description: "投稿が見つかりません",
                    variant: "destructive",
                  })
                  return
                }

                try {
                  await deletePost(post.dbId)
                  toast({
                    title: "成功",
                    description: "投稿を削除しました",
                  })
                  
                  // 投稿リストを更新
                  const latestPosts = await listPosts(50)
                  const sortedLatestPosts = [...latestPosts].sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
                    return dateB - dateA
                  })
                  
                  const mapped: Post[] = await Promise.all(
                    sortedLatestPosts.map(async (p, idx) => {
                      let user = defaultUser
                      if (p.authorEmail) {
                        try {
                          const author = await getUserByEmail(p.authorEmail)
                          if (author) {
                            user = {
                              id: idx + 1,
                              name: `${author.lastName} ${author.firstName}`,
                              avatar: author.avatar || "/placeholder.svg?height=40&width=40",
                            }
                          }
                        } catch (e) {
                          console.error("Failed to load user for refreshed post:", e)
                        }
                      }

                      // S3のURLを更新（期限切れの場合に新しいURLを生成）
                      let imageUrl = p.imageUrl ?? undefined
                      let pdfUrl = p.pdfUrl ?? undefined
                      
                      // S3のURLが期限切れの場合に新しいURLを生成
                      if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('blob:')) {
                        try {
                          imageUrl = await refreshS3Url(imageUrl, true) || undefined  // ダウンロードモードを使用
                        } catch (error) {
                          console.error('Failed to refresh image URL:', error)
                          // エラーが発生した場合は、元のURLを使用
                        }
                      }

                      if (pdfUrl && !pdfUrl.startsWith('data:') && !pdfUrl.startsWith('blob:')) {
                        try {
                          pdfUrl = await refreshS3Url(pdfUrl, true) || undefined  // ダウンロードモードを使用
                        } catch (error) {
                          console.error('Failed to refresh PDF URL:', error)
                          // エラーが発生した場合は、元のURLを使用
                        }
                      }

                      return {
                        id: idx + 1,
                        dbId: p.id,
                        authorEmail: p.authorEmail || undefined, // 投稿作成者のメールアドレスを保存（nullをundefinedに変換）
                        user: user,
                        content: p.content,
                        image: imageUrl,
                        videoUrl: p.videoUrl ?? undefined,
                        videoName: p.videoName ?? undefined,
                        pdfName: p.pdfName ?? undefined,
                        pdfUrl: pdfUrl,
                        location: p.locationName ? { id: "-", name: p.locationName, address: p.locationAddress || "" } : undefined,
                        linkPreview: p.linkUrl
                          ? {
                              url: p.linkUrl,
                              title: p.linkTitle || "",
                              description: p.linkDescription || "",
                              image: p.linkImage || "/placeholder.svg?height=200&width=400&text=Link",
                            }
                          : undefined,
                        likes: p.likesCount ?? 0,
                        comments: p.commentsCount ?? 0,
                        shares: 0,
                        timestamp: p.createdAt ? new Date(p.createdAt).toLocaleString('ja-JP', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : "",
                        liked: false,
                      }
                    })
                  )
                  
                  setPosts(mapped)
                  setDeletePostId(null)
                  setIsDeleteDialogOpen(false)
                } catch (error: any) {
                  console.error("Failed to delete post:", error)
                  toast({
                    title: "エラー",
                    description: error?.message || "投稿の削除に失敗しました",
                    variant: "destructive",
                  })
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 編集ダイアログ */}
      <Dialog open={editingPostId !== null} onOpenChange={(open) => !open && setEditingPostId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>投稿を編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="投稿内容を入力..."
              className="min-h-[200px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPostId(null)
                  setEditContent("")
                }}
              >
                キャンセル
              </Button>
              <Button
                onClick={async () => {
                  if (editingPostId === null) return
                  
                  const post = posts.find(p => p.id === editingPostId)
                  if (!post?.dbId) {
                    toast({
                      title: "エラー",
                      description: "投稿が見つかりません",
                      variant: "destructive",
                    })
                    return
                  }

                  try {
                    await updatePost(post.dbId, { content: editContent })
                    toast({
                      title: "成功",
                      description: "投稿を更新しました",
                    })
                    
                    // 投稿リストを更新
                    const latestPosts = await listPosts(50)
                    const sortedLatestPosts = [...latestPosts].sort((a, b) => {
                      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
                      return dateB - dateA
                    })
                    
                    const mapped: Post[] = await Promise.all(
                      sortedLatestPosts.map(async (p, idx) => {
                        let user = defaultUser
                        if (p.authorEmail) {
                          try {
                            const author = await getUserByEmail(p.authorEmail)
                            if (author) {
                              user = {
                                id: idx + 1,
                                name: `${author.lastName} ${author.firstName}`,
                                avatar: author.avatar || "/placeholder.svg?height=40&width=40",
                              }
                            }
                          } catch (e) {
                            console.error("Failed to load user for refreshed post:", e)
                          }
                        }

                        // S3のURLを更新（期限切れの場合に新しいURLを生成）
                        let imageUrl = p.imageUrl ?? undefined
                        let pdfUrl = p.pdfUrl ?? undefined
                        
                        // S3のURLが期限切れの場合に新しいURLを生成
                        if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('blob:')) {
                          try {
                            imageUrl = await refreshS3Url(imageUrl) || undefined
                          } catch (error) {
                            console.error('Failed to refresh image URL:', error)
                            // エラーが発生した場合は、元のURLを使用
                          }
                        }
                        
                        if (pdfUrl && !pdfUrl.startsWith('data:') && !pdfUrl.startsWith('blob:')) {
                          try {
                            pdfUrl = await refreshS3Url(pdfUrl) || undefined
                          } catch (error) {
                            console.error('Failed to refresh PDF URL:', error)
                            // エラーが発生した場合は、元のURLを使用
                          }
                        }

                        return {
                          id: idx + 1,
                          dbId: p.id,
                          user: user,
                          content: p.content,
                          image: imageUrl,
                          videoUrl: p.videoUrl ?? undefined,
                          videoName: p.videoName ?? undefined,
                          pdfName: p.pdfName ?? undefined,
                          pdfUrl: pdfUrl,
                          location: p.locationName ? { id: "-", name: p.locationName, address: p.locationAddress || "" } : undefined,
                          linkPreview: p.linkUrl
                            ? {
                                url: p.linkUrl,
                                title: p.linkTitle || "",
                                description: p.linkDescription || "",
                                image: p.linkImage || "/placeholder.svg?height=200&width=400&text=Link",
                              }
                            : undefined,
                          likes: p.likesCount ?? 0,
                          comments: p.commentsCount ?? 0,
                          shares: 0,
                          timestamp: p.createdAt ? new Date(p.createdAt).toLocaleString('ja-JP', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : "",
                          liked: false,
                        }
                      })
                    )
                    
                    setPosts(mapped)
                    setEditingPostId(null)
                    setEditContent("")
                  } catch (error: any) {
                    console.error("Failed to update post:", error)
                    toast({
                      title: "エラー",
                      description: error?.message || "投稿の更新に失敗しました",
                      variant: "destructive",
                    })
                  }
                }}
                disabled={!editContent.trim()}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
              >
                更新
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
