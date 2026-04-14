"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users, ArrowLeft, Search, Loader2, ShieldAlert,
  Trash2, Mail, MapPin, Calendar, ChevronDown, ChevronUp, Save, X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  isSystemAdmin, adminListAllUsers, adminUpdateUser, adminDeleteUser,
  isAdminEmail, type DbUser
} from "@/lib/api"

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<DbUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<Partial<DbUser> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const admin = await isSystemAdmin()
      if (!admin) { setIsAdmin(false); setIsLoading(false); return }
      setIsAdmin(true)
      try {
        const data = await adminListAllUsers()
        // 登録日の降順（最新が上）
        data.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        setUsers(data)
      } catch (e) { console.error(e) }
      setIsLoading(false)
    }
    load()
  }, [])

  // 検索フィルター
  const filteredUsers = users.filter(u => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      u.email?.toLowerCase().includes(q) ||
      `${u.lastName} ${u.firstName}`.toLowerCase().includes(q) ||
      u.prefecture?.toLowerCase().includes(q)
    )
  })

  // ユーザー展開/折りたたみ
  const toggleExpand = (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null)
      setEditingUser(null)
    } else {
      setExpandedUserId(userId)
      const user = users.find(u => u.id === userId)
      if (user) setEditingUser({ ...user })
    }
  }

  // ユーザー保存
  const handleSave = async (userId: string) => {
    if (!editingUser) return
    setIsSaving(true)
    try {
      const { id, createdAt, updatedAt, ...updateFields } = editingUser as any
      await adminUpdateUser(userId, updateFields)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updateFields } : u))
      setExpandedUserId(null)
      setEditingUser(null)
      toast({ title: "保存しました" })
    } catch (error: any) {
      toast({ title: "エラー", description: error?.message || "保存に失敗しました", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  // ユーザー削除
  const handleDelete = async (userId: string, email: string) => {
    if (isAdminEmail(email)) {
      toast({ title: "エラー", description: "管理者アカウントは削除できません", variant: "destructive" })
      return
    }
    if (!window.confirm(`${email} を削除しますか？この操作は取り消せません。`)) return
    try {
      await adminDeleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      toast({ title: "ユーザーを削除しました" })
    } catch (error: any) {
      toast({ title: "エラー", description: error?.message, variant: "destructive" })
    }
  }

  const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('ja-JP') : '-'

  if (isLoading) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div></Layout>
  }
  if (!isAdmin) {
    return <Layout><div className="max-w-2xl mx-auto px-4 py-16 text-center"><ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" /><h1 className="text-2xl font-bold mb-2">アクセス権限がありません</h1></div></Layout>
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-2 py-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />管理者パネル</Button>
          </Link>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h1 className="text-xl font-bold">ユーザー管理</h1>
            <Badge variant="secondary">{users.length}人</Badge>
          </div>
        </div>

        {/* 検索 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="名前・メール・都道府県で検索..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* ユーザー一覧 */}
        <div className="space-y-2">
          {filteredUsers.map(user => (
            <Card key={user.id} className="border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleExpand(user.id)}
                className="w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {user.lastName?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {user.lastName} {user.firstName}
                    </span>
                    {isAdminEmail(user.email) && (
                      <Badge className="bg-red-500 text-white text-[10px] px-1 py-0">管理者</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-xs text-gray-400">{user.prefecture || '-'}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(user.createdAt)}</p>
                </div>
                {expandedUserId === user.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {/* 展開: 編集フォーム */}
              {expandedUserId === user.id && editingUser && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">姓</label>
                      <Input value={editingUser.lastName || ''} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">名</label>
                      <Input value={editingUser.firstName || ''} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">メールアドレス</label>
                    <Input value={editingUser.email || ''} disabled className="bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">カテゴリ</label>
                      <Input value={editingUser.category || ''} onChange={e => setEditingUser({...editingUser, category: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">都道府県</label>
                      <Input value={editingUser.prefecture || ''} onChange={e => setEditingUser({...editingUser, prefecture: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">自己紹介</label>
                    <Input value={editingUser.bio || ''} onChange={e => setEditingUser({...editingUser, bio: e.target.value})} />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id, user.email)} disabled={isAdminEmail(user.email)}>
                      <Trash2 className="w-3 h-3 mr-1" />削除
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setExpandedUserId(null); setEditingUser(null) }}>
                        <X className="w-3 h-3 mr-1" />キャンセル
                      </Button>
                      <Button size="sm" onClick={() => handleSave(user.id)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Save className="w-3 h-3 mr-1" />{isSaving ? '保存中...' : '保存'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? '検索結果が見つかりません' : 'ユーザーがいません'}
          </div>
        )}
      </div>
    </Layout>
  )
}
