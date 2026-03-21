"use client"

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, rgba(247, 147, 30, 0.9) 0%, rgba(240, 106, 78, 0.9) 40%, rgba(232, 75, 138, 0.9) 100%)",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "16px",
          padding: "28px 24px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", color: "#1e1e1e" }}>
          エラーが発生しました
        </h2>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
          {error?.message || "ページの読み込みに失敗しました"}
        </p>
        <p style={{ fontSize: "12px", color: "#999", marginBottom: "20px" }}>
          {error?.digest && `Error ID: ${error.digest}`}
        </p>
        <button
          onClick={reset}
          style={{
            width: "100%",
            height: "44px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #f7931e 0%, #f06a4e 50%, #e84b8a 100%)",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            marginBottom: "12px",
          }}
        >
          もう一度試す
        </button>
        <a
          href="/login"
          style={{
            display: "block",
            fontSize: "13px",
            color: "#f06a4e",
            textDecoration: "none",
          }}
        >
          ページをリロード
        </a>
      </div>
    </div>
  )
}
