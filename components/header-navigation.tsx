"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "aws-amplify/auth"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, Search, Trophy, Users, User, X } from "lucide-react"

interface HeaderNavigationProps {
  isLoggedIn?: boolean
  currentUser?: {
    name: string
    avatar?: string
    email?: string
  }
}

export function HeaderNavigation({ isLoggedIn = false, currentUser }: HeaderNavigationProps) {
  ensureAmplifyConfigured()

  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const isActive = (path: string) => {
    if (path === "/") return pathname === path
    return pathname === path || pathname?.startsWith(path + "/")
  }

  const handleLogout = async () => {
    try {
      try {
        await signOut({ global: true })
      } catch (cognitoError) {
        console.error("Cognito signOut error:", cognitoError)
      }
      await fetch("/api/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("ログアウトエラー:", error)
      window.location.href = "/login"
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/list/search?q=${encodeURIComponent(searchQuery)}`
    }
    setIsSearchOpen(false)
  }

  // ログイン・ゲスト共通: 大会 | チーム
  const navItems = [
    { href: "/tournaments", icon: Trophy, label: "大会一覧" },
    { href: "/teams", icon: Users, label: "チーム一覧" },
  ]

  return (
    <header
      className="fixed top-0 z-50 bg-background shadow-sm"
      style={{ left: 0, right: 0, width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}
    >
      {/* 1段目: ロゴ | 検索 | アバター or ログイン/登録 */}
      <div
        className="flex items-center justify-between h-11 px-2 border-b border-gray-100"
        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
      >
        {/* ロゴ */}
        <Link href="/tournaments" className="shrink-0">
          <img src="/images/symbol.png" alt="YeLL" className="h-8 w-auto" />
        </Link>

        {/* 右側 */}
        <div className="flex items-center gap-1 shrink-0">
          {/* 検索ボタン */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 shrink-0"
          >
            {isSearchOpen ? (
              <X className="w-[18px] h-[18px] text-gray-700" />
            ) : (
              <Search className="w-[18px] h-[18px] text-gray-700" />
            )}
          </button>

          {/* ログイン済み: ユーザー名 + アバター（ドロップダウンでプロフィール/設定） */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-1 hover:opacity-80 transition-opacity cursor-pointer">
                  <span className="text-xs font-medium text-gray-700 max-w-[80px] truncate">
                    {currentUser?.name || "ユーザー"}
                  </span>
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback className="bg-brand-gradient text-white text-xs">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <User className="mr-3 h-4 w-4" />
                    プロフィール
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center cursor-pointer">
                    <Settings className="mr-3 h-4 w-4" />
                    設定
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-3 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1">
              <Link href="/login" className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                ログイン
              </Link>
              <Link href="/register" className="px-2 py-1 text-sm bg-brand-gradient text-white rounded whitespace-nowrap hover:opacity-90">
                登録
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 検索バー（展開時） */}
      {isSearchOpen && (
        <div
          className="px-2 py-2 bg-background border-b border-gray-100"
          style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
        >
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="YeLLを検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 px-3 bg-gray-100 rounded-full text-sm outline-none focus:bg-background focus:ring-2 ring-brand"
              style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              autoFocus
            />
          </form>
        </div>
      )}

      {/* 2段目: 大会 | チーム（全ユーザー共通） */}
      <div
        className="grid grid-cols-2 h-11 border-b border-gray-100"
        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: 0, margin: 0 }}
      >
        {navItems.map((item) => {
          const IconComponent = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center h-full relative ${
                active ? "text-[#e84b8a]" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-gradient-h" />
              )}
            </Link>
          )
        })}
      </div>
    </header>
  )
}

export default HeaderNavigation
