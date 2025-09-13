"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Trophy, 
  MessageCircle, 
  User, 
  Home,
  Menu,
  X
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
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const menuItems = [
    {
      href: "/timeline",
      icon: Home,
      label: "タイムライン",
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
    },
    {
      href: "/messages",
      icon: MessageCircle,
      label: "チャット",
      show: isLoggedIn,
      external: true
    }
  ]

  const visibleMenuItems = menuItems.filter(item => item.show)

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed top-24 left-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-sm"
        >
          {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
<div className={`
        fixed left-0 top-17 h-[calc(100vh-1rem)] bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-lg z-30 w-64
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>


        {/* User Profile Section */}
        {isLoggedIn && currentUser && (
          <div className="p-4 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {currentUser.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {currentUser.name || 'ユーザー'}
                </div>
                <div className="text-xs text-gray-500">オンライン</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {visibleMenuItems.map((item) => {
              const IconComponent = item.icon
              const linkProps = item.external 
                ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
                : { href: item.href }
              
              return (
                <Link key={item.href} {...linkProps}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-12 px-4 ${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="text-xs text-gray-500 text-center">
            <div>YeLL Basketball Platform</div>
            <div className="mt-1">© 2024 All rights reserved</div>
          </div>
        </div>
      </div>

      {/* Main Content Spacer */}
      <div className="hidden lg:block w-64" />
    </>
  )
}

export default SidebarMenu