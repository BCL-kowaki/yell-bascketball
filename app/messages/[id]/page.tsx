"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, Phone, Video, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  isOwn: boolean
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [newMessage, setNewMessage] = useState("")

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

  const MessageBubble = ({ message }: { message: Message }) => (
    <div className={`flex ${message.isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.isOwn ? "bg-facebook-blue text-white" : "bg-gray-200 text-gray-900"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${message.isOwn ? "text-blue-100" : "text-gray-500"}`}>{message.timestamp}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="田中太郎" />
            <AvatarFallback>田</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">田中太郎</h2>
            <p className="text-sm text-green-500">オンライン</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost">
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Video className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 pb-20">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ScrollArea>

      {/* Message Input */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t md:bottom-0">
        <div className="flex space-x-2 max-w-2xl mx-auto">
          <Input
            placeholder="メッセージを入力..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-facebook-blue hover:bg-facebook-blue/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
