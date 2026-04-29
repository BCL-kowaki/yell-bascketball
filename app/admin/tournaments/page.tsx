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
  Trash2, MapPin, Calendar, ChevronDown, ChevronUp, Save, X, Shield, Flag, Plus, CheckCircle, XCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  isSystemAdmin, adminListAllTournaments, updateTournament, adminDeleteTournament,
  adminUpdateTournamentApproval, createTournament, getCurrentUserEmail,
  type DbTournament
} from "@/lib/api"
import {
  REGION_BLOCKS, PREFECTURES_BY_REGION, CATEGORIES,
  OFFICIAL_AREAS_BY_PREFECTURE
} from "@/lib/regionData"

// 公式戦の新規登録フォームの初期値
const INITIAL_OFFICIAL_FORM = {
  name: "",
  category: "",
  regionBlock: "",
  prefecture: "",
  area: "",
  subArea: "",
  description: "",
  adminEmails: "", // カンマ区切り
}

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

  // 公式戦新規登録用
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState(INITIAL_OFFICIAL_FORM)
  const [isCreating, setIsCreating] = useState(false)

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

  // 公式戦の連動セレクト用データ
  const availablePrefectures = createForm.regionBlock
    ? (PREFECTURES_BY_REGION[createForm.regionBlock] || [])
    : []

  const areaHierarchy = createForm.prefecture
    ? (OFFICIAL_AREAS_BY_PREFECTURE[createForm.prefecture] || null)
    : null

  const availableAreas = areaHierarchy ? Object.keys(areaHierarchy) : []

  const availableSubAreas = (areaHierarchy && createForm.area)
    ? (areaHierarchy[createForm.area] || [])
    : []

  const pendingTournamentCount = tournaments.filter(t => !t.isApproved).length

  const filteredTournaments = tournaments.filter(t => {
    if (filterType === "official" && t.tournamentType !== "official") return false
    if (filterType === "cup" && t.tournamentType === "official") return false
    if (filterType === "pending" && t.isApproved) return false
    if (filterType === "approved" && !t.isApproved) return false
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

  // 大会承認・却下
  const handleApproval = async (id: string, approved: boolean) => {
    try {
      await adminUpdateTournamentApproval(id, approved)
      setTournaments(prev => prev.map(t => t.id === id ? { ...t, isApproved: approved } : t))
      toast({ title: approved ? "大会を承認しました" : "大会を未承認に戻しました" })

      // オーナーへ承認結果通知(Web Push + DB通知)
      try {
        const target = tournaments.find(t => t.id === id)
        if (target?.ownerEmail) {
          const { notifyTournamentApprovalResult } = await import('@/lib/push-sender')
          await notifyTournamentApprovalResult(target.ownerEmail, id, target.name || '大会', approved)
        }
      } catch (notifyErr: any) {
        console.error('大会承認通知エラー:', notifyErr?.message)
      }
    } catch (error: any) {
      toast({ title: "エラー", description: error?.message, variant: "destructive" })
    }
  }

  // 公式戦の新規登録
  const handleCreateOfficial = async () => {
    if (!createForm.name.trim()) {
      toast({ title: "大会名を入力してください", variant: "destructive" })
      return
    }
    if (!createForm.regionBlock) {
      toast({ title: "地域ブロックを選択してください", variant: "destructive" })
      return
    }
    if (!createForm.prefecture) {
      toast({ title: "都道府県を選択してください", variant: "destructive" })
      return
    }

    setIsCreating(true)
    try {
      const currentEmail = await getCurrentUserEmail()
      if (!currentEmail) {
        toast({ title: "ログインが必要です", variant: "destructive" })
        return
      }

      // 管理者メールを解析
      const adminEmails = createForm.adminEmails
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      // ownerEmailは最初の管理者、なければ現在のユーザー
      const ownerEmail = adminEmails[0] || currentEmail
      const coAdminEmails = adminEmails.length > 0 ? adminEmails : [currentEmail]

      const tournamentData: Partial<DbTournament> = {
        name: createForm.name.trim(),
        tournamentType: "official",
        category: createForm.category || null,
        regionBlock: createForm.regionBlock,
        prefecture: createForm.prefecture,
        area: createForm.area || null,
        subArea: createForm.subArea || null,
        district: null,
        description: createForm.description.trim() || null,
        ownerEmail,
        coAdminEmails,
        isApproved: true,
      }

      const created = await createTournament(tournamentData)
      setTournaments(prev => [created, ...prev])
      setCreateForm(INITIAL_OFFICIAL_FORM)
      setShowCreateForm(false)
      toast({ title: "公式戦を登録しました" })
    } catch (error: any) {
      toast({ title: "エラー", description: error?.message, variant: "destructive" })
    } finally {
      setIsCreating(false)
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
            <Trophy className="w-5 h-5 text-[#f06a4e]" />
            <h1 className="text-xl font-bold">大会管理</h1>
            <Badge variant="secondary">{tournaments.length}件</Badge>
            {pendingTournamentCount > 0 && <Badge className="bg-red-500 text-white">{pendingTournamentCount}件未承認</Badge>}
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-[#f7931e] to-[#e84b8a] hover:from-[#e8841a] hover:to-[#d44080] text-white"
          >
            <Plus className="w-4 h-4 mr-1" />公式戦を登録
          </Button>
        </div>

        {/* 公式戦 新規登録フォーム */}
        {showCreateForm && (
          <Card className="mb-4 border-2 border-[#f06a4e] overflow-hidden">
            <div className="bg-gradient-to-r from-[#f7931e] to-[#e84b8a] px-4 py-2">
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-4 h-4" />
                <span className="font-bold text-sm">公式戦の新規登録</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {/* 大会名 */}
              <div>
                <label className="text-xs font-medium text-gray-600">大会名 *</label>
                <Input
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="例: 福岡県ミニバスケットボール大会"
                />
              </div>

              {/* カテゴリ */}
              <div>
                <label className="text-xs font-medium text-gray-600">カテゴリ</label>
                <select
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                  value={createForm.category}
                  onChange={e => setCreateForm({ ...createForm, category: e.target.value })}
                >
                  <option value="">選択してください</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 地域ブロック */}
              <div>
                <label className="text-xs font-medium text-gray-600">地域ブロック *</label>
                <select
                  className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                  value={createForm.regionBlock}
                  onChange={e => setCreateForm({
                    ...createForm,
                    regionBlock: e.target.value,
                    prefecture: "",
                    area: "",
                    subArea: "",
                  })}
                >
                  <option value="">選択してください</option>
                  {REGION_BLOCKS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* 都道府県 */}
              {availablePrefectures.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-600">都道府県 *</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                    value={createForm.prefecture}
                    onChange={e => setCreateForm({
                      ...createForm,
                      prefecture: e.target.value,
                      area: "",
                      subArea: "",
                    })}
                  >
                    <option value="">選択してください</option>
                    {availablePrefectures.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* エリア（公式戦の階層データがある場合） */}
              {availableAreas.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-600">エリア</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                    value={createForm.area}
                    onChange={e => setCreateForm({
                      ...createForm,
                      area: e.target.value,
                      subArea: "",
                    })}
                  >
                    <option value="">選択してください</option>
                    {availableAreas.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* サブエリア */}
              {availableSubAreas.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-600">サブエリア</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                    value={createForm.subArea}
                    onChange={e => setCreateForm({ ...createForm, subArea: e.target.value })}
                  >
                    <option value="">選択してください</option>
                    {availableSubAreas.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 管理者メール */}
              <div>
                <label className="text-xs font-medium text-gray-600">管理者メール（カンマ区切りで複数指定可）</label>
                <Input
                  value={createForm.adminEmails}
                  onChange={e => setCreateForm({ ...createForm, adminEmails: e.target.value })}
                  placeholder="admin@example.com, sub@example.com"
                />
                <p className="text-[10px] text-gray-400 mt-1">※ 未入力の場合、現在のログインユーザーが管理者になります</p>
              </div>

              {/* 説明 */}
              <div>
                <label className="text-xs font-medium text-gray-600">説明</label>
                <Input
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="大会の説明（任意）"
                />
              </div>

              {/* ボタン */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowCreateForm(false); setCreateForm(INITIAL_OFFICIAL_FORM) }}
                >
                  <X className="w-3 h-3 mr-1" />キャンセル
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateOfficial}
                  disabled={isCreating}
                  className="bg-[#f06a4e] hover:bg-[#e05a3e] text-white"
                >
                  {isCreating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Shield className="w-3 h-3 mr-1" />}
                  {isCreating ? '登録中...' : '公式戦を登録'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* フィルタータブ */}
        <div className="flex gap-2 mb-3">
          {[
            { key: "all", label: "すべて" },
            { key: "pending", label: `未承認 (${pendingTournamentCount})` },
            { key: "approved", label: "承認済み" },
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
          <Input placeholder="大会名・主催者メール・都道府県で検索..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-white" />
        </div>

        {/* 一覧 */}
        <div className="space-y-2">
          {filteredTournaments.map(t => (
            <Card key={t.id} className={`overflow-hidden ${!t.isApproved ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-200'}`}>
              <button onClick={() => toggleExpand(t.id)} className="w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.tournamentType === 'official' ? 'bg-gradient-to-br from-[#f7931e] to-[#e84b8a]' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                  {t.tournamentType === 'official' ? <Shield className="w-5 h-5 text-white" /> : <Flag className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">{t.name}</span>
                    {t.tournamentType === 'official' && <Badge className="bg-[#f06a4e] text-white text-[10px] px-1 py-0">公式</Badge>}
                    {t.isApproved ? (
                      <Badge variant="outline" className="text-green-600 border-green-300 text-[10px] px-1 py-0"><CheckCircle className="w-2.5 h-2.5 mr-0.5" />承認済み</Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-50 text-[10px] px-1 py-0"><XCircle className="w-2.5 h-2.5 mr-0.5" />未承認</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {[t.prefecture, t.district || t.area].filter(Boolean).join(' / ')} | 管理者: {[t.ownerEmail, ...(t.coAdminEmails || [])].filter((v, i, a) => v && a.indexOf(v) === i).join(', ') || '-'}
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
                  {/* 公式戦のエリア編集 */}
                  {editingData.tournamentType === 'official' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600">エリア</label>
                        <Input value={editingData.area || ''} onChange={e => setEditingData({...editingData, area: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">サブエリア</label>
                        <Input value={editingData.subArea || ''} onChange={e => setEditingData({...editingData, subArea: e.target.value})} />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-gray-600">管理者メール（カンマ区切りで複数指定可）</label>
                    <Input
                      value={(() => {
                        const admins = new Set<string>()
                        if (editingData.ownerEmail) admins.add(editingData.ownerEmail)
                        if (editingData.coAdminEmails) editingData.coAdminEmails.forEach((e: string) => { if (e) admins.add(e) })
                        return [...admins].join(', ')
                      })()}
                      onChange={e => {
                        const emails = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                        setEditingData({
                          ...editingData,
                          ownerEmail: emails[0] || editingData.ownerEmail,
                          coAdminEmails: emails.length > 0 ? emails : editingData.coAdminEmails
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">説明</label>
                    <Input value={editingData.description || ''} onChange={e => setEditingData({...editingData, description: e.target.value})} />
                  </div>
                  {/* 承認ボタン */}
                  <div className="flex items-center gap-2 pt-2 pb-2">
                    {!t.isApproved ? (
                      <Button size="sm" onClick={() => handleApproval(t.id, true)} className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />承認する
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleApproval(t.id, false)} className="text-yellow-600 border-yellow-400 hover:bg-yellow-50">
                        <XCircle className="w-3 h-3 mr-1" />未承認に戻す
                      </Button>
                    )}
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
