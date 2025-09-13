"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Heart, MessageCircle, UserPlus, Users, Calendar, Settings, Check, X } from "lucide-react"
import Navigation from "@/components/navigation"

interface Notification {
  id: string
  type: "like" | "comment" | "friend_request" | "friend_accept" | "mention" | "event" | "group"
  title: string
  message: string
  avatar: string
  timestamp: string
  isRead: boolean
  actionable?: boolean
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "like",
      title: "田中太郎",
      message: "があなたの投稿にいいねしました",
      avatar: "/placeholder.svg?height=40&width=40",
      timestamp: "5分前",
      isRead: false,
    },
    {
      id: "2",
      type: "comment",
      title: "佐藤花子",
      message: "があなたの投稿にコメントしました: 「素晴らしい写真ですね！」",
      avatar: "/placeholder.svg?height=40&width=40",
      timestamp: "15分前",
      isRead: false,
    },
    {
      id: "3",
      type: "friend_request",
      title: "山田次郎",
      message: "から友達リクエストが届いています",
      avatar: "/placeholder.svg?height=40&width=40",
      timestamp: "1時間前",
      isRead: false,
      actionable: true,
    },
    {
      id: "4",
      type: "friend_accept",
      title: "鈴木美咲",
      message: "があなたの友達リクエストを承認しました",
      avatar: "/placeholder.svg?height=40&width=40",
      timestamp: "2時間前",
      isRead: true,
    },
    {
      id: "5",
      type: "mention",
      title: "高橋健太",
      message: "があなたを投稿でメンションしました",
      avatar: "/placeholder.svg?height=40&width=40",
      timestamp: "3時間前",
      isRead: true,
    },
    {
      id: "6",
      type: "event",
      title: "イベント通知",
      message: "「技術勉強会」が明日開催されます",
      avatar: "/placeholder.svg?height=40&width=40",
      timestamp: "1日前",
      isRead: true,
    },
  ])

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)))
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  const handleFriendAction = (notificationId: string, action: "accept" | "decline") => {
    console.log(`[v0] Friend request ${action} for notification ${notificationId}`)
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "friend_request":
      case "friend_accept":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "mention":
        return <MessageCircle className="h-4 w-4 text-purple-500" />
      case "event":
        return <Calendar className="h-4 w-4 text-orange-500" />
      case "group":
        return <Users className="h-4 w-4 text-indigo-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notif.isRead
    if (activeTab === "friends") return notif.type === "friend_request" || notif.type === "friend_accept"
    if (activeTab === "interactions")
      return notif.type === "like" || notif.type === "comment" || notif.type === "mention"
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card className={`mb-3 ${!notification.isRead ? "bg-blue-50 border-blue-200" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={notification.avatar || "/placeholder.svg"} alt={notification.title} />
              <AvatarFallback>{notification.title.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
              {getNotificationIcon(notification.type)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-gray-900">{notification.title}</span>
                  <span className="text-gray-600">{notification.message}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
              </div>

              {!notification.isRead && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-facebook-blue rounded-full"></div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-xs"
                  >
                    既読
                  </Button>
                </div>
              )}
            </div>

            {notification.actionable && notification.type === "friend_request" && (
              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  className="bg-facebook-blue hover:bg-facebook-blue/90"
                  onClick={() => handleFriendAction(notification.id, "accept")}
                >
                  <Check className="h-4 w-4 mr-1" />
                  承認
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleFriendAction(notification.id, "decline")}>
                  <X className="h-4 w-4 mr-1" />
                  削除
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-6 w-6 text-facebook-blue" />
                <span>通知</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                  すべて既読
                </Button>
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  すべて
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread">未読</TabsTrigger>
                <TabsTrigger value="friends">友達</TabsTrigger>
                <TabsTrigger value="interactions">反応</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="unread" className="mt-4">
                <div className="space-y-2">
                  {filteredNotifications
                    .filter((n) => !n.isRead)
                    .map((notification) => (
                      <NotificationCard key={notification.id} notification={notification} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="friends" className="mt-4">
                <div className="space-y-2">
                  {filteredNotifications
                    .filter((n) => n.type === "friend_request" || n.type === "friend_accept")
                    .map((notification) => (
                      <NotificationCard key={notification.id} notification={notification} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="interactions" className="mt-4">
                <div className="space-y-2">
                  {filteredNotifications
                    .filter((n) => n.type === "like" || n.type === "comment" || n.type === "mention")
                    .map((notification) => (
                      <NotificationCard key={notification.id} notification={notification} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  )
}
