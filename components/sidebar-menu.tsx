"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  Trophy,
  User,
  Smartphone,
  MessageCircle
} from "lucide-react"

interface SidebarMenuProps {
  isLoggedIn?: boolean
  currentUser?: {
    name: string
    avatar?: string
  }
}

export function SidebarMenu({ isLoggedIn = false, currentUser }: SidebarMenuProps) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  // ログイン中は未読メッセージ数を取得
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0)
      return
    }

    const fetchUnread = async () => {
      try {
        const { getTotalUnreadCount } = await import("@/lib/api")
        const count = await getTotalUnreadCount()
        setUnreadCount(count)
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
    if (path === "/timeline") return pathname === "/" || pathname === "/timeline"
    if (path === "/messages") return pathname === "/messages" || pathname?.startsWith("/messages/")
    return pathname === path
  }

  const menuItems = [
    {
      href: "/timeline",
      icon: Smartphone,
      label: "フィード",
      show: true,
      badge: 0
    },
    {
      href: "/tournaments",
      icon: Trophy,
      label: "大会情報",
      show: true,
      badge: 0
    },
    {
      href: "/messages",
      icon: MessageCircle,
      label: "チャット",
      show: isLoggedIn,
      badge: unreadCount
    },
    {
      href: "/teams",
      icon: Users,
      label: "チーム",
      show: true,
      badge: 0
    },
    {
      href: "/profile",
      icon: User,
      label: "プロフィール",
      show: isLoggedIn,
      badge: 0
    }
  ]

  const visibleMenuItems = menuItems.filter(item => item.show)

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg z-50 px-2 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-[60px]">
          {visibleMenuItems.map((item) => {
            const IconComponent = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[56px] ${
                    isActive(item.href)
                      ? "text-[#e84b8a]"
                      : "text-gray-500 hover:text-gray-900 active:bg-gray-100"
                  }`}
                >
                  <div className="relative">
                    <IconComponent className={`w-6 h-6 ${
                      isActive(item.href) ? "stroke-[2.5]" : ""
                    }`} />
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white rounded-full bg-red-500">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              </Link>
            )
          })}
        </div>
      </nav>

    </>
  )
}

export default SidebarMenu
