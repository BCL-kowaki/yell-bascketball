"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Trophy,
  Users,
  ArrowLeft,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import {
  getCurrentUserEmail,
  getMyAllChatThreads,
  getMyTeams,
  getMyTournaments,
  getTeam,
  type DbChatThread
} from "@/lib/api"
import { refreshS3Url } from "@/lib/storage"

export default function MessagesPage() {
  const router = useRouter()
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [threads, setThreads] = useState<DbChatThread[]>([])
  // 自分が運営する大会・チームのIDセット(送信側/受信側判定用)
  const [myTournamentIds, setMyTournamentIds] = useState<Set<string>>(new Set())
  // チームIDからロゴURLへのマップ
  const [teamLogos, setTeamLogos] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    const loadData = async () => {
      try {
        const email = await getCurrentUserEmail()
        console.log('[MessagesPage] currentUserEmail:', email)
        setCurrentUserEmail(email || null)
        if (email) {
          // 自分が運営する大会IDを取得(共同運営者として参加する大会も含む)
          const myTournaments = await getMyTournaments(email)
          setMyTournamentIds(new Set(myTournaments.map(t => t.id)))

          const allThreads = await getMyAllChatThreads()
          console.log('[MessagesPage] allThreads:', allThreads.length, allThreads.map(t => ({ id: t.id, teamName: t.teamName, senderEmail: t.senderEmail })))
          setThreads(allThreads)

          // 各スレッドのチームロゴを取得
          const logoMap = new Map<string, string>()
          const uniqueTeamIds = [...new Set(allThreads.map(t => t.teamId))]
          await Promise.all(
            uniqueTeamIds.map(async (teamId) => {
              try {
                const team = await getTeam(teamId)
                if (team?.logoUrl) {
                  const url = await refreshS3Url(team.logoUrl)
                  if (url) logoMap.set(teamId, url)
                }
              } catch (e) {
                // ロゴ取得失敗は無視
              }
            })
          )
          setTeamLogos(logoMap)
        }
      } catch (error: any) {
        console.error('[MessagesPage] エラー:', error?.message || error)
        setCurrentUserEmail(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // ステータスバッジ
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 text-[10px] px-1.5 py-0">
            <Clock className="w-2.5 h-2.5 mr-0.5" />
            確認待ち
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 text-[10px] px-1.5 py-0">
            <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
            承認済み
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 text-[10px] px-1.5 py-0">
            <XCircle className="w-2.5 h-2.5 mr-0.5" />
            辞退
          </Badge>
        )
      default:
        return null
    }
  }

  // 相手の名前を取得(送信側か受信側か)
  // 「送信側」 = 自分が大会オーナー or 大会共同運営者(myTournamentIds に含まれる)
  // 「受信側」 = 上記以外(チーム管理者として参加)
  const getDisplayInfo = (thread: DbChatThread) => {
    const myEmailNorm = (currentUserEmail || '').toLowerCase().trim()
    const threadSenderNorm = (thread.senderEmail || '').toLowerCase().trim()
    const isSender = myTournamentIds.has(thread.tournamentId) || threadSenderNorm === myEmailNorm
    return {
      name: isSender ? thread.teamName : thread.senderName,
      subtitle: `${thread.tournamentName}`,
      unreadCount: isSender ? (thread.senderUnreadCount || 0) : (thread.teamUnreadCount || 0),
      role: isSender ? "送信" : "受信",
    }
  }

  // 時刻のフォーマット
  const formatTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return "昨日"
    } else if (days < 7) {
      return `${days}日前`
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
    }
  }

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
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">メッセージ</h1>
          <p className="text-gray-500 mb-6">メッセージ機能を利用するにはログインが必要です。</p>
          <div className="flex justify-center gap-3">
            <Link href="/login">
              <Button className="bg-brand-gradient hover:opacity-90 text-white">ログイン</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">新規登録</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">メッセージ</h1>
        </div>

        {/* 説明バナー */}
        <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 border-b border-gray-100">
          <div className="flex items-start gap-2">
            <Trophy className="w-4 h-4 text-[#e84b8a] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600">
              大会運営者からのオファーや、チーム間の連絡がここに表示されます
            </p>
          </div>
        </div>

        {/* スレッド一覧 */}
        {threads.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">メッセージはありません</p>
            <p className="text-sm text-gray-500">
              大会ページからチームへオファーを送信すると、ここにスレッドが表示されます
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {threads.map((thread) => {
              const info = getDisplayInfo(thread)
              return (
                <button
                  key={thread.id}
                  onClick={() => router.push(`/messages/${thread.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  {/* アバター（チームアイコン） */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-14 h-14">
                      {teamLogos.get(thread.teamId) ? (
                        <AvatarImage src={teamLogos.get(thread.teamId)} alt={thread.teamName} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-[#e84b8a] to-[#f4a261] text-white font-bold text-lg">
                        {thread.teamName?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {info.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {info.unreadCount > 99 ? "99+" : info.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* 情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className={`text-[15px] truncate ${info.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {info.name}
                        </p>
                        {getStatusBadge(thread.status)}
                      </div>
                      <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                        {formatTime(thread.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Trophy className="w-3 h-3 text-[#e84b8a] flex-shrink-0" />
                      <p className="text-[11px] text-[#e84b8a] truncate">{info.subtitle}</p>
                    </div>
                    <p className={`text-[13px] truncate ${info.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {thread.lastMessage || "メッセージなし"}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
