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

  // ナビアイテム
  const navItems = [
    { href: "/tournaments", icon: Trophy, label: "大会一覧" },
    { href: "/teams", icon: Users, label: "チーム一覧" },
    { href: "/timeline", icon: Smartphone, label: "タイムライン", requireLogin: true },
    { href: "/profile", icon: User, label: "マイページ", requireLogin: true },
  ]

  const visibleNavItems = navItems.filter(item => !item.requireLogin || isLoggedIn)

  return (
    <header
      className="fixed top-0 z-50 bg-white shadow-sm"
      style={{ left: 0, right: 0, width: '100%' }}
    >
      {/* === FB風1段ヘッダー（PC） === */}
      <div className="hidden lg:flex items-center h-[56px] px-[16px]" style={{ width: '100%' }}>
        {/* 左: ロゴ */}
        <Link href="/tournaments" className="shrink-0 mr-[8px]">
          <img src="/images/symbol.png" alt="YeLL" className="h-[40px] w-auto" />
        </Link>

        {/* 左: 検索ボタン */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-gray-100 hover:bg-gray-200 shrink-0"
        >
          {isSearchOpen ? (
            <X className="w-[20px] h-[20px] text-gray-600" />
          ) : (
            <Search className="w-[20px] h-[20px] text-gray-600" />
          )}
        </button>

        {/* 中央: ナビゲーションアイコン（FB風 等間幅） */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center h-[56px]">
            {visibleNavItems.map((item) => {
              const IconComponent = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-center h-[48px] min-w-[110px] px-[16px] mx-[4px] rounded-[8px] relative transition-colors ${
                    active ? "text-[#e84b8a]" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <IconComponent className="w-[24px] h-[24px]" />
                  {active && (
                    <div className="absolute bottom-0 left-[8px] right-[8px] h-[3px] rounded-t-full" style={{ background: 'linear-gradient(90deg, #f7931e, #e84b8a)' }} />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* 右: アイコン群 */}
        <div className="flex items-center gap-[8px] shrink-0">
          {/* 通知 */}
          {isLoggedIn && (
            <Link
              href="/notifications"
              className="relative flex items-center justify-center w-[40px] h-[40px] rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Bell className="w-[20px] h-[20px] text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-[2px] -right-[2px] flex items-center justify-center min-w-[18px] h-[18px] px-[4px] text-[11px] font-bold text-white rounded-full bg-red-500">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Link>
          )}

          {/* メッセージ */}
          {isLoggedIn && (
            <Link
              href="/messages"
              className="relative flex items-center justify-center w-[40px] h-[40px] rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <MessageCircle className="w-[20px] h-[20px] text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-[2px] -right-[2px] flex items-center justify-center min-w-[18px] h-[18px] px-[4px] text-[11px] font-bold text-white rounded-full bg-red-500">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* アカウント */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-[40px] h-[40px] rounded-full hover:opacity-80 cursor-pointer">
                  <Avatar className="w-[40px] h-[40px]">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback className="bg-brand-gradient text-white text-sm">
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
            <div className="flex items-center gap-[6px]">
              <Link href="/login" className="px-[12px] py-[6px] text-[14px] text-gray-700 hover:bg-gray-100 rounded-[6px] whitespace-nowrap">
                ログイン
              </Link>
              <Link href="/register" className="px-[12px] py-[6px] text-[14px] bg-brand-gradient text-white rounded-[6px] whitespace-nowrap hover:opacity-90">
                登録
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* === モバイルヘッダー（1段のみ） === */}
      <div
        className="flex lg:hidden items-center justify-between h-[56px] px-[12px]"
      >
        {/* ロゴ */}
        <Link href="/tournaments" className="shrink-0">
          <img src="/images/symbol.png" alt="YeLL" className="h-[36px] w-auto" />
        </Link>

        {/* 右側アイコン */}
        <div className="flex items-center gap-[6px]">
          {/* 検索 */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center justify-center w-[36px] h-[36px] rounded-full bg-gray-100 hover:bg-gray-200"
          >
            {isSearchOpen ? (
              <X className="w-[20px] h-[20px] text-gray-600" />
            ) : (
              <Search className="w-[20px] h-[20px] text-gray-600" />
            )}
          </button>

          {/* 通知 */}
          {isLoggedIn && (
            <Link
              href="/notifications"
              className="relative flex items-center justify-center w-[36px] h-[36px] rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Bell className="w-[20px] h-[20px] text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-[1px] -right-[1px] flex items-center justify-center min-w-[16px] h-[16px] px-[3px] text-[10px] font-bold text-white rounded-full bg-pink-500">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Link>
          )}

          {/* アカウント */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center hover:opacity-80 cursor-pointer">
                  <Avatar className="w-[32px] h-[32px]">
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
            <div className="flex items-center gap-[4px]">
              <Link href="/login" className="px-[8px] py-[4px] text-[13px] text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                ログイン
              </Link>
              <Link href="/register" className="px-[8px] py-[4px] text-[13px] bg-brand-gradient text-white rounded whitespace-nowrap hover:opacity-90">
                登録
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 検索バー（展開時） */}
      {isSearchOpen && (
        <div className="px-[12px] py-[8px] bg-background border-t border-gray-100">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="YeLLを検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[36px] px-[14px] bg-gray-100 rounded-full text-[14px] outline-none focus:bg-background focus:ring-2 ring-brand"
              autoFocus
            />
          </form>
        </div>
      )}
    </header>
  )
}

export default HeaderNavigation
