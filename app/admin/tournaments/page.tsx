"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Trophy, ArrowLeft, Search, Loader2, ShieldAlert,
  Trash2, MapPin, Calendar, ChevronDown, ChevronUp, Save, X, Shield, Flag
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  isSystemAdmin, adminListAllTournaments, updateTournament, adminDeleteTournament,
  type DbTournament
} from "@/lib/api"

export default function AdminTournamentsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tournaments, setTournaments] = useState<DbTournament[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<DbTournament> | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    const load = async () => {
      const admin = await isSystemAdmin()
      if (!admin) { setIsAdmin(false); setIsLoading(false); return }
      setIsAdmin(true)
      try {
        const data = await adminListAllTournaments()
        data.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        setTournaments(data)
      } catch (e) { console.error(e) }
      setIsLoading(false)
    }
    load()
  }, [])

  const filteredTournaments = tournaments.filter(t => {
    if (filterType === "official" && t.tournamentType !== "official") return false
    if (filterType === "cup" && t.tournamentType === "official") return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      t.name?.toLowerCase().includes(q) ||
      t.ownerEmail?.toLowerCase().includes(q) ||
      t.prefecture?.toLowerCase().includes(q)
    )
  })

  const toggleExpand = (id: string) => {
    if (expandedId === id) { setExpandedId(null); setEditingData(null) }
    else {
      setExpandedId(id)
      const t = tournaments.find(x => x.id === id)
      if (t) setEditingData({ ...t })
    }
  }

  const handleSave = async (id: string) => {
    if (!editingData) return
    setIsSaving(true)
    try {
      const { id: _, createdAt, updatedAt, ...fields } = editingData as any
      await updateTournament(id, fields)
      setTournaments(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t))
      setExpandedId(null); setEditingData(null)
      toast({ title: "保存しました" })
    } catch (error: any) {
      toast({ title: "エラー", description: error?.message, variant: "destructive" })
    } finally { setIsSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`「${name}」を削除しますか？この操作は取り消せません。`)) return
    try {
      await adminDeleteTournament(id)
      setTournaments(prev => prev.filter(t => t.id !== id))
      toast({ title: "大会を削除しました" })
    } catch (error: any) {
      toast({ title: "エラー", description: error?.message, variant: "destructive" })
    }
  }

  const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('ja-JP') : '-'

  if (isLoading) return <Layout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div></Layout>
  if (!isAdmin) return <Layout><div className="max-w-2xl mx-auto px-4 py-16 text-center"><ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" /><h1 className="text-2xl font-bold mb-2">アクセス権限がありません</h1></div></Layout>

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />管理者パネル</Button></Link>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#f06a4e]" />
            <h1 className="text-xl font-bold">大会管理</h1>
            <Badge variant="secondary">{tournaments.length}件</Badge>
          </div>
        </div>

        {/* フィルタータブ */}
        <div className="flex gap-2 mb-3">
          {[
            { key: "all", label: "すべて" },
            { key: "official", label: "公式戦" },
            { key: "cup", label: "カップ戦" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterType === f.key ? 'bg-[#f06a4e] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >{f.label}</button>
          ))}
        </div>

        {/* 検索 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="大会名・主催者メール・都道府県で検索..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {/* 一覧 */}
        <div className="space-y-2">
          {filteredTournaments.map(t => (
            <Card key={t.id} className="border-gray-200 overflow-hidden">
              <button onClick={() => toggleExpand(t.id)} className="w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.tournamentType === 'official' ? 'bg-gradient-to-br from-[#f7931e] to-[#e84b8a]' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                  {t.tournamentType === 'official' ? <Shield className="w-5 h-5 text-white" /> : <Flag className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">{t.name}</span>
                    {t.tournamentType === 'official' && <Badge className="bg-[#f06a4e] text-white text-[10px] px-1 py-0">公式</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {[t.prefecture, t.district || t.area].filter(Boolean).join(' / ')} | {t.ownerEmail}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-xs text-gray-400">{t.category || '-'}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(t.createdAt)}</p>
                </div>
                {expandedId === t.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {expandedId === t.id && editingData && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">大会名</label>
                    <Input value={editingData.name || ''} onChange={e => setEditingData({...editingData, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">タイプ</label>
                      <Input value={editingData.tournamentType || 'cup'} disabled className="bg-gray-100" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">カテゴリ</label>
                      <Input value={editingData.category || ''} onChange={e => setEditingData({...editingData, category: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">地域ブロック</label>
                      <Input value={editingData.regionBlock || ''} onChange={e => setEditingData({...editingData, regionBlock: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">都道府県</label>
                      <Input value={editingData.prefecture || ''} onChange={e => setEditingData({...editingData, prefecture: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">地区</label>
                      <Input value={editingData.district || ''} onChange={e => setEditingData({...editingData, district: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">主催者メール</label>
                    <Input value={editingData.ownerEmail || ''} onChange={e => setEditingData({...editingData, ownerEmail: e.target.value})} />
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
                      <Button size="sm" onClick={() => handleSave(t.id)} disabled={isSaving} className="bg-[#f06a4e] hover:bg-[#e05a3e] text-white">
                        <Save className="w-3 h-3 mr-1" />{isSaving ? '保存中...' : '保存'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-12 text-gray-500">{searchQuery ? '検索結果が見つかりません' : '大会がありません'}</div>
        )}
      </div>
    </Layout>
  )
}
