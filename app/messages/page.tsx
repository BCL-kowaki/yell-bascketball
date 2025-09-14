"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, MessageCircle, Send, Phone, Video, MoreHorizontal, Plus, Home, ArrowLeft, Menu, ChevronLeft } from "lucide-react"
import Link from "next/link"

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline: boolean
  isGroup?: boolean
}

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  isOwn: boolean
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [showConversationList, setShowConversationList] = useState(true)

  // Mock data for conversations
  const conversations: Conversation[] = [
    {
      id: "1",
      name: "田中太郎",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "今度一緒に映画を見に行きませんか？",
      timestamp: "5分前",
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: "2",
      name: "佐藤花子",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "写真ありがとうございます！",
      timestamp: "1時間前",
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: "3",
      name: "開発チーム",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "山田: 明日のミーティングの件で...",
      timestamp: "2時間前",
      unreadCount: 5,
      isOnline: true,
      isGroup: true,
    },
    {
      id: "4",
      name: "鈴木美咲",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "お疲れ様でした！",
      timestamp: "1日前",
      unreadCount: 0,
      isOnline: false,
    },
  ]

  // Mock data for messages
  const messages: Message[] = [
    {
      id: "1",
      senderId: "1",
      senderName: "田中太郎",
      content: "こんにちは！元気ですか？",
      timestamp: "10:30",
      isOwn: false,
    },
    {
      id: "2",
      senderId: "me",
      senderName: "あなた",
      content: "こんにちは！元気です。ありがとうございます。",
      timestamp: "10:32",
      isOwn: true,
    },
    {
      id: "3",
      senderId: "1",
      senderName: "田中太郎",
      content: "今度一緒に映画を見に行きませんか？",
      timestamp: "10:35",
      isOwn: false,
    },
    {
      id: "4",
      senderId: "me",
      senderName: "あなた",
      content: "いいですね！どんな映画を見たいですか？",
      timestamp: "10:37",
      isOwn: true,
    },
  ]

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log(`[v0] Sending message: ${newMessage}`)
      setNewMessage("")
      // Here you would implement the actual message sending logic
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId)
    setShowConversationList(false) // モバイルではチャット画面に切り替え
  }

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => (
    <div
      className={`p-3 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        selectedConversation === conversation.id ? "bg-orange-50 border-r-4 border-r-orange-500 md:border-l-4 md:border-l-orange-500 md:border-r-0" : ""
      }`}
      onClick={() => handleConversationSelect(conversation.id)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="h-11 w-11 md:h-12 md:w-12">
            <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-medium">
              {conversation.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {conversation.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-orange-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-gray-900 truncate text-sm md:text-base">
              {conversation.name}
              {conversation.isGroup && (
                <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0.5">
                  グループ
                </Badge>
              )}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0">{conversation.timestamp}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate flex-1 mr-2">{conversation.lastMessage}</p>
            {conversation.unreadCount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-500 min-w-[18px] h-5 text-xs px-1.5 rounded-full">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const MessageBubble = ({ message }: { message: Message }) => (
    <div className={`flex ${message.isOwn ? "justify-end" : "justify-start"} mb-3 px-4`}>
      <div
        className={`max-w-[75%] md:max-w-xs lg:max-w-md px-3 py-2 rounded-2xl shadow-sm ${
          message.isOwn 
            ? "bg-orange-500 text-white rounded-br-md" 
            : "bg-white text-gray-900 rounded-bl-md border border-gray-100"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-1 ${message.isOwn ? "text-orange-100" : "text-gray-500"}`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  )

  const selectedConv = conversations.find(c => c.id === selectedConversation)

  return (
    <div className="min-h-screen bg-gray-100 md:bg-gray-50">
      {/* Mobile Header - Shows different content based on current view */}
      <div className="bg-white border-b border-gray-200 p-3 md:p-4 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Mobile: Show back button when in chat view */}
          <div className="flex items-center space-x-3 md:space-x-0">
            {!showConversationList && selectedConv && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConversationList(true)}
                className="md:hidden p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            
            {/* Desktop: Always show logo */}
            <Link 
              href="/" 
              className="font-serif text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              YeLL
            </Link>
            
            {/* Mobile: Show conversation name in chat view */}
            {!showConversationList && selectedConv && (
              <div className="flex items-center space-x-2 md:hidden">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedConv.avatar} alt={selectedConv.name} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-sm">
                    {selectedConv.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium text-gray-900 text-sm">{selectedConv.name}</h2>
                  <p className="text-xs text-orange-500">{selectedConv.isOnline ? 'オンライン' : 'オフライン'}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile: Show chat actions when in chat view */}
            {!showConversationList && selectedConv && (
              <div className="flex space-x-1 md:hidden">
                <Button size="sm" variant="ghost" className="p-2">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="p-2">
                  <Video className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="p-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Desktop: Always show home button */}
            <Link href="/" className="text-gray-600 hover:text-gray-900 hidden md:block">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] pt-16 md:pt-20">
        {/* Conversations List */}
        <div className={`${
          showConversationList ? 'block' : 'hidden'
        } md:block w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col`}>
          <div className="p-3 md:p-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h1 className="text-lg md:text-xl font-bold text-gray-900">チャット</h1>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 p-2">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="友達を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => (
                <ConversationItem key={conversation.id} conversation={conversation} />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`${
          showConversationList ? 'hidden' : 'flex'
        } md:flex flex-1 flex-col min-h-0 bg-gray-50`}>
          {selectedConversation && selectedConv ? (
            <>
              {/* Desktop Chat Header */}
              <div className="hidden md:flex p-4 bg-white border-b border-gray-200 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConv.avatar} alt={selectedConv.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
                      {selectedConv.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedConv.name}</h2>
                    <p className="text-sm text-orange-500">{selectedConv.isOnline ? 'オンライン' : 'オフライン'}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 bg-gray-50">
                <div className="py-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-3 md:p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-2">
                  <Input
                    placeholder="メッセージを入力..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-orange-500 hover:bg-orange-600 px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">チャットを始めよう</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  友達を選んでメッセージを送信しましょう
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
