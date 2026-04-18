"use client"

import { generateClient } from "aws-amplify/api"
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth"
import { ensureAmplifyConfigured } from "./amplifyClient"

// GraphQLクライアントを初期化（API_KEY認証を使用）
// 安全に初期化（SSRやモジュール読み込み時のエラー防止）
try {
  ensureAmplifyConfigured()
} catch (e) {
  console.error('Amplify初期化エラー（モジュールレベル）:', e)
}
const client = generateClient({
  authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
})

export type DbPost = {
  id: string
  content: string
  imageUrl?: string | null
  videoUrl?: string | null
  videoName?: string | null
  pdfUrl?: string | null
  pdfName?: string | null
  locationName?: string | null
  locationAddress?: string | null
  linkUrl?: string | null
  linkTitle?: string | null
  linkDescription?: string | null
  linkImage?: string | null
  likesCount: number
  commentsCount: number
  authorEmail?: string | null
  tournamentId?: string | null
  teamId?: string | null
  createdAt?: string | null
}

export type DbUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  bio?: string | null
  location?: string | null
  avatar?: string | null
  coverImage?: string | null
  category?: string | null
  region?: string | null
  regionBlock?: string | null
  prefecture?: string | null
  district?: string | null
  teams?: string[] | null
  isEmailPublic?: boolean | null
  isRegistrationDatePublic?: boolean | null
  instagramUrl?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbTournament = {
  id: string
  name: string
  iconUrl?: string | null
  coverImage?: string | null
  category?: string | null
  regionBlock?: string | null
  prefecture?: string | null
  district?: string | null
  tournamentType?: string | null
  area?: string | null
  subArea?: string | null
  description?: string | null
  ownerEmail: string
  coAdminEmails?: string[] | null
  startDate?: string | null
  endDate?: string | null
  favoritesCount?: number | null
  isApproved?: boolean
  instagramUrl?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbRegion = {
  id: string
  name: string
  slug: string
  sortOrder: number
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbPrefecture = {
  id: string
  name: string
  slug: string
  regionId: string
  sortOrder: number
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbDistrict = {
  id: string
  name: string
  prefectureId: string
  sortOrder: number
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbTournamentTeam = {
  id: string
  tournamentId: string
  teamId: string
  teamName?: string | null
  participationYear?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbTournamentResult = {
  id: string
  tournamentId: string
  year: string
  title: string
  content: string
  ranking?: string[] | null
  startDate?: string | null
  endDate?: string | null
  imageUrl?: string | null
  pdfUrl?: string | null
  pdfName?: string | null
  createdBy: string
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbTournamentInvitation = {
  id: string
  tournamentId: string
  tournamentName: string
  inviterEmail: string
  inviteeEmail: string
  status: string
  createdAt?: string | null
}

export type DbTeam = {
  id: string
  name: string
  shortName?: string | null
  logoUrl?: string | null
  coverImageUrl?: string | null
  founded?: string | null
  region?: string | null
  prefecture?: string | null
  headcount?: number | null
  category?: string | null
  description?: string | null
  website?: string | null
  instagramUrl?: string | null
  ownerEmail: string
  editorEmails?: string[] | null
  isApproved: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbFavorite = {
  id: string
  userEmail: string
  tournamentId?: string | null
  teamId?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbChatThread = {
  id: string
  senderEmail: string
  senderName: string
  teamId: string
  teamName: string
  tournamentId: string
  tournamentName: string
  threadType: string
  status: string
  lastMessage?: string | null
  lastMessageAt?: string | null
  teamUnreadCount?: number | null
  senderUnreadCount?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbChatMessage = {
  id: string
  threadId: string
  senderEmail: string
  senderName: string
  content: string
  messageType: string
  imageUrl?: string | null
  videoUrl?: string | null
  pdfUrl?: string | null
  pdfName?: string | null
  isRead?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbNotification = {
  id: string
  recipientEmail: string
  type: string
  title: string
  message: string
  senderName?: string | null
  senderAvatar?: string | null
  relatedId?: string | null
  relatedType?: string | null
  isRead: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

// ==================== スポンサーバナー型定義 ====================
export type SponsorBanner = {
  id: string        // UUID
  name: string      // スポンサー名
  imageUrl: string  // バナー画像URL（S3）
  linkUrl: string   // リンク先URL
  order: number     // 表示順（0-4）
}

export type DbSiteConfig = {
  id: string
  configKey: string
  configValue: string
  updatedBy?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type DbPushSubscription = {
  id: string
  userEmail: string
  endpoint: string
  p256dh: string
  auth: string
  createdAt?: string | null
  updatedAt?: string | null
}

/**
 * スポンサーJSON文字列をパースしてSponsorBanner配列に変換
 */
export function parseSponsors(sponsorsJson: string | null | undefined): SponsorBanner[] {
  if (!sponsorsJson) return []
  try {
    const parsed = JSON.parse(sponsorsJson)
    if (!Array.isArray(parsed)) return []
    return parsed.sort((a: SponsorBanner, b: SponsorBanner) => a.order - b.order)
  } catch {
    return []
  }
}

/**
 * SponsorBanner配列をJSON文字列に変換
 */
export function stringifySponsors(sponsors: SponsorBanner[]): string {
  return JSON.stringify(sponsors)
}

/**
 * 大会の管理者一覧を取得する
 * ownerEmailとcoAdminEmailsを統合して返す（重複排除）
 */
export function getTournamentAdminEmails(tournament: DbTournament): string[] {
  const admins = new Set<string>()
  if (tournament.ownerEmail) admins.add(tournament.ownerEmail)
  if (tournament.coAdminEmails) {
    tournament.coAdminEmails.forEach(e => { if (e) admins.add(e) })
  }
  return [...admins]
}

/**
 * チームの管理者一覧を取得する
 * ownerEmailとeditorEmailsを統合して返す（重複排除）
 */
export function getTeamAdminEmails(team: DbTeam): string[] {
  const admins = new Set<string>()
  if (team.ownerEmail) admins.add(team.ownerEmail)
  if (team.editorEmails) {
    team.editorEmails.forEach(e => { if (e) admins.add(e) })
  }
  return [...admins]
}

/**
 * 大会の管理者であるかチェックする
 * ownerEmail または coAdminEmails に含まれているかを確認
 */
export async function checkTournamentAdminPermission(tournamentId: string, userEmail: string): Promise<boolean> {
  try {
    const tournament = await getTournament(tournamentId)
    if (!tournament) return false
    const admins = getTournamentAdminEmails(tournament)
    return admins.includes(userEmail)
  } catch (error) {
    console.error('checkTournamentAdminPermission error:', error?.message)
    return false
  }
}

/**
 * チームの管理者であるかチェックする
 * ownerEmail または editorEmails に含まれているかを確認
 */
export function checkTeamAdminPermission(team: DbTeam, userEmail: string): boolean {
  const admins = getTeamAdminEmails(team)
  return admins.includes(userEmail)
}

/**
 * セッションからメールアドレスを取得（Cognito認証に依存しない）
 * @returns メールアドレス、またはundefined
 */
export async function getEmailFromSession(): Promise<string | undefined> {
  try {
    const sessionRes = await fetch('/api/session')
    if (sessionRes.ok) {
      const sessionData = await sessionRes.json()
      return sessionData.email
    }
    return undefined
  } catch (error) {
    console.error('getEmailFromSession error:', error?.message)
    return undefined
  }
}

export async function getCurrentUserEmail(): Promise<string | undefined> {
  // まずセッションから取得を試行（Cognito認証に依存しない）
  const sessionEmail = await getEmailFromSession()
  if (sessionEmail) {
    return sessionEmail
  }

  // セッションから取得できない場合のみ、Cognitoから取得を試行
  try {
    // まず現在のユーザーが存在するか確認
    await getCurrentUser()
    // Cognitoのユーザー属性から直接メールアドレスを取得
    const attributes = await fetchUserAttributes()
    return attributes.email || attributes.preferred_username || undefined
  } catch (error) {
    console.error('getCurrentUserEmail error:', error?.message)
    return undefined
  }
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const query = /* GraphQL */ `
    query ListUsers($filter: ModelUserFilterInput) {
      listUsers(filter: $filter) {
        items {
          id firstName lastName email bio avatar coverImage instagramUrl
          category location region regionBlock prefecture district
          teams isEmailPublic isRegistrationDatePublic
          createdAt updatedAt
        }
      }
    }
  `
  
  try {
    // 明示的にauthModeを指定してIdentity Poolへのアクセスを回避
    const { data } = await client.graphql({ 
      query, 
      variables: { filter: { email: { eq: email } } },
      authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
    }) as any
    return data?.listUsers?.items?.[0] ?? null
  } catch (error: any) {
    // Identity Poolのエラーは無視（GraphQL APIはAPI_KEY認証を使用しているため）
    if (error?.message?.includes('cognito-identity') ||
        error?.message?.includes('IdentityPool') ||
        error?.name === 'NotAuthorizedException') {
      return null
    }

    console.error('getUserByEmail error:', error?.message)
    return null
  }
}

export async function updateUser(id: string, input: Partial<DbUser>): Promise<DbUser> {
  const mutation = /* GraphQL */ `
    mutation UpdateUser($input: UpdateUserInput!) {
      updateUser(input: $input) {
        id firstName lastName email bio avatar coverImage
        category location region regionBlock prefecture district
        teams isEmailPublic isRegistrationDatePublic instagramUrl
        createdAt updatedAt
      }
    }
  `
  try {
    const variables = { input: { id, ...input } }

    // 明示的にauthModeを指定してIdentity Poolへのアクセスを回避
    const result = await client.graphql({
      query: mutation,
      variables,
      authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    if (!result.data?.updateUser) {
      throw new Error('Update user returned no data')
    }

    return result.data.updateUser
  } catch (error: any) {
    console.error('updateUser error:', error?.message)
    throw error
  }
}

// チーム検索（名前でフィルタリング）
export async function searchTeams(searchTerm: string): Promise<DbTeam[]> {
  const query = /* GraphQL */ `
    query ListTeams($filter: ModelTeamFilterInput, $limit: Int) {
      listTeams(filter: $filter, limit: $limit) {
        items {
          id name shortName logoUrl coverImageUrl founded region prefecture headcount category description website instagramUrl ownerEmail editorEmails isApproved createdAt updatedAt
        }
      }
    }
  `

  try {
    const { data } = await client.graphql({
      query,
      variables: {
        filter: {
          and: [
            { name: { contains: searchTerm } },
            { isApproved: { eq: true } }
          ]
        },
        limit: 50
      },
      authMode: 'apiKey'
    }) as any

    return data?.listTeams?.items ?? []
  } catch (error: any) {
    console.error('searchTeams error:', error?.message)
    return []
  }
}

const postFields = `
  id content imageUrl videoUrl videoName pdfUrl pdfName locationName locationAddress
  linkUrl linkTitle linkDescription linkImage likesCount commentsCount
  authorEmail createdAt
`

export async function listPosts(limit = 50, filter?: { authorEmail?: string; tournamentId?: string; teamId?: string }): Promise<DbPost[]> {
  const fallbackFields = `
    id content imageUrl videoUrl videoName pdfUrl pdfName locationName locationAddress
    linkUrl linkTitle linkDescription linkImage likesCount commentsCount
    authorEmail createdAt tournamentId teamId
  `

  // フィルターを構築
  let filterInput: any = {}
  if (filter?.authorEmail) {
    filterInput.authorEmail = { eq: filter.authorEmail }
  }
  if (filter?.tournamentId) {
    filterInput.tournamentId = { eq: filter.tournamentId }
  }
  if (filter?.teamId) {
    filterInput.teamId = { eq: filter.teamId }
  }
  const finalFilter = Object.keys(filterInput).length > 0 ? filterInput : undefined
  
  const query = /* GraphQL */ `
    query ListPosts($filter: ModelPostFilterInput, $limit: Int, $nextToken: String) {
      listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items { ${fallbackFields} }
        nextToken
      }
    }
  `

  try {
    console.log('listPosts - filter:', JSON.stringify(finalFilter), 'limit:', limit)
    let allItems: DbPost[] = []
    let nextToken: string | null = null

    // ページネーションで全投稿を取得
    do {
      const result = await client.graphql({
        query,
        variables: { filter: finalFilter, limit, nextToken },
        authMode: 'apiKey'
      }) as any

      if (result.errors) {
        const errorMessage = result.errors[0]?.message || 'GraphQL error'
        console.error('listPosts GraphQL error:', JSON.stringify(result.errors))
        throw new Error(`GraphQL error: ${errorMessage}`)
      }

      const items = result?.data?.listPosts?.items ?? []
      allItems = [...allItems, ...items]
      nextToken = result?.data?.listPosts?.nextToken || null
    } while (nextToken)

    console.log('listPosts - returned:', allItems.length, 'posts')
    return allItems
  } catch (error: any) {
    console.error('listPosts error:', error?.message)
    return []
  }
}

export async function getPostsByTeam(teamId: string): Promise<DbPost[]> {
  // GraphQLフィルタでteamIdに一致する投稿を直接取得
  try {
    console.log('getPostsByTeam - teamId:', teamId)
    const teamPosts = await listPosts(1000, { teamId })
    console.log('getPostsByTeam - found posts:', teamPosts.length, 'posts for teamId:', teamId)
    // 念のためクライアント側でもフィルタリング
    const filteredPosts = teamPosts.filter(post => post.teamId === teamId)
    if (filteredPosts.length !== teamPosts.length) {
      console.warn('getPostsByTeam - GraphQL filter returned extra posts. Filtered:', filteredPosts.length, 'vs Total:', teamPosts.length)
    }
    return filteredPosts
  } catch (error: any) {
    console.error('getPostsByTeam error:', error?.message)
    return []
  }
}

export async function getPostsByTournament(tournamentId: string): Promise<DbPost[]> {
  // GraphQLフィルタでtournamentIdに一致する投稿を直接取得
  try {
    console.log('getPostsByTournament - tournamentId:', tournamentId)
    const tournamentPosts = await listPosts(1000, { tournamentId })
    console.log('getPostsByTournament - found posts:', tournamentPosts.length, 'posts for tournamentId:', tournamentId)
    // 念のためクライアント側でもフィルタリング
    const filteredPosts = tournamentPosts.filter(post => post.tournamentId === tournamentId)
    if (filteredPosts.length !== tournamentPosts.length) {
      console.warn('getPostsByTournament - GraphQL filter returned extra posts. Filtered:', filteredPosts.length, 'vs Total:', tournamentPosts.length)
    }
    return filteredPosts
  } catch (error: any) {
    console.error('getPostsByTournament error:', error?.message)
    return []
  }
}

export async function createPost(input: Partial<DbPost>): Promise<DbPost> {
  const fallbackFields = `
    id content imageUrl videoUrl videoName pdfUrl pdfName locationName locationAddress
    linkUrl linkTitle linkDescription linkImage likesCount commentsCount
    authorEmail tournamentId teamId createdAt
  `

  const mutation = /* GraphQL */ `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) { ${fallbackFields} }
    }
  `

  try {
    // Base64データが大きすぎる場合は除外（S3 URLのみ許可）
    const sanitizedInput = { ...input }
    
    // 画像のBase64データサイズチェック（200MB制限、圧縮後）
    if (sanitizedInput.imageUrl && sanitizedInput.imageUrl.startsWith('data:')) {
      const imageSize = sanitizedInput.imageUrl.length
      const maxImageSize = 200 * 1024 * 1024 // 200MB（圧縮後）
      if (imageSize > maxImageSize) {
        throw new Error(`画像が大きすぎます（${(imageSize / 1024 / 1024).toFixed(2)}MB）。S3へのアップロードが必要です。S3の設定を確認してください。`)
      }
    }

    // blob: URLが誤って保存されないようにチェック
    if (sanitizedInput.pdfUrl && sanitizedInput.pdfUrl.startsWith('blob:')) {
      throw new Error('PDFのURLが無効です。blob: URLは一時的なもので、保存できません。S3へのアップロードが必要です。')
    }

    // PDFのBase64データサイズチェック（400KB制限 - DynamoDBの制限）
    if (sanitizedInput.pdfUrl && sanitizedInput.pdfUrl.startsWith('data:')) {
      const pdfSize = sanitizedInput.pdfUrl.length
      const maxPdfSize = 400 * 1024 // 400KB（DynamoDBの制限）
      if (pdfSize > maxPdfSize) {
        throw new Error(`PDFが大きすぎます（${(pdfSize / 1024).toFixed(2)}KB）。DynamoDBの制限（400KB）を超えるため、S3へのアップロードが必要です。S3の設定を確認してください。`)
      }
    }
    
    // undefinedフィールドを除去（GraphQLに送信しないため）
    const cleanedInput = Object.fromEntries(
      Object.entries(sanitizedInput).filter(([_, v]) => v !== undefined)
    )

    console.log('createPost - sending input:', JSON.stringify(cleanedInput, (key, value) => {
      if (typeof value === 'string' && value.length > 100) return value.substring(0, 100) + '...'
      return value
    }))

    // 明示的にauthModeを指定してIdentity Poolへのアクセスを回避
    const result = await client.graphql({
      query: mutation,
      variables: { input: cleanedInput },
      authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
    }) as any

    if (result.errors) {
      const errorMessages = result.errors.map((e: any) => {
        if (e.message) return e.message
        if (e.errorInfo) return JSON.stringify(e.errorInfo)
        if (e.extensions) return JSON.stringify(e.extensions)
        return JSON.stringify(e)
      }).join(', ')

      const firstError = result.errors[0]
      let detailedMessage = errorMessages

      if (firstError?.extensions?.errorType === 'DataTooLargeException' ||
          firstError?.message?.includes('too large') ||
          firstError?.message?.includes('size')) {
        detailedMessage = `データが大きすぎます。画像をS3にアップロードしてください。エラー: ${errorMessages}`
      } else if (firstError?.extensions?.errorType === 'UnauthorizedException') {
        detailedMessage = `認証エラーが発生しました。APIキーを確認してください。エラー: ${errorMessages}`
      }

      throw new Error(`GraphQL error: ${detailedMessage}`)
    }

    if (!result.data?.createPost) {
      throw new Error('Post creation returned no data')
    }

    console.log('createPost - result:', JSON.stringify({
      id: result.data.createPost.id,
      teamId: result.data.createPost.teamId,
      tournamentId: result.data.createPost.tournamentId,
      authorEmail: result.data.createPost.authorEmail,
    }))

    return result.data.createPost
  } catch (error: any) {
    console.error('createPost error:', error?.message)
    throw error
  }
}

export async function updatePostCounts(id: string, counts: { likesCount?: number; commentsCount?: number }) {
  const mutation = /* GraphQL */ `
    mutation UpdatePost($input: UpdatePostInput!) { updatePost(input: $input) { id likesCount commentsCount } }
  `
  const input: any = { id, ...counts }
  await client.graphql({ 
    query: mutation, 
    variables: { input },
    authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
  })
}

export async function addComment(postId: string, content: string, authorEmail?: string) {
  const mutation = /* GraphQL */ `
    mutation CreateComment($input: CreateCommentInput!) {
      createComment(input: $input) { id postId content authorEmail createdAt }
    }
  `
  await client.graphql({
    query: mutation,
    variables: { input: { postId, content, authorEmail } },
    authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
  })
}

export interface DbComment {
  id: string
  postId: string
  authorEmail?: string
  content: string
  createdAt: string
}

export async function getCommentsByPost(postId: string): Promise<DbComment[]> {
  const query = /* GraphQL */ `
    query ListComments($filter: ModelCommentFilterInput) {
      listComments(filter: $filter) {
        items {
          id
          postId
          authorEmail
          content
          createdAt
        }
      }
    }
  `

  const { data } = await client.graphql({
    query,
    variables: {
      filter: {
        postId: { eq: postId }
      }
    },
    authMode: 'apiKey'
  }) as any

  return data?.listComments?.items || []
}

export async function toggleLike(postId: string, userEmail: string, currentLikes: number) {
  const query = /* GraphQL */ `
    query LikesByPostAndUser($postId: ID!, $userEmail: String!) {
      likesByPostAndUser(postId: $postId, userEmail: { eq: $userEmail }) { items { id } }
    }
  `
  const createLike = /* GraphQL */ `
    mutation CreateLike($input: CreateLikeInput!) { createLike(input: $input) { id } }
  `
  const deleteLike = /* GraphQL */ `
    mutation DeleteLike($input: DeleteLikeInput!) { deleteLike(input: $input) { id } }
  `

  const { data } = await client.graphql({ 
    query, 
    variables: { postId, userEmail },
    authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
  }) as any
  const existing = data?.likesByPostAndUser?.items?.[0]
  if (existing) {
    await client.graphql({ 
      query: deleteLike, 
      variables: { input: { id: existing.id } },
      authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
    })
    await updatePostCounts(postId, { likesCount: Math.max(0, currentLikes - 1) })
    return { liked: false, likes: Math.max(0, currentLikes - 1) }
  } else {
    await client.graphql({ 
      query: createLike, 
      variables: { input: { postId, userEmail } },
      authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
    })
    await updatePostCounts(postId, { likesCount: currentLikes + 1 })
    return { liked: true, likes: currentLikes + 1 }
  }
}

export async function checkLikeStatus(postId: string, userEmail: string): Promise<boolean> {
  const query = /* GraphQL */ `
    query LikesByPostAndUser($postId: ID!, $userEmail: String!) {
      likesByPostAndUser(postId: $postId, userEmail: { eq: $userEmail }) { items { id } }
    }
  `

  try {
    const { data } = await client.graphql({ 
      query, 
      variables: { postId, userEmail },
      authMode: 'apiKey'
    }) as any
    return (data?.likesByPostAndUser?.items?.length || 0) > 0
  } catch (error: any) {
    console.error('checkLikeStatus error:', error?.message)
    return false
  }
}

export async function updatePost(id: string, input: Partial<DbPost>): Promise<DbPost> {
  const fallbackFields = `
    id content imageUrl videoUrl videoName pdfUrl pdfName locationName locationAddress
    linkUrl linkTitle linkDescription linkImage likesCount commentsCount
    authorEmail tournamentId teamId createdAt
  `
  
  const mutation = /* GraphQL */ `
    mutation UpdatePost($input: UpdatePostInput!) {
      updatePost(input: $input) { ${fallbackFields} }
    }
  `
  
  try {
    const { videoUrl, videoName, ...inputWithoutVideo } = input
    const sanitizedInput = { id, ...inputWithoutVideo }

    const result = await client.graphql({
      query: mutation,
      variables: { input: sanitizedInput },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    if (!result.data?.updatePost) {
      throw new Error('Update post returned no data')
    }

    return result.data.updatePost
  } catch (error: any) {
    console.error('updatePost error:', error?.message)
    throw error
  }
}

export async function deletePost(id: string): Promise<void> {
  const mutation = /* GraphQL */ `
    mutation DeletePost($input: DeletePostInput!) {
      deletePost(input: $input) { id }
    }
  `

  try {
    const result = await client.graphql({
      query: mutation,
      variables: { input: { id } },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }
  } catch (error: any) {
    console.error('deletePost error:', error?.message)
    throw error
  }
}

// ==================== Tournament Functions ====================

export async function createTournament(input: Partial<DbTournament>): Promise<DbTournament> {
  const mutation = /* GraphQL */ `
    mutation CreateTournament($input: CreateTournamentInput!) {
      createTournament(input: $input) {
        id name iconUrl coverImage category regionBlock prefecture district
        tournamentType area subArea
        description ownerEmail coAdminEmails startDate endDate favoritesCount isApproved instagramUrl createdAt updatedAt
      }
    }
  `

  try {
    const result = await client.graphql({
      query: mutation,
      variables: { input },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'GraphQL error occurred'
      throw new Error(errorMessage)
    }

    return result.data.createTournament
  } catch (error: any) {
    console.error('createTournament error:', error?.message)
    throw error
  }
}

export async function listTournaments(limit = 200, filter?: { isApproved?: boolean }): Promise<DbTournament[]> {
  const query = /* GraphQL */ `
    query ListTournaments($limit: Int, $nextToken: String, $filter: ModelTournamentFilterInput) {
      listTournaments(limit: $limit, nextToken: $nextToken, filter: $filter) {
        items {
          id name iconUrl coverImage category regionBlock prefecture district
          tournamentType area subArea
          description ownerEmail coAdminEmails startDate endDate favoritesCount isApproved instagramUrl createdAt updatedAt
        }
        nextToken
      }
    }
  `

  try {
    let allItems: DbTournament[] = []
    let nextToken: string | null = null

    // フィルタ構築
    const graphqlFilter: any = {}
    if (filter?.isApproved !== undefined) {
      graphqlFilter.isApproved = { eq: filter.isApproved }
    }

    // ページネーションで全大会を取得
    do {
      const result = await client.graphql({
        query,
        variables: {
          limit,
          nextToken,
          filter: Object.keys(graphqlFilter).length > 0 ? graphqlFilter : undefined,
        },
        authMode: 'apiKey'
      }) as any

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
      }

      const items = result?.data?.listTournaments?.items ?? []
      allItems = [...allItems, ...items]
      nextToken = result?.data?.listTournaments?.nextToken || null
    } while (nextToken)

    return allItems
  } catch (error: any) {
    console.error('listTournaments error:', error?.message)
    // Amplify GraphQLはエラーとデータを同時に返すことがある
    const fallbackItems = error?.data?.listTournaments?.items
    if (fallbackItems && fallbackItems.length > 0) {
      return fallbackItems
    }
    return []
  }
}

export async function getTournament(id: string): Promise<DbTournament | null> {
  const query = /* GraphQL */ `
    query GetTournament($id: ID!) {
      getTournament(id: $id) {
        id name iconUrl coverImage category regionBlock prefecture district
        tournamentType area subArea
        description ownerEmail coAdminEmails startDate endDate favoritesCount isApproved instagramUrl createdAt updatedAt
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: { id },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return null
    }

    return result?.data?.getTournament ?? null
  } catch (error: any) {
    console.error('getTournament error:', error?.message)
    return null
  }
}

export async function searchUsersByEmail(searchTerm: string): Promise<DbUser[]> {
  const query = /* GraphQL */ `
    query ListUsers($filter: ModelUserFilterInput) {
      listUsers(filter: $filter) {
        items {
          id firstName lastName email avatar
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: {
        filter: {
          email: { contains: searchTerm }
        }
      },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return []
    }

    return result?.data?.listUsers?.items ?? []
  } catch (error: any) {
    console.error('searchUsersByEmail error:', error?.message)
    return []
  }
}

export async function updateTournament(id: string, input: Partial<DbTournament>): Promise<DbTournament> {
  const mutation = /* GraphQL */ `
    mutation UpdateTournament($input: UpdateTournamentInput!) {
      updateTournament(input: $input) {
        id name iconUrl coverImage category regionBlock prefecture district
        tournamentType area subArea
        description ownerEmail coAdminEmails startDate endDate favoritesCount instagramUrl createdAt updatedAt
      }
    }
  `

  try {
    // スキーマに存在するフィールドのみを送信
    const sanitizedInput: any = { id }
    const allowedFields = [
      'name', 'iconUrl', 'coverImage', 'category', 'regionBlock', 'prefecture',
      'district', 'tournamentType', 'area', 'subArea', 'description', 'ownerEmail',
      'coAdminEmails', 'startDate', 'endDate', 'favoritesCount', 'instagramUrl'
    ]
    for (const field of allowedFields) {
      if ((input as any)[field] !== undefined) {
        sanitizedInput[field] = (input as any)[field]
      }
    }

    const variables = { input: sanitizedInput }

    const result = await client.graphql({
      query: mutation,
      variables,
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    if (!result.data?.updateTournament) {
      throw new Error('Update tournament returned no data')
    }

    return result.data.updateTournament
  } catch (error: any) {
    console.error('updateTournament error:', error?.message)
    throw error
  }
}

export async function createTournamentInvitation(input: Partial<DbTournamentInvitation>): Promise<DbTournamentInvitation> {
  const mutation = /* GraphQL */ `
    mutation CreateTournamentInvitation($input: CreateTournamentInvitationInput!) {
      createTournamentInvitation(input: $input) {
        id tournamentId tournamentName inviterEmail inviteeEmail status createdAt
      }
    }
  `

  try {
    const result = await client.graphql({
      query: mutation,
      variables: { input },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    return result.data.createTournamentInvitation
  } catch (error: any) {
    console.error('createTournamentInvitation error:', error?.message)
    throw error
  }
}

// ==================== Team Functions ====================

export async function createTeam(input: Partial<DbTeam>): Promise<DbTeam> {
  // GraphQLスキーマに存在するフィールドを使用
  const mutation = /* GraphQL */ `
    mutation CreateTeam($input: CreateTeamInput!) {
      createTeam(input: $input) {
        id name shortName logoUrl coverImageUrl founded region prefecture headcount category description website instagramUrl ownerEmail editorEmails isApproved createdAt updatedAt
      }
    }
  `

  try {
    // スキーマに存在するフィールドのみを送信
    const sanitizedInput: any = {}
    if (input.name) sanitizedInput.name = input.name
    if ((input as any).shortName) sanitizedInput.shortName = (input as any).shortName
    if ((input as any).logoUrl) sanitizedInput.logoUrl = (input as any).logoUrl
    if ((input as any).coverImageUrl) sanitizedInput.coverImageUrl = (input as any).coverImageUrl
    if ((input as any).founded) sanitizedInput.founded = (input as any).founded
    if (input.region) sanitizedInput.region = input.region
    if (input.prefecture) sanitizedInput.prefecture = input.prefecture
    if ((input as any).district) sanitizedInput.district = (input as any).district
    if ((input as any).headcount) sanitizedInput.headcount = (input as any).headcount
    if (input.category) sanitizedInput.category = input.category
    if (input.description) sanitizedInput.description = input.description
    if ((input as any).website) sanitizedInput.website = (input as any).website
    if ((input as any).ownerEmail) sanitizedInput.ownerEmail = (input as any).ownerEmail
    if ((input as any).editorEmails) sanitizedInput.editorEmails = (input as any).editorEmails
    if ((input as any).isApproved !== undefined) sanitizedInput.isApproved = (input as any).isApproved !== false

    const result = await client.graphql({
      query: mutation,
      variables: { input: sanitizedInput },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      const errorMessage = result.errors[0]?.message || 'GraphQL error occurred'
      throw new Error(errorMessage)
    }

    return result.data.createTeam
  } catch (error: any) {
    console.error('createTeam error:', error?.message)
    throw error
  }
}

export async function listTeams(limit = 50, filter?: { isApproved?: boolean }): Promise<DbTeam[]> {
  const query = /* GraphQL */ `
    query ListTeams($filter: ModelTeamFilterInput, $limit: Int) {
      listTeams(filter: $filter, limit: $limit) {
        items {
          id name shortName logoUrl coverImageUrl founded region prefecture headcount category description website instagramUrl ownerEmail editorEmails isApproved createdAt updatedAt
        }
      }
    }
  `

  try {
    // フィルターを構築
    const graphqlFilter: any = {}
    if (filter?.isApproved !== undefined) {
      graphqlFilter.isApproved = { eq: filter.isApproved }
    }

    const result = await client.graphql({
      query,
      variables: {
        filter: Object.keys(graphqlFilter).length > 0 ? graphqlFilter : undefined,
        limit
      },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    const teams = result.data.listTeams.items || []
    return teams
  } catch (error: any) {
    console.error('listTeams error:', error?.message)
    throw error
  }
}

export async function getTeam(id: string): Promise<DbTeam | null> {
  const query = /* GraphQL */ `
    query GetTeam($id: ID!) {
      getTeam(id: $id) {
        id name shortName logoUrl coverImageUrl founded region prefecture headcount category description website instagramUrl ownerEmail editorEmails isApproved createdAt updatedAt
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: { id },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    return result.data?.getTeam ?? null
  } catch (error: any) {
    console.error('getTeam error:', error?.message)
    throw error
  }
}

export async function updateTeam(id: string, input: Partial<DbTeam>): Promise<DbTeam> {
  // GraphQLスキーマに存在するフィールドのみを使用
  const mutation = /* GraphQL */ `
    mutation UpdateTeam($input: UpdateTeamInput!) {
      updateTeam(input: $input) {
        id name shortName category region prefecture description website instagramUrl logoUrl coverImageUrl editorEmails isApproved createdAt
      }
    }
  `

  try {
    // スキーマに存在するフィールドのみを送信
    const sanitizedInput: any = { id }
    if (input.name) sanitizedInput.name = input.name
    if (input.shortName) sanitizedInput.shortName = input.shortName
    if (input.founded) sanitizedInput.founded = input.founded
    if (input.category) sanitizedInput.category = input.category
    if (input.region) sanitizedInput.region = input.region
    if (input.prefecture) sanitizedInput.prefecture = input.prefecture
    if (input.description) sanitizedInput.description = input.description
    if (input.website) sanitizedInput.website = input.website
    if (input.instagramUrl) sanitizedInput.instagramUrl = input.instagramUrl
    if (input.logoUrl !== undefined) sanitizedInput.logoUrl = input.logoUrl
    if (input.coverImageUrl !== undefined) sanitizedInput.coverImageUrl = input.coverImageUrl
    if (input.editorEmails !== undefined) sanitizedInput.editorEmails = input.editorEmails
    if (input.headcount) sanitizedInput.headcount = input.headcount

    const result = await client.graphql({
      query: mutation,
      variables: { input: sanitizedInput },
      authMode: 'apiKey'
    }) as any

    // GraphQLエラーのチェック（errors配列が存在し、空でない場合）
    if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
      const firstError = result.errors[0]
      const errorMessage = firstError?.message || 'GraphQL error occurred'
      throw new Error(`GraphQL error: ${errorMessage}`)
    }

    // データが存在しない場合のチェック
    if (!result.data || !result.data.updateTeam) {
      throw new Error('Update team returned no data. The team may not exist or you may not have permission to update it.')
    }

    return result.data.updateTeam
  } catch (error: any) {
    if (error instanceof Error) {
      console.error('updateTeam error:', error.message)
      throw error
    }

    // エラーがオブジェクトの場合
    if (typeof error === 'object' && error !== null) {
      let errorMessage = 'Unknown error'

      if (error.message) {
        errorMessage = error.message
      } else if (error.toString && typeof error.toString === 'function') {
        const toStringResult = error.toString()
        if (toStringResult !== '[object Object]') {
          errorMessage = toStringResult
        }
      }

      // JSON.stringifyを試みる（循環参照を避けるため）
      try {
        const jsonString = JSON.stringify(error, (key, value) => {
          if (key === 'stack') return undefined // stackトレースは除外
          return value
        }, 2)
        if (jsonString && jsonString !== '{}') {
          errorMessage = jsonString
        }
      } catch (e) {
        // JSON.stringifyが失敗した場合（循環参照など）
        errorMessage = `Error object: ${Object.keys(error).join(', ')}`
      }

      throw new Error(`Failed to update team: ${errorMessage}`)
    }

    throw new Error(`Failed to update team: ${String(error)}`)
  }
}

// ==================== お気に入り機能 ====================

/**
 * ユーザーの特定大会/チームのお気に入りレコードを検索
 * favoritesByUser GSI → listFavorites フォールバックで検索
 */
async function findExistingFavorite(
  userEmail: string,
  targetId: string,
  targetType: 'tournament' | 'team'
): Promise<{ id: string } | null> {
  const filterField = targetType === 'tournament' ? 'tournamentId' : 'teamId'

  // まずfavoritesByUser GSIを試す
  try {
    const result = await client.graphql({
      query: `
        query FavoritesByUser($userEmail: String!) {
          favoritesByUser(userEmail: $userEmail) {
            items {
              id
              tournamentId
              teamId
            }
          }
        }
      `,
      variables: { userEmail },
      authMode: 'apiKey'
    }) as any

    if (result.data?.favoritesByUser?.items) {
      const match = result.data.favoritesByUser.items.find(
        (f: any) => f[filterField] === targetId
      )
      if (match) return { id: match.id }
    }
  } catch (gsiError) {
    // GSIが利用不可の場合、listFavoritesにフォールバック
    console.log('[api] findExistingFavorite: GSI利用不可、listFavoritesにフォールバック')
  }

  // フォールバック: listFavoritesでスキャン
  try {
    const result = await client.graphql({
      query: `
        query ListFavorites($filter: ModelFavoriteFilterInput, $limit: Int) {
          listFavorites(filter: $filter, limit: $limit) {
            items {
              id
              userEmail
              tournamentId
              teamId
            }
          }
        }
      `,
      variables: {
        filter: {
          userEmail: { eq: userEmail },
          [filterField]: { eq: targetId }
        },
        limit: 1000
      },
      authMode: 'apiKey'
    }) as any

    const items = result.data?.listFavorites?.items || []
    if (items.length > 0) return { id: items[0].id }
  } catch (error: any) {
    console.error('[api] findExistingFavorite listFavorites error:', error?.message)
  }

  return null
}

/**
 * お気に入り大会のトグル（追加/解除）
 */
export async function toggleFavoriteTournament(tournamentId: string, userEmail: string): Promise<{ isFavorite: boolean }> {
  try {
    // 既存のお気に入りを検索
    const existing = await findExistingFavorite(userEmail, tournamentId, 'tournament')

    if (existing) {
      // 既に存在する → 削除（お気に入り解除）
      await client.graphql({
        query: `
          mutation DeleteFavorite($input: DeleteFavoriteInput!) {
            deleteFavorite(input: $input) { id }
          }
        `,
        variables: { input: { id: existing.id } },
        authMode: 'apiKey'
      })
      console.log('[api] toggleFavoriteTournament: お気に入り解除', tournamentId)
      return { isFavorite: false }
    } else {
      // 存在しない → 作成（お気に入り登録）
      await client.graphql({
        query: `
          mutation CreateFavorite($input: CreateFavoriteInput!) {
            createFavorite(input: $input) { id userEmail tournamentId }
          }
        `,
        variables: { input: { userEmail, tournamentId } },
        authMode: 'apiKey'
      })
      console.log('[api] toggleFavoriteTournament: お気に入り登録', tournamentId)
      return { isFavorite: true }
    }
  } catch (error: any) {
    console.error("toggleFavoriteTournament error:", error?.message)
    throw error
  }
}

/**
 * お気に入りチームのトグル（追加/解除）
 */
export async function toggleFavoriteTeam(teamId: string, userEmail: string): Promise<{ isFavorite: boolean }> {
  try {
    // 既存のお気に入りを検索
    const existing = await findExistingFavorite(userEmail, teamId, 'team')

    if (existing) {
      // 既に存在する → 削除（お気に入り解除）
      await client.graphql({
        query: `
          mutation DeleteFavorite($input: DeleteFavoriteInput!) {
            deleteFavorite(input: $input) { id }
          }
        `,
        variables: { input: { id: existing.id } },
        authMode: 'apiKey'
      })
      console.log('[api] toggleFavoriteTeam: お気に入り解除', teamId)
      return { isFavorite: false }
    } else {
      // 存在しない → 作成（お気に入り登録）
      await client.graphql({
        query: `
          mutation CreateFavorite($input: CreateFavoriteInput!) {
            createFavorite(input: $input) { id userEmail teamId }
          }
        `,
        variables: { input: { userEmail, teamId } },
        authMode: 'apiKey'
      })
      console.log('[api] toggleFavoriteTeam: お気に入り登録', teamId)
      return { isFavorite: true }
    }
  } catch (error: any) {
    console.error("toggleFavoriteTeam error:", error?.message)
    throw error
  }
}

/**
 * 大会がお気に入り登録済みか確認
 */
export async function checkFavoriteTournament(tournamentId: string, userEmail: string): Promise<boolean> {
  try {
    const existing = await findExistingFavorite(userEmail, tournamentId, 'tournament')
    return existing !== null
  } catch (error: any) {
    console.error("checkFavoriteTournament error:", error?.message)
    return false
  }
}

/**
 * チームがお気に入り登録済みか確認
 */
export async function checkFavoriteTeam(teamId: string, userEmail: string): Promise<boolean> {
  try {
    const existing = await findExistingFavorite(userEmail, teamId, 'team')
    return existing !== null
  } catch (error: any) {
    console.error("checkFavoriteTeam error:", error?.message)
    return false
  }
}

/**
 * ユーザーのお気に入り一覧を取得（大会 + チーム）
 */
export async function getUserFavorites(userEmail: string): Promise<{ tournaments: DbTournament[], teams: DbTeam[] }> {
  try {
    let favorites: any[] = []

    // まずfavoritesByUser GSIを試す
    try {
      const result = await client.graphql({
        query: `
          query FavoritesByUser($userEmail: String!) {
            favoritesByUser(userEmail: $userEmail) {
              items {
                id
                tournamentId
                teamId
              }
            }
          }
        `,
        variables: { userEmail },
        authMode: 'apiKey'
      }) as any

      if (result.data?.favoritesByUser?.items) {
        favorites = result.data.favoritesByUser.items
      }
    } catch (gsiError) {
      // GSI利用不可の場合、listFavoritesにフォールバック
      console.log('[api] getUserFavorites: GSI利用不可、listFavoritesにフォールバック')
    }

    // GSIで取得できなかった場合、listFavoritesを使用
    if (favorites.length === 0) {
      const result = await client.graphql({
        query: `
          query ListFavorites($filter: ModelFavoriteFilterInput, $limit: Int) {
            listFavorites(filter: $filter, limit: $limit) {
              items {
                id
                userEmail
                tournamentId
                teamId
              }
            }
          }
        `,
        variables: {
          filter: { userEmail: { eq: userEmail } },
          limit: 1000
        },
        authMode: 'apiKey'
      }) as any

      favorites = result.data?.listFavorites?.items || []
    }

    const tournamentIds = favorites.filter((f: any) => f.tournamentId).map((f: any) => f.tournamentId)
    const teamIds = favorites.filter((f: any) => f.teamId).map((f: any) => f.teamId)

    const tournaments = await Promise.all(
      tournamentIds.map((id: string) => getTournament(id))
    )
    const teams = await Promise.all(
      teamIds.map((id: string) => getTeam(id))
    )

    return {
      tournaments: tournaments.filter((t): t is DbTournament => t !== null),
      teams: teams.filter((t): t is DbTeam => t !== null)
    }
  } catch (error: any) {
    console.error("getUserFavorites error:", error?.message)
    return { tournaments: [], teams: [] }
  }
}

// ==================== Follow Functions ====================

export type DbFollow = {
  id: string
  followerEmail: string
  followingEmail: string
  createdAt?: string | null
}

/**
 * ユーザーをフォローする
 */
export async function followUser(followerEmail: string, followingEmail: string): Promise<DbFollow> {
  try {
    const result = await client.graphql({
      query: `
        mutation CreateFollow($input: CreateFollowInput!) {
          createFollow(input: $input) {
            id
            followerEmail
            followingEmail
            createdAt
          }
        }
      `,
      variables: {
        input: {
          followerEmail,
          followingEmail
        }
      },
      authMode: 'apiKey'
    }) as any

    return result.data.createFollow
  } catch (error: any) {
    console.error("followUser error:", error?.message)
    throw error
  }
}

/**
 * ユーザーのフォローを解除する
 */
export async function unfollowUser(followerEmail: string, followingEmail: string): Promise<void> {
  try {
    // まず既存のフォロー関係を検索
    const findResult = await client.graphql({
      query: `
        query FollowsByFollower($followerEmail: String!) {
          followsByFollower(followerEmail: $followerEmail) {
            items {
              id
              followingEmail
            }
          }
        }
      `,
      variables: {
        followerEmail
      },
      authMode: 'apiKey'
    }) as any

    const follows = findResult.data?.followsByFollower?.items || []
    const follow = follows.find((f: any) => f.followingEmail === followingEmail)

    if (!follow) {
      throw new Error("Follow relationship not found")
    }

    // フォロー関係を削除
    await client.graphql({
      query: `
        mutation DeleteFollow($input: DeleteFollowInput!) {
          deleteFollow(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          id: follow.id
        }
      },
      authMode: 'apiKey'
    })
  } catch (error: any) {
    console.error("unfollowUser error:", error?.message)
    throw error
  }
}

/**
 * フォロー状態を確認
 */
export async function checkFollowStatus(followerEmail: string, followingEmail: string): Promise<boolean> {
  try {
    const result = await client.graphql({
      query: `
        query FollowsByFollower($followerEmail: String!) {
          followsByFollower(followerEmail: $followerEmail) {
            items {
              id
              followingEmail
            }
          }
        }
      `,
      variables: {
        followerEmail
      },
      authMode: 'apiKey'
    }) as any

    const follows = result.data?.followsByFollower?.items || []
    return follows.some((f: any) => f.followingEmail === followingEmail)
  } catch (error: any) {
    console.error("checkFollowStatus error:", error?.message)
    return false
  }
}

/**
 * フォロワー一覧を取得
 */
export async function getFollowers(userEmail: string): Promise<DbUser[]> {
  try {
    const result = await client.graphql({
      query: `
        query FollowsByFollowing($followingEmail: String!) {
          followsByFollowing(followingEmail: $followingEmail) {
            items {
              followerEmail
            }
          }
        }
      `,
      variables: {
        followingEmail: userEmail
      },
      authMode: 'apiKey'
    }) as any

    const follows = result.data?.followsByFollowing?.items || []
    const followerEmails = follows.map((f: any) => f.followerEmail)

    const users = await Promise.all(
      followerEmails.map((email: string) => getUserByEmail(email))
    )

    return users.filter((u): u is DbUser => u !== null)
  } catch (error: any) {
    console.error("getFollowers error:", error?.message)
    return []
  }
}

/**
 * フォロー中一覧を取得
 */
export async function getFollowing(userEmail: string): Promise<DbUser[]> {
  try {
    const result = await client.graphql({
      query: `
        query FollowsByFollower($followerEmail: String!) {
          followsByFollower(followerEmail: $followerEmail) {
            items {
              followingEmail
            }
          }
        }
      `,
      variables: {
        followerEmail: userEmail
      },
      authMode: 'apiKey'
    }) as any

    const follows = result.data?.followsByFollower?.items || []
    const followingEmails = follows.map((f: any) => f.followingEmail)

    const users = await Promise.all(
      followingEmails.map((email: string) => getUserByEmail(email))
    )

    return users.filter((u): u is DbUser => u !== null)
  } catch (error: any) {
    console.error("getFollowing error:", error?.message)
    return []
  }
}

/**
 * フォロワー数とフォロー中数を取得
 */
export async function getFollowCounts(userEmail: string): Promise<{ followers: number, following: number }> {
  try {
    const [followersResult, followingResult] = await Promise.all([
      client.graphql({
        query: `
          query FollowsByFollowing($followingEmail: String!) {
            followsByFollowing(followingEmail: $followingEmail) {
              items {
                id
              }
            }
          }
        `,
        variables: {
          followingEmail: userEmail
        },
        authMode: 'apiKey'
      }) as any,
      client.graphql({
        query: `
          query FollowsByFollower($followerEmail: String!) {
            followsByFollower(followerEmail: $followerEmail) {
              items {
                id
              }
            }
          }
        `,
        variables: {
          followerEmail: userEmail
        },
        authMode: 'apiKey'
      }) as any
    ])

    return {
      followers: followersResult.data?.followsByFollowing?.items?.length || 0,
      following: followingResult.data?.followsByFollower?.items?.length || 0
    }
  } catch (error: any) {
    console.error("getFollowCounts error:", error?.message)
    return { followers: 0, following: 0 }
  }
}

// ==================== Region Functions ====================

export async function listRegions(): Promise<DbRegion[]> {
  const query = /* GraphQL */ `
    query ListRegions {
      listRegions {
        items {
          id name slug sortOrder createdAt updatedAt
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    const regions = result?.data?.listRegions?.items ?? []
    return regions.sort((a: DbRegion, b: DbRegion) => a.sortOrder - b.sortOrder)
  } catch (error: any) {
    console.error('listRegions error:', error?.message)
    return []
  }
}

export async function getRegionBySlug(slug: string): Promise<DbRegion | null> {
  const query = /* GraphQL */ `
    query ListRegions($filter: ModelRegionFilterInput) {
      listRegions(filter: $filter) {
        items {
          id name slug sortOrder createdAt updatedAt
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: {
        filter: { slug: { eq: slug } }
      },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return null
    }

    return result?.data?.listRegions?.items?.[0] || null
  } catch (error: any) {
    console.error('getRegionBySlug error:', error?.message)
    return null
  }
}

// ==================== Prefecture Functions ====================

export async function listPrefectures(regionId?: string): Promise<DbPrefecture[]> {
  let query: string
  let variables: any = {}

  if (regionId) {
    query = /* GraphQL */ `
      query ListPrefectures($filter: ModelPrefectureFilterInput) {
        listPrefectures(filter: $filter) {
          items {
            id name slug regionId sortOrder createdAt updatedAt
          }
        }
      }
    `
    variables.filter = { regionId: { eq: regionId } }
  } else {
    query = /* GraphQL */ `
      query ListPrefectures {
        listPrefectures {
          items {
            id name slug regionId sortOrder createdAt updatedAt
          }
        }
      }
    `
  }

  try {
    const result = await client.graphql({
      query,
      variables: Object.keys(variables).length > 0 ? variables : undefined,
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    const prefectures = result?.data?.listPrefectures?.items ?? []

    return prefectures.sort((a: DbPrefecture, b: DbPrefecture) => a.sortOrder - b.sortOrder)
  } catch (error: any) {
    console.error('listPrefectures error:', error?.message)
    return []
  }
}

export async function getPrefectureBySlug(slug: string, regionId?: string): Promise<DbPrefecture | null> {
  const query = /* GraphQL */ `
    query ListPrefectures($filter: ModelPrefectureFilterInput) {
      listPrefectures(filter: $filter) {
        items {
          id name slug regionId sortOrder createdAt updatedAt
        }
      }
    }
  `

  try {
    const filter: any = { slug: { eq: slug } }
    if (regionId) {
      filter.regionId = { eq: regionId }
    }

    const result = await client.graphql({
      query,
      variables: { filter },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return null
    }

    return result?.data?.listPrefectures?.items?.[0] || null
  } catch (error: any) {
    console.error('getPrefectureBySlug error:', error?.message)
    return null
  }
}

// ==================== District Functions ====================

export async function listDistricts(prefectureId: string): Promise<DbDistrict[]> {
  const query = /* GraphQL */ `
    query ListDistricts($filter: ModelDistrictFilterInput) {
      listDistricts(filter: $filter) {
        items {
          id name prefectureId sortOrder createdAt updatedAt
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: {
        filter: { prefectureId: { eq: prefectureId } }
      },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    const districts = result?.data?.listDistricts?.items ?? []
    return districts.sort((a: DbDistrict, b: DbDistrict) => a.sortOrder - b.sortOrder)
  } catch (error: any) {
    console.error('listDistricts error:', error?.message)
    return []
  }
}

// ==================== Tournament Team Functions ====================

export async function getTournamentTeams(tournamentId: string): Promise<(DbTournamentTeam & { team?: DbTeam | null })[]> {
  const query = /* GraphQL */ `
    query TournamentTeamsByTournamentId($tournamentId: ID!) {
      tournamentTeamsByTournamentId(tournamentId: $tournamentId) {
        items {
          id tournamentId teamId teamName participationYear createdAt updatedAt
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: { tournamentId },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return []
    }

    const tournamentTeams = result?.data?.tournamentTeamsByTournamentId?.items ?? []

    // チーム情報を取得
    const teamsWithData = await Promise.all(
      tournamentTeams.map(async (tt: DbTournamentTeam) => {
        try {
          const team = await getTeam(tt.teamId)
          return { ...tt, team }
        } catch (error) {
          return { ...tt, team: null }
        }
      })
    )

    return teamsWithData
  } catch (error: any) {
    console.error('getTournamentTeams error:', error?.message)
    return []
  }
}

export async function addTournamentTeam(tournamentId: string, teamId: string, teamName?: string, participationYear?: string): Promise<DbTournamentTeam> {
  // 権限チェック: 大会運営者のみ追加可能
  const currentEmail = await getCurrentUserEmail()
  if (!currentEmail) {
    throw new Error('参加チームの追加にはログインが必要です')
  }
  const hasPermission = await checkTournamentAdminPermission(tournamentId, currentEmail)
  if (!hasPermission) {
    throw new Error('参加チームの追加は大会運営者のみ実行できます')
  }

  const mutation = /* GraphQL */ `
    mutation CreateTournamentTeam($input: CreateTournamentTeamInput!) {
      createTournamentTeam(input: $input) {
        id tournamentId teamId teamName participationYear createdAt updatedAt
      }
    }
  `

  try {
    const result = await client.graphql({
      query: mutation,
      variables: {
        input: {
          tournamentId,
          teamId,
          teamName,
          participationYear
        }
      },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    return result.data.createTournamentTeam
  } catch (error: any) {
    console.error('addTournamentTeam error:', error?.message)
    throw error
  }
}

export async function getTeamTournaments(teamId: string): Promise<(DbTournamentTeam & { tournament?: DbTournament | null })[]> {
  const query = /* GraphQL */ `
    query TournamentTeamsByTeamId($teamId: ID!) {
      tournamentTeamsByTeamId(teamId: $teamId) {
        items {
          id tournamentId teamId teamName participationYear createdAt updatedAt
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: { teamId },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return []
    }

    const tournamentTeams = result?.data?.tournamentTeamsByTeamId?.items ?? []

    // 大会情報を取得
    const tournamentsWithData = await Promise.all(
      tournamentTeams.map(async (tt: DbTournamentTeam) => {
        try {
          const tournament = await getTournament(tt.tournamentId)
          return { ...tt, tournament }
        } catch (error) {
          return { ...tt, tournament: null }
        }
      })
    )

    return tournamentsWithData
  } catch (error: any) {
    console.error('getTeamTournaments error:', error?.message)
    return []
  }
}

export async function removeTournamentTeam(id: string, tournamentId?: string): Promise<void> {
  // 権限チェック: 大会運営者のみ削除可能
  const currentEmail = await getCurrentUserEmail()
  if (!currentEmail) {
    throw new Error('参加チームの削除にはログインが必要です')
  }

  // tournamentIdが渡されない場合はTournamentTeamレコードから取得
  let tId = tournamentId
  if (!tId) {
    const getQuery = /* GraphQL */ `
      query GetTournamentTeam($id: ID!) {
        getTournamentTeam(id: $id) {
          id tournamentId
        }
      }
    `
    const getResult = await client.graphql({
      query: getQuery,
      variables: { id },
      authMode: 'apiKey'
    }) as any
    tId = getResult?.data?.getTournamentTeam?.tournamentId
  }

  if (!tId) {
    throw new Error('大会チーム情報が見つかりません')
  }

  const hasPermission = await checkTournamentAdminPermission(tId, currentEmail)
  if (!hasPermission) {
    throw new Error('参加チームの削除は大会運営者のみ実行できます')
  }

  const mutation = /* GraphQL */ `
    mutation DeleteTournamentTeam($input: DeleteTournamentTeamInput!) {
      deleteTournamentTeam(input: $input) {
        id
      }
    }
  `

  try {
    const result = await client.graphql({
      query: mutation,
      variables: { input: { id } },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }
  } catch (error: any) {
    console.error('removeTournamentTeam error:', error?.message)
    throw error
  }
}

// ==================== Tournament Result Functions ====================

// 個別の大会結果を取得（権限チェック用ヘルパー）
async function getTournamentResultById(id: string): Promise<DbTournamentResult | null> {
  const query = /* GraphQL */ `
    query GetTournamentResult($id: ID!) {
      getTournamentResult(id: $id) {
        id tournamentId year title content ranking startDate endDate imageUrl pdfUrl pdfName createdBy createdAt updatedAt
      }
    }
  `
  try {
    const result = await client.graphql({
      query,
      variables: { id },
      authMode: 'apiKey'
    }) as any
    return result?.data?.getTournamentResult ?? null
  } catch (error: any) {
    console.error('getTournamentResultById error:', error?.message)
    return null
  }
}

export async function getTournamentResults(tournamentId: string): Promise<DbTournamentResult[]> {
  const query = /* GraphQL */ `
    query TournamentResultsByTournamentId($tournamentId: ID!) {
      tournamentResultsByTournamentId(tournamentId: $tournamentId) {
        items {
          id tournamentId year title content ranking startDate endDate imageUrl pdfUrl pdfName createdBy createdAt updatedAt
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: { tournamentId },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return []
    }

    return result?.data?.tournamentResultsByTournamentId?.items ?? []
  } catch (error: any) {
    console.error('getTournamentResults error:', error?.message)
    return []
  }
}

export async function createTournamentResult(input: Partial<DbTournamentResult>): Promise<DbTournamentResult> {
  // 権限チェック: 大会運営者のみ作成可能
  const currentEmail = await getCurrentUserEmail()
  if (!currentEmail) {
    throw new Error('大会結果の追加にはログインが必要です')
  }
  if (!input.tournamentId) {
    throw new Error('大会IDが指定されていません')
  }
  const hasPermission = await checkTournamentAdminPermission(input.tournamentId, currentEmail)
  if (!hasPermission) {
    throw new Error('大会結果の追加は大会運営者のみ実行できます')
  }

  const mutation = /* GraphQL */ `
    mutation CreateTournamentResult($input: CreateTournamentResultInput!) {
      createTournamentResult(input: $input) {
        id tournamentId year title content ranking startDate endDate imageUrl pdfUrl pdfName createdBy createdAt updatedAt
      }
    }
  `

  try {
    const result = await client.graphql({
      query: mutation,
      variables: { input },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    return result.data.createTournamentResult
  } catch (error: any) {
    console.error('createTournamentResult error:', error?.message)
    throw error
  }
}

export async function updateTournamentResult(id: string, input: Partial<DbTournamentResult>): Promise<DbTournamentResult> {
  // 権限チェック: 大会運営者のみ更新可能
  const currentEmail = await getCurrentUserEmail()
  if (!currentEmail) {
    throw new Error('大会結果の更新にはログインが必要です')
  }

  // tournamentIdをinputまたは既存レコードから取得
  let tournamentId = input.tournamentId
  if (!tournamentId) {
    const existingResults = await getTournamentResultById(id)
    tournamentId = existingResults?.tournamentId
  }
  if (!tournamentId) {
    throw new Error('大会IDが取得できません')
  }

  const hasPermission = await checkTournamentAdminPermission(tournamentId, currentEmail)
  if (!hasPermission) {
    throw new Error('大会結果の更新は大会運営者のみ実行できます')
  }

  const mutation = /* GraphQL */ `
    mutation UpdateTournamentResult($input: UpdateTournamentResultInput!) {
      updateTournamentResult(input: $input) {
        id tournamentId year title content ranking startDate endDate imageUrl pdfUrl pdfName createdBy createdAt updatedAt
      }
    }
  `

  try {
    const result = await client.graphql({
      query: mutation,
      variables: { input: { id, ...input } },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    return result.data.updateTournamentResult
  } catch (error: any) {
    console.error('updateTournamentResult error:', error?.message)
    throw error
  }
}

export async function deleteTournamentResult(id: string): Promise<void> {
  // 権限チェック: 大会運営者のみ削除可能
  const currentEmail = await getCurrentUserEmail()
  if (!currentEmail) {
    throw new Error('大会結果の削除にはログインが必要です')
  }

  const existingResult = await getTournamentResultById(id)
  if (!existingResult?.tournamentId) {
    throw new Error('大会結果が見つかりません')
  }

  const hasPermission = await checkTournamentAdminPermission(existingResult.tournamentId, currentEmail)
  if (!hasPermission) {
    throw new Error('大会結果の削除は大会運営者のみ実行できます')
  }

  const mutation = /* GraphQL */ `
    mutation DeleteTournamentResult($input: DeleteTournamentResultInput!) {
      deleteTournamentResult(input: $input) {
        id
      }
    }
  `

  try {
    const result = await client.graphql({
      query: mutation,
      variables: { input: { id } },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }
  } catch (error: any) {
    console.error('deleteTournamentResult error:', error?.message)
    throw error
  }
}

// ==================== Timeline Functions ====================

/**
 * フォローベースのタイムライン投稿を取得
 * - フォローしているユーザーの投稿
 * - お気に入りチームの投稿
 * - お気に入り大会の投稿
 * - 自分の投稿
 */
export async function getTimelinePosts(userEmail: string, limit = 50): Promise<DbPost[]> {
  try {
    // 1. フォローしているユーザーのメールアドレスを取得
    let followingEmails: string[] = []
    try {
      const followingResult = await client.graphql({
        query: `
          query FollowsByFollower($followerEmail: String!) {
            followsByFollower(followerEmail: $followerEmail) {
              items {
                followingEmail
              }
            }
          }
        `,
        variables: { followerEmail: userEmail },
        authMode: 'apiKey'
      }) as any
      
      followingEmails = (followingResult.data?.followsByFollower?.items || [])
        .map((f: any) => f.followingEmail)
    } catch (followError) {
      // フォローリスト取得失敗時はフォールバック
    }
    
    // 2. お気に入りのチームIDと大会IDを取得
    let favoriteTeamIds: string[] = []
    let favoriteTournamentIds: string[] = []
    try {
      const favResult = await client.graphql({
        query: `
          query ListFavorites($filter: ModelFavoriteFilterInput, $limit: Int) {
            listFavorites(filter: $filter, limit: $limit) {
              items {
                teamId
                tournamentId
              }
            }
          }
        `,
        variables: {
          filter: { userEmail: { eq: userEmail } },
          limit: 500
        },
        authMode: 'apiKey'
      }) as any
      
      const favorites = favResult.data?.listFavorites?.items || []
      favoriteTeamIds = favorites.filter((f: any) => f.teamId).map((f: any) => f.teamId)
      favoriteTournamentIds = favorites.filter((f: any) => f.tournamentId).map((f: any) => f.tournamentId)
    } catch (favError) {
      // お気に入り取得失敗時はフォールバック
    }
    
    // 3. すべての投稿を取得
    const allPosts = await listPosts(1000)
    
    // 4. フィルタリング
    // - 自分の投稿
    // - フォローしているユーザーの投稿
    // - お気に入りチームの投稿
    // - お気に入り大会の投稿
    const relevantEmails = [userEmail, ...followingEmails]
    
    const filteredPosts = allPosts.filter(post => {
      // 自分またはフォローしているユーザーの投稿
      if (post.authorEmail && relevantEmails.includes(post.authorEmail)) {
        return true
      }
      // お気に入りチームの投稿
      if (post.teamId && favoriteTeamIds.includes(post.teamId)) {
        return true
      }
      // お気に入り大会の投稿
      if (post.tournamentId && favoriteTournamentIds.includes(post.tournamentId)) {
        return true
      }
      return false
    })

    // 5. 新しい順にソートして返す
    const sortedPosts = filteredPosts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
    
    return sortedPosts.slice(0, limit)
  } catch (error: any) {
    console.error('getTimelinePosts error:', error?.message)
    // フォールバック: 全投稿を返す
    return listPosts(limit)
  }
}

/**
 * フォロー/アンフォローをトグル
 */
export async function toggleFollow(followerEmail: string, followingEmail: string): Promise<{ isFollowing: boolean }> {
  try {
    // 現在のフォロー状態を確認
    const isCurrentlyFollowing = await checkFollowStatus(followerEmail, followingEmail)
    
    if (isCurrentlyFollowing) {
      // フォロー解除
      await unfollowUser(followerEmail, followingEmail)
      return { isFollowing: false }
    } else {
      // フォロー
      await followUser(followerEmail, followingEmail)
      return { isFollowing: true }
    }
  } catch (error: any) {
    console.error('toggleFollow error:', error?.message)
    throw error
  }
}

// ==================== Search Functions ====================

/**
 * ユーザーを検索（名前またはメールアドレスで）
 */
export async function searchUsers(searchTerm: string): Promise<DbUser[]> {
  const query = /* GraphQL */ `
    query ListUsers($filter: ModelUserFilterInput, $limit: Int) {
      listUsers(filter: $filter, limit: $limit) {
        items {
          id email firstName lastName avatar bio category region prefecture district teams
          isEmailPublic isRegistrationDatePublic createdAt updatedAt
        }
      }
    }
  `

  try {
    // 名前での検索
    const nameResult = await client.graphql({
      query,
      variables: {
        filter: {
          or: [
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } },
            { email: { contains: searchTerm } }
          ]
        },
        limit: 50
      },
      authMode: 'apiKey'
    }) as any

    if (nameResult.errors) {
      return []
    }

    return nameResult?.data?.listUsers?.items ?? []
  } catch (error: any) {
    console.error('searchUsers error:', error?.message)
    return []
  }
}

/**
 * 大会を検索（名前で）
 */
export async function searchTournaments(searchTerm: string): Promise<DbTournament[]> {
  const query = /* GraphQL */ `
    query ListTournaments($filter: ModelTournamentFilterInput, $limit: Int) {
      listTournaments(filter: $filter, limit: $limit) {
        items {
          id name iconUrl coverImage category regionBlock prefecture district
          tournamentType area subArea
          description ownerEmail coAdminEmails startDate endDate favoritesCount instagramUrl createdAt updatedAt
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: {
        filter: {
          name: { contains: searchTerm }
        },
        limit: 50
      },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return []
    }

    return result?.data?.listTournaments?.items ?? []
  } catch (error: any) {
    console.error('searchTournaments error:', error?.message)
    return []
  }
}

// ==================== Chat Functions ====================

const CHAT_THREAD_FIELDS = 'id senderEmail senderName teamId teamName tournamentId tournamentName threadType status lastMessage lastMessageAt teamUnreadCount senderUnreadCount createdAt updatedAt'
const CHAT_MESSAGE_FIELDS = 'id threadId senderEmail senderName content messageType imageUrl videoUrl pdfUrl pdfName isRead createdAt updatedAt'
// メディアフィールドなしバージョン（スキーマが未更新の場合のフォールバック用）
const CHAT_MESSAGE_FIELDS_BASIC = 'id threadId senderEmail senderName content messageType isRead createdAt updatedAt'

/**
 * チャットスレッドを作成（大会運営者からチームへのオファー）
 * 権限チェック: 大会運営者のみ
 */
export async function createChatThread(input: {
  teamId: string
  teamName: string
  tournamentId: string
  tournamentName: string
  initialMessage: string
}): Promise<DbChatThread> {
  const currentEmail = await getCurrentUserEmail()
  if (!currentEmail) {
    throw new Error('オファーの送信にはログインが必要です')
  }

  // 権限チェック: 大会運営者のみ送信可能
  const hasPermission = await checkTournamentAdminPermission(input.tournamentId, currentEmail)
  if (!hasPermission) {
    throw new Error('大会参加オファーは大会運営者のみ送信できます')
  }

  // 送信者の名前を取得
  const currentUser = await getUserByEmail(currentEmail)
  const senderName = currentUser ? `${currentUser.lastName} ${currentUser.firstName}` : currentEmail

  const mutation = /* GraphQL */ `
    mutation CreateChatThread($input: CreateChatThreadInput!) {
      createChatThread(input: $input) {
        ${CHAT_THREAD_FIELDS}
      }
    }
  `

  try {
    const now = new Date().toISOString()
    const threadInput = {
      senderEmail: currentEmail,
      senderName,
      teamId: input.teamId,
      teamName: input.teamName,
      tournamentId: input.tournamentId,
      tournamentName: input.tournamentName,
      threadType: 'offer',
      status: 'pending',
      lastMessage: input.initialMessage,
      lastMessageAt: now,
      teamUnreadCount: 1,
      senderUnreadCount: 0,
    }
    console.log('[createChatThread] 送信データ:', JSON.stringify(threadInput))

    const result = await client.graphql({
      query: mutation,
      variables: { input: threadInput },
      authMode: 'apiKey'
    }) as any

    console.log('[createChatThread] GraphQL結果:', JSON.stringify(result))

    if (result.errors) {
      console.error('[createChatThread] GraphQLエラー:', JSON.stringify(result.errors))
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    const thread = result.data?.createChatThread
    if (!thread) {
      console.error('[createChatThread] スレッドデータが空:', JSON.stringify(result.data))
      throw new Error('スレッドの作成に失敗しました（データなし）')
    }

    console.log('[createChatThread] スレッド作成成功:', thread.id)

    // 初期メッセージを送信
    try {
      await createChatMessage({
        threadId: thread.id,
        content: input.initialMessage,
        messageType: 'text',
      })
      console.log('[createChatThread] 初期メッセージ送信成功')
    } catch (msgError: any) {
      console.error('[createChatThread] 初期メッセージ送信失敗:', msgError?.message)
      // メッセージ送信失敗でもスレッドは返す
    }

    // チーム運営者へ通知を送信
    try {
      await notifyTeamAdmins(input.teamId, {
        type: 'offer_received',
        title: '大会参加オファーが届きました',
        message: `${senderName} から「${input.tournamentName}」への参加オファーが届きました`,
        senderName,
        relatedId: thread.id,
        relatedType: 'chat',
      })
    } catch (notifyError) {
      // 通知送信に失敗してもスレッド作成は成功とする
      console.warn('[createChatThread] 通知送信失敗（続行）')
    }

    return thread
  } catch (error: any) {
    console.error('[createChatThread] エラー:', error)
    console.error('[createChatThread] エラー名:', error?.name)
    console.error('[createChatThread] エラーメッセージ:', error?.message)
    console.error('[createChatThread] エラー詳細:', JSON.stringify(error, Object.getOwnPropertyNames(error || {})))
    throw error
  }
}

/**
 * チャットメッセージを送信
 */
export async function createChatMessage(input: {
  threadId: string
  content: string
  messageType: string
  imageUrl?: string | null
  videoUrl?: string | null
  pdfUrl?: string | null
  pdfName?: string | null
}): Promise<DbChatMessage> {
  const currentEmail = await getCurrentUserEmail()
  if (!currentEmail) {
    throw new Error('メッセージの送信にはログインが必要です')
  }

  const currentUser = await getUserByEmail(currentEmail)
  const senderName = currentUser ? `${currentUser.lastName} ${currentUser.firstName}` : currentEmail

  // メディアフィールド付きmutation
  const mutationWithMedia = /* GraphQL */ `
    mutation CreateChatMessage($input: CreateChatMessageInput!) {
      createChatMessage(input: $input) {
        ${CHAT_MESSAGE_FIELDS}
      }
    }
  `
  // メディアフィールドなしmutation（フォールバック用）
  const mutationBasic = /* GraphQL */ `
    mutation CreateChatMessage($input: CreateChatMessageInput!) {
      createChatMessage(input: $input) {
        ${CHAT_MESSAGE_FIELDS_BASIC}
      }
    }
  `

  // メディアフィールドを構築
  const messageInput: any = {
    threadId: input.threadId,
    senderEmail: currentEmail,
    senderName,
    content: input.content,
    messageType: input.messageType,
    isRead: false,
  }
  if (input.imageUrl) messageInput.imageUrl = input.imageUrl
  if (input.videoUrl) messageInput.videoUrl = input.videoUrl
  if (input.pdfUrl) messageInput.pdfUrl = input.pdfUrl
  if (input.pdfName) messageInput.pdfName = input.pdfName

  // メディアなしの基本inputを準備（フォールバック用）
  const basicInput: any = {
    threadId: input.threadId,
    senderEmail: currentEmail,
    senderName,
    content: input.content,
    messageType: input.messageType,
    isRead: false,
  }

  try {
    const result = await client.graphql({
      query: mutationWithMedia,
      variables: { input: messageInput },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      console.warn('createChatMessage - メディアフィールド付きmutation失敗、フォールバック:', result.errors[0]?.message)
      // メディアフィールドなしで再試行
      const fallbackResult = await client.graphql({
        query: mutationBasic,
        variables: { input: basicInput },
        authMode: 'apiKey'
      }) as any
      if (fallbackResult.errors) {
        throw new Error(fallbackResult.errors[0]?.message || 'GraphQL error occurred')
      }
      // スレッドの最終メッセージを更新
      const lastMsg = input.content
      await updateChatThreadLastMessage(input.threadId, lastMsg, currentEmail)
      return fallbackResult.data.createChatMessage
    }

    // スレッドの最終メッセージを更新
    const lastMsg = input.imageUrl ? '📷 画像' : input.videoUrl ? '🎬 動画' : input.pdfUrl ? '📄 PDF' : input.content
    await updateChatThreadLastMessage(input.threadId, lastMsg, currentEmail)

    return result.data.createChatMessage
  } catch (error: any) {
    console.error('createChatMessage error:', error?.message)
    // catchでもフォールバック試行
    try {
      console.warn('createChatMessage - フォールバック試行（メディアフィールドなし）')
      const fallbackResult = await client.graphql({
        query: mutationBasic,
        variables: { input: basicInput },
        authMode: 'apiKey'
      }) as any
      if (fallbackResult.errors) {
        throw new Error(fallbackResult.errors[0]?.message || 'GraphQL error occurred')
      }
      const lastMsg = input.content
      await updateChatThreadLastMessage(input.threadId, lastMsg, currentEmail)
      return fallbackResult.data.createChatMessage
    } catch (fallbackError: any) {
      console.error('createChatMessage fallback error:', fallbackError?.message)
      throw fallbackError
    }
  }
}

/**
 * スレッドの最終メッセージ情報を更新（内部用）
 */
async function updateChatThreadLastMessage(threadId: string, lastMessage: string, senderEmail: string): Promise<void> {
  // まずスレッドを取得して未読カウントを決定
  const thread = await getChatThread(threadId)
  if (!thread) return

  const isSenderOriginalSender = thread.senderEmail === senderEmail
  const updateInput: any = {
    id: threadId,
    lastMessage,
    lastMessageAt: new Date().toISOString(),
  }

  // 相手側の未読カウントをインクリメント
  if (isSenderOriginalSender) {
    updateInput.teamUnreadCount = (thread.teamUnreadCount || 0) + 1
  } else {
    updateInput.senderUnreadCount = (thread.senderUnreadCount || 0) + 1
  }

  const mutation = /* GraphQL */ `
    mutation UpdateChatThread($input: UpdateChatThreadInput!) {
      updateChatThread(input: $input) {
        ${CHAT_THREAD_FIELDS}
      }
    }
  `

  try {
    await client.graphql({
      query: mutation,
      variables: { input: updateInput },
      authMode: 'apiKey'
    })
  } catch (error: any) {
    console.error('updateChatThreadLastMessage error:', error?.message)
  }
}

/**
 * チャットスレッドを取得
 */
export async function getChatThread(id: string): Promise<DbChatThread | null> {
  const query = /* GraphQL */ `
    query GetChatThread($id: ID!) {
      getChatThread(id: $id) {
        ${CHAT_THREAD_FIELDS}
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: { id },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return null
    }

    return result?.data?.getChatThread ?? null
  } catch (error: any) {
    console.error('getChatThread error:', error?.message)
    return null
  }
}

/**
 * チーム宛てのチャットスレッド一覧を取得
 * チーム運営者（ownerEmail/editorEmails）が閲覧する
 */
export async function getChatThreadsByTeam(teamId: string): Promise<DbChatThread[]> {
  const query = /* GraphQL */ `
    query ChatThreadsByTeam($teamId: ID!) {
      chatThreadsByTeam(teamId: $teamId) {
        items {
          ${CHAT_THREAD_FIELDS}
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: { teamId },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return []
    }

    return result?.data?.chatThreadsByTeam?.items ?? []
  } catch (error: any) {
    console.error('getChatThreadsByTeam error:', error?.message)
    return []
  }
}

/**
 * 大会運営者が送信したチャットスレッド一覧を取得
 */
export async function getChatThreadsBySender(senderEmail: string): Promise<DbChatThread[]> {
  const query = /* GraphQL */ `
    query ChatThreadsBySender($senderEmail: String!) {
      chatThreadsBySender(senderEmail: $senderEmail) {
        items {
          ${CHAT_THREAD_FIELDS}
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: { senderEmail },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return []
    }

    return result?.data?.chatThreadsBySender?.items ?? []
  } catch (error: any) {
    console.error('getChatThreadsBySender error:', error?.message)
    return []
  }
}

/**
 * 現在のユーザーに関連する全てのチャットスレッドを取得
 * - 送信者として送ったスレッド
 * - チーム運営者として受け取ったスレッド
 */
export async function getMyAllChatThreads(): Promise<DbChatThread[]> {
  const currentEmail = await getCurrentUserEmail()
  console.log('[getMyAllChatThreads] currentEmail:', currentEmail)
  if (!currentEmail) return []

  try {
    // 1. 送信したスレッドを取得
    const sentThreads = await getChatThreadsBySender(currentEmail)
    console.log('[getMyAllChatThreads] sentThreads:', sentThreads.length)

    // 2. 自分が運営するチーム宛てのスレッドを取得
    // まず自分がオーナーまたはエディターのチームを検索
    const myTeams = await getMyTeams(currentEmail)
    console.log('[getMyAllChatThreads] myTeams:', myTeams.length, myTeams.map(t => ({ id: t.id, name: t.name })))
    const receivedThreads: DbChatThread[] = []
    for (const team of myTeams) {
      const threads = await getChatThreadsByTeam(team.id)
      console.log(`[getMyAllChatThreads] team ${team.name} (${team.id}) threads:`, threads.length)
      receivedThreads.push(...threads)
    }

    // 重複を除去してマージ（lastMessageAtの降順）
    const allThreads = [...sentThreads, ...receivedThreads]
    const uniqueThreads = allThreads.filter((thread, index, self) =>
      index === self.findIndex((t) => t.id === thread.id)
    )

    console.log('[getMyAllChatThreads] 合計スレッド数:', uniqueThreads.length)
    return uniqueThreads.sort((a, b) => {
      const dateA = a.lastMessageAt || a.createdAt || ''
      const dateB = b.lastMessageAt || b.createdAt || ''
      return dateB.localeCompare(dateA)
    })
  } catch (error: any) {
    console.error('getMyAllChatThreads error:', error?.message)
    return []
  }
}

/**
 * 自分がオーナーまたはエディターのチーム一覧を取得
 */
export async function getMyTeams(email: string): Promise<DbTeam[]> {
  const query = /* GraphQL */ `
    query ListTeams($filter: ModelTeamFilterInput, $limit: Int) {
      listTeams(filter: $filter, limit: $limit) {
        items {
          id name shortName logoUrl coverImageUrl founded region prefecture headcount category description website instagramUrl ownerEmail editorEmails isApproved createdAt updatedAt
        }
      }
    }
  `

  try {
    // オーナーとして所有するチーム
    const ownerResult = await client.graphql({
      query,
      variables: {
        filter: { ownerEmail: { eq: email } },
        limit: 100
      },
      authMode: 'apiKey'
    }) as any

    const ownerTeams = ownerResult?.data?.listTeams?.items ?? []

    // エディターとして参加するチーム
    const editorResult = await client.graphql({
      query,
      variables: {
        filter: { editorEmails: { contains: email } },
        limit: 100
      },
      authMode: 'apiKey'
    }) as any

    const editorTeams = editorResult?.data?.listTeams?.items ?? []

    // 重複除去
    const allTeams = [...ownerTeams, ...editorTeams]
    return allTeams.filter((team: DbTeam, index: number, self: DbTeam[]) =>
      index === self.findIndex((t) => t.id === team.id)
    )
  } catch (error: any) {
    console.error('getMyTeams error:', error?.message)
    return []
  }
}

/**
 * チャットスレッドのメッセージ一覧を取得
 */
export async function getChatMessages(threadId: string): Promise<DbChatMessage[]> {
  // メディアフィールド付きクエリをまず試行
  const queryWithMedia = /* GraphQL */ `
    query ChatMessagesByThreadIdAndCreatedAt($threadId: ID!) {
      chatMessagesByThreadIdAndCreatedAt(threadId: $threadId, sortDirection: ASC) {
        items {
          ${CHAT_MESSAGE_FIELDS}
        }
      }
    }
  `
  // メディアフィールドなしクエリ（フォールバック用）
  const queryBasic = /* GraphQL */ `
    query ChatMessagesByThreadIdAndCreatedAt($threadId: ID!) {
      chatMessagesByThreadIdAndCreatedAt(threadId: $threadId, sortDirection: ASC) {
        items {
          ${CHAT_MESSAGE_FIELDS_BASIC}
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query: queryWithMedia,
      variables: { threadId },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      console.warn('getChatMessages - メディアフィールド付きクエリ失敗、フォールバック:', result.errors[0]?.message)
      // メディアフィールドなしで再試行
      const fallbackResult = await client.graphql({
        query: queryBasic,
        variables: { threadId },
        authMode: 'apiKey'
      }) as any
      if (fallbackResult.errors) {
        console.error('getChatMessages - フォールバックも失敗:', fallbackResult.errors[0]?.message)
        return []
      }
      return fallbackResult?.data?.chatMessagesByThreadIdAndCreatedAt?.items ?? []
    }

    return result?.data?.chatMessagesByThreadIdAndCreatedAt?.items ?? []
  } catch (error: any) {
    console.error('getChatMessages error:', error?.message)
    // catchでもフォールバック試行
    try {
      const fallbackResult = await client.graphql({
        query: queryBasic,
        variables: { threadId },
        authMode: 'apiKey'
      }) as any
      return fallbackResult?.data?.chatMessagesByThreadIdAndCreatedAt?.items ?? []
    } catch (fallbackError: any) {
      console.error('getChatMessages fallback error:', fallbackError?.message)
      return []
    }
  }
}

/**
 * チャットスレッドのステータスを更新（承認/辞退）
 * チーム運営者のみ実行可能
 */
export async function updateChatThreadStatus(threadId: string, status: 'accepted' | 'rejected'): Promise<DbChatThread> {
  const currentEmail = await getCurrentUserEmail()
  if (!currentEmail) {
    throw new Error('ステータスの更新にはログインが必要です')
  }

  const thread = await getChatThread(threadId)
  if (!thread) {
    throw new Error('スレッドが見つかりません')
  }

  // チーム運営者かチェック
  const team = await getTeam(thread.teamId)
  if (!team) {
    throw new Error('チームが見つかりません')
  }

  const isTeamAdmin = checkTeamAdminPermission(team, currentEmail)
  if (!isTeamAdmin) {
    throw new Error('オファーの承認/辞退はチーム管理者のみ実行できます')
  }

  const mutation = /* GraphQL */ `
    mutation UpdateChatThread($input: UpdateChatThreadInput!) {
      updateChatThread(input: $input) {
        ${CHAT_THREAD_FIELDS}
      }
    }
  `

  try {
    const statusLabel = status === 'accepted' ? '承認' : '辞退'
    const result = await client.graphql({
      query: mutation,
      variables: {
        input: {
          id: threadId,
          status,
        }
      },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    // システムメッセージを送信
    const currentUser = await getUserByEmail(currentEmail)
    const userName = currentUser ? `${currentUser.lastName} ${currentUser.firstName}` : currentEmail
    await createChatMessage({
      threadId,
      content: `${userName} がオファーを${statusLabel}しました`,
      messageType: 'system',
    })

    return result.data.updateChatThread
  } catch (error: any) {
    console.error('updateChatThreadStatus error:', error?.message)
    throw error
  }
}

/**
 * チャットスレッドの未読カウントをリセット
 */
export async function markChatThreadAsRead(threadId: string): Promise<void> {
  const currentEmail = await getCurrentUserEmail()
  if (!currentEmail) return

  const thread = await getChatThread(threadId)
  if (!thread) return

  const isSenderOriginalSender = thread.senderEmail === currentEmail
  const updateInput: any = { id: threadId }

  if (isSenderOriginalSender) {
    updateInput.senderUnreadCount = 0
  } else {
    updateInput.teamUnreadCount = 0
  }

  const mutation = /* GraphQL */ `
    mutation UpdateChatThread($input: UpdateChatThreadInput!) {
      updateChatThread(input: $input) {
        ${CHAT_THREAD_FIELDS}
      }
    }
  `

  try {
    await client.graphql({
      query: mutation,
      variables: { input: updateInput },
      authMode: 'apiKey'
    })
  } catch (error: any) {
    console.error('markChatThreadAsRead error:', error?.message)
  }
}

/**
 * 未読メッセージの合計数を取得
 */
export async function getTotalUnreadCount(): Promise<number> {
  const currentEmail = await getCurrentUserEmail()
  if (!currentEmail) return 0

  try {
    const allThreads = await getMyAllChatThreads()
    let total = 0

    for (const thread of allThreads) {
      if (thread.senderEmail === currentEmail) {
        total += thread.senderUnreadCount || 0
      } else {
        total += thread.teamUnreadCount || 0
      }
    }

    return total
  } catch (error: any) {
    console.error('getTotalUnreadCount error:', error?.message)
    return 0
  }
}

// ==================== Notification Functions ====================

const NOTIFICATION_FIELDS = 'id recipientEmail type title message senderName senderAvatar relatedId relatedType isRead createdAt updatedAt'

/**
 * 通知を作成（チーム運営者へのオファー通知など）
 */
export async function createNotification(input: {
  recipientEmail: string
  type: string
  title: string
  message: string
  senderName?: string
  senderAvatar?: string
  relatedId?: string
  relatedType?: string
}): Promise<DbNotification> {
  console.log('[api] createNotification 開始:', {
    recipientEmail: input.recipientEmail,
    type: input.type,
    title: input.title,
    relatedId: input.relatedId,
    relatedType: input.relatedType,
  })

  const mutation = /* GraphQL */ `
    mutation CreateNotification($input: CreateNotificationInput!) {
      createNotification(input: $input) {
        ${NOTIFICATION_FIELDS}
      }
    }
  `

  try {
    const result = await client.graphql({
      query: mutation,
      variables: {
        input: {
          ...input,
          isRead: false,
        }
      },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      console.error('[api] createNotification GraphQL errors:', JSON.stringify(result.errors))
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    console.log('[api] createNotification 成功:', result.data.createNotification?.id)
    return result.data.createNotification
  } catch (error: any) {
    console.error('[api] createNotification error:', error?.message, error)
    throw error
  }
}

/**
 * システム管理者全員に承認待ち通知を送信
 */
export async function notifyAdminsForApproval(notification: {
  type: string
  title: string
  message: string
  senderName?: string
  senderAvatar?: string
  relatedId?: string
  relatedType?: string
}): Promise<void> {
  try {
    const adminEmails = await getAdminEmails()
    for (const email of adminEmails) {
      try {
        await createNotification({
          recipientEmail: email,
          ...notification,
        })
      } catch (error) {
        console.error(`管理者通知送信エラー (${email}):`, error)
      }
    }
  } catch (error) {
    console.error('管理者通知送信エラー:', error)
  }
}

/**
 * チームの運営者全員に通知を送信
 */
export async function notifyTeamAdmins(teamId: string, notification: {
  type: string
  title: string
  message: string
  senderName?: string
  senderAvatar?: string
  relatedId?: string
  relatedType?: string
}): Promise<void> {
  try {
    const team = await getTeam(teamId)
    if (!team) return

    // 管理者全員のメールアドレスを収集（ownerEmail + editorEmails統合）
    const uniqueEmails = getTeamAdminEmails(team)

    // 各管理者に通知を送信
    await Promise.all(
      uniqueEmails.map(email =>
        createNotification({
          recipientEmail: email,
          ...notification,
        })
      )
    )
  } catch (error: any) {
    console.error('notifyTeamAdmins error:', error?.message)
  }
}

/**
 * ユーザーの通知一覧を取得
 */
export async function getNotifications(recipientEmail: string, limit = 50): Promise<DbNotification[]> {
  const query = /* GraphQL */ `
    query NotificationsByRecipient($recipientEmail: String!, $limit: Int, $sortDirection: ModelSortDirection) {
      notificationsByRecipient(recipientEmail: $recipientEmail, limit: $limit, sortDirection: $sortDirection) {
        items {
          ${NOTIFICATION_FIELDS}
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: { recipientEmail, limit, sortDirection: 'DESC' },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      return []
    }

    return result?.data?.notificationsByRecipient?.items ?? []
  } catch (error: any) {
    console.error('getNotifications error:', error?.message)
    return []
  }
}

/**
 * 通知を既読にする
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  const mutation = /* GraphQL */ `
    mutation UpdateNotification($input: UpdateNotificationInput!) {
      updateNotification(input: $input) {
        id isRead
      }
    }
  `

  try {
    await client.graphql({
      query: mutation,
      variables: { input: { id, isRead: true } },
      authMode: 'apiKey'
    })
  } catch (error: any) {
    console.error('markNotificationAsRead error:', error?.message)
  }
}

/**
 * 全通知を既読にする
 */
export async function markAllNotificationsAsRead(recipientEmail: string): Promise<void> {
  try {
    const notifications = await getNotifications(recipientEmail)
    const unread = notifications.filter(n => !n.isRead)
    await Promise.all(unread.map(n => markNotificationAsRead(n.id)))
  } catch (error: any) {
    console.error('markAllNotificationsAsRead error:', error?.message)
  }
}

/**
 * 未読通知数を取得
 */
export async function getUnreadNotificationCount(recipientEmail: string): Promise<number> {
  try {
    const notifications = await getNotifications(recipientEmail)
    return notifications.filter(n => !n.isRead).length
  } catch (error: any) {
    console.error('getUnreadNotificationCount error:', error?.message)
    return 0
  }
}

/**
 * 自分が運営する大会一覧を取得
 */
export async function getMyManagedTournaments(email: string): Promise<DbTournament[]> {
  try {
    const allTournaments = await listTournaments(200)
    return allTournaments.filter(
      (t: DbTournament) => getTournamentAdminEmails(t).includes(email)
    )
  } catch (error: any) {
    console.error('getMyManagedTournaments error:', error?.message)
    return []
  }
}

// ユーザーが運営するチームが参加している大会を取得（参加予定・過去参加を分類）
export async function getMyTeamTournaments(email: string): Promise<{
  upcoming: (DbTournament & { teamName?: string })[]
  past: (DbTournament & { teamName?: string })[]
}> {
  try {
    const teams = await getMyTeams(email)
    if (teams.length === 0) return { upcoming: [], past: [] }

    // 各チームの参加大会を取得
    const allTournamentTeams = await Promise.all(
      teams.map(async (team) => {
        const tts = await getTeamTournaments(team.id)
        return tts.map(tt => ({ ...tt, teamName: team.name }))
      })
    )

    const now = new Date()
    const upcoming: (DbTournament & { teamName?: string })[] = []
    const past: (DbTournament & { teamName?: string })[] = []
    const seenIds = new Set<string>()

    for (const teamTournaments of allTournamentTeams) {
      for (const tt of teamTournaments) {
        if (!tt.tournament || seenIds.has(tt.tournament.id)) continue
        seenIds.add(tt.tournament.id)

        const tournamentWithTeam = { ...tt.tournament, teamName: tt.teamName }
        const endDate = tt.tournament.endDate ? new Date(tt.tournament.endDate) : null
        const startDate = tt.tournament.startDate ? new Date(tt.tournament.startDate) : null

        // 終了日がある場合はそれで判定、なければ開始日、どちらもなければ参加予定扱い
        if (endDate && endDate < now) {
          past.push(tournamentWithTeam)
        } else if (startDate && startDate < now && !endDate) {
          // 開始済みだが終了日未設定 → 開催中扱いで参加予定に含める
          upcoming.push(tournamentWithTeam)
        } else {
          upcoming.push(tournamentWithTeam)
        }
      }
    }

    // 参加予定: 開始日が近い順、過去: 終了日が新しい順
    upcoming.sort((a, b) => {
      const da = a.startDate ? new Date(a.startDate).getTime() : Infinity
      const db = b.startDate ? new Date(b.startDate).getTime() : Infinity
      return da - db
    })
    past.sort((a, b) => {
      const da = a.endDate ? new Date(a.endDate).getTime() : 0
      const db = b.endDate ? new Date(b.endDate).getTime() : 0
      return db - da
    })

    return { upcoming, past }
  } catch (error: any) {
    console.error('getMyTeamTournaments error:', error?.message)
    return { upcoming: [], past: [] }
  }
}

// ==================== 管理者機能 ====================

// 管理者固定認証情報
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin',
}

// デフォルト管理者メールアドレス（フォールバック: 常に管理者として認識）
// ※ SiteConfigに未登録 or 取得失敗時でもここに記載されたメアドは必ず管理者扱いになる
const DEFAULT_ADMIN_EMAILS = [
  'kowaki1111@gmail.com',
  'ikuma.saito@easys-inc.com',
]

// キャッシュ済み管理者メールリスト（SiteConfigから取得後にキャッシュ）
let _cachedAdminEmails: string[] | null = null
let _adminEmailsCacheTime = 0
const ADMIN_CACHE_TTL = 5 * 60 * 1000 // 5分間キャッシュ

/**
 * SiteConfigから管理者メールアドレス一覧を取得
 * デフォルト管理者 + SiteConfigに登録された管理者をマージ
 */
export async function getAdminEmails(): Promise<string[]> {
  // キャッシュが有効ならそれを使う
  const now = Date.now()
  if (_cachedAdminEmails && (now - _adminEmailsCacheTime) < ADMIN_CACHE_TTL) {
    return _cachedAdminEmails
  }

  try {
    const config = await getSiteConfig('admin_emails')
    let dynamicEmails: string[] = []
    if (config?.configValue) {
      try {
        dynamicEmails = JSON.parse(config.configValue)
      } catch {
        dynamicEmails = []
      }
    }
    // デフォルト管理者 + 動的管理者をマージ（重複排除）
    const allEmails = [...new Set([
      ...DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase().trim()),
      ...dynamicEmails.map((e: string) => e.toLowerCase().trim()),
    ])]
    _cachedAdminEmails = allEmails
    _adminEmailsCacheTime = now
    return allEmails
  } catch (error) {
    console.error('管理者メール取得エラー:', error)
    return DEFAULT_ADMIN_EMAILS
  }
}

/**
 * 管理者メールアドレス一覧を更新（SiteConfigに保存）
 */
export async function updateAdminEmails(emails: string[], updatedBy: string): Promise<void> {
  // デフォルト管理者は必ず含める
  const allEmails = [...new Set([
    ...DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase().trim()),
    ...emails.map(e => e.toLowerCase().trim()).filter(e => e.length > 0),
  ])]
  const emailsJson = JSON.stringify(allEmails)

  const existingConfig = await getSiteConfig('admin_emails')

  if (existingConfig) {
    const mutation = /* GraphQL */ `
      mutation UpdateSiteConfig($input: UpdateSiteConfigInput!) {
        updateSiteConfig(input: $input) {
          ${SITE_CONFIG_FIELDS}
        }
      }
    `
    const result = await client.graphql({
      query: mutation,
      variables: { input: { id: existingConfig.id, configValue: emailsJson, updatedBy } },
      authMode: 'apiKey'
    }) as any
    if (result.errors) throw new Error(result.errors[0]?.message || '管理者メール更新エラー')
  } else {
    const mutation = /* GraphQL */ `
      mutation CreateSiteConfig($input: CreateSiteConfigInput!) {
        createSiteConfig(input: $input) {
          ${SITE_CONFIG_FIELDS}
        }
      }
    `
    const result = await client.graphql({
      query: mutation,
      variables: { input: { configKey: 'admin_emails', configValue: emailsJson, updatedBy } },
      authMode: 'apiKey'
    }) as any
    if (result.errors) throw new Error(result.errors[0]?.message || '管理者メール作成エラー')
  }

  // キャッシュ更新
  _cachedAdminEmails = allEmails
  _adminEmailsCacheTime = Date.now()
}

/**
 * 管理者キャッシュをクリア（管理者変更時に使用）
 */
export function clearAdminEmailsCache(): void {
  _cachedAdminEmails = null
  _adminEmailsCacheTime = 0
}

/**
 * 管理者固定ID/パスワードでログイン
 * 成功時はsessionStorageに管理者セッションを保存
 */
export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('yell_admin_session', 'true')
    }
    return true
  }
  return false
}

/**
 * 管理者セッションをクリア
 */
export function adminLogout(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('yell_admin_session')
  }
}

/**
 * 管理者固定ログインでセッションが有効かどうか
 */
export function isAdminLoggedIn(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('yell_admin_session') === 'true'
  }
  return false
}

/**
 * 現在のユーザーがシステム管理者かどうかを判定
 * 固定ID/パスワードでのログイン、またはCognitoメールアドレスで判定
 * SiteConfigから動的に管理者リストを取得
 */
export async function isSystemAdmin(): Promise<boolean> {
  // 固定ログインセッションがあればOK
  if (isAdminLoggedIn()) return true
  // Cognitoメールでの判定
  const email = await getCurrentUserEmail()
  if (!email) return false
  const adminEmails = await getAdminEmails()
  return adminEmails.includes(email.toLowerCase().trim())
}

/**
 * メールアドレスがシステム管理者かどうかを判定（同期版）
 * 注意: キャッシュが未取得の場合はデフォルト管理者のみで判定
 */
export function isAdminEmail(email: string): boolean {
  const emails = _cachedAdminEmails || DEFAULT_ADMIN_EMAILS
  return emails.includes(email.toLowerCase().trim())
}

/**
 * 管理者用: 全ユーザー一覧を取得（ページネーション対応）
 */
export async function adminListAllUsers(limit = 500): Promise<DbUser[]> {
  const query = /* GraphQL */ `
    query ListUsers($limit: Int, $nextToken: String) {
      listUsers(limit: $limit, nextToken: $nextToken) {
        items {
          id firstName lastName email bio avatar category region regionBlock prefecture district
          isEmailPublic isRegistrationDatePublic instagramUrl createdAt updatedAt
        }
        nextToken
      }
    }
  `

  const allItems: DbUser[] = []
  let nextToken: string | null = null

  try {
    do {
      const result = await client.graphql({
        query,
        variables: { limit: Math.min(limit - allItems.length, 200), nextToken },
        authMode: 'apiKey'
      }) as any

      const items = result?.data?.listUsers?.items ?? []
      allItems.push(...items)
      nextToken = result?.data?.listUsers?.nextToken || null
    } while (nextToken && allItems.length < limit)

    return allItems
  } catch (error: any) {
    console.error('adminListAllUsers error:', error?.message)
    return []
  }
}

/**
 * 管理者用: 全チーム一覧を取得（承認・未承認含む）
 */
export async function adminListAllTeams(limit = 500): Promise<DbTeam[]> {
  const query = /* GraphQL */ `
    query ListTeams($limit: Int, $nextToken: String) {
      listTeams(limit: $limit, nextToken: $nextToken) {
        items {
          id name shortName logoUrl region prefecture headcount category
          ownerEmail editorEmails isApproved createdAt updatedAt
        }
        nextToken
      }
    }
  `

  const allItems: DbTeam[] = []
  let nextToken: string | null = null

  try {
    do {
      const result = await client.graphql({
        query,
        variables: { limit: Math.min(limit - allItems.length, 200), nextToken },
        authMode: 'apiKey'
      }) as any

      const items = result?.data?.listTeams?.items ?? []
      allItems.push(...items)
      nextToken = result?.data?.listTeams?.nextToken || null
    } while (nextToken && allItems.length < limit)

    return allItems
  } catch (error: any) {
    console.error('adminListAllTeams error:', error?.message)
    return []
  }
}

/**
 * 管理者用: 全大会一覧を取得
 */
export async function adminListAllTournaments(limit = 500): Promise<DbTournament[]> {
  const query = /* GraphQL */ `
    query ListTournaments($limit: Int, $nextToken: String) {
      listTournaments(limit: $limit, nextToken: $nextToken) {
        items {
          id name category regionBlock prefecture district tournamentType area subArea
          ownerEmail coAdminEmails startDate endDate favoritesCount isApproved createdAt updatedAt
        }
        nextToken
      }
    }
  `

  const allItems: DbTournament[] = []
  let nextToken: string | null = null

  try {
    do {
      const result = await client.graphql({
        query,
        variables: { limit: Math.min(limit - allItems.length, 200), nextToken },
        authMode: 'apiKey'
      }) as any

      const items = result?.data?.listTournaments?.items ?? []
      allItems.push(...items)
      nextToken = result?.data?.listTournaments?.nextToken || null
    } while (nextToken && allItems.length < limit)

    return allItems
  } catch (error: any) {
    console.error('adminListAllTournaments error:', error?.message)
    return []
  }
}

/**
 * 管理者用: 全チャットスレッド一覧を取得
 */
export async function adminListAllChatThreads(limit = 500): Promise<DbChatThread[]> {
  const query = /* GraphQL */ `
    query ListChatThreads($limit: Int, $nextToken: String) {
      listChatThreads(limit: $limit, nextToken: $nextToken) {
        items {
          ${CHAT_THREAD_FIELDS}
        }
        nextToken
      }
    }
  `

  const allItems: DbChatThread[] = []
  let nextToken: string | null = null

  try {
    do {
      const result = await client.graphql({
        query,
        variables: { limit: Math.min(limit - allItems.length, 200), nextToken },
        authMode: 'apiKey'
      }) as any

      const items = result?.data?.listChatThreads?.items ?? []
      allItems.push(...items)
      nextToken = result?.data?.listChatThreads?.nextToken || null
    } while (nextToken && allItems.length < limit)

    return allItems
  } catch (error: any) {
    console.error('adminListAllChatThreads error:', error?.message)
    return []
  }
}

/**
 * 管理者用: ユーザー情報を更新
 */
export async function adminUpdateUser(id: string, input: Partial<DbUser>): Promise<DbUser> {
  const mutation = /* GraphQL */ `
    mutation UpdateUser($input: UpdateUserInput!) {
      updateUser(input: $input) {
        id firstName lastName email bio avatar category region regionBlock prefecture district
        isEmailPublic isRegistrationDatePublic instagramUrl createdAt updatedAt
      }
    }
  `

  const result = await client.graphql({
    query: mutation,
    variables: { input: { id, ...input } },
    authMode: 'apiKey'
  }) as any

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'ユーザー更新エラー')
  }

  return result.data.updateUser
}

/**
 * 管理者用: ユーザーを削除
 */
export async function adminDeleteUser(id: string): Promise<void> {
  const mutation = /* GraphQL */ `
    mutation DeleteUser($input: DeleteUserInput!) {
      deleteUser(input: $input) { id }
    }
  `

  const result = await client.graphql({
    query: mutation,
    variables: { input: { id } },
    authMode: 'apiKey'
  }) as any

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'ユーザー削除エラー')
  }
}

/**
 * 管理者用: チームの承認状態を更新
 */
export async function adminUpdateTeamApproval(id: string, isApproved: boolean): Promise<DbTeam> {
  const mutation = /* GraphQL */ `
    mutation UpdateTeam($input: UpdateTeamInput!) {
      updateTeam(input: $input) {
        id name isApproved
      }
    }
  `

  const result = await client.graphql({
    query: mutation,
    variables: { input: { id, isApproved } },
    authMode: 'apiKey'
  }) as any

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'チーム更新エラー')
  }

  return result.data.updateTeam
}

/**
 * 管理者用: 大会の承認状態を更新
 */
export async function adminUpdateTournamentApproval(id: string, isApproved: boolean): Promise<DbTournament> {
  const mutation = /* GraphQL */ `
    mutation UpdateTournament($input: UpdateTournamentInput!) {
      updateTournament(input: $input) {
        id name isApproved
      }
    }
  `

  const result = await client.graphql({
    query: mutation,
    variables: { input: { id, isApproved } },
    authMode: 'apiKey'
  }) as any

  if (result.errors) {
    throw new Error(result.errors[0]?.message || '大会更新エラー')
  }

  return result.data.updateTournament
}

/**
 * 管理者用: 大会を削除
 */
export async function adminDeleteTournament(id: string): Promise<void> {
  const mutation = /* GraphQL */ `
    mutation DeleteTournament($input: DeleteTournamentInput!) {
      deleteTournament(input: $input) { id }
    }
  `

  const result = await client.graphql({
    query: mutation,
    variables: { input: { id } },
    authMode: 'apiKey'
  }) as any

  if (result.errors) {
    throw new Error(result.errors[0]?.message || '大会削除エラー')
  }
}

/**
 * 管理者用: チームを削除
 */
export async function adminDeleteTeam(id: string): Promise<void> {
  const mutation = /* GraphQL */ `
    mutation DeleteTeam($input: DeleteTeamInput!) {
      deleteTeam(input: $input) { id }
    }
  `

  const result = await client.graphql({
    query: mutation,
    variables: { input: { id } },
    authMode: 'apiKey'
  }) as any

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'チーム削除エラー')
  }
}

// ==================== SiteConfig（YeLL全体設定） ====================

const SITE_CONFIG_FIELDS = `id configKey configValue updatedBy createdAt updatedAt`

/**
 * SiteConfigをキーで取得
 */
export async function getSiteConfig(configKey: string): Promise<DbSiteConfig | null> {
  const query = /* GraphQL */ `
    query SiteConfigByKey($configKey: String!) {
      siteConfigByKey(configKey: $configKey) {
        items {
          ${SITE_CONFIG_FIELDS}
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: { configKey },
      authMode: 'apiKey'
    }) as any

    const items = result?.data?.siteConfigByKey?.items ?? []
    return items.length > 0 ? items[0] : null
  } catch (error: any) {
    console.error('getSiteConfig error:', error?.message)
    return null
  }
}

/**
 * YeLL全体スポンサーを取得
 */
export async function getSiteSponsors(): Promise<SponsorBanner[]> {
  const config = await getSiteConfig('site_sponsors')
  if (!config) return []
  return parseSponsors(config.configValue)
}

/**
 * YeLL運営バナー（プロフィールページ用）を取得
 */
export async function getSiteBanners(): Promise<SponsorBanner[]> {
  const config = await getSiteConfig('site_banners')
  if (!config) return []
  return parseSponsors(config.configValue)
}

/**
 * YeLL運営バナーを更新（なければ作成）
 */
export async function updateSiteBanners(banners: SponsorBanner[], updatedBy: string): Promise<void> {
  const existingConfig = await getSiteConfig('site_banners')
  const bannersJson = stringifySponsors(banners)

  if (existingConfig) {
    const mutation = /* GraphQL */ `
      mutation UpdateSiteConfig($input: UpdateSiteConfigInput!) {
        updateSiteConfig(input: $input) {
          ${SITE_CONFIG_FIELDS}
        }
      }
    `
    const result = await client.graphql({
      query: mutation,
      variables: { input: { id: existingConfig.id, configValue: bannersJson, updatedBy } },
      authMode: 'apiKey'
    }) as any
    if (result.errors) throw new Error(result.errors[0]?.message || '運営バナー更新エラー')
  } else {
    const mutation = /* GraphQL */ `
      mutation CreateSiteConfig($input: CreateSiteConfigInput!) {
        createSiteConfig(input: $input) {
          ${SITE_CONFIG_FIELDS}
        }
      }
    `
    const result = await client.graphql({
      query: mutation,
      variables: { input: { configKey: 'site_banners', configValue: bannersJson, updatedBy } },
      authMode: 'apiKey'
    }) as any
    if (result.errors) throw new Error(result.errors[0]?.message || '運営バナー作成エラー')
  }
}

/**
 * YeLL全体スポンサーを更新（なければ作成）
 */
export async function updateSiteSponsors(sponsors: SponsorBanner[], updatedBy: string): Promise<void> {
  const existingConfig = await getSiteConfig('site_sponsors')
  const sponsorsJson = stringifySponsors(sponsors)

  if (existingConfig) {
    // 既存レコードを更新
    const mutation = /* GraphQL */ `
      mutation UpdateSiteConfig($input: UpdateSiteConfigInput!) {
        updateSiteConfig(input: $input) {
          ${SITE_CONFIG_FIELDS}
        }
      }
    `

    const result = await client.graphql({
      query: mutation,
      variables: {
        input: {
          id: existingConfig.id,
          configValue: sponsorsJson,
          updatedBy
        }
      },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'SiteConfig更新エラー')
    }
  } else {
    // 新規作成
    const mutation = /* GraphQL */ `
      mutation CreateSiteConfig($input: CreateSiteConfigInput!) {
        createSiteConfig(input: $input) {
          ${SITE_CONFIG_FIELDS}
        }
      }
    `

    const result = await client.graphql({
      query: mutation,
      variables: {
        input: {
          configKey: 'site_sponsors',
          configValue: sponsorsJson,
          updatedBy
        }
      },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'SiteConfig作成エラー')
    }
  }
}

// ==================== PushSubscription（プッシュ通知購読） ====================

const PUSH_SUBSCRIPTION_FIELDS = 'id userEmail endpoint p256dh auth createdAt updatedAt'

/**
 * プッシュ通知購読を保存
 */
export async function savePushSubscription(input: {
  userEmail: string
  endpoint: string
  p256dh: string
  auth: string
}): Promise<DbPushSubscription> {
  // 同じendpointの既存レコードがあれば更新不要（重複防止）
  const existing = await getPushSubscriptionsByUser(input.userEmail)
  const dup = existing.find(s => s.endpoint === input.endpoint)
  if (dup) return dup

  const mutation = /* GraphQL */ `
    mutation CreatePushSubscription($input: CreatePushSubscriptionInput!) {
      createPushSubscription(input: $input) {
        ${PUSH_SUBSCRIPTION_FIELDS}
      }
    }
  `

  const result = await client.graphql({
    query: mutation,
    variables: { input },
    authMode: 'apiKey'
  }) as any

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'PushSubscription作成エラー')
  }

  return result.data.createPushSubscription
}

/**
 * ユーザーのプッシュ通知購読一覧を取得
 */
export async function getPushSubscriptionsByUser(userEmail: string): Promise<DbPushSubscription[]> {
  const query = /* GraphQL */ `
    query PushSubscriptionsByUser($userEmail: String!) {
      pushSubscriptionsByUser(userEmail: $userEmail) {
        items {
          ${PUSH_SUBSCRIPTION_FIELDS}
        }
      }
    }
  `

  try {
    const result = await client.graphql({
      query,
      variables: { userEmail },
      authMode: 'apiKey'
    }) as any

    return result?.data?.pushSubscriptionsByUser?.items ?? []
  } catch (error: any) {
    console.error('getPushSubscriptionsByUser error:', error?.message)
    return []
  }
}

/**
 * プッシュ通知購読を削除
 */
export async function deletePushSubscription(id: string): Promise<void> {
  const mutation = /* GraphQL */ `
    mutation DeletePushSubscription($input: DeletePushSubscriptionInput!) {
      deletePushSubscription(input: $input) { id }
    }
  `

  try {
    await client.graphql({
      query: mutation,
      variables: { input: { id } },
      authMode: 'apiKey'
    })
  } catch (error: any) {
    console.error('deletePushSubscription error:', error?.message)
  }
}

/**
 * 全ユーザーのプッシュ通知購読一覧を取得（通知送信APIで使用）
 */
export async function getAllPushSubscriptions(limit = 1000): Promise<DbPushSubscription[]> {
  const query = /* GraphQL */ `
    query ListPushSubscriptions($limit: Int, $nextToken: String) {
      listPushSubscriptions(limit: $limit, nextToken: $nextToken) {
        items {
          ${PUSH_SUBSCRIPTION_FIELDS}
        }
        nextToken
      }
    }
  `

  const allItems: DbPushSubscription[] = []
  let nextToken: string | null = null

  try {
    do {
      const result = await client.graphql({
        query,
        variables: { limit: 200, nextToken },
        authMode: 'apiKey'
      }) as any

      const items = result?.data?.listPushSubscriptions?.items ?? []
      allItems.push(...items)
      nextToken = result?.data?.listPushSubscriptions?.nextToken || null
    } while (nextToken && allItems.length < limit)

    return allItems
  } catch (error: any) {
    console.error('getAllPushSubscriptions error:', error?.message)
    return []
  }
}

/**
 * お気に入りにこの大会/チームを登録しているユーザーのメールアドレスを取得
 * listFavoritesでスキャンし、ページネーションを最大10回まで試行
 */
export async function getFavoriteUserEmails(targetId: string, targetType: 'tournament' | 'team'): Promise<string[]> {
  console.log('[api] getFavoriteUserEmails 開始 - targetId:', targetId, 'targetType:', targetType)
  const filterField = targetType === 'tournament' ? 'tournamentId' : 'teamId'

  const allEmails: string[] = []
  let nextToken: string | null = null
  let pageCount = 0
  const MAX_PAGES = 20 // 最大20ページまでスキャン（4000件）

  try {
    do {
      pageCount++
      const filterVar = { [filterField]: { eq: targetId } }
      if (pageCount === 1) {
        console.log('[api] getFavoriteUserEmails - GraphQL filter:', JSON.stringify(filterVar))
      }

      const result = await client.graphql({
        query: /* GraphQL */ `
          query ListFavorites($filter: ModelFavoriteFilterInput, $limit: Int, $nextToken: String) {
            listFavorites(filter: $filter, limit: $limit, nextToken: $nextToken) {
              items {
                userEmail
              }
              nextToken
            }
          }
        `,
        variables: {
          filter: filterVar,
          limit: 200,
          nextToken
        },
        authMode: 'apiKey'
      }) as any

      if (result.errors) {
        console.error('[api] getFavoriteUserEmails - GraphQL errors:', JSON.stringify(result.errors))
        break
      }

      const items = result?.data?.listFavorites?.items ?? []
      console.log('[api] getFavoriteUserEmails - ページ', pageCount, '取得件数:', items.length)
      allEmails.push(...items.map((i: any) => i.userEmail).filter(Boolean))
      nextToken = result?.data?.listFavorites?.nextToken || null
    } while (nextToken && pageCount < MAX_PAGES)

    const uniqueEmails = [...new Set(allEmails)]
    console.log('[api] getFavoriteUserEmails 結果:', uniqueEmails.length, '件', uniqueEmails)
    return uniqueEmails
  } catch (error: any) {
    console.error('[api] getFavoriteUserEmails error:', error?.message, error)
    return []
  }
}
