"use client"

import React from 'react'
import { SponsorBanner } from '@/lib/api'
import { Megaphone } from 'lucide-react'

interface SponsorBannerDisplayProps {
  sponsors: SponsorBanner[]
  title?: string
  showPlaceholder?: boolean
  layout?: 'horizontal' | 'vertical' | 'grid'
}

/**
 * スポンサーバナー表示コンポーネント（再利用可能）
 * チーム・大会・タイムラインで共用
 */
export default function SponsorBannerDisplay({
  sponsors,
  title = 'スポンサー',
  showPlaceholder = true,
  layout = 'horizontal'
}: SponsorBannerDisplayProps) {
  // スポンサーなしの場合
  if (sponsors.length === 0) {
    if (!showPlaceholder) return null
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center bg-gray-50/50">
        <Megaphone size={20} className="mx-auto text-gray-300 mb-1" />
        <p className="text-xs text-gray-400 font-medium">スポンサー掲載欄</p>
        <p className="text-[10px] text-gray-300 mt-0.5">お問い合わせはこちら</p>
      </div>
    )
  }

  // 水平レイアウト（横並び）
  if (layout === 'horizontal') {
    return (
      <div className="space-y-2">
        {title && (
          <h4 className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <Megaphone size={12} />
            {title}
          </h4>
        )}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {sponsors.map((sponsor) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
      </div>
    )
  }

  // 縦レイアウト（縦並び）
  if (layout === 'vertical') {
    return (
      <div className="space-y-2">
        {title && (
          <h4 className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <Megaphone size={12} />
            {title}
          </h4>
        )}
        <div className="flex flex-col gap-2">
          {sponsors.map((sponsor) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
      </div>
    )
  }

  // グリッドレイアウト
  return (
    <div className="space-y-2">
      {title && (
        <h4 className="text-xs font-semibold text-gray-500 flex items-center gap-1">
          <Megaphone size={12} />
          {title}
        </h4>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sponsors.map((sponsor) => (
          <SponsorCard key={sponsor.id} sponsor={sponsor} />
        ))}
      </div>
    </div>
  )
}

/**
 * 個別スポンサーカード
 */
function SponsorCard({ sponsor }: { sponsor: SponsorBanner }) {
  const content = (
    <div className="flex flex-col items-center gap-1 p-2 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
      {sponsor.imageUrl ? (
        <img
          src={sponsor.imageUrl}
          alt={sponsor.name || 'スポンサー'}
          className="h-12 w-full object-contain"
        />
      ) : (
        <div className="h-12 w-full flex items-center justify-center bg-gray-50 rounded text-gray-300 text-xs">
          No Image
        </div>
      )}
      {sponsor.name && (
        <span className="text-[10px] text-gray-500 text-center truncate w-full">
          {sponsor.name}
        </span>
      )}
    </div>
  )

  if (sponsor.linkUrl) {
    return (
      <a
        href={sponsor.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    )
  }

  return content
}
