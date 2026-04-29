"use client"
import Link from "next/link"
import { MapPin, ChevronRight } from "lucide-react"
import { REGION_BLOCKS, PREFECTURES_BY_REGION } from "@/lib/regionData"
import { REGION_NAME_TO_SLUG } from "@/lib/regionMapping"

export default function WelcomePage() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
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
          地域から大会を探す
        </h1>

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
              <Link
                key={region}
                href={regionSlug ? `/tournaments/${regionSlug}` : '/tournaments'}
                prefetch={true}
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
                  textDecoration: "none",
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
              </Link>
            )
          })}
        </div>

        {/* All tournaments link */}
        <Link
          href="/tournaments"
          prefetch={true}
          style={{
            display: "block",
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
        </Link>
      </div>
    </div>
  )
}
