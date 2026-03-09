"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageCircle,
  Send,
  Trophy,
  Users,
  ArrowLeft,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { Layout } from "@/components/layout"
import { getCurrentUserEmail } from "@/lib/api"

// コンタクトのタイプ
type ContactType = "offer" | "inquiry"
// コンタクトのステータス
type ContactStatus = "pending" | "accepted" | "rejected"

interface ContactThread {
  id: string
  type: ContactType
  fromEmail: string
  fromName: string
  fromAvatar: string
  toEmail: string
  toName: string
  toAvatar: string
  tournamentId?: string
  tournamentName?: string
  teamId?: string
  teamName?: string
  status: ContactStatus
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  createdAt: string
}

interface ContactMessage {
  id: string
  threadId: string
  senderEmail: string
  senderName: string
  content: string
  createdAt: string
}

export default function ContactPage() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")
  const [selectedThread, setSelectedThread] = useState<ContactThread | null>(null)
  const [newMessage, setNewMessage] = useState("")

  // TODO: Replace with actual API calls when GraphQL schema is updated
  const [threads] = useState<ContactThread[]>([])
  const [messages] = useState<ContactMessage[]>([])

  useEffect(() => {
    const loadUser = async () => {
      try {
        const email = await getCurrentUserEmail()
        setCurrentUserEmail(email || null)
      } catch {
        setCurrentUserEmail(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !currentUserEmail) return
    // TODO: Implement actual message sending via GraphQL
    console.log("Sending message:", newMessage, "to thread:", selectedThread.id)
    setNewMessage("")
  }

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50"><Clock className="w-3 h-3 mr-1" />確認待ち</Badge>
      case "accepted":
        return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />承認済み</Badge>
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50"><XCircle className="w-3 h-3 mr-1" />辞退</Badge>
    }
  }

  const getTypeLabel = (type: ContactType) => {
    switch (type) {
      case "offer":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Trophy className="w-3 h-3 mr-1" />参加オファー</Badge>
      case "inquiry":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100"><Mail className="w-3 h-3 mr-1" />問い合わせ</Badge>
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
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">コンタクト</h1>
          <p className="text-gray-500 mb-6">コンタクト機能を利用するにはログインが必要です。</p>
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

  // Thread detail view
  if (selectedThread) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setSelectedThread(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            コンタクト一覧に戻る
          </Button>

          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedThread.fromAvatar} />
                    <AvatarFallback>{selectedThread.fromName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedThread.fromName}</p>
                    <div className="flex gap-2 mt-1">
                      {getTypeLabel(selectedThread.type)}
                      {getStatusBadge(selectedThread.status)}
                    </div>
                  </div>
                </div>
              </div>
              {selectedThread.tournamentName && (
                <p className="text-sm text-gray-500 mt-2">
                  大会: <Link href={`/tournaments/${selectedThread.tournamentId}`} className="text-[#e84b8a] hover:underline">{selectedThread.tournamentName}</Link>
                </p>
              )}
              {selectedThread.teamName && (
                <p className="text-sm text-gray-500 mt-1">
                  チーム: <Link href={`/teams/${selectedThread.teamId}`} className="text-[#e84b8a] hover:underline">{selectedThread.teamName}</Link>
                </p>
              )}
            </CardHeader>
          </Card>

          {/* Messages */}
          <div className="space-y-3 mb-4 min-h-[200px]">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">まだメッセージはありません</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderEmail === currentUserEmail ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      msg.senderEmail === currentUserEmail
                        ? "bg-brand-gradient text-white rounded-br-md"
                        : "bg-white text-gray-900 rounded-bl-md border border-gray-100"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderEmail === currentUserEmail ? "text-red-200" : "text-gray-500"}`}>
                      {msg.createdAt}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input - only if thread is accepted or user is the sender */}
          {(selectedThread.status === "accepted" ||
            selectedThread.fromEmail === currentUserEmail) && (
            <div className="flex gap-2">
              <Textarea
                placeholder="メッセージを入力..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 min-h-[44px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-brand-gradient hover:opacity-90 self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Layout>
    )
  }

  // Contact list view
  const receivedThreads = threads.filter(t => t.toEmail === currentUserEmail)
  const sentThreads = threads.filter(t => t.fromEmail === currentUserEmail)

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">コンタクト</h1>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-2">コンタクトの仕組み</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start gap-2">
              <Trophy className="w-4 h-4 text-[#e84b8a] mt-0.5 flex-shrink-0" />
              <span><strong>大会主催者</strong>は、登録チームに参加オファーを送ることができます</span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <span><strong>チーム</strong>は、オファーを承認した後に大会主催者へ問い合わせができます</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>オファーが欲しい場合は、<Link href="/teams/create" className="text-[#e84b8a] hover:underline">チーム登録</Link>を行ってください</span>
            </li>
          </ul>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "received" | "sent")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="received">
              受信
              {receivedThreads.filter(t => t.unreadCount > 0).length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0">
                  {receivedThreads.filter(t => t.unreadCount > 0).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">送信済み</TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            {receivedThreads.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-3" />
                <p className="font-medium">受信したコンタクトはありません</p>
                <p className="text-sm mt-1">大会主催者からのオファーがここに表示されます</p>
              </div>
            ) : (
              <div className="space-y-2">
                {receivedThreads.map((thread) => (
                  <Card
                    key={thread.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedThread(thread)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={thread.fromAvatar} />
                          <AvatarFallback>{thread.fromName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">{thread.fromName}</p>
                            <span className="text-xs text-gray-500">{thread.lastMessageAt}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeLabel(thread.type)}
                            {getStatusBadge(thread.status)}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{thread.lastMessage}</p>
                        </div>
                        {thread.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs px-1.5 rounded-full">
                            {thread.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent">
            {sentThreads.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Send className="w-12 h-12 mx-auto mb-3" />
                <p className="font-medium">送信したコンタクトはありません</p>
                <p className="text-sm mt-1">大会ページからチームへオファーを送ることができます</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sentThreads.map((thread) => (
                  <Card
                    key={thread.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedThread(thread)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={thread.toAvatar} />
                          <AvatarFallback>{thread.toName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">{thread.toName}</p>
                            <span className="text-xs text-gray-500">{thread.lastMessageAt}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeLabel(thread.type)}
                            {getStatusBadge(thread.status)}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{thread.lastMessage}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
