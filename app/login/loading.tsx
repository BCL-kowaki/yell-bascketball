export default function LoginLoading() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, rgba(247, 147, 30, 0.9) 0%, rgba(240, 106, 78, 0.9) 40%, rgba(232, 75, 138, 0.9) 100%)",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <img
          src="/images/logo.png"
          alt="YeLL Basketball"
          style={{
            width: "160px",
            height: "auto",
            filter: "brightness(0) invert(1)",
            display: "block",
            margin: "0 auto",
          }}
        />
      </div>
      <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px" }}>
        読み込み中...
      </p>
    </div>
  )
}
