"use client"

import React, { useState, useRef } from 'react'
import { Plus, Trash2, GripVertical, Upload, ExternalLink } from 'lucide-react'
import { SponsorBanner } from '@/lib/api'
import { uploadImageToS3 } from '@/lib/storage'

interface SponsorBannerEditorProps {
  sponsors: SponsorBanner[]
  onChange: (sponsors: SponsorBanner[]) => void
  maxCount?: number
}

/**
 * スポンサーバナー編集コンポーネント（再利用可能）
 * チーム・大会・管理者ページで共用
 */
export default function SponsorBannerEditor({
  sponsors,
  onChange,
  maxCount = 5
}: SponsorBannerEditorProps) {
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // スポンサー追加
  const handleAdd = () => {
    if (sponsors.length >= maxCount) return
    const newSponsor: SponsorBanner = {
      id: crypto.randomUUID(),
      name: '',
      imageUrl: '',
      linkUrl: '',
      order: sponsors.length
    }
    onChange([...sponsors, newSponsor])
  }

  // スポンサー削除
  const handleRemove = (id: string) => {
    const updated = sponsors
      .filter(s => s.id !== id)
      .map((s, i) => ({ ...s, order: i }))
    onChange(updated)
  }

  // フィールド更新
  const handleFieldChange = (id: string, field: keyof SponsorBanner, value: string) => {
    const updated = sponsors.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    )
    onChange(updated)
  }

  // 画像アップロード
  const handleImageUpload = async (id: string, file: File) => {
    setUploading(id)
    try {
      const url = await uploadImageToS3(file)
      handleFieldChange(id, 'imageUrl', url)
    } catch (error) {
      console.error('スポンサー画像アップロードエラー:', error)
      alert('画像のアップロードに失敗しました')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">スポンサーバナー</h3>
        <span className="text-xs text-gray-400">{sponsors.length} / {maxCount}</span>
      </div>

      {sponsors.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-sm text-gray-400">スポンサーバナーがありません</p>
          <p className="text-xs text-gray-400 mt-1">追加ボタンからスポンサーを登録してください</p>
        </div>
      )}

      {sponsors.map((sponsor, index) => (
        <div
          key={sponsor.id}
          className="border border-gray-200 rounded-lg p-3 bg-white space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-400">
              <GripVertical size={14} />
              <span className="text-xs font-medium">#{index + 1}</span>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(sponsor.id)}
              className="text-red-400 hover:text-red-600 transition-colors p-1"
              title="削除"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* スポンサー名 */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">スポンサー名</label>
            <input
              type="text"
              value={sponsor.name}
              onChange={(e) => handleFieldChange(sponsor.id, 'name', e.target.value)}
              placeholder="株式会社○○"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          {/* 画像アップロード */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">バナー画像</label>
            <input
              ref={el => { fileInputRefs.current[sponsor.id] = el }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(sponsor.id, file)
              }}
            />
            {sponsor.imageUrl ? (
              <div className="relative group">
                <img
                  src={sponsor.imageUrl}
                  alt={sponsor.name || 'スポンサー'}
                  className="w-full h-20 object-contain bg-gray-50 rounded-md border border-gray-100"
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[sponsor.id]?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center text-white text-xs"
                >
                  {uploading === sponsor.id ? '⏳ アップロード中...' : '📷 画像を変更'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRefs.current[sponsor.id]?.click()}
                disabled={uploading === sponsor.id}
                className="w-full h-20 flex flex-col items-center justify-center gap-1 bg-gray-50 border-2 border-dashed border-gray-200 rounded-md hover:border-orange-300 transition-colors disabled:opacity-50"
              >
                {uploading === sponsor.id ? (
                  <span className="text-xs text-gray-400">アップロード中...</span>
                ) : (
                  <>
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-400">画像をアップロード</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* リンクURL */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              <ExternalLink size={10} className="inline mr-1" />
              リンクURL
            </label>
            <input
              type="url"
              value={sponsor.linkUrl}
              onChange={(e) => handleFieldChange(sponsor.id, 'linkUrl', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
        </div>
      ))}

      {/* 追加ボタン */}
      {sponsors.length < maxCount && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-2 flex items-center justify-center gap-1 text-sm text-orange-500 border-2 border-dashed border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <Plus size={16} />
          スポンサーを追加
        </button>
      )}
    </div>
  )
}
