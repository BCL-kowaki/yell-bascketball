"use client"

/**
 * プッシュ通知送信ヘルパー
 * フロントエンドからAPIルートを経由して通知を送信
 */

import { getPushSubscriptionsByUser, getFavoriteUserEmails } from './api'

/**
 * 特定ユーザーにプッシュ通知を送信
 */
async function sendPushToUsers(
  userEmails: string[],
  notification: {
    title: string
    body: string
    url?: string
    tag?: string
  }
): Promise<void> {
  if (userEmails.length === 0) return

  try {
    // 対象ユーザーの購読情報を取得
    const allSubs = await Promise.all(
      userEmails.map(email => getPushSubscriptionsByUser(email))
    )

    const subscriptions = allSubs.flat().map(s => ({
      endpoint: s.endpoint,
      p256dh: s.p256dh,
      auth: s.auth
    }))

    if (subscriptions.length === 0) return

    // APIルートへ送信リクエスト
    const response = await fetch('/api/push-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriptions,
        ...notification
      })
    })

    if (!response.ok) {
      console.error('プッシュ通知送信失敗:', await response.text())
    }
  } catch (error) {
    console.error('プッシュ通知送信エラー:', error)
  }
}

/**
 * チャットメッセージの通知を送信
 * 相手チームの運営者、または大会運営者に通知
 */
export async function notifyNewChatMessage(
  recipientEmails: string[],
  senderName: string,
  messagePreview: string,
  threadId: string
): Promise<void> {
  await sendPushToUsers(recipientEmails, {
    title: `${senderName}からメッセージ`,
    body: messagePreview.length > 50 ? messagePreview.slice(0, 50) + '...' : messagePreview,
    url: `/messages/${threadId}`,
    tag: `chat-${threadId}`
  })
}

/**
 * 大会タイムラインへの投稿通知
 * お気に入り登録ユーザーに通知
 */
export async function notifyNewTournamentPost(
  tournamentId: string,
  tournamentName: string,
  authorName: string,
  postPreview: string,
  excludeEmail?: string
): Promise<void> {
  const emails = await getFavoriteUserEmails(tournamentId, 'tournament')
  // 投稿者自身は除外
  const filtered = excludeEmail ? emails.filter(e => e !== excludeEmail) : emails

  await sendPushToUsers(filtered, {
    title: `${tournamentName}に新しい投稿`,
    body: `${authorName}: ${postPreview.length > 40 ? postPreview.slice(0, 40) + '...' : postPreview}`,
    url: `/tournaments/${tournamentId}`,
    tag: `tournament-post-${tournamentId}`
  })
}

/**
 * チームタイムラインへの投稿通知
 * お気に入り登録ユーザーに通知
 */
export async function notifyNewTeamPost(
  teamId: string,
  teamName: string,
  authorName: string,
  postPreview: string,
  excludeEmail?: string
): Promise<void> {
  const emails = await getFavoriteUserEmails(teamId, 'team')
  // 投稿者自身は除外
  const filtered = excludeEmail ? emails.filter(e => e !== excludeEmail) : emails

  await sendPushToUsers(filtered, {
    title: `${teamName}に新しい投稿`,
    body: `${authorName}: ${postPreview.length > 40 ? postPreview.slice(0, 40) + '...' : postPreview}`,
    url: `/teams/${teamId}`,
    tag: `team-post-${teamId}`
  })
}
