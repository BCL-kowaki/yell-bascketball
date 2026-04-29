"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, Send, Loader2, FileText, Video, X } from "lucide-react"
import { createPost as createDbPost, updatePost, type DbPost } from "@/lib/api"
import { uploadImageToS3, uploadPdfToS3, uploadVideoToS3 } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

// ファイルサイズ上限(バイト)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_PDF_SIZE = 500 * 1024 * 1024 // 500MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500MB

type TournamentPostFormProps = {
  currentUserEmail: string
  currentUserName: string
  currentUserAvatar?: string
  tournamentId: string
  isAdmin: boolean // オーナーまたは共同管理者かどうか
  onPostCreated: () => void
  // 編集モード用
  editingPost?: DbPost | null
  onCancelEdit?: () => void
}

export function TournamentPostForm({
  currentUserEmail,
  currentUserName,
  currentUserAvatar,
  tournamentId,
  isAdmin,
  onPostCreated,
  editingPost,
  onCancelEdit,
}: TournamentPostFormProps) {
  const { toast } = useToast()
  const isEditMode = !!editingPost
  const [postContent, setPostContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [pdfNameOnly, setPdfNameOnly] = useState<string | null>(null) // 既存PDFのファイル名表示用
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)

  // 編集モード切り替え時に既存値を反映
  useEffect(() => {
    if (editingPost) {
      setPostContent(editingPost.content || "")
      setImagePreview(editingPost.imageUrl || null)
      setVideoPreview(editingPost.videoUrl || null)
      setPdfNameOnly(editingPost.pdfName || null)
      // 新規ファイルはクリア(既存ファイル維持)
      setSelectedImage(null)
      setSelectedPdf(null)
      setSelectedVideo(null)
    } else {
      // 新規投稿モード
      setPostContent("")
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedPdf(null)
      setPdfNameOnly(null)
      setSelectedVideo(null)
      setVideoPreview(null)
    }
  }, [editingPost])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          title: "ファイルサイズエラー",
          description: `画像は${MAX_IMAGE_SIZE / 1024 / 1024}MB以下にしてください`,
          variant: "destructive",
        })
        return
      }
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
      if (file.size > MAX_PDF_SIZE) {
        toast({
          title: "ファイルサイズエラー",
          description: `PDFは${MAX_PDF_SIZE / 1024 / 1024}MB以下にしてください`,
          variant: "destructive",
        })
        return
      }
      setSelectedPdf(file)
      setPdfNameOnly(null) // 既存PDF名を上書き表示
    }
  }

  const handleRemovePdf = () => {
    setSelectedPdf(null)
    setPdfNameOnly(null)
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > MAX_VIDEO_SIZE) {
        toast({
          title: "ファイルサイズエラー",
          description: `動画は${MAX_VIDEO_SIZE / 1024 / 1024}MB以下にしてください`,
          variant: "destructive",
        })
        return
      }
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
    const hasContent =
      postContent.trim() ||
      selectedImage ||
      selectedPdf ||
      selectedVideo ||
      (isEditMode && (imagePreview || pdfNameOnly || videoPreview))
    if (!hasContent) {
      toast({
        title: "エラー",
        description: "投稿内容またはファイルを入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setIsPosting(true)

      // 既存値ベースに、新規ファイルがあれば差し替え
      let imageUrl: string | null | undefined = isEditMode ? editingPost?.imageUrl : null
      let pdfUrl: string | null | undefined = isEditMode ? editingPost?.pdfUrl : null
      let pdfName: string | null | undefined = isEditMode ? editingPost?.pdfName : null
      let videoUrl: string | null | undefined = isEditMode ? editingPost?.videoUrl : null
      let videoName: string | null | undefined = isEditMode ? editingPost?.videoName : null

      // 画像
      if (selectedImage) {
        imageUrl = await uploadImageToS3(selectedImage, `tournament-${tournamentId}`)
      } else if (isEditMode && !imagePreview) {
        // プレビューが消えている = 削除
        imageUrl = null
      }

      // PDF
      if (selectedPdf) {
        pdfUrl = await uploadPdfToS3(selectedPdf, `tournament-${tournamentId}`)
        pdfName = selectedPdf.name
      } else if (isEditMode && !pdfNameOnly) {
        pdfUrl = null
        pdfName = null
      }

      // 動画
      if (selectedVideo) {
        videoUrl = await uploadVideoToS3(selectedVideo, `tournament-${tournamentId}`)
        videoName = selectedVideo.name
      } else if (isEditMode && !videoPreview) {
        videoUrl = null
        videoName = null
      }

      if (isEditMode && editingPost) {
        // 既存投稿を更新
        await updatePost(editingPost.id, {
          content: postContent,
          imageUrl: imageUrl ?? null,
          pdfUrl: pdfUrl ?? null,
          pdfName: pdfName ?? null,
          videoUrl: videoUrl ?? null,
          videoName: videoName ?? null,
        })
        toast({
          title: "投稿を更新しました",
        })
      } else {
        // 新規作成
        await createDbPost({
          content: postContent,
          imageUrl: imageUrl || undefined,
          pdfUrl: pdfUrl || undefined,
          pdfName: pdfName || undefined,
          videoUrl: videoUrl || undefined,
          videoName: videoName || undefined,
          authorEmail: currentUserEmail,
          tournamentId: tournamentId,
          likesCount: 0,
          commentsCount: 0,
        })
        toast({
          title: "投稿しました",
          description: "投稿が正常に作成されました",
        })
      }

      // フォームをリセット
      setPostContent("")
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedPdf(null)
      setPdfNameOnly(null)
      setSelectedVideo(null)
      setVideoPreview(null)

      // 親コンポーネントに通知
      onPostCreated()
      onCancelEdit?.()
    } catch (error: any) {
      console.error("Failed to save post:", error)
      toast({
        title: "エラー",
        description: isEditMode ? "投稿の更新に失敗しました" : "投稿の作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="bg-card rounded-lg shadow p-4 mb-4">
      {isEditMode && (
        <div className="mb-3 flex items-center justify-between gap-2 px-3 py-2 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-blue-700">投稿を編集中</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancelEdit}
            disabled={isPosting}
            className="text-blue-700 hover:text-blue-900 h-7"
          >
            キャンセル
          </Button>
        </div>
      )}
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

          {(selectedPdf || pdfNameOnly) && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  {selectedPdf?.name || pdfNameOnly}
                </span>
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

          {videoPreview && (
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

          <p className="text-xs text-muted-foreground mb-2">
            添付可能: 画像 (最大{MAX_IMAGE_SIZE / 1024 / 1024}MB) / PDF (最大
            {MAX_PDF_SIZE / 1024 / 1024}MB) / 動画 (最大{MAX_VIDEO_SIZE / 1024 / 1024}MB)
          </p>

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
              disabled={isPosting}
              className="gap-2"
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditMode ? "更新中..." : "投稿中..."}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {isEditMode ? "更新" : "投稿"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
