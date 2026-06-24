"use client"

import { useState, useEffect } from "react"
import { FileText, Loader2, Download } from "lucide-react"
import { extractS3KeyFromUrl } from "@/lib/storage"

// ファイル選択(input accept)で受け付けるドキュメント形式
export const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"

const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"]
const S3_BUCKET = "yellc34dfecaeb3545229f8a541d9a04a2aec8ef5-main"
const S3_REGION = "ap-northeast-1"

/** ファイル名またはURLから拡張子（小文字・ドットなし）を取得 */
export function getFileExtension(nameOrUrl?: string | null): string {
  if (!nameOrUrl) return ""
  const clean = nameOrUrl.split("?")[0].split("#")[0]
  const match = clean.match(/\.([a-zA-Z0-9]+)$/)
  return match ? match[1].toLowerCase() : ""
}

/** Officeファイル（Word/Excel/PowerPoint）かどうかを拡張子で判定 */
export function isOfficeDocument(nameOrUrl?: string | null): boolean {
  return OFFICE_EXTENSIONS.includes(getFileExtension(nameOrUrl))
}

/**
 * S3キーから公開URLを生成する
 * バケットポリシーで public/* への GetObject を全員に許可済みのため有効期限なし
 */
function buildPublicS3Url(key: string): string {
  const fullKey = key.startsWith("public/") ? key : `public/${key}`
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${fullKey}`
}

interface DocumentViewerProps {
  pdfUrl: string
  pdfName?: string | null
}

export function DocumentViewer({ pdfUrl, pdfName }: DocumentViewerProps) {
  const [viewerSrc, setViewerSrc] = useState<string | null>(null)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!pdfUrl) {
      setIsLoading(false)
      return
    }

    // Base64 / Blob URL はプレビュー不可
    if (pdfUrl.startsWith("data:") || pdfUrl.startsWith("blob:")) {
      setPublicUrl(pdfUrl)
      setIsLoading(false)
      return
    }

    // S3キーを抽出して公開URLを生成（有効期限なし・署名不要）
    const key = extractS3KeyFromUrl(pdfUrl)
    if (key) {
      const url = buildPublicS3Url(key)
      setPublicUrl(url)

      if (isOfficeDocument(pdfName || pdfUrl)) {
        // Office Online Viewerに公開URLを直接渡す（短いURL・有効期限なし）
        setViewerSrc(
          `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
        )
      }
    } else {
      setPublicUrl(pdfUrl)
    }

    setIsLoading(false)
  }, [pdfUrl, pdfName])

  if (isLoading) {
    return (
      <div
        className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center"
        style={{ height: "500px" }}
      >
        <div className="text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>ファイルを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!publicUrl) {
    return (
      <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 p-4 text-center text-gray-500">
        <p>ファイルを読み込めませんでした</p>
      </div>
    )
  }

  const isOffice = isOfficeDocument(pdfName || pdfUrl)
  const isLocal = publicUrl.startsWith("data:") || publicUrl.startsWith("blob:")

  // Officeファイル
  if (isOffice) {
    if (isLocal) {
      return (
        <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">このファイルはプレビュー表示できません</p>
          <a
            href={publicUrl}
            download={pdfName || "document"}
            className="text-[#e84b8a] hover:underline inline-flex items-center gap-2 font-medium"
          >
            <FileText className="w-4 h-4" />
            {pdfName || "ファイル"}をダウンロード
          </a>
        </div>
      )
    }

    if (!viewerSrc) {
      return (
        <div
          className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center"
          style={{ height: "500px" }}
        >
          <div className="text-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>ビューワを準備中...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex justify-end px-3 py-2 bg-gray-50 border-b border-gray-200">
          <a
            href={publicUrl}
            download={pdfName || "document"}
            className="inline-flex items-center gap-1.5 text-sm text-[#e84b8a] hover:underline font-medium"
          >
            <Download className="w-4 h-4" />
            ダウンロード
          </a>
        </div>
        <iframe
          key={viewerSrc}
          src={viewerSrc}
          width="100%"
          height="500px"
          className="w-full"
          style={{ minHeight: "500px" }}
          title={pdfName || "ドキュメント"}
        />
      </div>
    )
  }

  // PDF
  return (
    <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex justify-end px-3 py-2 bg-gray-50 border-b border-gray-200">
        <a
          href={publicUrl}
          download={pdfName || "document.pdf"}
          className="inline-flex items-center gap-1.5 text-sm text-[#e84b8a] hover:underline font-medium"
        >
          <Download className="w-4 h-4" />
          ダウンロード
        </a>
      </div>
      <object
        key={publicUrl}
        data={publicUrl}
        type="application/pdf"
        width="100%"
        height="500px"
        className="w-full"
        style={{ minHeight: "500px" }}
      >
        <div className="p-8 text-center bg-gray-50">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">PDFを表示できませんでした</p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e84b8a] hover:underline inline-flex items-center gap-2 font-medium"
          >
            <FileText className="w-4 h-4" />
            {pdfName || "PDFファイル"}を新しいタブで開く
          </a>
        </div>
      </object>
    </div>
  )
}
