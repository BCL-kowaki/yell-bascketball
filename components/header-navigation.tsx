"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Trophy, Settings, User, Users, MessageCircle, LogOut } from "lucide-react"

interface HeaderNavigationProps {
  isLoggedIn?: boolean
  currentUser?: {
    name: string
    avatar?: string
  }
}

export function HeaderNavigation({ isLoggedIn = false, currentUser }: HeaderNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('ログアウトに失敗しました:', error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-4 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left side - Logo and Search */}
        <div className="flex items-center gap-6 flex-1">
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            YeLL
          </Link>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus:border-blue-500 focus:ring-orange-500"
              />
            </div>
          </form>
        </div>

        {/* Right side - Navigation Links */}
        <div className="flex items-center gap-2">

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Settings */}
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      isActive("/settings")
                        ? "text-orange-600 bg-blue-50 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>

                {/* User Profile */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                </div>
                {/* Logout Button */}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              /* Guest user - only show login/register buttons */
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                    ログイン
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                    新規登録
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default HeaderNavigation 