"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"

interface User {
  id: number
  name: string
  avatar: string
}

interface PostCardProps {
  id: number
  user: User
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  timestamp: string
  liked: boolean
  onLike: (postId: number) => void
}

export function PostCard({
  id,
  user,
  content,
  image,
  likes,
  comments,
  shares,
  timestamp,
  liked,
  onLike,
}: PostCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold hover:underline cursor-pointer">{user.name}</div>
              <div className="text-sm text-muted-foreground">{timestamp}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-foreground leading-relaxed">{content}</p>

        {image && (
          <div className="mb-4 rounded-lg overflow-hidden bg-muted">
            <img
              src={image || "/placeholder.svg"}
              alt="Post content"
              className="w-full h-auto cursor-pointer hover:opacity-95 transition-opacity"
            />
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between py-2 mb-3 text-sm text-muted-foreground border-b border-border">
          <div className="flex items-center gap-4">
            {likes > 0 && (
              <span className="flex items-center gap-1">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-primary-foreground fill-current" />
                </div>
                {likes}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {comments > 0 && <span>{comments}件のコメント</span>}
            {shares > 0 && <span>{shares}回シェア</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-around pt-2">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 ${liked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            onClick={() => onLike(id)}
          >
            <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
            いいね
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-primary">
            <MessageCircle className="w-4 h-4 mr-2" />
            コメント
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-primary">
            <Share2 className="w-4 h-4 mr-2" />
            シェア
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
