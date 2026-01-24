"use client"
import { ReactNode, useState, useEffect } from "react"
import { HeaderNavigation } from "@/components/header-navigation"
import { getUserByEmail, getCurrentUserEmail } from "@/lib/api"

interface LayoutProps {
  children: ReactNode
  isLoggedIn?: boolean
  currentUser?: {
    name: string
    avatar?: string
  }
}

export function Layout({ children, isLoggedIn: propIsLoggedIn = false, currentUser: propCurrentUser }: LayoutProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(propIsLoggedIn)
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar?: string } | undefined>(propCurrentUser)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // プロップで渡された場合はそれを使用
    if (propIsLoggedIn && propCurrentUser) {
      setIsLoggedIn(true)
      setCurrentUser(propCurrentUser)
      setIsLoading(false)
      return
    }

    // 自動的にユーザー情報を取得
    const loadUserInfo = async () => {
      try {
        // Amplifyのauth sessionから直接ユーザー情報を取得
        const email = await getCurrentUserEmail()

        if (!email) {
          setIsLoggedIn(false)
          setCurrentUser(undefined)
          setIsLoading(false)
          return
        }

        // DynamoDBからユーザー情報を取得
        const userData = await getUserByEmail(email)
        if (userData) {
          setIsLoggedIn(true)
          setCurrentUser({
            name: `${userData.lastName} ${userData.firstName}`,
            avatar: userData.avatar || undefined,
          })
        } else {
          setIsLoggedIn(false)
          setCurrentUser(undefined)
        }
      } catch (error) {
        console.error('Failed to load user info:', error)
        setIsLoggedIn(false)
        setCurrentUser(undefined)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserInfo()
  }, [propIsLoggedIn, propCurrentUser?.name, propCurrentUser?.avatar])

  // ローディング中はデフォルト値を表示
  const displayUser = isLoading && !propCurrentUser 
    ? { name: "読み込み中...", avatar: undefined }
    : currentUser

  return (
    <div className="min-h-screen bg-[#F0F2F5] overflow-x-hidden w-full max-w-full">
      {/* Header */}
      <HeaderNavigation isLoggedIn={isLoggedIn} currentUser={displayUser} />

      {/* Main Content - ヘッダー2段分(44px + 44px = 88px)のスペース確保 */}
      <div className={isLoggedIn ? "pt-[88px]" : "pt-11"}>
        <main className="min-h-screen w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout