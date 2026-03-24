"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { signOut, updatePassword, deleteUser as deleteCognitoUser } from "aws-amplify/auth"
import { getCurrentUserEmail } from "@/lib/api"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Lock,
  Moon,
  Sun,
  FileText,
  UserX,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Mail,
  Bell,
} from "lucide-react"
import PushNotificationToggle from "@/components/push-notification-toggle"

export default function SettingsPage() {
  ensureAmplifyConfigured()
  const router = useRouter()
  const { toast } = useToast()

  const [currentEmail, setCurrentEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // パスワード変更
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // ダークモード
  const [isDarkMode, setIsDarkMode] = useState(false)

  // 退会確認
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadUserInfo()
    const savedTheme = localStorage.getItem("theme")
    setIsDarkMode(savedTheme === "dark")
  }, [])

  const loadUserInfo = async () => {
    try {
      const email = await getCurrentUserEmail()
      if (email) {
        setCurrentEmail(email)
      } else {
        router.push("/login")
      }
    } catch {
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "エラー", description: "新しいパスワードが一致しません", variant: "destructive" })
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast({ title: "エラー", description: "パスワードは8文字以上にしてください", variant: "destructive" })
      return
    }

    setIsChangingPassword(true)
    try {
      await updatePassword({
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast({ title: "パスワードを変更しました" })
      setShowPasswordSection(false)
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      console.error("Password change error:", error)
      if (error?.message?.includes("Incorrect") || error?.message?.includes("NotAuthorizedException")) {
        toast({ title: "エラー", description: "現在のパスワードが正しくありません", variant: "destructive" })
      } else {
        toast({ title: "エラー", description: "パスワードの変更に失敗しました。要件を確認してください", variant: "destructive" })
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem("theme", newMode ? "dark" : "light")
    // <html>にdarkクラスを付け外し → CSS変数が切り替わる
    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    toast({ title: newMode ? "ダークモードを有効にしました" : "ライトモードに切り替えました" })
  }

  const handleLogout = async () => {
    try {
      try {
        await signOut({ global: true })
      } catch (cognitoError) {
        console.error("Cognito signOut error:", cognitoError)
      }
      await fetch("/api/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("ログアウトエラー:", error)
      window.location.href = "/login"
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "退会する") {
      toast({ title: "エラー", description: "「退会する」と入力してください", variant: "destructive" })
      return
    }

    setIsDeleting(true)
    try {
      await deleteCognitoUser()
      await fetch("/api/logout", { method: "POST" })
      toast({ title: "アカウントを削除しました" })
      window.location.href = "/"
    } catch (error: any) {
      console.error("Delete account error:", error)
      toast({ title: "エラー", description: "アカウントの削除に失敗しました", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <Layout isLoggedIn={true}>
        <div className="max-w-2xl mx-auto p-4 py-8 text-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout isLoggedIn={true}>
      <div className="max-w-2xl mx-auto p-4 py-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">設定</h1>

        {/* アカウント情報 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: "#f06a4e" }} />
              アカウント情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                <Mail className="w-3.5 h-3.5" />
                メールアドレス
              </label>
              <p className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                {currentEmail}
              </p>
            </div>

            <div>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  パスワード変更
                </span>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showPasswordSection ? "rotate-90" : ""}`} />
              </button>

              {showPasswordSection && (
                <div className="mt-3 space-y-3 pl-1">
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="現在のパスワード"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="新しいパスワード"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="新しいパスワード（確認）"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                    className="w-full"
                    size="sm"
                  >
                    {isChangingPassword ? "変更中..." : "パスワードを変更"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 表示設定 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {isDarkMode ? <Moon className="w-5 h-5" style={{ color: "#f06a4e" }} /> : <Sun className="w-5 h-5" style={{ color: "#f06a4e" }} />}
              表示設定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800">
                {isDarkMode ? "ダークモード" : "ライトモード"}
              </span>
              <div
                className="w-12 h-6 rounded-full relative transition-colors"
                style={{ backgroundColor: isDarkMode ? "#f06a4e" : "#d1d5db" }}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
                  style={{ left: isDarkMode ? "26px" : "2px" }}
                />
              </div>
            </button>
          </CardContent>
        </Card>

        {/* 通知設定 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-5 h-5" style={{ color: "#f06a4e" }} />
              通知設定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PushNotificationToggle />
            <p className="text-xs text-gray-400 mt-2 px-1">
              お気に入りの大会・チームの新着投稿やチャットメッセージをプッシュ通知で受け取れます
            </p>
          </CardContent>
        </Card>

        {/* 法的情報 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: "#f06a4e" }} />
              法的情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Link href="/terms" className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-800">利用規約</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link href="/privacy" className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-800">プライバシーポリシー</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </CardContent>
        </Card>

        {/* ログアウト */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">ログアウト</span>
            </button>
          </CardContent>
        </Card>

        {/* 退会 */}
        <Card className="mb-4 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <UserX className="w-5 h-5" />
              アカウント削除
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-sm text-red-500 hover:text-red-700 py-2 transition-colors"
              >
                退会する
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-600">
                  アカウントを削除すると、すべてのデータが失われます。この操作は取り消せません。
                </p>
                <p className="text-sm text-gray-600">
                  確認のため「退会する」と入力してください。
                </p>
                <Input
                  placeholder="退会する"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="border-red-200 focus:ring-red-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== "退会する"}
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                  >
                    {isDeleting ? "削除中..." : "アカウントを削除"}
                  </Button>
                  <Button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText("") }}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
