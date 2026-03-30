"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Save, Loader2, UserCog, Plus, Trash2, ShieldCheck, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  isAdminLoggedIn, isSystemAdmin, getCurrentUserEmail,
  getAdminEmails, updateAdminEmails, getUserByEmail,
  type DbUser
} from "@/lib/api"

export default function AdminAdminsPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [adminEmails, setAdminEmails] = useState<string[]>([])
  const [currentEmail, setCurrentEmail] = useState<string>("")
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState("")
  const [addError, setAddError] = useState<string | null>(null)

  // 管理者ユーザー情報（名前表示用）
  const [adminUsers, setAdminUsers] = useState<Map<string, DbUser | null>>(new Map())

  // デフォルト管理者（削除不可）
  const defaultAdminEmail = "kowaki1111@gmail.com"

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      if (isAdminLoggedIn()) {
        setIsAuthorized(true)
        setCurrentEmail("admin")
        await loadAdmins()
        return
      }

      const email = await getCurrentUserEmail()
      if (email) {
        const isAdmin = await isSystemAdmin()
        if (isAdmin) {
          setIsAuthorized(true)
          setCurrentEmail(email)
          await loadAdmins()
          return
        }
      }

      setIsAuthorized(false)
    } catch (error) {
      console.error("認証チェックエラー:", error)
      setIsAuthorized(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadAdmins() {
    try {
      const emails = await getAdminEmails()
      setAdminEmails(emails)

      // 各管理者のユーザー情報を取得
      const userMap = new Map<string, DbUser | null>()
      await Promise.all(
        emails.map(async (email) => {
          try {
            const user = await getUserByEmail(email)
            userMap.set(email, user)
          } catch {
            userMap.set(email, null)
          }
        })
      )
      setAdminUsers(userMap)
    } catch (error) {
      console.error("管理者一覧取得エラー:", error)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    setSaveMessage(null)
    try {
      await updateAdminEmails(adminEmails, currentEmail)
      setSaveMessage("保存しました")
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error("管理者メール保存エラー:", error)
      setSaveMessage("保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  // メールアドレスの簡易バリデーション
  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async function handleAddAdmin() {
    setAddError(null)
    const email = newEmail.toLowerCase().trim()

    if (!email) {
      setAddError("メールアドレスを入力してください")
      return
    }
    if (!isValidEmail(email)) {
      setAddError("有効なメールアドレスを入力してください")
      return
    }
    if (adminEmails.includes(email)) {
      setAddError("既に管理者として登録されています")
      return
    }

    // ユーザーが存在するか確認
    try {
      const user = await getUserByEmail(email)
      if (!user) {
        setAddError("このメールアドレスのユーザーが見つかりません。先にYeLLにユーザー登録してください。")
        return
      }

      const newList = [...adminEmails, email]
      setAdminEmails(newList)
      setAdminUsers(prev => {
        const newMap = new Map(prev)
        newMap.set(email, user)
        return newMap
      })
      setNewEmail("")
    } catch (error) {
      console.error("ユーザー確認エラー:", error)
      setAddError("ユーザーの確認に失敗しました")
    }
  }

  function handleRemoveAdmin(email: string) {
    if (email === defaultAdminEmail) return // デフォルト管理者は削除不可
    setAdminEmails(prev => prev.filter(e => e !== email))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">アクセス権限がありません</p>
          <Link href="/admin" className="text-blue-500 hover:underline mt-4 inline-block">
            管理者パネルに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <UserCog size={20} className="text-red-500" />
              <h1 className="text-lg font-bold">管理者管理</h1>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
            style={{
              background: 'linear-gradient(135deg, #f7931e 0%, #f06a4e 50%, #e84b8a 100%)',
            }}
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            保存
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-2 py-6 space-y-6">
        {/* 保存メッセージ */}
        {saveMessage && (
          <div className={`p-3 rounded-lg text-sm text-center ${
            saveMessage.includes('失敗') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* 説明 */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600">
              管理者権限を持つユーザーを管理します。管理者はYeLLの全機能（ユーザー管理、大会管理、チーム管理など）にアクセスできます。
            </p>
            <p className="text-xs text-gray-400 mt-2">
              ※ デフォルト管理者（kowaki1111@gmail.com）は削除できません。
            </p>
          </CardContent>
        </Card>

        {/* 管理者追加 */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <h2 className="font-semibold flex items-center gap-2">
              <Plus size={16} />
              管理者を追加
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="追加するメールアドレスを入力..."
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value)
                  setAddError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddAdmin()
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleAddAdmin}
                disabled={!newEmail.trim()}
                className="gap-1"
                style={{
                  background: 'linear-gradient(135deg, #f7931e 0%, #f06a4e 50%, #e84b8a 100%)',
                }}
              >
                <Plus size={16} />
                追加
              </Button>
            </div>
            {addError && (
              <p className="text-sm text-red-500 mt-2">{addError}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              YeLLに登録済みのユーザーのメールアドレスを入力してください
            </p>
          </CardContent>
        </Card>

        {/* 管理者一覧 */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <h2 className="font-semibold flex items-center gap-2">
              <ShieldCheck size={16} />
              管理者一覧（{adminEmails.length}名）
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adminEmails.map((email) => {
                const user = adminUsers.get(email)
                const isDefault = email === defaultAdminEmail
                return (
                  <div
                    key={email}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isDefault ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {/* アイコン */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDefault ? 'bg-amber-100' : 'bg-gray-100'
                    }`}>
                      {isDefault ? (
                        <ShieldAlert size={20} className="text-amber-600" />
                      ) : (
                        <ShieldCheck size={20} className="text-green-600" />
                      )}
                    </div>

                    {/* ユーザー情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {user ? `${user.lastName} ${user.firstName}` : '（未登録ユーザー）'}
                        </p>
                        {isDefault && (
                          <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">
                            デフォルト
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{email}</p>
                    </div>

                    {/* 削除ボタン */}
                    {!isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAdmin(email)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                )
              })}

              {adminEmails.length === 0 && (
                <div className="text-center py-8">
                  <UserCog className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">管理者が登録されていません</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
