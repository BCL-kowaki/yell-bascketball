"use client"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DbPost, DbTournament, DbUser, getUserByEmail, deletePost } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

type TournamentPostListProps = {
  posts: DbPost[]
  tournament: DbTournament
  currentUserEmail?: string
  isSiteAdmin?: boolean
  onPostDeleted?: () => void
  onPostEdit?: (post: DbPost) => void
}

type UserCache = {
  [email: string]: DbUser | null
}

export function TournamentPostList({ posts, tournament, currentUserEmail, isSiteAdmin = false, onPostDeleted, onPostEdit }: TournamentPostListProps) {
  const { toast } = useToast()
  const [userCache, setUserCache] = useState<UserCache>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    // 投稿者のユーザー情報を取得
    const loadUsers = async () => {
      const emailsToFetch = Array.from(new Set(
        posts
          .map(p => p.authorEmail)
          .filter((email): email is string => !!email)
      ))

      const newCache: UserCache = { ...userCache }

      for (const email of emailsToFetch) {
        if (!newCache[email]) {
          try {
            const user = await getUserByEmail(email)
            newCache[email] = user
          } catch (error) {
            console.error(`Failed to load user ${email}:`, error)
            newCache[email] = null
          }
        }
      }

      setUserCache(newCache)
    }

    if (posts.length > 0) {
      loadUsers()
    }
  }, [posts])

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">まだ投稿がありません</p>
        <p className="text-sm text-muted-foreground mt-2">
          最初の投稿を作成してみましょう
        </p>
      </div>
    )
  }

  // 大会運営者(オーナー or 共同管理者)判定
  const isAdmin = (authorEmail: string) => {
    return authorEmail === tournament.ownerEmail ||
           tournament.coAdminEmails?.includes(authorEmail)
  }

  // 削除/編集権限の判定: 投稿者本人 / 大会オーナー・共同管理者 / サイト管理者
  const canModifyPost = (post: DbPost): boolean => {
    if (!currentUserEmail) return false
    if (isSiteAdmin) return true
    if (post.authorEmail === currentUserEmail) return true
    if (currentUserEmail === tournament.ownerEmail) return true
    if (tournament.coAdminEmails?.includes(currentUserEmail)) return true
    return false
  }

  const handleDelete = async (postId: string) => {
    try {
      setDeletingId(postId)
      await deletePost(postId)
      toast({
        title: "投稿を削除しました",
      })
      onPostDeleted?.()
    } catch (error: any) {
      console.error("Failed to delete post:", error)
      toast({
        title: "エラー",
        description: "投稿の削除に失敗しました",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  const getUserName = (email: string) => {
    const user = userCache[email]
    if (user) {
      return `${user.firstName} ${user.lastName}`
    }
    return email
  }

  const getUserAvatar = (email: string) => {
    const user = userCache[email]
    return user?.avatar
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const isPostAdmin = post.authorEmail && isAdmin(post.authorEmail)
        const timeAgo = post.createdAt
          ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ja })
          : "不明"

        const userName = post.authorEmail ? getUserName(post.authorEmail) : "不明なユーザー"
        const userAvatar = post.authorEmail ? getUserAvatar(post.authorEmail) : undefined
        const canModify = canModifyPost(post)

        return (
          <Card key={post.id} className="border-0 shadow">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
                  <AvatarFallback>{userName[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{userName}</span>
                      {isPostAdmin && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                          【大会運営本部】
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">· {timeAgo}</span>
                    </div>
                    {canModify && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 flex-shrink-0"
                            disabled={deletingId === post.id}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {onPostEdit && (
                            <DropdownMenuItem onClick={() => onPostEdit(post)} className="cursor-pointer">
                              <Pencil className="w-4 h-4 mr-2" />
                              編集
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setConfirmDeleteId(post.id)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post image"
                      className="rounded-lg w-full mb-3 h-auto"
                    />
                  )}

                  {post.pdfUrl && post.pdfName && (
                    <a
                      href={post.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">{post.pdfName}</span>
                    </a>
                  )}

                  {post.videoUrl && (
                    <video
                      src={post.videoUrl}
                      controls
                      className="rounded-lg w-full mb-3 max-h-96"
                    />
                  )}

                  <div className="flex items-center gap-4 text-muted-foreground">
                    <Button variant="ghost" size="sm" className="gap-2 h-8">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">{post.likesCount || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 h-8">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{post.commentsCount || 0}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。削除した投稿は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
