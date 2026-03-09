"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { getUserByEmail, updateUser } from "@/lib/api"
import { generateClient } from 'aws-amplify/api'
import { createUser } from '@/src/graphql/mutations'
import { PREFECTURES_BY_REGION, REGION_BLOCKS } from "@/lib/regionData"
import { useToast } from "@/hooks/use-toast"

// ユーザーカテゴリ
const USER_CATEGORIES = [
  { value: "general", label: "一般ユーザー" },
  { value: "organizer", label: "大会運営者" },
  { value: "team_manager", label: "チーム運営者" },
  { value: "player", label: "選手" },
]

function SetupProfileForm() {
  ensureAmplifyConfigured()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    username: "",
    prefecture: "",
    category: "",
  })

  const [selectedRegion, setSelectedRegion] = useState("")
  const [availablePrefectures, setAvailablePrefectures] = useState<string[]>([])

  useEffect(() => {
    if (selectedRegion && PREFECTURES_BY_REGION[selectedRegion]) {
      setAvailablePrefectures(PREFECTURES_BY_REGION[selectedRegion])
    } else {
      setAvailablePrefectures([])
    }
  }, [selectedRegion])

  const handleSave = async () => {
    if (!email) {
      toast({ title: "エラー", description: "メールアドレスが見つかりません", variant: "destructive" })
      return
    }

    if (!formData.lastName || !formData.firstName) {
      toast({ title: "エラー", description: "名前を入力してください", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      // まずDynamoDBにユーザーが存在するか確認
      let user = await getUserByEmail(email)

      if (!user) {
        // ユーザーが存在しない場合、新規作成
        const client = generateClient({ authMode: 'apiKey' })
        const result = await client.graphql({
          query: createUser,
          variables: {
            input: {
              email: email,
              firstName: formData.firstName,
              lastName: formData.lastName,
            }
          },
          authMode: 'apiKey'
        })
        // @ts-ignore
        user = result.data?.createUser
      }

      if (user) {
        // プロフィール情報を更新
        await updateUser(user.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          prefecture: formData.prefecture || null,
          category: formData.category || null,
          region: selectedRegion || null,
        })
      }

      toast({ title: "プロフィールを保存しました" })

      // セッションを設定
      try {
        const sessionResponse = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, userId: user?.id || email }),
        })
        if (sessionResponse.ok) {
          window.location.href = "/tournaments"
        } else {
          window.location.href = "/tournaments"
        }
      } catch {
        window.location.href = "/tournaments"
      }
    } catch (error: any) {
      console.error("Profile setup error:", error)
      toast({ title: "エラー", description: error.message || "プロフィールの保存に失敗しました", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    if (!email) {
      toast({ title: "エラー", description: "メールアドレスが見つかりません", variant: "destructive" })
      return
    }

    setIsSkipping(true)
    try {
      // DynamoDBにユーザーが存在しない場合は作成
      let user = await getUserByEmail(email)
      if (!user) {
        const client = generateClient({ authMode: 'apiKey' })
        const result = await client.graphql({
          query: createUser,
          variables: {
            input: {
              email: email,
              firstName: "",
              lastName: "",
            }
          },
          authMode: 'apiKey'
        })
        // @ts-ignore
        user = result.data?.createUser
      }

      // セッションを設定
      try {
        const sessionResponse = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, userId: user?.id || email }),
        })
        if (sessionResponse.ok) {
          window.location.href = "/tournaments"
        } else {
          window.location.href = "/tournaments"
        }
      } catch {
        window.location.href = "/tournaments"
      }
    } catch (error: any) {
      console.error("Skip error:", error)
      toast({ title: "エラー", description: error.message || "エラーが発生しました", variant: "destructive" })
    } finally {
      setIsSkipping(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        margin: 0,
        padding: 0,
        border: "none",
        outline: "none",
        background: "linear-gradient(135deg, rgba(247, 147, 30, 0.9) 0%, rgba(240, 106, 78, 0.9) 40%, rgba(232, 75, 138, 0.9) 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          padding: "24px 16px",
          border: "none",
          outline: "none",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "16px", border: "none", outline: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="YeLL Basketball"
            style={{
              width: "140px",
              height: "auto",
              filter: "brightness(0) invert(1)",
              border: "none",
              outline: "none",
            }}
          />
        </div>

        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "14px",
            marginBottom: "20px",
            border: "none",
            outline: "none",
          }}
        >
          プロフィールを設定（後から変更可能）
        </p>

        {/* Form Card */}
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "16px",
            padding: "28px 24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            border: "none",
            outline: "none",
          }}
        >
          {/* 名前（姓名） */}
          <div style={{ marginBottom: "16px", border: "none", outline: "none" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#333", marginBottom: "6px", display: "block", border: "none", outline: "none" }}>
              名前 <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", border: "none", outline: "none" }}>
              <input
                placeholder="姓"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px",
                  fontSize: "15px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "10px",
                  border: "none",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#1e1e1e",
                }}
              />
              <input
                placeholder="名"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px",
                  fontSize: "15px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "10px",
                  border: "none",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#1e1e1e",
                }}
              />
            </div>
          </div>

          {/* ユーザー名 */}
          <div style={{ marginBottom: "16px", border: "none", outline: "none" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#333", marginBottom: "6px", display: "block", border: "none", outline: "none" }}>
              ユーザー名（任意）
            </label>
            <p style={{ fontSize: "11px", color: "#999", marginBottom: "6px", margin: "0 0 6px 0", border: "none", outline: "none" }}>
              ※表示名はこちらを優先します
            </p>
            <input
              placeholder="例: basketball_lover"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              style={{
                width: "100%",
                height: "44px",
                padding: "0 12px",
                fontSize: "15px",
                backgroundColor: "#f5f5f5",
                borderRadius: "10px",
                border: "none",
                outline: "none",
                boxSizing: "border-box",
                color: "#1e1e1e",
              }}
            />
          </div>

          {/* 都道府県 */}
          <div style={{ marginBottom: "16px", border: "none", outline: "none" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#333", marginBottom: "6px", display: "block", border: "none", outline: "none" }}>
              都道府県（任意）
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value)
                setFormData({ ...formData, prefecture: "" })
              }}
              style={{
                width: "100%",
                height: "44px",
                padding: "0 12px",
                fontSize: "15px",
                backgroundColor: "#f5f5f5",
                borderRadius: "10px",
                border: "none",
                outline: "none",
                boxSizing: "border-box",
                color: selectedRegion ? "#1e1e1e" : "#999",
                marginBottom: "8px",
                appearance: "auto",
                WebkitAppearance: "auto",
              }}
            >
              <option value="">地域ブロックを選択</option>
              {REGION_BLOCKS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {availablePrefectures.length > 0 && (
              <select
                value={formData.prefecture}
                onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px",
                  fontSize: "15px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "10px",
                  border: "none",
                  outline: "none",
                  boxSizing: "border-box",
                  color: formData.prefecture ? "#1e1e1e" : "#999",
                  appearance: "auto",
                  WebkitAppearance: "auto",
                }}
              >
                <option value="">都道府県を選択</option>
                {availablePrefectures.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}
          </div>

          {/* カテゴリ */}
          <div style={{ marginBottom: "24px", border: "none", outline: "none" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#333", marginBottom: "8px", display: "block", border: "none", outline: "none" }}>
              カテゴリ（任意）
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", border: "none", outline: "none" }}>
              {USER_CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  onClick={() => setFormData({ ...formData, category: formData.category === cat.value ? "" : cat.value })}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "10px",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: formData.category === cat.value ? 700 : 500,
                    cursor: "pointer",
                    backgroundColor: formData.category === cat.value ? "#fcf4e7" : "#f5f5f5",
                    color: formData.category === cat.value ? "#f06a4e" : "#666",
                    border: formData.category === cat.value ? "2px solid #f06a4e" : "2px solid transparent",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                  }}
                >
                  {cat.label}
                </div>
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div style={{ display: "flex", gap: "12px", border: "none", outline: "none" }}>
            <button
              onClick={handleSave}
              disabled={isLoading || isSkipping}
              style={{
                flex: 1,
                height: "48px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #f7931e 0%, #f06a4e 50%, #e84b8a 100%)",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: isLoading || isSkipping ? "not-allowed" : "pointer",
                opacity: isLoading || isSkipping ? 0.7 : 1,
                border: "none",
                outline: "none",
              }}
            >
              {isLoading ? "保存中..." : "保存して続ける"}
            </button>
            <button
              onClick={handleSkip}
              disabled={isLoading || isSkipping}
              style={{
                flex: 1,
                height: "48px",
                borderRadius: "10px",
                backgroundColor: "#e5e5e5",
                color: "#666",
                fontSize: "15px",
                fontWeight: 600,
                cursor: isLoading || isSkipping ? "not-allowed" : "pointer",
                opacity: isLoading || isSkipping ? 0.7 : 1,
                border: "none",
                outline: "none",
              }}
            >
              {isSkipping ? "スキップ中..." : "スキップ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SetupProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetupProfileForm />
    </Suspense>
  )
}
