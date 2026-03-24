"use client"

/**
 * プッシュ通知のフロントエンド管理
 * - 通知許可リクエスト
 * - Service Worker購読
 * - サーバーへの購読情報送信
 */

import { savePushSubscription, deletePushSubscription, getPushSubscriptionsByUser, getCurrentUserEmail } from './api'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

/**
 * VAPID公開鍵をUint8Arrayに変換（PushManager用）
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * プッシュ通知がサポートされているか確認
 */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
}

/**
 * 現在の通知許可状態を取得
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

/**
 * プッシュ通知を購読（許可リクエスト → SW購読 → DB保存）
 */
export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    // 通知許可をリクエスト
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    // Service Workerの登録を取得
    const registration = await navigator.serviceWorker.ready

    // 既存の購読があれば再利用
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // 新規購読を作成
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
    }

    // 購読情報をサーバーに保存
    const email = await getCurrentUserEmail()
    if (!email) return false

    const p256dh = subscription.getKey('p256dh')
    const auth = subscription.getKey('auth')

    if (!p256dh || !auth) return false

    await savePushSubscription({
      userEmail: email,
      endpoint: subscription.endpoint,
      p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
      auth: btoa(String.fromCharCode(...new Uint8Array(auth)))
    })

    return true
  } catch (error) {
    console.error('プッシュ通知の購読に失敗:', error)
    return false
  }
}

/**
 * プッシュ通知の購読を解除
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
    }

    // DBからも削除
    const email = await getCurrentUserEmail()
    if (email) {
      const subs = await getPushSubscriptionsByUser(email)
      await Promise.all(subs.map(s => deletePushSubscription(s.id)))
    }

    return true
  } catch (error) {
    console.error('プッシュ通知の購読解除に失敗:', error)
    return false
  }
}

/**
 * 現在購読中かどうかを確認
 */
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return !!subscription
  } catch {
    return false
  }
}
