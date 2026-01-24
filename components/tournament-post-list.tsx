"use client"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, FileText, Video } from "lucide-react"
import { DbPost, DbTournament, DbUser, getUserByEmail } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

type TournamentPostListProps = {
  posts: DbPost[]
  tournament: DbTournament
  currentUserEmail?: string
}

type UserCache = {
  [email: string]: DbUser | null
}

export function TournamentPostList({ posts, tournament, currentUserEmail }: TournamentPostListProps) {
  const [userCache, setUserCache] = useState<UserCache>({})

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

  const isAdmin = (authorEmail: string) => {
    return authorEmail === tournament.ownerEmail ||
           tournament.coAdminEmails?.includes(authorEmail)
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

        const authorEmail = post.authorEmail || "不明なユーザー"
        const userName = post.authorEmail ? getUserName(post.authorEmail) : "不明なユーザー"
        const userAvatar = post.authorEmail ? getUserAvatar(post.authorEmail) : undefined

        return (
          <Card key={post.id} className="border-0 shadow">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
                  <AvatarFallback>{userName[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{userName}</span>
                    {isPostAdmin && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        【大会運営本部】
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">· {timeAgo}</span>
                  </div>

                  <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post image"
                      className="rounded-lg w-full mb-3 max-h-96 object-cover"
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
    </div>
  )
}
