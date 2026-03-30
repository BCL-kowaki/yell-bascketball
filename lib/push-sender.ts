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
  if (userEmails.length === 0) {
    console.log('[push-sender] sendPushToUsers: 対象ユーザーなし、スキップ')
    return
  }

  console.log('[push-sender] sendPushToUsers: 対象ユーザー数:', userEmails.length, 'emails:', userEmails)

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

    console.log('[push-sender] sendPushToUsers: 購読数:', subscriptions.length)

    if (subscriptions.length === 0) {
      console.log('[push-sender] sendPushToUsers: プッシュ購読なし（通知設定OFFの可能性）')
      return
    }

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
      console.error('[push-sender] プッシュ通知送信失敗:', await response.text())
    } else {
      console.log('[push-sender] プッシュ通知送信成功')
    }
  } catch (error) {
    console.error('[push-sender] プッシュ通知送信エラー:', error)
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
  if (userEmails.length === 0) {
    console.log('[push-sender] createNotificationsForUsers: 対象ユーザーなし、スキップ')
    return
  }

  console.log('[push-sender] createNotificationsForUsers: 対象ユーザー数:', userEmails.length, 'type:', notification.type)

  try {
    const results = await Promise.all(
      userEmails.map(email =>
        createNotification({
          recipientEmail: email,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          senderName: notification.senderName,
          relatedId: notification.relatedId,
          relatedType: notification.relatedType,
        }).then(result => {
          console.log('[push-sender] DB通知作成成功:', email, result?.id)
          return result
        }).catch(err => {
          console.error('[push-sender] DB通知作成失敗:', email, err?.message, err)
          return null
        })
      )
    )
    const successCount = results.filter(r => r !== null).length
    console.log('[push-sender] DB通知作成結果:', successCount, '/', userEmails.length, '件成功')
  } catch (error) {
    console.error('[push-sender] DB通知作成エラー:', error)
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
  console.log('[push-sender] notifyNewChatMessage: recipients:', recipientEmails.length, 'sender:', senderName)

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
  console.log('[push-sender] notifyNewTournamentPost 開始:', {
    tournamentId,
    tournamentName,
    authorName,
    excludeEmail
  })

  try {
    const emails = await getFavoriteUserEmails(tournamentId, 'tournament')
    console.log('[push-sender] notifyNewTournamentPost - お気に入りユーザー数:', emails.length, 'emails:', emails)

    // 投稿者自身は除外
    const filtered = excludeEmail ? emails.filter(e => e !== excludeEmail) : emails
    console.log('[push-sender] notifyNewTournamentPost - 除外後:', filtered.length, '件')

    if (filtered.length === 0) {
      console.log('[push-sender] notifyNewTournamentPost: 通知対象者がいません')
      return
    }

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

    console.log('[push-sender] notifyNewTournamentPost 完了')
  } catch (error: any) {
    console.error('[push-sender] notifyNewTournamentPost エラー:', error?.message, error)
  }
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
  console.log('[push-sender] notifyNewTeamPost 開始:', {
    teamId,
    teamName,
    authorName,
    excludeEmail
  })

  try {
    const emails = await getFavoriteUserEmails(teamId, 'team')
    console.log('[push-sender] notifyNewTeamPost - お気に入りユーザー数:', emails.length, 'emails:', emails)

    // 投稿者自身は除外
    const filtered = excludeEmail ? emails.filter(e => e !== excludeEmail) : emails
    console.log('[push-sender] notifyNewTeamPost - 除外後:', filtered.length, '件')

    if (filtered.length === 0) {
      console.log('[push-sender] notifyNewTeamPost: 通知対象者がいません')
      return
    }

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

    console.log('[push-sender] notifyNewTeamPost 完了')
  } catch (error: any) {
    console.error('[push-sender] notifyNewTeamPost エラー:', error?.message, error)
  }
}
