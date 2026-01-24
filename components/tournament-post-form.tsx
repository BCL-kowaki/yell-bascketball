"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, Send, Loader2, FileText, Video, X } from "lucide-react"
import { createPost as createDbPost } from "@/lib/api"
import { uploadImageToS3, uploadPdfToS3, uploadVideoToS3 } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

type TournamentPostFormProps = {
  currentUserEmail: string
  currentUserName: string
  currentUserAvatar?: string
  tournamentId: string
  isAdmin: boolean // オーナーまたは共同管理者かどうか
  onPostCreated: () => void
}

export function TournamentPostForm({
  currentUserEmail,
  currentUserName,
  currentUserAvatar,
  tournamentId,
  isAdmin,
  onPostCreated
}: TournamentPostFormProps) {
  const { toast } = useToast()
  const [postContent, setPostContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedPdf(file)
    }
  }

  const handleRemovePdf = () => {
    setSelectedPdf(null)
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedVideo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveVideo = () => {
    setSelectedVideo(null)
    setVideoPreview(null)
  }

  const handleSubmitPost = async () => {
    if (!postContent.trim() && !selectedImage && !selectedPdf && !selectedVideo) {
      toast({
        title: "エラー",
        description: "投稿内容または画像を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setIsPosting(true)

      let imageUrl: string | null = null
      let pdfUrl: string | null = null
      let videoUrl: string | null = null

      // 画像をS3にアップロード
      if (selectedImage) {
        imageUrl = await uploadImageToS3(selectedImage, `tournament-${tournamentId}`)
      }

      // PDFをS3にアップロード
      if (selectedPdf) {
        pdfUrl = await uploadPdfToS3(selectedPdf, `tournament-${tournamentId}`)
      }

      // 動画をS3にアップロード
      if (selectedVideo) {
        videoUrl = await uploadVideoToS3(selectedVideo, `tournament-${tournamentId}`)
      }

      // 投稿を作成
      await createDbPost({
        content: postContent,
        imageUrl: imageUrl || undefined,
        pdfUrl: pdfUrl || undefined,
        pdfName: selectedPdf?.name,
        videoUrl: videoUrl || undefined,
        videoName: selectedVideo?.name,
        authorEmail: currentUserEmail,
        tournamentId: tournamentId,
        likesCount: 0,
        commentsCount: 0,
      })

      toast({
        title: "投稿しました",
        description: "投稿が正常に作成されました",
      })

      // フォームをリセット
      setPostContent("")
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedPdf(null)
      setSelectedVideo(null)
      setVideoPreview(null)

      // 親コンポーネントに通知
      onPostCreated()
    } catch (error: any) {
      console.error("Failed to create post:", error)
      toast({
        title: "エラー",
        description: "投稿の作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="bg-card rounded-lg shadow p-4 mb-4">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={currentUserAvatar} alt={currentUserName} />
          <AvatarFallback>{currentUserName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{currentUserName}</span>
              {isAdmin && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  【大会運営本部】
                </span>
              )}
            </div>
          </div>
          <Textarea
            placeholder="この大会について投稿する..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="min-h-[80px] mb-3 resize-none"
            disabled={isPosting}
          />

          {imagePreview && (
            <div className="relative mb-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="rounded-lg max-h-64 w-full object-cover"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                disabled={isPosting}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {selectedPdf && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">{selectedPdf.name}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemovePdf}
                disabled={isPosting}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {videoPreview && selectedVideo && (
            <div className="relative mb-3">
              <video
                src={videoPreview}
                controls
                className="rounded-lg w-full max-h-64"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemoveVideo}
                disabled={isPosting}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-2"
                  asChild
                  disabled={isPosting}
                >
                  <span className="cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    画像
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={isPosting}
                />
              </label>

              <label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-2"
                  asChild
                  disabled={isPosting}
                >
                  <span className="cursor-pointer">
                    <FileText className="w-4 h-4" />
                    PDF
                  </span>
                </Button>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handlePdfSelect}
                  disabled={isPosting}
                />
              </label>

              <label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-2"
                  asChild
                  disabled={isPosting}
                >
                  <span className="cursor-pointer">
                    <Video className="w-4 h-4" />
                    動画
                  </span>
                </Button>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoSelect}
                  disabled={isPosting}
                />
              </label>
            </div>

            <Button
              onClick={handleSubmitPost}
              disabled={isPosting || (!postContent.trim() && !selectedImage && !selectedPdf && !selectedVideo)}
              className="gap-2"
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  投稿中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  投稿
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
