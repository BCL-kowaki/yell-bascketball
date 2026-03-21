"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Trophy, Users, Heart, MessageCircle, Mail, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Layout } from "@/components/layout"
import {
  getCurrentUserEmail,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type DbNotification
} from "@/lib/api"

export default function NotificationsPage() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<DbNotification[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const email = await getCurrentUserEmail()
        setCurrentUserEmail(email || null)
        if (email) {
          const notifs = await getNotifications(email)
          setNotifications(notifs)
        }
      } catch {
        setCurrentUserEmail(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    )
    await markNotificationAsRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    if (currentUserEmail) {
      await markAllNotificationsAsRead(currentUserEmail)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "tournament_update":
        return <Trophy className="h-4 w-4 text-red-500" />
      case "team_update":
        return <Users className="h-4 w-4 text-[#e84b8a]" />
      case "offer_received":
        return <Mail className="h-4 w-4 text-purple-500" />
      case "offer_accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "offer_rejected":
        return <Mail className="h-4 w-4 text-gray-400" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-[#e84b8a]" />
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationLink = (notification: DbNotification): string | undefined => {
    if (!notification.relatedId || !notification.relatedType) return undefined
    switch (notification.relatedType) {
      case "tournament":
        return `/tournaments/${notification.relatedId}`
      case "team":
        return `/teams/${notification.relatedId}`
      case "chat":
        return `/messages/${notification.relatedId}`
      default:
        return undefined
    }
  }

  // 時刻フォーマット
  const formatTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "たった今"
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !n.isRead
    if (activeTab === "favorites") return n.type === "tournament_update" || n.type === "team_update"
    if (activeTab === "offers") return n.type === "offer_received" || n.type === "offer_accepted" || n.type === "offer_rejected"
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

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
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">通知</h1>
          <p className="text-gray-500 mb-6">通知を受け取るにはログインが必要です。</p>
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
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-6 w-6 text-[#e84b8a]" />
                <span>通知</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                すべて既読
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  すべて
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread">未読</TabsTrigger>
                <TabsTrigger value="favorites">お気に入り</TabsTrigger>
                <TabsTrigger value="offers">オファー</TabsTrigger>
              </TabsList>

              {["all", "unread", "favorites", "offers"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-4">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Bell className="w-12 h-12 mx-auto mb-3" />
                      <p className="font-medium">通知はありません</p>
                      {tab === "favorites" && (
                        <p className="text-sm mt-1">
                          お気に入りの大会やチームが更新されるとここに表示されます
                        </p>
                      )}
                      {tab === "offers" && (
                        <p className="text-sm mt-1">
                          参加オファーが届くとここに表示されます
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredNotifications.map((notification) => {
                        const link = getNotificationLink(notification)
                        const content = (
                          <Card
                            className={`${!notification.isRead ? "bg-red-50 border-red-100" : ""} ${link ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="relative flex-shrink-0">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={notification.senderAvatar || "/placeholder.svg"} />
                                    <AvatarFallback className="bg-gray-200">
                                      {notification.title.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm">
                                        <span className="font-semibold text-gray-900">{notification.title}</span>
                                      </p>
                                      <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                                      <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                                    </div>
                                    {!notification.isRead && (
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="w-2 h-2 bg-brand-gradient rounded-full"></div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleMarkAsRead(notification.id)
                                          }}
                                          className="text-xs"
                                        >
                                          既読
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )

                        return link ? (
                          <Link key={notification.id} href={link} onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}>
                            {content}
                          </Link>
                        ) : (
                          <div key={notification.id}>{content}</div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* 通知の説明 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-800 mb-2">通知について</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span>お気に入り登録した<strong>大会</strong>や<strong>チーム</strong>が更新されると通知が届きます</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <span>大会主催者からの<strong>参加オファー</strong>が届くと通知されます</span>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-[#e84b8a] mt-0.5 flex-shrink-0" />
              <span>あなたの投稿への<strong>コメント</strong>や<strong>いいね</strong>が通知されます</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
