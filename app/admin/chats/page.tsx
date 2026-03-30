"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle, ArrowLeft, Search, Loader2, ShieldAlert,
  Trash2, ChevronDown, ChevronUp, Mail, Clock, Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  isSystemAdmin, adminListAllChatThreads,
  type DbChatThread
} from "@/lib/api"

export default function AdminChatsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [threads, setThreads] = useState<DbChatThread[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    const load = async () => {
      const admin = await isSystemAdmin()
      if (!admin) { setIsAdmin(false); setIsLoading(false); return }
      setIsAdmin(true)
      try {
        const data = await adminListAllChatThreads()
        // 最新順
        data.sort((a, b) => (b.lastMessageAt || b.createdAt || '').localeCompare(a.lastMessageAt || a.createdAt || ''))
        setThreads(data)
      } catch (e) { console.error(e) }
      setIsLoading(false)
    }
    load()
  }, [])

  const filteredThreads = threads.filter(t => {
    if (filterStatus === "unread" && (t.teamUnreadCount || 0) + (t.senderUnreadCount || 0) === 0) return false
    if (filterStatus === "active" && t.status !== "active") return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      t.senderEmail?.toLowerCase().includes(q) ||
      t.senderName?.toLowerCase().includes(q) ||
      t.teamName?.toLowerCase().includes(q) ||
      t.tournamentName?.toLowerCase().includes(q) ||
      t.lastMessage?.toLowerCase().includes(q)
    )
  })

  const unreadCount = threads.filter(t => (t.teamUnreadCount || 0) + (t.senderUnreadCount || 0) > 0).length
  const activeCount = threads.filter(t => t.status === "active").length

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (d?: string | null) => {
    if (!d) return '-'
    const date = new Date(d)
    return date.toLocaleDateString('ja-JP') + ' ' + date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return { label: '進行中', color: 'text-green-600 border-green-300 bg-green-50' }
      case 'closed': return { label: '終了', color: 'text-gray-500 border-gray-300 bg-gray-50' }
      case 'declined': return { label: '辞退', color: 'text-red-500 border-red-300 bg-red-50' }
      default: return { label: status || '不明', color: 'text-gray-500 border-gray-300' }
    }
  }

  if (isLoading) return <Layout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div></Layout>
  if (!isAdmin) return <Layout><div className="max-w-2xl mx-auto px-4 py-16 text-center"><ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" /><h1 className="text-2xl font-bold mb-2">アクセス権限がありません</h1></div></Layout>

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-2 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />管理者パネル</Button></Link>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            <h1 className="text-xl font-bold">チャット管理</h1>
            <Badge variant="secondary">{threads.length}件</Badge>
            {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}件未読あり</Badge>}
          </div>
        </div>

        {/* フィルタータブ */}
        <div className="flex gap-2 mb-3">
          {[
            { key: "all", label: "すべて" },
            { key: "unread", label: `未読あり (${unreadCount})` },
            { key: "active", label: `進行中 (${activeCount})` },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterStatus === f.key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >{f.label}</button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="送信者・チーム名・大会名・メッセージで検索..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        <div className="space-y-2">
          {filteredThreads.map(t => {
            const totalUnread = (t.teamUnreadCount || 0) + (t.senderUnreadCount || 0)
            const statusInfo = getStatusLabel(t.status)
            return (
              <Card key={t.id} className={`overflow-hidden ${totalUnread > 0 ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'}`}>
                <button onClick={() => toggleExpand(t.id)} className="w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{t.senderName || t.senderEmail}</span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className="text-sm text-gray-600 truncate">{t.teamName}</span>
                      <Badge variant="outline" className={`text-[10px] px-1 py-0 ${statusInfo.color}`}>{statusInfo.label}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {t.tournamentName && `${t.tournamentName} | `}
                      {t.lastMessage || 'メッセージなし'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    {totalUnread > 0 && (
                      <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 mb-0.5">{totalUnread}未読</Badge>
                    )}
                    <p className="text-[10px] text-gray-400">{formatDate(t.lastMessageAt || t.createdAt)}</p>
                  </div>
                  {expandedId === t.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {expandedId === t.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs font-medium text-gray-500">送信者</span>
                        <p className="text-gray-900">{t.senderName}</p>
                        <p className="text-xs text-gray-500">{t.senderEmail}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">チーム</span>
                        <p className="text-gray-900">{t.teamName}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">大会</span>
                        <p className="text-gray-900">{t.tournamentName || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">タイプ</span>
                        <p className="text-gray-900">{t.threadType === 'offer' ? 'オファー' : t.threadType || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">ステータス</span>
                        <p className="text-gray-900">{statusInfo.label}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">作成日</span>
                        <p className="text-gray-900">{formatDate(t.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">チーム側未読</span>
                        <p className="text-gray-900">{t.teamUnreadCount || 0}件</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">送信者側未読</span>
                        <p className="text-gray-900">{t.senderUnreadCount || 0}件</p>
                      </div>
                    </div>
                    {t.lastMessage && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs font-medium text-gray-500">最新メッセージ</span>
                        <p className="text-sm text-gray-800 bg-white rounded-lg p-2 mt-1">{t.lastMessage}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(t.lastMessageAt)}</p>
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 pt-1">
                      ID: {t.id}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {filteredThreads.length === 0 && (
          <div className="text-center py-12 text-gray-500">{searchQuery ? '検索結果が見つかりません' : 'チャットがありません'}</div>
        )}
      </div>
    </Layout>
  )
}
