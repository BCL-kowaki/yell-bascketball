"use client"

import { useState, useEffect } from "react"
import { FileText, Loader2 } from "lucide-react"
import { refreshS3Url, extractS3KeyFromUrl } from "@/lib/storage"

/**
 * 投稿に添付されたドキュメント（PDF / Word / Excel / PowerPoint）を表示する共通ビューワ。
 *
 * - PDF      : ブラウザネイティブの <object> で直接表示
 * - Office系 : ブラウザがネイティブ表示できないため Microsoft Office Online Viewer で表示
 *
 * S3の署名付きURLは期限切れするため、表示前に refreshS3Url() で再取得する。
 * Base64(data:) / Blob(blob:) URL は外部ビューワで取得できないため、PDFのみ表示・
 * Office系はダウンロードリンクにフォールバックする。
 */

// ファイル選択(input accept)で受け付けるドキュメント形式
export const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"

// Officeファイルの拡張子
const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"]

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

interface DocumentViewerProps {
  /** ドキュメントのURL（S3署名付きURL / data: / blob:） */
  pdfUrl: string
  /** ファイル名（拡張子判定・表示に使用） */
  pdfName?: string | null
}

export function DocumentViewer({ pdfUrl, pdfName }: DocumentViewerProps) {
  const [refreshedUrl, setRefreshedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!pdfUrl) {
        setIsLoading(false)
        return
      }

      // Base64 / Blob URL はそのまま使用（S3再取得不要）
      if (pdfUrl.startsWith("data:") || pdfUrl.startsWith("blob:")) {
        setRefreshedUrl(pdfUrl)
        setIsLoading(false)
        return
      }

      // S3の署名付きURLを再取得（期限切れ対策）
      try {
        const newUrl = await refreshS3Url(pdfUrl)
        setRefreshedUrl(newUrl || pdfUrl)
      } catch (error) {
        console.error("DocumentViewer: URLの再取得に失敗しました:", error)
        setRefreshedUrl(pdfUrl)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [pdfUrl])

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

  if (!refreshedUrl) {
    return (
      <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 p-4 text-center text-gray-500">
        <p>ファイルを読み込めませんでした</p>
      </div>
    )
  }

  const isOffice = isOfficeDocument(pdfName || refreshedUrl)
  const isLocal = refreshedUrl.startsWith("data:") || refreshedUrl.startsWith("blob:")

  // Officeファイル：Microsoft Office Online Viewer で表示
  if (isOffice) {
    // data:/blob: は外部ビューワで取得できないためダウンロードのみ
    if (isLocal) {
      return (
        <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">このファイルはプレビュー表示できません</p>
          <a
            href={refreshedUrl}
            download={pdfName || "document"}
            className="text-[#e84b8a] hover:underline inline-flex items-center gap-2 font-medium"
          >
            <FileText className="w-4 h-4" />
            {pdfName || "ファイル"}をダウンロード
          </a>
        </div>
      )
    }

    // S3の署名付きURLはURLが長すぎてOffice Online Viewerが処理できないため、
    // /api/file プロキシにS3キー（短い文字列）のみ渡してサーバー側で取得する
    const s3Key = extractS3KeyFromUrl(refreshedUrl)
    const proxyUrl = s3Key
      ? `/api/file?key=${encodeURIComponent(s3Key)}`
      : `/api/file?key=${encodeURIComponent(refreshedUrl)}`
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const viewerSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      `${origin}${proxyUrl}`
    )}`

    return (
      <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
        <iframe
          key={refreshedUrl}
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

  // PDF：ブラウザネイティブの <object> で直接表示
  return (
    <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
      <object
        key={refreshedUrl}
        data={refreshedUrl}
        type="application/pdf"
        width="100%"
        height="500px"
        className="w-full"
        style={{ minHeight: "500px" }}
      >
        {/* フォールバック: PDFが表示できない場合 */}
        <div className="p-8 text-center bg-gray-50">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">PDFを表示できませんでした</p>
          <a
            href={refreshedUrl}
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
