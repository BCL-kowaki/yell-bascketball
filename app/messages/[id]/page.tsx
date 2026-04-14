"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Send,
  Trophy,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Users,
  Info,
  Image as ImageIcon,
  Video,
  FileText,
  X,
  Paperclip
} from "lucide-react"
import Link from "next/link"
import { Layout } from "@/components/layout"
import { refreshS3Url, uploadImageToS3, uploadVideoToS3, uploadPdfToS3 } from "@/lib/storage"
import { notifyNewChatMessage } from "@/lib/push-sender"
import {
  getCurrentUserEmail,
  getChatThread,
  getChatMessages,
  createChatMessage,
  updateChatThreadStatus,
  markChatThreadAsRead,
  getTeam,
  getPushSubscriptionsByUser,
  type DbChatThread,
  type DbChatMessage,
  type DbTeam
} from "@/lib/api"

// メディア表示コンポーネント
function MediaImage({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    refreshS3Url(url).then(u => setSrc(u))
  }, [url])
  if (!src) return <div className="w-48 h-32 bg-gray-200 animate-pulse rounded" />
  return (
    <a href={src} target="_blank" rel="noopener noreferrer">
      <img src={src} alt="画像" className="max-w-[240px] max-h-[300px] object-cover rounded-lg" />
    </a>
  )
}

function MediaVideo({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    refreshS3Url(url).then(u => setSrc(u))
  }, [url])
  if (!src) return <div className="w-48 h-32 bg-gray-200 animate-pulse rounded" />
  return (
    <video src={src} controls className="max-w-[240px] max-h-[300px] rounded-lg" />
  )
}

function MediaPdf({ url, name, isMyMsg }: { url: string; name?: string | null; isMyMsg: boolean }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    refreshS3Url(url).then(u => setSrc(u))
  }, [url])
  return (
    <a
      href={src || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-3 py-2 ${isMyMsg ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
    >
      <FileText className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm truncate max-w-[180px]">{name || 'PDF'}</span>
    </a>
  )
}

export default function ChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const threadId = params?.id as string

  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [thread, setThread] = useState<DbChatThread | null>(null)
  const [messages, setMessages] = useState<DbChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isTeamAdmin, setIsTeamAdmin] = useState(false)
  const [team, setTeam] = useState<DbTeam | null>(null)
  const [teamLogoUrl, setTeamLogoUrl] = useState<string | null>(null)
  // メディア添付用
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Enterキー2回連続送信用のタイマー
  const enterPressedRef = useRef(false)
  const enterTimerRef = useRef<NodeJS.Timeout | null>(null)

  // メッセージ一覧の末尾へスクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const email = await getCurrentUserEmail()
        setCurrentUserEmail(email || null)

        if (!email || !threadId) {
          setIsLoading(false)
          return
        }

        // スレッド情報を取得
        const threadData = await getChatThread(threadId)
        if (!threadData) {
          setIsLoading(false)
          return
        }
        setThread(threadData)

        // チーム情報を取得
        const teamData = await getTeam(threadData.teamId)
        setTeam(teamData)

        // チームロゴURLをリフレッシュ
        if (teamData?.logoUrl) {
          try {
            const url = await refreshS3Url(teamData.logoUrl)
            setTeamLogoUrl(url)
          } catch { /* ロゴ取得失敗は無視 */ }
        }

        // チーム管理者かチェック（ownerEmail + editorEmails統合）
        if (teamData) {
          const adminEmails = new Set<string>()
          if (teamData.ownerEmail) adminEmails.add(teamData.ownerEmail)
          if (teamData.editorEmails) teamData.editorEmails.forEach((e: string) => { if (e) adminEmails.add(e) })
          setIsTeamAdmin(adminEmails.has(email))
        }

        // メッセージ一覧を取得
        const msgs = await getChatMessages(threadId)
        setMessages(msgs)

        // 未読をリセット
        await markChatThreadAsRead(threadId)
      } catch (error) {
        console.error('Failed to load chat:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [threadId])

  // メッセージ更新時にスクロール
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // メディアファイル選択ハンドラー
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // 他のメディアをクリア
    clearMedia()
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    clearMedia()
    setSelectedVideo(file)
    setVideoPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    clearMedia()
    setSelectedPdf(file)
    e.target.value = ''
  }

  const clearMedia = () => {
    setSelectedImage(null)
    setSelectedVideo(null)
    setSelectedPdf(null)
    setImagePreview(null)
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoPreview(null)
  }

  const hasMedia = selectedImage || selectedVideo || selectedPdf

  // メッセージ送信
  const handleSend = async () => {
    if ((!newMessage.trim() && !hasMedia) || !thread || !currentUserEmail || isSending) return

    setIsSending(true)
    try {
      let imageUrl: string | undefined
      let videoUrl: string | undefined
      let pdfUrl: string | undefined
      let pdfName: string | undefined
      let messageType = 'text'

      // メディアアップロード
      if (selectedImage) {
        setUploadProgress('画像をアップロード中...')
        const s3Key = await uploadImageToS3(selectedImage)
        imageUrl = s3Key
        messageType = 'image'
      } else if (selectedVideo) {
        setUploadProgress('動画をアップロード中...')
        const s3Key = await uploadVideoToS3(selectedVideo)
        videoUrl = s3Key
        messageType = 'video'
      } else if (selectedPdf) {
        setUploadProgress('PDFをアップロード中...')
        const s3Key = await uploadPdfToS3(selectedPdf)
        pdfUrl = s3Key
        pdfName = selectedPdf.name
        messageType = 'pdf'
      }

      setUploadProgress(null)

      const content = newMessage.trim() || (messageType === 'image' ? '📷 画像' : messageType === 'video' ? '🎬 動画' : messageType === 'pdf' ? '📄 PDF' : '')

      const msg = await createChatMessage({
        threadId: thread.id,
        content,
        messageType,
        imageUrl,
        videoUrl,
        pdfUrl,
        pdfName,
      })
      setMessages(prev => [...prev, msg])

      // プッシュ通知: チャット参加者全員に通知（自分以外）
      // 大会管理者（送信者側）+ チーム管理者（受信側）全員が通知対象
      if (thread && currentUserEmail) {
        // チーム管理者全員を取得（ownerEmail + editorEmails統合）
        const teamAdmins: string[] = []
        if (team) {
          if (team.ownerEmail) teamAdmins.push(team.ownerEmail)
          if (team.editorEmails) teamAdmins.push(...team.editorEmails.filter(Boolean) as string[])
        }
        // 大会管理者を取得するために送信者も含める
        const allParticipants = [...new Set([thread.senderEmail, ...teamAdmins])]
        const filteredRecipients = allParticipants.filter(e => e !== currentUserEmail)
        notifyNewChatMessage(
          filteredRecipients,
          thread.senderName || '送信者',
          content,
          thread.id
        ).catch((err) => console.error('通知送信エラー:', err))
      }

      setNewMessage("")
      clearMedia()
      // テキストエリアの高さをリセット
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setUploadProgress(null)
    } finally {
      setIsSending(false)
    }
  }

  // オファー承認/辞退
  const handleStatusUpdate = async (status: 'accepted' | 'rejected') => {
    if (!thread) return
    try {
      const updated = await updateChatThreadStatus(thread.id, status)
      setThread(updated)
      // メッセージ一覧を再取得（システムメッセージが追加される）
      const msgs = await getChatMessages(thread.id)
      setMessages(msgs)
    } catch (error: any) {
      console.error('Failed to update status:', error)
    }
  }

  // 時刻フォーマット
  const formatMessageTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  // 日付ヘッダー用
  const formatDateHeader = (dateStr: string | null | undefined) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "今日"
    if (date.toDateString() === yesterday.toDateString()) return "昨日"
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // メッセージ間に日付区切りを表示するか
  const shouldShowDateHeader = (current: DbChatMessage, index: number) => {
    if (index === 0) return true
    const prev = messages[index - 1]
    if (!current.createdAt || !prev.createdAt) return false
    const currentDate = new Date(current.createdAt).toDateString()
    const prevDate = new Date(prev.createdAt).toDateString()
    return currentDate !== prevDate
  }

  // 自分のメッセージかどうか
  const isMyMessage = (msg: DbChatMessage) => msg.senderEmail === currentUserEmail

  // ステータスバッジ
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            確認待ち
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            承認済み
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            辞退
          </Badge>
        )
      default:
        return null
    }
  }

  // 送信可能かどうか（辞退されたスレッドではメッセージ送信不可）
  const canSendMessage = thread?.status !== 'rejected'

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </Layout>
    )
  }

  if (!currentUserEmail) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">ログインが必要です</p>
          <Link href="/login">
            <Button className="mt-4 bg-brand-gradient hover:opacity-90 text-white">ログイン</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  if (!thread) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">スレッドが見つかりません</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/messages')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            メッセージ一覧へ
          </Button>
        </div>
      </Layout>
    )
  }

  const isSender = thread.senderEmail === currentUserEmail
  const otherName = isSender ? thread.teamName : thread.senderName

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5]">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-3 py-2.5">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 -ml-1"
            onClick={() => router.push('/messages')}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>

          <Avatar className="w-10 h-10 flex-shrink-0">
            {teamLogoUrl && <AvatarImage src={teamLogoUrl} alt={otherName || ""} />}
            <AvatarFallback className="bg-gradient-to-br from-[#e84b8a] to-[#f4a261] text-white font-bold">
              {otherName?.[0] || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] text-gray-900 truncate">{otherName}</p>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-[#e84b8a] flex-shrink-0" />
              <p className="text-[11px] text-gray-500 truncate">{thread.tournamentName}</p>
            </div>
          </div>

          {getStatusBadge(thread.status)}
        </div>
      </div>

      {/* オファー情報バナー */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              <strong>{thread.senderName}</strong> が <strong>{thread.teamName}</strong> に
              <Link href={`/tournaments`} className="text-[#e84b8a] hover:underline ml-1">
                {thread.tournamentName}
              </Link>
              への参加オファーを送信
            </span>
          </div>
        </div>
      </div>

      {/* オファー承認/辞退ボタン（チーム運営者かつ未回答の場合のみ表示） */}
      {isTeamAdmin && !isSender && thread.status === 'pending' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <p className="text-sm text-gray-700 mb-2 font-medium">このオファーに回答してください</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={() => handleStatusUpdate('accepted')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                承認する
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => handleStatusUpdate('rejected')}
              >
                <XCircle className="w-4 h-4 mr-1" />
                辞退する
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-3 py-4 space-y-1">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">メッセージはまだありません</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={msg.id}>
                {/* 日付区切り */}
                {shouldShowDateHeader(msg, index) && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-200/80 text-gray-500 text-[11px] px-3 py-1 rounded-full">
                      {formatDateHeader(msg.createdAt)}
                    </div>
                  </div>
                )}

                {/* システムメッセージ */}
                {msg.messageType === 'system' ? (
                  <div className="flex items-center justify-center my-3">
                    <div className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full border border-blue-100">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  /* 通常メッセージ（LINE/iMessage風） */
                  <div className={`flex ${isMyMessage(msg) ? 'justify-end' : 'justify-start'} mb-1`}>
                    <div className={`flex items-end gap-1.5 max-w-[80%] ${isMyMessage(msg) ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* 相手のメッセージにはアバター表示 */}
                      {!isMyMessage(msg) && (
                        <Avatar className="w-7 h-7 flex-shrink-0 mb-4">
                          <AvatarFallback className="text-[10px] bg-gray-300 text-white">
                            {msg.senderName?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`${isMyMessage(msg) ? 'items-end' : 'items-start'} flex flex-col`}>
                        {/* 送信者名（相手のメッセージのみ、連続メッセージの場合は非表示） */}
                        {!isMyMessage(msg) && (index === 0 || messages[index - 1].senderEmail !== msg.senderEmail || messages[index - 1].messageType === 'system') && (
                          <p className="text-[11px] text-gray-500 mb-0.5 ml-1">{msg.senderName}</p>
                        )}

                        {/* メッセージ吹き出し */}
                        <div
                          className={`rounded-2xl overflow-hidden ${
                            isMyMessage(msg)
                              ? 'bg-[#e84b8a] text-white rounded-br-md'
                              : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                          } ${msg.imageUrl || msg.videoUrl ? '' : 'px-3 py-2'}`}
                        >
                          {/* 画像メッセージ */}
                          {msg.imageUrl && (
                            <MediaImage url={msg.imageUrl} />
                          )}
                          {/* 動画メッセージ */}
                          {msg.videoUrl && (
                            <MediaVideo url={msg.videoUrl} />
                          )}
                          {/* PDFメッセージ */}
                          {msg.pdfUrl && (
                            <MediaPdf url={msg.pdfUrl} name={msg.pdfName} isMyMsg={isMyMessage(msg)} />
                          )}
                          {/* テキスト（メディアがある場合はキャプション表示） */}
                          {msg.content && !(msg.content === '📷 画像' || msg.content === '🎬 動画' || msg.content === '📄 PDF') && (
                            <p className={`text-[14px] leading-relaxed whitespace-pre-wrap break-words ${msg.imageUrl || msg.videoUrl ? 'px-3 py-2' : ''}`}>{msg.content}</p>
                          )}
                        </div>

                        {/* 時刻 */}
                        <p className={`text-[10px] mt-0.5 mx-1 ${isMyMessage(msg) ? 'text-gray-400' : 'text-gray-400'}`}>
                          {formatMessageTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 隠しファイル入力 */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
      <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfSelect} />

      {/* メッセージ入力エリア */}
      {canSendMessage ? (
        <div className="sticky bottom-0 bg-white border-t border-gray-200">
          <div className="max-w-2xl mx-auto px-3 py-2">
            {/* アップロード進捗 */}
            {uploadProgress && (
              <div className="flex items-center gap-2 px-3 py-1.5 mb-1 text-xs text-[#e84b8a]">
                <Loader2 className="w-3 h-3 animate-spin" />
                {uploadProgress}
              </div>
            )}

            {/* メディアプレビュー */}
            {hasMedia && (
              <div className="relative mb-2 px-1">
                {imagePreview && (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="プレビュー" className="h-20 rounded-lg object-cover" />
                    <button onClick={clearMedia} className="absolute -top-1.5 -right-1.5 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {videoPreview && (
                  <div className="relative inline-block">
                    <video src={videoPreview} className="h-20 rounded-lg" />
                    <button onClick={clearMedia} className="absolute -top-1.5 -right-1.5 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {selectedPdf && (
                  <div className="relative inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                    <FileText className="w-5 h-5 text-red-500" />
                    <span className="text-xs text-gray-700 max-w-[150px] truncate">{selectedPdf.name}</span>
                    <button onClick={clearMedia} className="ml-1 text-gray-500 hover:text-gray-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* メディア添付ボタン群 */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-[#e84b8a] transition-colors rounded-full hover:bg-gray-100"
                  title="画像を添付"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-[#e84b8a] transition-colors rounded-full hover:bg-gray-100"
                  title="動画を添付"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button
                  onClick={() => pdfInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-[#e84b8a] transition-colors rounded-full hover:bg-gray-100"
                  title="PDFを添付"
                >
                  <FileText className="w-5 h-5" />
                </button>
              </div>

              <Textarea
                ref={textareaRef}
                placeholder="メッセージを入力..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  // 自動リサイズ
                  const target = e.target
                  target.style.height = 'auto'
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                }}
                onKeyDown={(e) => {
                  // IME変換中（日本語入力確定時など）は無視
                  if (e.isComposing || e.keyCode === 229) return

                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()

                    if (enterPressedRef.current) {
                      // 2回目のEnter → 送信
                      enterPressedRef.current = false
                      if (enterTimerRef.current) {
                        clearTimeout(enterTimerRef.current)
                        enterTimerRef.current = null
                      }
                      handleSend()
                    } else {
                      // 1回目のEnter → 待機（500ms以内に2回目が来れば送信）
                      enterPressedRef.current = true
                      enterTimerRef.current = setTimeout(() => {
                        enterPressedRef.current = false
                        enterTimerRef.current = null
                      }, 500)
                    }
                  }
                }}
                className="flex-1 min-h-[40px] max-h-[120px] resize-none border-gray-200 rounded-2xl bg-gray-50 focus:bg-white text-sm px-4 py-2.5"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={(!newMessage.trim() && !hasMedia) || isSending}
                className="bg-[#e84b8a] hover:bg-[#d63d7a] text-white rounded-full w-10 h-10 p-0 flex-shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-3 text-center">
            <p className="text-sm text-gray-500">このスレッドは辞退されたため、メッセージを送信できません</p>
          </div>
        </div>
      )}
    </div>
  )
}
