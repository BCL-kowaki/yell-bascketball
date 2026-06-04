"use client"
import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react"

interface PhoneVerificationModalProps {
  // モーダルの開閉
  open: boolean
  // 認証対象の電話番号（フォームで入力された値）
  phone: string
  // 認証成功時に呼ばれる（実際の作成処理）。成功で true、失敗で false を返す
  onVerified: () => Promise<boolean> | boolean
  // モーダルを閉じる（キャンセル）
  onClose: () => void
  // 申請完了画面の本文（例: "運営本部に大会登録の申請いたしました。…"）
  completeMessage: string
  // 完了画面の「トップへ戻る」ボタンのラベル（例: "大会トップへ戻る"）
  backToTopLabel: string
  // 「トップへ戻る」押下時の遷移処理
  onBackToTop: () => void
}

/**
 * SMS 2段階認証モーダル。
 * open になると指定番号へ認証コードを自動送信し、6桁コードの入力・検証を行う。
 * 検証に成功すると onVerified() を呼ぶ。
 */
export function PhoneVerificationModal({
  open,
  phone,
  onVerified,
  onClose,
  completeMessage,
  backToTopLabel,
  onBackToTop,
}: PhoneVerificationModalProps) {
  const { toast } = useToast()
  const [code, setCode] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [sent, setSent] = useState(false)
  // 再送までのクールダウン（秒）
  const [cooldown, setCooldown] = useState(0)
  // モーダル内のステップ: "input"（認証コード入力）→ "done"（申請完了）
  const [step, setStep] = useState<"input" | "done">("input")

  // 認証コードを送信
  const sendCode = useCallback(async () => {
    setIsSending(true)
    try {
      const res = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "認証コードの送信に失敗しました")
      }
      setSent(true)
      setCooldown(30)
      toast({
        title: "認証コードを送信しました",
        description: `${phone} 宛のSMSをご確認ください`,
      })
    } catch (error: any) {
      toast({
        title: "送信エラー",
        description: error?.message || "認証コードの送信に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }, [phone, toast])

  // モーダルが開いたら自動でコード送信し、状態をリセット
  useEffect(() => {
    if (open) {
      setCode("")
      setSent(false)
      setStep("input")
      sendCode()
    }
    // open が false の時は何もしない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // 再送クールダウンのカウントダウン
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  // 認証コードを検証
  const checkCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "エラー",
        description: "6桁の認証コードを入力してください",
        variant: "destructive",
      })
      return
    }
    setIsChecking(true)
    try {
      const res = await fetch("/api/verify/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      })
      const data = await res.json()
      if (!res.ok || !data?.approved) {
        throw new Error(data?.error || "認証コードが正しくありません")
      }
      // 認証成功 → 実際の作成処理を実行（成功なら完了画面へ切り替え）
      const ok = await onVerified()
      if (ok) {
        setStep("done")
      }
      // ok === false の場合、作成失敗のトーストは親側で表示済み
    } catch (error: any) {
      toast({
        title: "認証エラー",
        description: error?.message || "認証コードが正しくありません",
        variant: "destructive",
      })
      setCode("")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { step === "done" ? onBackToTop() : onClose() } }}>
      <DialogContent
        className="mx-auto"
        style={{ width: "calc(100% - 2rem)", maxWidth: "56rem" }}
      >
        {step === "done" ? (
          /* ===== 申請完了表示（ダイアログ内で切り替え） ===== */
          <div className="py-8 px-2 text-center space-y-5">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <DialogTitle className="text-2xl font-bold">申請を受け付けました</DialogTitle>
            <DialogDescription className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {completeMessage}
            </DialogDescription>
            <div className="pt-2">
              <Button onClick={onBackToTop} className="bg-brand-gradient text-white">
                {backToTopLabel}
              </Button>
            </div>
          </div>
        ) : (
          /* ===== 認証コード入力 ===== */
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#e84b8a]" />
                電話番号の認証
              </DialogTitle>
              <DialogDescription>
                登録を完了するために、SMSで送信された6桁の認証コードを入力してください。
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="w-4 h-4" />
                <span>送信先: {phone}</span>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  disabled={isChecking}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                className="w-full bg-brand-gradient text-white"
                onClick={checkCode}
                disabled={isChecking || isSending || code.length !== 6}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    処理中...
                  </>
                ) : (
                  "認証して登録する"
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-[#e84b8a] disabled:text-muted-foreground"
                  onClick={sendCode}
                  disabled={isSending || cooldown > 0}
                >
                  {isSending
                    ? "送信中..."
                    : cooldown > 0
                    ? `再送する (${cooldown}s)`
                    : "コードを再送する"}
                </button>
                <button
                  type="button"
                  className="text-muted-foreground"
                  onClick={onClose}
                  disabled={isChecking}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
