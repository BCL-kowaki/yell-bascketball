"use client"

import React from 'react'
import { SponsorBanner } from '@/lib/api'
import SponsorBannerDisplay from '@/components/sponsor-banner-display'

interface SponsorSidebarProps {
  sponsors: SponsorBanner[]
  title?: string
}

/**
 * スポンサーサイドバー（デスクトップのみ表示）
 * 右サイドバーとしてスティッキー表示
 */
export default function SponsorSidebar({
  sponsors,
  title = 'スポンサー'
}: SponsorSidebarProps) {
  return (
    <aside className="hidden lg:block w-[280px] shrink-0">
      <div className="sticky top-[100px] space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <SponsorBannerDisplay
            sponsors={sponsors}
            title={title}
            showPlaceholder={true}
            layout="vertical"
          />
        </div>
      </div>
    </aside>
  )
}
