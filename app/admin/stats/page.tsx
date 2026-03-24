"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3, ArrowLeft, Loader2, ShieldAlert,
  Users, Trophy, Shield, MessageCircle, TrendingUp, Calendar
} from "lucide-react"
import {
  isSystemAdmin, adminListAllUsers, adminListAllTeams,
  adminListAllTournaments, adminListAllChatThreads,
  type DbUser, type DbTeam, type DbTournament, type DbChatThread
} from "@/lib/api"

// 日付を「YYYY-MM」形式に変換
function toMonthKey(dateStr?: string | null): string {
  if (!dateStr) return '不明'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// 日付を「M/D」形式に変換
function toDayKey(dateStr?: string | null): string {
  if (!dateStr) return '不明'
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 直近N日の日付キーリストを生成
function getRecentDayKeys(days: number): string[] {
  const keys: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    keys.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return keys
}

// シンプルな棒グラフコンポーネント
function SimpleBarChart({ data, color }: { data: { label: string; value: number }[], color: string }) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] text-gray-500 font-medium">{d.value > 0 ? d.value : ''}</span>
          <div
            className={`w-full rounded-t-sm ${color}`}
            style={{ height: `${Math.max((d.value / maxValue) * 100, 2)}%`, minHeight: d.value > 0 ? '4px' : '1px', opacity: d.value > 0 ? 1 : 0.2 }}
          />
          <span className="text-[8px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminStatsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<DbUser[]>([])
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [tournaments, setTournaments] = useState<DbTournament[]>([])
  const [chatThreads, setChatThreads] = useState<DbChatThread[]>([])

  useEffect(() => {
    const load = async () => {
      const admin = await isSystemAdmin()
      if (!admin) { setIsAdmin(false); setIsLoading(false); return }
      setIsAdmin(true)
      try {
        const [u, t, tn, c] = await Promise.all([
          adminListAllUsers(),
          adminListAllTeams(),
          adminListAllTournaments(),
          adminListAllChatThreads(),
        ])
        setUsers(u)
        setTeams(t)
        setTournaments(tn)
        setChatThreads(c)
      } catch (e) { console.error(e) }
      setIsLoading(false)
    }
    load()
  }, [])

  // 統計データ計算
  const stats = useMemo(() => {
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // 基本統計
    const totalUsers = users.length
    const totalTeams = teams.length
    const totalTournaments = tournaments.length
    const totalChats = chatThreads.length

    // 期間別新規
    const newUsersToday = users.filter(u => u.createdAt && new Date(u.createdAt) > dayAgo).length
    const newUsersWeek = users.filter(u => u.createdAt && new Date(u.createdAt) > weekAgo).length
    const newUsersMonth = users.filter(u => u.createdAt && new Date(u.createdAt) > monthAgo).length

    const newTeamsWeek = teams.filter(t => t.createdAt && new Date(t.createdAt) > weekAgo).length
    const newTeamsMonth = teams.filter(t => t.createdAt && new Date(t.createdAt) > monthAgo).length

    // チーム承認状況
    const approvedTeams = teams.filter(t => t.isApproved).length
    const pendingTeams = teams.filter(t => !t.isApproved).length

    // 大会タイプ別
    const officialTournaments = tournaments.filter(t => t.tournamentType === 'official').length
    const cupTournaments = tournaments.filter(t => t.tournamentType !== 'official').length

    // チャット状態
    const activeChats = chatThreads.filter(c => c.status === 'active').length
    const totalUnread = chatThreads.reduce((sum, c) => sum + (c.teamUnreadCount || 0) + (c.senderUnreadCount || 0), 0)

    // 都道府県別ユーザー（上位5）
    const prefectureMap = new Map<string, number>()
    users.forEach(u => {
      const pref = u.prefecture || '未設定'
      prefectureMap.set(pref, (prefectureMap.get(pref) || 0) + 1)
    })
    const topPrefectures = [...prefectureMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // カテゴリ別ユーザー（上位5）
    const categoryMap = new Map<string, number>()
    users.forEach(u => {
      const cat = u.category || '未設定'
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
    })
    const topCategories = [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // 直近14日の登録推移
    const recentDays = getRecentDayKeys(14)
    const usersByDay = new Map<string, number>()
    users.forEach(u => {
      if (u.createdAt) {
        const key = toDayKey(u.createdAt)
        usersByDay.set(key, (usersByDay.get(key) || 0) + 1)
      }
    })
    const dailyRegistrations = recentDays.map(day => ({
      label: day,
      value: usersByDay.get(day) || 0,
    }))

    // 月別登録推移
    const monthlyUserMap = new Map<string, number>()
    users.forEach(u => {
      if (u.createdAt) {
        const key = toMonthKey(u.createdAt)
        monthlyUserMap.set(key, (monthlyUserMap.get(key) || 0) + 1)
      }
    })
    const monthlyRegistrations = [...monthlyUserMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([label, value]) => ({ label, value }))

    return {
      totalUsers, totalTeams, totalTournaments, totalChats,
      newUsersToday, newUsersWeek, newUsersMonth,
      newTeamsWeek, newTeamsMonth,
      approvedTeams, pendingTeams,
      officialTournaments, cupTournaments,
      activeChats, totalUnread,
      topPrefectures, topCategories,
      dailyRegistrations, monthlyRegistrations,
    }
  }, [users, teams, tournaments, chatThreads])

  if (isLoading) return <Layout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div></Layout>
  if (!isAdmin) return <Layout><div className="max-w-2xl mx-auto px-4 py-16 text-center"><ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" /><h1 className="text-2xl font-bold mb-2">アクセス権限がありません</h1></div></Layout>

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />管理者パネル</Button></Link>
        </div>
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h1 className="text-xl font-bold">統計情報</h1>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          {[
            { label: "ユーザー", value: stats.totalUsers, icon: Users, color: "text-blue-500", sub: `+${stats.newUsersWeek} 今週` },
            { label: "チーム", value: stats.totalTeams, icon: Shield, color: "text-green-500", sub: `${stats.pendingTeams}件未承認` },
            { label: "大会", value: stats.totalTournaments, icon: Trophy, color: "text-orange-500", sub: `公式${stats.officialTournaments} / カップ${stats.cupTournaments}` },
            { label: "チャット", value: stats.totalChats, icon: MessageCircle, color: "text-purple-500", sub: `${stats.activeChats}件進行中` },
          ].map(item => (
            <Card key={item.label} className="border-gray-200">
              <CardContent className="p-3 text-center">
                <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 新規ユーザー推移 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: "今日", value: stats.newUsersToday, icon: "24h" },
            { label: "今週", value: stats.newUsersWeek, icon: "7d" },
            { label: "今月", value: stats.newUsersMonth, icon: "30d" },
          ].map(item => (
            <Card key={item.label} className="border-gray-200">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">{item.icon}</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{item.value}人</p>
                  <p className="text-xs text-gray-500">新規ユーザー（{item.label}）</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 日別登録推移（グラフ） */}
        <Card className="border-gray-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-gray-700">直近14日間のユーザー登録推移</h3>
            </div>
            <SimpleBarChart data={stats.dailyRegistrations} color="bg-blue-500" />
          </CardContent>
        </Card>

        {/* 月別登録推移 */}
        {stats.monthlyRegistrations.length > 1 && (
          <Card className="border-gray-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-700">月別ユーザー登録数</h3>
              </div>
              <SimpleBarChart data={stats.monthlyRegistrations} color="bg-indigo-500" />
            </CardContent>
          </Card>
        )}

        {/* 都道府県・カテゴリランキング */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">都道府県別ユーザー（上位5）</h3>
              <div className="space-y-2">
                {stats.topPrefectures.map(([pref, count], i) => (
                  <div key={pref} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm text-gray-700">{pref}</span>
                        <span className="text-xs text-gray-500">{count}人</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">カテゴリ別ユーザー（上位5）</h3>
              <div className="space-y-2">
                {stats.topCategories.map(([cat, count], i) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm text-gray-700">{cat}</span>
                        <span className="text-xs text-gray-500">{count}人</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* チーム承認状況 */}
        <Card className="border-gray-200 mb-6">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">チーム承認状況</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">承認済み</span>
                  <span className="text-sm font-bold text-green-600">{stats.approvedTeams}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${stats.totalTeams > 0 ? (stats.approvedTeams / stats.totalTeams) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">未承認</span>
                  <span className="text-sm font-bold text-yellow-600">{stats.pendingTeams}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${stats.totalTeams > 0 ? (stats.pendingTeams / stats.totalTeams) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 未読メッセージ情報 */}
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">チャット未読状況</h3>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-500">合計未読: </span>
                <span className="font-bold text-red-600">{stats.totalUnread}件</span>
              </div>
              <div>
                <span className="text-gray-500">進行中チャット: </span>
                <span className="font-bold text-purple-600">{stats.activeChats}件</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
