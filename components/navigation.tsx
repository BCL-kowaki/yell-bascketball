"use client"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Users } from "lucide-react"

interface NavigationProps {
  currentUser?: {
    name: string
    avatar?: string
  } | null
}

export function Navigation({ currentUser }: NavigationProps) {
  return (
    <div className="hidden lg:block w-[340px] flex-shrink-0 pt-4 sticky top-[100px] self-start">
      {/* User Profile */}
      {currentUser && (
        <Link href="/profile" className="block mb-6">
          <div className="flex items-center gap-4 mb-4 hover:opacity-80 transition-opacity cursor-pointer">
            <Avatar className="w-[50px] h-[50px]">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name || 'ユーザー'} />
              <AvatarFallback className="bg-blue-600 text-white font-semibold text-[18px]">
                {currentUser.name
                  ? currentUser.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="font-bold text-[15px] text-black">
              {currentUser.name || "ユーザー"}
            </div>
          </div>
        </Link>
      )}

      {/* Favorite Tournaments */}
      <Link href="/favorites/tournaments" className="block mb-6">
        <div className="flex items-center gap-4 mb-4 hover:opacity-80 transition-opacity cursor-pointer p-2 rounded-lg hover:bg-gray-100">
          <Trophy className="w-[40px] h-[40px] text-gray-300" />
          <div className="font-bold text-[15px] text-black">
            お気に入り大会
          </div>
        </div>
      </Link>

      {/* Favorite Teams */}
      <Link href="/favorites/teams" className="block mb-6">
        <div className="flex items-center gap-4 mb-4 hover:opacity-80 transition-opacity cursor-pointer p-2 rounded-lg hover:bg-gray-100">
          <Users className="w-[40px] h-[40px] text-gray-300" />
          <div className="font-bold text-[15px] text-black">
            お気に入りチーム
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Navigation
