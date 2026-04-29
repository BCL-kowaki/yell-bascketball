import Link from "next/link"

export default function LandingPage() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        border: "none",
        outline: "none",
        backgroundColor: "#000",
      }}
    >
      {/* Video Background - 最背面 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          border: "none",
          outline: "none",
        }}
      >
        <source src="/videos/landing-bg.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay - 動画の上にうっすらかぶせる */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          background:
            "linear-gradient(135deg, rgba(247, 147, 30, 0.9) 0%, rgba(240, 106, 78, 0.9) 40%, rgba(232, 75, 138, 0.9) 100%)",
          border: "none",
          outline: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "24px",
          gap: "40px",
          border: "none",
          outline: "none",
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <div style={{ border: "none", outline: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="YeLL Basketball"
            style={{
              width: "150px",
              height: "auto",
              filter: "brightness(0) invert(1)",
              border: "none",
              outline: "none",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>

        {/* Tagline */}
        <h1
          style={{
            color: "#ffffff",
            fontSize: "clamp(1.5rem, 6vw, 2.5rem)",
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.6,
            letterSpacing: "0.05em",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            margin: 0,
            padding: 0,
            border: "none",
            outline: "none",
          }}
        >
          全てのバスケファンに、
          <br />
          ワクワクを。
        </h1>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            width: "100%",
            maxWidth: "320px",
            padding: "0 16px",
            border: "none",
            outline: "none",
            boxSizing: "border-box",
          }}
        >
          <Link
            href="/tournaments"
            prefetch={true}
            style={{
              display: "block",
              width: "100%",
              padding: "16px 32px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              color: "#f06a4e",
              fontSize: "16px",
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: "0.05em",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              cursor: "pointer",
              boxSizing: "border-box",
              border: "none",
              outline: "none",
              textDecoration: "none",
              WebkitTapHighlightColor: "transparent",
              userSelect: "none",
            }}
          >
            大会情報を見る
          </Link>

          <Link
            href="/profile"
            prefetch={true}
            style={{
              display: "block",
              width: "100%",
              padding: "14px 32px",
              borderRadius: "9999px",
              backgroundColor: "transparent",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: "0.05em",
              border: "2px solid rgba(255, 255, 255, 0.8)",
              outline: "none",
              textShadow: "0 1px 4px rgba(0,0,0,0.2)",
              cursor: "pointer",
              boxSizing: "border-box",
              textDecoration: "none",
              WebkitTapHighlightColor: "transparent",
              userSelect: "none",
            }}
          >
            マイページ
          </Link>

          {/* 未登録ユーザー向け案内 */}
          <Link
            href="/register"
            prefetch={true}
            style={{
              display: "block",
              marginTop: "4px",
              padding: "8px 16px",
              color: "rgba(255, 255, 255, 0.95)",
              fontSize: "14px",
              fontWeight: 500,
              textAlign: "center",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              textShadow: "0 1px 4px rgba(0,0,0,0.2)",
              cursor: "pointer",
              border: "none",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
              userSelect: "none",
            }}
          >
            はじめての方はこちら（新規登録）
          </Link>
        </div>
      </div>
    </div>
  )
}
