"use client"

import { useState, useEffect } from "react"
import { getShowTeams } from "./api"

// 複数のナビコンポーネントで重複取得しないよう、モジュールレベルで共有キャッシュする
let cached: boolean | null = null
let inflight: Promise<boolean> | null = null

/**
 * 管理者パネルで設定した「チームメニュー表示」フラグを返すフック。
 * 取得前は false（非表示）。SiteConfig('show_teams') を一度だけ取得して共有する。
 */
export function useShowTeams(): boolean {
  const [show, setShow] = useState<boolean>(cached ?? false)

  useEffect(() => {
    if (cached !== null) {
      setShow(cached)
      return
    }
    if (!inflight) {
      inflight = getShowTeams().then((v) => {
        cached = v
        return v
      })
    }
    let active = true
    inflight.then((v) => {
      if (active) setShow(v)
    })
    return () => {
      active = false
    }
  }, [])

  return show
}

/** 設定変更後にキャッシュを破棄して再取得させる */
export function clearShowTeamsCache() {
  cached = null
  inflight = null
}
