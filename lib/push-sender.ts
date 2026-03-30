"use client"

/**
 * プッシュ通知送信ヘルパー
 * フロントエンドからAPIルートを経由して通知を送信
 * + Notification DBレコードも作成（お知らせ一覧用）
 */

import { getPushSubscriptionsByUser, getFavoriteUserEmails, createNotification } from './api'

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
 * 特定ユーザーにNotification DBレコードを作成（お知らせ一覧用）
 */
async function createNotificationsForUsers(
  userEmails: string[],
  notification: {
    type: string
    title: string
    message: string
    senderName?: string
    relatedId?: string
    relatedType?: string
  }
): Promise<void> {
  if (userEmails.length === 0) return

  try {
    await Promise.all(
      userEmails.map(email =>
        createNotification({
          recipientEmail: email,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          senderName: notification.senderName,
          relatedId: notification.relatedId,
          relatedType: notification.relatedType,
        }).catch(err => {
          console.error('DB通知作成失敗:', email, err?.message)
        })
      )
    )
  } catch (error) {
    console.error('DB通知作成エラー:', error)
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
  const title = `${senderName}からメッセージ`
  const body = messagePreview.length > 50 ? messagePreview.slice(0, 50) + '...' : messagePreview

  // プッシュ通知送信
  await sendPushToUsers(recipientEmails, {
    title,
    body,
    url: `/messages/${threadId}`,
    tag: `chat-${threadId}`
  })

  // Notification DBレコード作成（お知らせ一覧用）
  await createNotificationsForUsers(recipientEmails, {
    type: 'chat_message',
    title,
    message: body,
    senderName,
    relatedId: threadId,
    relatedType: 'chat',
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

  const title = `${tournamentName}に新しい投稿`
  const body = `${authorName}: ${postPreview.length > 40 ? postPreview.slice(0, 40) + '...' : postPreview}`

  // プッシュ通知送信
  await sendPushToUsers(filtered, {
    title,
    body,
    url: `/tournaments/${tournamentId}`,
    tag: `tournament-post-${tournamentId}`
  })

  // Notification DBレコード作成（お知らせ一覧用）
  await createNotificationsForUsers(filtered, {
    type: 'tournament_post',
    title,
    message: body,
    senderName: authorName,
    relatedId: tournamentId,
    relatedType: 'tournament',
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

  const title = `${teamName}に新しい投稿`
  const body = `${authorName}: ${postPreview.length > 40 ? postPreview.slice(0, 40) + '...' : postPreview}`

  // プッシュ通知送信
  await sendPushToUsers(filtered, {
    title,
    body,
    url: `/teams/${teamId}`,
    tag: `team-post-${teamId}`
  })

  // Notification DBレコード作成（お知らせ一覧用）
  await createNotificationsForUsers(filtered, {
    type: 'team_post',
    title,
    message: body,
    senderName: authorName,
    relatedId: teamId,
    relatedType: 'team',
  })
}
