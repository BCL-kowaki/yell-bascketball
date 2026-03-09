"use client"
import Link from "next/link"
import { LogIn } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// インラインバナー型のログイン促進
interface LoginPromptBannerProps {
  message?: string
}

export function LoginPromptBanner({ message = "ログインすると、いいねやコメント、お気に入り登録ができます。" }: LoginPromptBannerProps) {
  return (
    <div className="rounded-lg p-4 text-center border border-[#e8d6c0]" style={{ backgroundColor: "#fcf4e7" }}>
      <p className="text-sm text-gray-700 mb-3">{message}</p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gradient text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          ログイン
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          新規登録
        </Link>
      </div>
    </div>
  )
}

// モーダル型のログイン促進（アクションボタン押下時に表示）
interface LoginPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action?: string // 「いいね」「コメント」「お気に入り登録」など
}

export function LoginPromptModal({ open, onOpenChange, action = "この機能を利用" }: LoginPromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">ログインが必要です</DialogTitle>
        </DialogHeader>
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-6">
            {action}するには、ログインまたは新規登録が必要です。
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login">
              <Button className="w-full bg-brand-gradient hover:opacity-90 text-white">
                <LogIn className="w-4 h-4 mr-2" />
                ログイン
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full">
                新規登録
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            大会やチームの閲覧はログインなしでご利用いただけます。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
