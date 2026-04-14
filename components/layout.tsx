"use client"
import { ReactNode, useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { HeaderNavigation } from "@/components/header-navigation"
import { SidebarMenu } from "@/components/sidebar-menu"
import { getUserByEmail, isAdminEmail } from "@/lib/api"

interface LayoutProps {
  children: ReactNode
  isLoggedIn?: boolean
  currentUser?: {
    name: string
    avatar?: string
  }
}

// ユーザー情報のメモリキャッシュ（同一セッション内で再利用）
let userCache: { email: string; name: string; avatar?: string; isAdmin?: boolean; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5分キャッシュ

export function Layout({ children, isLoggedIn: propIsLoggedIn = false, currentUser: propCurrentUser }: LayoutProps) {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // 初期値: プロップまたはキャッシュから高速判定
    if (propIsLoggedIn) return true
    if (userCache && (Date.now() - userCache.timestamp < CACHE_TTL)) return true
    return false
  })
  const [isAdmin, setIsAdmin] = useState(() => {
    if (userCache && (Date.now() - userCache.timestamp < CACHE_TTL)) {
      return userCache.isAdmin || false
    }
    return false
  })
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar?: string } | undefined>(() => {
    if (propCurrentUser) return propCurrentUser
    if (userCache && (Date.now() - userCache.timestamp < CACHE_TTL)) {
      return { name: userCache.name, avatar: userCache.avatar }
    }
    return undefined
  })
  const [isLoading, setIsLoading] = useState(!propIsLoggedIn && !userCache)
  // 前回チェックしたpathnameを記録（ページ遷移で再チェック可能にする）
  const lastCheckedPath = useRef<string | null>(null)

  useEffect(() => {
    // プロップで渡された場合はそれを使用
    if (propIsLoggedIn && propCurrentUser) {
      setIsLoggedIn(true)
      setCurrentUser(propCurrentUser)
      setIsLoading(false)
      lastCheckedPath.current = pathname
      return
    }

    // キャッシュが有効なら再取得しない
    if (userCache && (Date.now() - userCache.timestamp < CACHE_TTL)) {
      setIsLoggedIn(true)
      setCurrentUser({ name: userCache.name, avatar: userCache.avatar })
      setIsAdmin(userCache.isAdmin || false)
      setIsLoading(false)
      lastCheckedPath.current = pathname
      return
    }

    // 同じパスで既にチェック済みならスキップ（二重実行防止）
    if (lastCheckedPath.current === pathname) return
    lastCheckedPath.current = pathname

    // /api/session でHTTPOnly cookieの有無をサーバー側で確認
    const loadUserInfo = async () => {
      try {
        // セッションAPIでログイン状態を確認（httpOnly cookieはJSからアクセス不可のため）
        const sessionRes = await fetch('/api/session')
        if (!sessionRes.ok) {
          setIsLoggedIn(false)
          setCurrentUser(undefined)
          setIsLoading(false)
          return
        }

        const sessionData = await sessionRes.json()
        const email = sessionData.email
        if (!email) {
          setIsLoggedIn(false)
          setCurrentUser(undefined)
          setIsLoading(false)
          return
        }

        // 管理者チェック
        const adminFlag = isAdminEmail(email)
        setIsAdmin(adminFlag)

        // ユーザー情報をDBから取得
        const userData = await getUserByEmail(email)
        if (userData) {
          let avatarUrl = userData.avatar || undefined
          if (avatarUrl && !avatarUrl.startsWith('/') && !avatarUrl.startsWith('data:')) {
            try {
              const { refreshS3Url } = await import('@/lib/storage')
              const refreshed = await refreshS3Url(avatarUrl)
              if (refreshed) avatarUrl = refreshed
            } catch { /* アバターURL更新失敗は無視 */ }
          }
          const name = `${userData.lastName} ${userData.firstName}`
          // キャッシュに保存（管理者フラグも含める）
          userCache = { email, name, avatar: avatarUrl, isAdmin: adminFlag, timestamp: Date.now() }
          setIsLoggedIn(true)
          setCurrentUser({ name, avatar: avatarUrl })
        } else {
          // DB未登録だがセッションはある（新規登録直後など）
          setIsLoggedIn(true)
          setCurrentUser({ name: email.split('@')[0] })
        }
      } catch {
        setIsLoggedIn(false)
        setCurrentUser(undefined)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserInfo()
  }, [propIsLoggedIn, propCurrentUser?.name, propCurrentUser?.avatar, pathname])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full max-w-full">
      <HeaderNavigation isLoggedIn={isLoggedIn} currentUser={currentUser} isAdmin={isAdmin} />
      <div className="pt-[56px] pb-16 lg:pb-0">
        <main className="min-h-screen w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
      <SidebarMenu isLoggedIn={isLoggedIn} currentUser={currentUser} />
    </div>
  )
}

// キャッシュクリア（ログアウト時に呼ぶ）
export function clearLayoutCache() {
  userCache = null
}

export default Layout