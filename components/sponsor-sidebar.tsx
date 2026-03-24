"use client"

import React from 'react'
import { SponsorBanner } from '@/lib/api'
import SponsorBannerDisplay from '@/components/sponsor-banner-display'

interface SponsorSidebarProps {
  sponsors: SponsorBanner[]
  title?: string
  /** デフォルトSNSリンクを表示するかどうか */
  showDefaultSns?: boolean
}

/** YeLL公式SNSリンク定義 */
const DEFAULT_SNS_LINKS = [
  {
    name: 'LINE',
    url: 'https://line.me/R/ti/p/@578rcrwd',
    icon: '/icons/line-icon.svg',
    color: '#06C755',
    label: '公式LINE',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/yell_basket?igsh=MTczYXl5djR1M2lxcw==',
    icon: null, // グラデーションアイコンをインラインSVGで描画
    color: '#E4405F',
    label: '@yell_basket',
  },
]

/**
 * SNSリンクカードの中身（LINE・Instagram）
 * デスクトップサイドバーとモバイル版で共通利用
 */
export function SnsLinksContent() {
  return (
    <>
      <h4 className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-3">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        YeLL 公式SNS
      </h4>
      <div className="space-y-2">
        {/* LINE */}
        <a
          href={DEFAULT_SNS_LINKS[0].url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-green-50 transition-colors group"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#06C755' }}
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-700 group-hover:text-[#06C755] transition-colors">
              {DEFAULT_SNS_LINKS[0].label}
            </p>
            <p className="text-[10px] text-gray-400">友だち追加はこちら</p>
          </div>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </a>

        {/* Instagram */}
        <a
          href={DEFAULT_SNS_LINKS[1].url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-pink-50 transition-colors group"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
            }}
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-700 group-hover:text-[#E4405F] transition-colors">
              {DEFAULT_SNS_LINKS[1].label}
            </p>
            <p className="text-[10px] text-gray-400">フォローはこちら</p>
          </div>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </a>
      </div>
    </>
  )
}

/**
 * モバイル用SNSリンクカード（lg未満で表示）
 * 各ページのコンテンツ末尾に配置
 */
export function MobileSnsCard() {
  return (
    <div className="lg:hidden mt-2 mb-4">
      <div className="bg-white sm:rounded-lg rounded-none shadow-sm border-0 p-4">
        <SnsLinksContent />
      </div>
    </div>
  )
}

/**
 * スポンサーサイドバー（デスクトップのみ表示）
 * 右サイドバーとしてスティッキー表示
 */
export default function SponsorSidebar({
  sponsors,
  title = 'スポンサー',
  showDefaultSns = true,
}: SponsorSidebarProps) {
  return (
    <aside className="hidden lg:block w-[300px] shrink-0">
      <div className="sticky top-[100px] space-y-4">
        {/* デフォルトSNSリンク */}
        {showDefaultSns && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <SnsLinksContent />
          </div>
        )}

        {/* 運営バナー */}
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
