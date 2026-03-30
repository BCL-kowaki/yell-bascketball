"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Shield, ArrowLeft, Search, Loader2, ShieldAlert,
  Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp, Save, X, Users
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  isSystemAdmin, adminListAllTeams, updateTeam, adminUpdateTeamApproval, adminDeleteTeam,
  type DbTeam
} from "@/lib/api"

export default function AdminTeamsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<DbTeam> | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [filterApproval, setFilterApproval] = useState<string>("all")

  useEffect(() => {
    const load = async () => {
      const admin = await isSystemAdmin()
      if (!admin) { setIsAdmin(false); setIsLoading(false); return }
      setIsAdmin(true)
      try {
        const data = await adminListAllTeams()
        // 未承認を上に、登録日の降順
        data.sort((a, b) => {
          if (a.isApproved !== b.isApproved) return a.isApproved ? 1 : -1
          return (b.createdAt || '').localeCompare(a.createdAt || '')
        })
        setTeams(data)
      } catch (e) { console.error(e) }
      setIsLoading(false)
    }
    load()
  }, [])

  const filteredTeams = teams.filter(t => {
    if (filterApproval === "pending" && t.isApproved) return false
    if (filterApproval === "approved" && !t.isApproved) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      t.name?.toLowerCase().includes(q) ||
      t.ownerEmail?.toLowerCase().includes(q) ||
      t.prefecture?.toLowerCase().includes(q)
    )
  })

  const pendingCount = teams.filter(t => !t.isApproved).length

  const toggleExpand = (id: string) => {
    if (expandedId === id) { setExpandedId(null); setEditingData(null) }
    else {
      setExpandedId(id)
      const t = teams.find(x => x.id === id)
      if (t) setEditingData({ ...t })
    }
  }

  // チーム承認・却下
  const handleApproval = async (id: string, approved: boolean) => {
    try {
      await adminUpdateTeamApproval(id, approved)
      setTeams(prev => prev.map(t => t.id === id ? { ...t, isApproved: approved } : t))
      toast({ title: approved ? "チームを承認しました" : "チームを未承認に戻しました" })
    } catch (error: any) {
      toast({ title: "エラー", description: error?.message, variant: "destructive" })
    }
  }

  const handleSave = async (id: string) => {
    if (!editingData) return
    setIsSaving(true)
    try {
      const { id: _, createdAt, updatedAt, tournamentTeams, posts, favorites, ...fields } = editingData as any
      await updateTeam(id, fields)
      setTeams(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t))
      setExpandedId(null); setEditingData(null)
      toast({ title: "保存しました" })
    } catch (error: any) {
      toast({ title: "エラー", description: error?.message, variant: "destructive" })
    } finally { setIsSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`「${name}」を削除しますか？この操作は取り消せません。`)) return
    try {
      await adminDeleteTeam(id)
      setTeams(prev => prev.filter(t => t.id !== id))
      toast({ title: "チームを削除しました" })
    } catch (error: any) {
      toast({ title: "エラー", description: error?.message, variant: "destructive" })
    }
  }

  const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('ja-JP') : '-'

  if (isLoading) return <Layout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div></Layout>
  if (!isAdmin) return <Layout><div className="max-w-2xl mx-auto px-4 py-16 text-center"><ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" /><h1 className="text-2xl font-bold mb-2">アクセス権限がありません</h1></div></Layout>

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-2 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />管理者パネル</Button></Link>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <h1 className="text-xl font-bold">チーム管理</h1>
            <Badge variant="secondary">{teams.length}チーム</Badge>
            {pendingCount > 0 && <Badge className="bg-red-500 text-white">{pendingCount}件未承認</Badge>}
          </div>
        </div>

        {/* フィルタータブ */}
        <div className="flex gap-2 mb-3">
          {[
            { key: "all", label: "すべて" },
            { key: "pending", label: `未承認 (${pendingCount})` },
            { key: "approved", label: "承認済み" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterApproval(f.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterApproval === f.key ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >{f.label}</button>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="チーム名・オーナーメール・都道府県で検索..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        <div className="space-y-2">
          {filteredTeams.map(t => (
            <Card key={t.id} className={`overflow-hidden ${!t.isApproved ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-200'}`}>
              <button onClick={() => toggleExpand(t.id)} className="w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {t.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">{t.name}</span>
                    {t.isApproved ? (
                      <Badge variant="outline" className="text-green-600 border-green-300 text-[10px] px-1 py-0"><CheckCircle className="w-2.5 h-2.5 mr-0.5" />承認済み</Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-50 text-[10px] px-1 py-0"><XCircle className="w-2.5 h-2.5 mr-0.5" />未承認</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">管理者: {[t.ownerEmail, ...(t.editorEmails || [])].filter((v, i, a) => v && a.indexOf(v) === i).join(', ') || '-'} | {t.prefecture || '-'}</p>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-xs text-gray-400">{t.headcount ? `${t.headcount}人` : '-'}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(t.createdAt)}</p>
                </div>
                {expandedId === t.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {expandedId === t.id && editingData && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                  {/* 承認ボタン */}
                  <div className="flex gap-2 pb-2 border-b border-gray-200">
                    {!t.isApproved ? (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproval(t.id, true)}>
                        <CheckCircle className="w-3 h-3 mr-1" />承認する
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleApproval(t.id, false)}>
                        <XCircle className="w-3 h-3 mr-1" />未承認に戻す
                      </Button>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">チーム名</label>
                    <Input value={editingData.name || ''} onChange={e => setEditingData({...editingData, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">カテゴリ</label>
                      <Input value={editingData.category || ''} onChange={e => setEditingData({...editingData, category: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">都道府県</label>
                      <Input value={editingData.prefecture || ''} onChange={e => setEditingData({...editingData, prefecture: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">管理者メール（カンマ区切りで複数指定可）</label>
                    <Input
                      value={(() => {
                        const admins = new Set<string>()
                        if (editingData.ownerEmail) admins.add(editingData.ownerEmail)
                        if (editingData.editorEmails) editingData.editorEmails.forEach((e: string) => { if (e) admins.add(e) })
                        return [...admins].join(', ')
                      })()}
                      onChange={e => {
                        const emails = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                        setEditingData({
                          ...editingData,
                          ownerEmail: emails[0] || editingData.ownerEmail,
                          editorEmails: emails.length > 0 ? emails : editingData.editorEmails
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">説明</label>
                    <Input value={editingData.description || ''} onChange={e => setEditingData({...editingData, description: e.target.value})} />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id, t.name)}>
                      <Trash2 className="w-3 h-3 mr-1" />削除
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setExpandedId(null); setEditingData(null) }}><X className="w-3 h-3 mr-1" />キャンセル</Button>
                      <Button size="sm" onClick={() => handleSave(t.id)} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white">
                        <Save className="w-3 h-3 mr-1" />{isSaving ? '保存中...' : '保存'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12 text-gray-500">{searchQuery ? '検索結果が見つかりません' : 'チームがありません'}</div>
        )}
      </div>
    </Layout>
  )
}
