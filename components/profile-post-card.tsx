"use client"
import { TimelinePostCard, type PostAuthor } from "@/components/timeline-post-card"
import { type DbPost, type DbUser } from "@/lib/api"

interface ProfilePostCardProps {
  post: DbPost
  user: DbUser
  isVisible: boolean
  onToggleComments?: (postId: string) => void
  onLike?: (postId: string) => void
}

export function ProfilePostCard({ post, user, isVisible, onToggleComments, onLike }: ProfilePostCardProps) {
  const author: PostAuthor = {
    name: `${user.lastName} ${user.firstName}`,
    avatar: user.avatar || null,
    email: user.email,
  }

  return (
    <div
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <TimelinePostCard
        post={post}
        author={author}
        onToggleComments={onToggleComments}
        onLike={onLike}
      />
        </div>
  )
}
