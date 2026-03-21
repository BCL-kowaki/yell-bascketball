"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users, Trophy, Shield, MessageCircle, BarChart3,
  Loader2, ShieldAlert, ChevronRight, Lock, LogOut
} from "lucide-react"
import {
  isSystemAdmin, adminLogin, adminLogout, isAdminLoggedIn,
  adminListAllUsers, adminListAllTeams,
  adminListAllTournaments, adminListAllChatThreads,
  type DbUser, type DbTeam, type DbTournament, type DbChatThread
} from "@/lib/api"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    users: 0, teams: 0, tournaments: 0, chats: 0,
    pendingTeams: 0, recentUsers: 0, recentTeams: 0,
  })

  // ログインフォーム用
  const [loginId, setLoginId] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // 管理者データを読み込む関数
  const loadAdminData = async () => {
    try {
      const [users, teams, tournaments, chats] = await Promise.all([
        adminListAllUsers(), adminListAllTeams(),
        adminListAllTournaments(), adminListAllChatThreads(),
      ])

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      setStats({
        users: users.length,
        teams: teams.length,
        tournaments: tournaments.length,
        chats: chats.length,
        pendingTeams: teams.filter(t => !t.isApproved).length,
        recentUsers: users.filter(u => u.createdAt && new Date(u.createdAt) > weekAgo).length,
        recentTeams: teams.filter(t => t.createdAt && new Date(t.createdAt) > weekAgo).length,
      })
    } catch (error) {
      console.error('管理者データ取得エラー:', error)
    }
  }

  useEffect(() => {
    const load = async () => {
      const admin = await isSystemAdmin()
      if (!admin) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }
      setIsAdmin(true)
      await loadAdminData()
      setIsLoading(false)
    }
    load()
  }, [])

  // 固定ID/パスワードでログイン
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    const success = adminLogin(loginId, loginPassword)
    if (success) {
      setIsAdmin(true)
      setIsLoading(true)
      await loadAdminData()
      setIsLoading(false)
    } else {
      setLoginError("IDまたはパスワードが正しくありません")
    }
  }

  // 管理者ログアウト
  const handleLogout = () => {
    adminLogout()
    setIsAdmin(false)
    setStats({ users: 0, teams: 0, tournaments: 0, chats: 0, pendingTeams: 0, recentUsers: 0, recentTeams: 0 })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </Layout>
    )
  }

  // 未認証: ログインフォームを表示
  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-sm mx-auto px-4 py-20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f7931e] to-[#e84b8a] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">管理者ログイン</h1>
            <p className="text-sm text-gray-500 mt-1">管理者IDとパスワードを入力してください</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">管理者ID</label>
              <Input
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder="管理者IDを入力"
                autoComplete="username"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">パスワード</label>
              <Input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="パスワードを入力"
                autoComplete="current-password"
                className="mt-1"
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-500 text-center">{loginError}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#f7931e] via-[#f06a4e] to-[#e84b8a] text-white hover:opacity-90"
            >
              ログイン
            </Button>
          </form>
        </div>
      </Layout>
    )
  }

  // ダッシュボードメニュー項目
  const menuItems = [
    {
      href: "/admin/users",
      icon: Users,
      label: "ユーザー管理",
      count: stats.users,
      color: "from-blue-500 to-blue-600",
      desc: "全ユーザーの一覧・編集・削除",
      badge: stats.recentUsers > 0 ? `+${stats.recentUsers} 今週` : undefined,
    },
    {
      href: "/admin/tournaments",
      icon: Trophy,
      label: "大会管理",
      count: stats.tournaments,
      color: "from-[#f7931e] to-[#e84b8a]",
      desc: "全大会の一覧・編集・削除",
    },
    {
      href: "/admin/teams",
      icon: Shield,
      label: "チーム管理",
      count: stats.teams,
      color: "from-green-500 to-emerald-600",
      desc: "チーム承認・編集・削除",
      badge: stats.pendingTeams > 0 ? `${stats.pendingTeams} 件未承認` : undefined,
      badgeColor: stats.pendingTeams > 0 ? "bg-red-500" : undefined,
    },
    {
      href: "/admin/chats",
      icon: MessageCircle,
      label: "チャット管理",
      count: stats.chats,
      color: "from-purple-500 to-purple-600",
      desc: "全オファー・チャットの確認",
    },
    {
      href: "/admin/stats",
      icon: BarChart3,
      label: "統計情報",
      count: null,
      color: "from-gray-600 to-gray-700",
      desc: "登録推移・利用状況の確認",
    },
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-[#e84b8a]" />
              <h1 className="text-2xl font-bold text-gray-900">管理者パネル</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-500">
              <LogOut className="w-4 h-4 mr-1" />ログアウト
            </Button>
          </div>
          <p className="text-sm text-gray-500">YeLL Basketball システム管理</p>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "ユーザー", value: stats.users, icon: Users },
            { label: "大会", value: stats.tournaments, icon: Trophy },
            { label: "チーム", value: stats.teams, icon: Shield },
            { label: "チャット", value: stats.chats, icon: MessageCircle },
          ].map((item) => (
            <Card key={item.label} className="border-gray-200">
              <CardContent className="p-4 text-center">
                <item.icon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* メニュー一覧 */}
        <div className="space-y-3">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group border-gray-200">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-gray-900 group-hover:text-[#e84b8a] transition-colors">
                        {item.label}
                      </h2>
                      {item.badge && (
                        <span className={`text-[10px] text-white px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-blue-500'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  {item.count !== null && (
                    <span className="text-lg font-bold text-gray-400">{item.count}</span>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}
