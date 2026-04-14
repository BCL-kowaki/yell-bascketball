"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, Search, Trophy, Users, User, X, Smartphone, MessageCircle, ShieldAlert, Bell } from "lucide-react"

interface HeaderNavigationProps {
  isLoggedIn?: boolean
  currentUser?: {
    name: string
    avatar?: string
    email?: string
  }
  isAdmin?: boolean
}

export function HeaderNavigation({ isLoggedIn = false, currentUser, isAdmin = false }: HeaderNavigationProps) {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)

  // ログイン中は未読メッセージ数と未読通知数を取得
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0)
      setNotificationCount(0)
      return
    }

    const fetchUnread = async () => {
      try {
        const { getTotalUnreadCount, getUnreadNotificationCount, getCurrentUserEmail } = await import("@/lib/api")
        const [msgCount, email] = await Promise.all([
          getTotalUnreadCount(),
          getCurrentUserEmail()
        ])
        setUnreadCount(msgCount)

        // 通知数を取得
        if (email) {
          const notiCount = await getUnreadNotificationCount(email)
          setNotificationCount(notiCount)
        }
      } catch {
        // エラー時は0のまま
      }
    }

    fetchUnread()
    // 60秒ごとにポーリングして未読数を更新
    const interval = setInterval(fetchUnread, 60000)
    return () => clearInterval(interval)
  }, [isLoggedIn])

  const isActive = (path: string) => {
    if (path === "/") return pathname === path
    return pathname === path || pathname?.startsWith(path + "/")
  }

  const handleLogout = async () => {
    try {
      // レイアウトキャッシュをクリア
      const { clearLayoutCache } = await import("@/components/layout")
      clearLayoutCache()
      try {
        const { signOut } = await import("aws-amplify/auth")
        await signOut({ global: true })
      } catch { /* Cognito signOut失敗は無視 */ }
      await fetch("/api/logout", { method: "POST" })
      window.location.href = "/login"
    } catch {
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

  // ログイン・ゲスト共通: 大会 | チーム | タイムライン | プロフィール
  const navItems = [
    { href: "/tournaments", icon: Trophy, label: "大会一覧" },
    { href: "/teams", icon: Users, label: "チーム一覧" },
    { href: "/timeline", icon: Smartphone, label: "タイムライン", requireLogin: true },
    { href: "/profile", icon: User, label: "マイページ", requireLogin: true },
  ]

  return (
    <header
      className="fixed top-0 z-50 bg-background shadow-sm"
      style={{ left: 0, right: 0, width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}
    >
      {/* 1段目: ロゴ | 検索 | アバター or ログイン/登録 */}
      <div
        className="flex items-center justify-between h-14 lg:h-11 px-3 lg:px-2 border-b border-gray-100"
        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
      >
        {/* ロゴ */}
        <Link href="/tournaments" className="shrink-0">
          <img src="/images/symbol.png" alt="YeLL" className="h-9 lg:h-8 w-auto" />
        </Link>

        {/* 右側 */}
        <div className="flex items-center gap-1.5 lg:gap-1 shrink-0">
          {/* 検索ボタン */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center justify-center w-10 h-10 lg:w-9 lg:h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 shrink-0"
          >
            {isSearchOpen ? (
              <X className="w-5 h-5 lg:w-[18px] lg:h-[18px] text-gray-700" />
            ) : (
              <Search className="w-5 h-5 lg:w-[18px] lg:h-[18px] text-gray-700" />
            )}
          </button>

          {/* お知らせ通知ボタン（ログイン時のみ） */}
          {isLoggedIn && (
            <Link
              href="/notifications"
              className="relative flex items-center justify-center w-10 h-10 lg:w-9 lg:h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 shrink-0"
            >
              <Bell className="w-5 h-5 lg:w-[18px] lg:h-[18px] text-gray-700" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full bg-pink-500">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Link>
          )}

          {/* メッセージボタン（ログイン時のみ・PCのみ表示。モバイルは下部ナビに移動） */}
          {isLoggedIn && (
            <Link
              href="/messages"
              className="hidden lg:flex relative items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 shrink-0"
            >
              <MessageCircle className="w-[18px] h-[18px] text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full bg-red-500">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}

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
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <a href="/admin" target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                      <ShieldAlert className="mr-3 h-4 w-4" />
                      管理者パネル
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/notifications" className="flex items-center cursor-pointer">
                    <Bell className="mr-3 h-4 w-4" />
                    お知らせ
                    {notificationCount > 0 && (
                      <span className="ml-auto text-xs font-bold text-pink-500">
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
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

      {/* 2段目: 大会 | チーム | マイページ（PCのみ表示、スマホは下部ナビに統一） */}
      {(() => {
        const visibleNavItems = navItems.filter(item => !item.requireLogin || isLoggedIn)
        return (
          <div
            className={`hidden lg:grid h-11 border-b border-gray-100 ${visibleNavItems.length === 4 ? 'grid-cols-4' : visibleNavItems.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: 0, margin: 0 }}
          >
            {visibleNavItems.map((item) => {
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
        )
      })()}
    </header>
  )
}

export default HeaderNavigation
