"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Trophy, 
  MessageCircle, 
  User, 
  Home
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

  const isActive = (path: string) => pathname === path

  const menuItems = [
    {
      href: "/",
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
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg z-50 px-1 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-14">
          {visibleMenuItems.map((item) => {
            const IconComponent = item.icon
            const linkProps = item.external 
              ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
              : { href: item.href }
            
            return (
              <Link key={item.href} {...linkProps}>
                <button
                  className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${
                    isActive(item.href)
                      ? "text-orange-600"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${
                    isActive(item.href) ? "stroke-[2.5]" : ""
                  }`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-17 h-[calc(100vh-1rem)] bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-lg z-30 w-64">
        {/* User Profile Section */}
        {isLoggedIn && currentUser && (
          <div className="p-4 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
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
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
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

      {/* Desktop Content Spacer */}
      <div className="hidden lg:block w-64" />
      
      {/* Mobile Content Bottom Spacer */}
      <div className="lg:hidden h-14" />
    </>
  )
}

export default SidebarMenu