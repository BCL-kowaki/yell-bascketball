"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  Trophy,
  User,
  Smartphone
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

  const isActive = (path: string) => {
    if (path === "/timeline") return pathname === "/" || pathname === "/timeline"
    return pathname === path
  }

  const menuItems = [
    {
      href: "/timeline",
      icon: Smartphone,
      label: "フィード",
      show: true,
      external: false
    },
    {
      href: "/tournaments",
      icon: Trophy,
      label: "大会情報",
      show: true,
      external: false
    },
    {
      href: "/teams",
      icon: Users,
      label: "チーム",
      show: true,
      external: false
    },
    {
      href: "/profile",
      icon: User,
      label: "プロフィール",
      show: isLoggedIn,
      external: false
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
            const linkProps = item.external
              ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
              : { href: item.href }

            return (
              <Link key={item.href} {...linkProps}>
                <button
                  className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl transition-all min-w-[64px] ${
                    isActive(item.href)
                      ? "text-[#e84b8a]"
                      : "text-gray-500 hover:text-gray-900 active:bg-gray-100"
                  }`}
                >
                  <IconComponent className={`w-6 h-6 ${
                    isActive(item.href) ? "stroke-[2.5]" : ""
                  }`} />
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
