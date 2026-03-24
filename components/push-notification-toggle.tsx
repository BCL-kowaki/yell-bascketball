"use client"

import React, { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { isPushSupported, getNotificationPermission, subscribeToPush, unsubscribeFromPush, isSubscribedToPush } from '@/lib/push-notifications'

/**
 * プッシュ通知ON/OFFトグルコンポーネント
 * 設定ページやヘッダーに配置
 */
export default function PushNotificationToggle() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    const checkStatus = async () => {
      const isSupported = isPushSupported()
      setSupported(isSupported)
      setPermission(getNotificationPermission())

      if (isSupported) {
        const isSub = await isSubscribedToPush()
        setSubscribed(isSub)
      }
      setLoading(false)
    }
    checkStatus()
  }, [])

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (subscribed) {
        const success = await unsubscribeFromPush()
        if (success) setSubscribed(false)
      } else {
        const success = await subscribeToPush()
        if (success) {
          setSubscribed(true)
          setPermission('granted')
        } else {
          setPermission(getNotificationPermission())
        }
      }
    } finally {
      setLoading(false)
    }
  }

  if (!supported) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <BellOff className="w-5 h-5 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-500">プッシュ通知</p>
          <p className="text-xs text-gray-400">このブラウザではプッシュ通知に対応していません</p>
        </div>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
        <BellOff className="w-5 h-5 text-red-400" />
        <div>
          <p className="text-sm font-medium text-red-600">プッシュ通知がブロックされています</p>
          <p className="text-xs text-red-400">ブラウザの設定から通知を許可してください</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
      <div className="flex items-center gap-3">
        {subscribed ? (
          <Bell className="w-5 h-5 text-pink-500" />
        ) : (
          <BellOff className="w-5 h-5 text-gray-400" />
        )}
        <div>
          <p className="text-sm font-medium text-gray-700">プッシュ通知</p>
          <p className="text-xs text-gray-400">
            {subscribed
              ? '新着投稿やメッセージを通知でお知らせします'
              : 'ONにすると新着投稿やメッセージを通知で受け取れます'}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          subscribed ? 'bg-pink-500' : 'bg-gray-300'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {loading ? (
          <Loader2 className="absolute left-1/2 -translate-x-1/2 w-4 h-4 animate-spin text-white" />
        ) : (
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              subscribed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        )}
      </button>
    </div>
  )
}
