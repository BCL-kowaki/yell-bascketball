import Link from "next/link"
import { Home, Search, Bell, User, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <Link href="/timeline">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <Home className="w-5 h-5" />
            <span className="text-xs">ホーム</span>
          </Button>
        </Link>

        <Link href="/search">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <Search className="w-5 h-5" />
            <span className="text-xs">検索</span>
          </Button>
        </Link>

        <Link href="/notifications">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 relative">
            <Bell className="w-5 h-5" />
            <span className="text-xs">通知</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Button>
        </Link>

        <Link href="/messages">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 relative">
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">メッセージ</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Button>
        </Link>

        <Link href="/profile">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <User className="w-5 h-5" />
            <span className="text-xs">プロフィール</span>
          </Button>
        </Link>
      </div>
    </nav>
  )
}

export default Navigation
