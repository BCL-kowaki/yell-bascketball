"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Navigation, ChevronRight, Loader2 } from "lucide-react"
import { getCurrentPosition, getNearestPrefecture } from "@/lib/geolocation"
import { REGION_BLOCKS, PREFECTURES_BY_REGION } from "@/lib/regionData"
import { REGION_NAME_TO_SLUG, PREFECTURE_NAME_TO_SLUG } from "@/lib/regionMapping"

export default function WelcomePage() {
  const router = useRouter()
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsPrefecture, setGpsPrefecture] = useState<string | null>(null)
  const [gpsRegion, setGpsRegion] = useState<string | null>(null)
  const [gpsError, setGpsError] = useState(false)
  const [gpsAttempted, setGpsAttempted] = useState(false)

  // ページ表示時にGPSを自動取得
  useEffect(() => {
    const detectLocation = async () => {
      setGpsLoading(true)
      try {
        const pos = await getCurrentPosition()
        const { prefecture, region } = getNearestPrefecture(pos.lat, pos.lng)
        setGpsPrefecture(prefecture)
        setGpsRegion(region)
      } catch {
        setGpsError(true)
      } finally {
        setGpsLoading(false)
        setGpsAttempted(true)
      }
    }
    detectLocation()
  }, [])

  const handleGpsPrefectureClick = () => {
    if (gpsPrefecture && gpsRegion) {
      const regionSlug = REGION_NAME_TO_SLUG[gpsRegion]
      const prefSlug = PREFECTURE_NAME_TO_SLUG[gpsPrefecture]
      if (regionSlug && prefSlug) {
        router.push(`/tournaments/${regionSlug}/${prefSlug}`)
      }
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
        background: "linear-gradient(135deg, #f7931e 0%, #f06a4e 40%, #e84b8a 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          padding: "40px 24px 60px",
          border: "none",
          outline: "none",
        }}
      >
        {/* Header area */}
        <div
          style={{
            marginBottom: "32px",
            border: "none",
            outline: "none",
          }}
        >
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

        {/* Title */}
        <h1
          style={{
            color: "#ffffff",
            fontSize: "20px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "32px",
            textShadow: "0 1px 6px rgba(0,0,0,0.2)",
            border: "none",
            outline: "none",
          }}
        >
          あなたのお住まいの地域は？
        </h1>

        {/* GPS Result / Loading */}
        <div
          style={{
            width: "100%",
            maxWidth: "360px",
            marginBottom: "24px",
            border: "none",
            outline: "none",
          }}
        >
          {gpsLoading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                padding: "20px",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: "16px",
                color: "#fff",
                fontSize: "14px",
                border: "none",
                outline: "none",
              }}
            >
              <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />
              位置情報を取得中...
            </div>
          )}

          {gpsPrefecture && !gpsLoading && (
            <div
              onClick={handleGpsPrefectureClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleGpsPrefectureClick()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: "16px",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                border: "none",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "none", outline: "none" }}>
                <Navigation style={{ width: 22, height: 22, color: "#f06a4e" }} />
                <div style={{ border: "none", outline: "none" }}>
                  <div style={{ fontSize: "11px", color: "#999", marginBottom: "2px", border: "none", outline: "none" }}>
                    現在地から検出
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#1e1e1e", border: "none", outline: "none" }}>
                    {gpsPrefecture}
                  </div>
                </div>
              </div>
              <ChevronRight style={{ width: 20, height: 20, color: "#ccc" }} />
            </div>
          )}

          {gpsError && gpsAttempted && !gpsLoading && (
            <div
              style={{
                padding: "14px 20px",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                color: "rgba(255,255,255,0.8)",
                fontSize: "13px",
                textAlign: "center",
                border: "none",
                outline: "none",
              }}
            >
              位置情報を取得できませんでした。下記から地域を選択してください。
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            maxWidth: "360px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
            border: "none",
            outline: "none",
          }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.3)", border: "none", outline: "none" }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", border: "none", outline: "none" }}>
            その他の地域を見る
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.3)", border: "none", outline: "none" }} />
        </div>

        {/* Region List */}
        <div
          style={{
            width: "100%",
            maxWidth: "360px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            border: "none",
            outline: "none",
          }}
        >
          {REGION_BLOCKS.map((region) => {
            const regionSlug = REGION_NAME_TO_SLUG[region]
            const prefectures = PREFECTURES_BY_REGION[region] || []
            return (
              <div
                key={region}
                onClick={() => {
                  if (regionSlug) {
                    router.push(`/tournaments/${regionSlug}`)
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && regionSlug) {
                    router.push(`/tournaments/${regionSlug}`)
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  border: "none",
                  outline: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", border: "none", outline: "none" }}>
                  <MapPin style={{ width: 16, height: 16, color: "rgba(255,255,255,0.7)" }} />
                  <div style={{ border: "none", outline: "none" }}>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", border: "none", outline: "none" }}>
                      {region}
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "2px", border: "none", outline: "none" }}>
                      {prefectures.join("・")}
                    </div>
                  </div>
                </div>
                <ChevronRight style={{ width: 16, height: 16, color: "rgba(255,255,255,0.5)" }} />
              </div>
            )
          })}
        </div>

        {/* All tournaments link */}
        <div
          onClick={() => router.push("/tournaments")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && router.push("/tournaments")}
          style={{
            marginTop: "24px",
            padding: "12px 24px",
            color: "rgba(255,255,255,0.8)",
            fontSize: "14px",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            border: "none",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          すべての大会を見る
        </div>
      </div>
    </div>
  )
}
