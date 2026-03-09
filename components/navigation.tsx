"use client"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Users, LogIn } from "lucide-react"

interface NavigationProps {
  currentUser?: {
    name: string
    avatar?: string
  } | null
  isLoggedIn?: boolean
}

export function Navigation({ currentUser, isLoggedIn = false }: NavigationProps) {
  return (
    <div className="hidden lg:block w-[340px] flex-shrink-0 pt-4 sticky top-[100px] self-start">
      {/* User Profile（ログイン時のみ） */}
      {isLoggedIn && currentUser && (
        <Link href="/profile" className="block mb-6">
          <div className="flex items-center gap-4 mb-4 hover:opacity-80 transition-opacity cursor-pointer">
            <Avatar className="w-[50px] h-[50px]">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name || 'ユーザー'} />
              <AvatarFallback className="bg-brand-gradient text-white font-semibold text-[18px]">
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

      {/* ゲスト時: ログイン促進 */}
      {!isLoggedIn && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-3">
            ログインすると、お気に入り登録や大会・チームの作成ができます。
          </p>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-brand-gradient text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            ログイン
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center w-full mt-2 py-2 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            新規登録
          </Link>
        </div>
      )}

      {/* Favorite Tournaments（ログイン時のみ） */}
      {isLoggedIn && (
        <Link href="/favorites/tournaments" className="block mb-6">
          <div className="flex items-center gap-4 mb-4 hover:opacity-80 transition-opacity cursor-pointer p-2 rounded-lg hover:bg-gray-100">
            <Trophy className="w-[40px] h-[40px] text-gray-300" />
            <div className="font-bold text-[15px] text-black">
              お気に入り大会
            </div>
          </div>
        </Link>
      )}

      {/* Favorite Teams（ログイン時のみ） */}
      {isLoggedIn && (
        <Link href="/favorites/teams" className="block mb-6">
          <div className="flex items-center gap-4 mb-4 hover:opacity-80 transition-opacity cursor-pointer p-2 rounded-lg hover:bg-gray-100">
            <Users className="w-[40px] h-[40px] text-gray-300" />
            <div className="font-bold text-[15px] text-black">
              お気に入りチーム
            </div>
          </div>
        </Link>
      )}

      {/* ゲスト時: 大会・チームへのリンク */}
      {!isLoggedIn && (
        <>
          <Link href="/tournaments" className="block mb-6">
            <div className="flex items-center gap-4 mb-4 hover:opacity-80 transition-opacity cursor-pointer p-2 rounded-lg hover:bg-gray-100">
              <Trophy className="w-[40px] h-[40px] text-gray-300" />
              <div className="font-bold text-[15px] text-black">
                大会を探す
              </div>
            </div>
          </Link>
          <Link href="/teams" className="block mb-6">
            <div className="flex items-center gap-4 mb-4 hover:opacity-80 transition-opacity cursor-pointer p-2 rounded-lg hover:bg-gray-100">
              <Users className="w-[40px] h-[40px] text-gray-300" />
              <div className="font-bold text-[15px] text-black">
                チームを探す
              </div>
            </div>
          </Link>
        </>
      )}
    </div>
  )
}

export default Navigation
