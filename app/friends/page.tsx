"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus, Users, UserCheck, UserX, MessageCircle } from "lucide-react"
import Navigation from "@/components/navigation"

interface User {
  id: string
  name: string
  avatar: string
  mutualFriends: number
  status: "friend" | "pending" | "suggested" | "blocked"
  isOnline: boolean
  lastSeen?: string
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Mock data for friends
  const friends: User[] = [
    {
      id: "1",
      name: "田中太郎",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualFriends: 12,
      status: "friend",
      isOnline: true,
    },
    {
      id: "2",
      name: "佐藤花子",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualFriends: 8,
      status: "friend",
      isOnline: false,
      lastSeen: "2時間前",
    },
    {
      id: "3",
      name: "山田次郎",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualFriends: 15,
      status: "pending",
      isOnline: false,
      lastSeen: "1日前",
    },
    {
      id: "4",
      name: "鈴木美咲",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualFriends: 5,
      status: "suggested",
      isOnline: true,
    },
  ]

  const handleFriendAction = (userId: string, action: "add" | "accept" | "remove" | "block") => {
    console.log(`[v0] Friend action: ${action} for user ${userId}`)
    // Here you would implement the actual friend management logic
  }

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "online" && friend.isOnline) ||
      (activeTab === "requests" && friend.status === "pending") ||
      (activeTab === "suggestions" && friend.status === "suggested")
    return matchesSearch && matchesTab
  })

  const FriendCard = ({ user }: { user: User }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.isOnline ? "オンライン" : user.lastSeen}</p>
              <p className="text-xs text-gray-400">共通の友達 {user.mutualFriends}人</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {user.status === "friend" && (
              <>
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleFriendAction(user.id, "remove")}>
                  <UserX className="h-4 w-4" />
                </Button>
              </>
            )}
            {user.status === "pending" && (
              <>
                <Button
                  size="sm"
                  className="bg-facebook-blue hover:bg-facebook-blue/90"
                  onClick={() => handleFriendAction(user.id, "accept")}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  承認
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleFriendAction(user.id, "remove")}>
                  削除
                </Button>
              </>
            )}
            {user.status === "suggested" && (
              <Button
                size="sm"
                className="bg-facebook-blue hover:bg-facebook-blue/90"
                onClick={() => handleFriendAction(user.id, "add")}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                友達追加
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-facebook-blue" />
              <span>友達</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="友達を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">すべて</TabsTrigger>
                <TabsTrigger value="online">
                  オンライン
                  <Badge variant="secondary" className="ml-1">
                    {friends.filter((f) => f.isOnline).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="requests">
                  リクエスト
                  <Badge variant="secondary" className="ml-1">
                    {friends.filter((f) => f.status === "pending").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="suggestions">おすすめ</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <FriendCard key={friend.id} user={friend} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="online" className="mt-4">
                <div className="space-y-2">
                  {filteredFriends
                    .filter((f) => f.isOnline)
                    .map((friend) => (
                      <FriendCard key={friend.id} user={friend} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="requests" className="mt-4">
                <div className="space-y-2">
                  {filteredFriends
                    .filter((f) => f.status === "pending")
                    .map((friend) => (
                      <FriendCard key={friend.id} user={friend} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-4">
                <div className="space-y-2">
                  {filteredFriends
                    .filter((f) => f.status === "suggested")
                    .map((friend) => (
                      <FriendCard key={friend.id} user={friend} />
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
