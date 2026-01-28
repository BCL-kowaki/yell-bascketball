"use client"

import { generateClient } from "aws-amplify/api"
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth"
import { ensureAmplifyConfigured } from "./amplifyClient"

// GraphQLクライアントを初期化（API_KEY認証を使用）
ensureAmplifyConfigured()
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
  description?: string | null
  ownerEmail: string
  coAdminEmails?: string[] | null
  startDate?: string | null
  endDate?: string | null
  favoritesCount?: number | null
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
    console.error('getEmailFromSession error:', error)
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
    console.error('getCurrentUserEmail error:', error)
    return undefined
  }
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const query = /* GraphQL */ `
    query ListUsers($filter: ModelUserFilterInput) {
      listUsers(filter: $filter) {
        items {
          id firstName lastName email bio avatar coverImage
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
    // エラーの詳細をログ出力
    const errorDetails = {
      message: error?.message,
      name: error?.name,
      errors: error?.errors,
      code: error?.code,
      stack: error?.stack,
      cause: error?.cause
    }
    console.error('getUserByEmail: Error details:', errorDetails)
    
    // Identity Poolのエラーは無視（GraphQL APIはAPI_KEY認証を使用しているため）
    if (error?.message?.includes('cognito-identity') || 
        error?.message?.includes('IdentityPool') ||
        error?.name === 'NotAuthorizedException') {
      console.warn('getUserByEmail: Identity Pool error ignored (using API_KEY auth):', error?.message)
      return null
    }
    
    // GraphQLエラーの場合
    if (error?.errors && Array.isArray(error.errors)) {
      const errorMessages = error.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ')
      console.error('getUserByEmail: GraphQL errors:', errorMessages)
      console.error('getUserByEmail: GraphQL error details:', error.errors)
      
      // ネットワークエラーの場合
      if (errorMessages.includes('network error') || errorMessages.includes('Network')) {
        console.error('getUserByEmail: ⚠️ Network error detected!')
        console.error('getUserByEmail: Possible causes:')
        console.error('  1. API key is invalid or expired')
        console.error('  2. GraphQL endpoint URL is incorrect')
        console.error('  3. DNS resolution issue (ERR_NAME_NOT_RESOLVED)')
        // 設定を再読み込み
        const config = await import('../src/amplifyconfiguration.json').catch(() => null)
        const endpoint = config?.default?.aws_appsync_graphqlEndpoint || config?.aws_appsync_graphqlEndpoint
        console.error('getUserByEmail: Current endpoint:', endpoint || 'NOT FOUND')
        console.error('getUserByEmail: Expected endpoint: https://helcik5ebvbyta6fjd4fhysy3u.appsync-api.ap-northeast-1.amazonaws.com/graphql')
        console.error('getUserByEmail: Please check the API key in AWS AppSync Console for API ID: mcs2dydfpvf5lonf4yvahm4fk4')
      }
      return null
    }
    
    // その他のエラー
    console.error('getUserByEmail: Unknown error:', error)
    return null // エラーが発生した場合はnullを返す（throwしない）
  }
}

export async function updateUser(id: string, input: Partial<DbUser>): Promise<DbUser> {
  const mutation = /* GraphQL */ `
    mutation UpdateUser($input: UpdateUserInput!) {
      updateUser(input: $input) {
        id firstName lastName email bio avatar coverImage
        category location region regionBlock prefecture district
        teams isEmailPublic isRegistrationDatePublic
        createdAt updatedAt
      }
    }
  `
  try {
    const variables = { input: { id, ...input } }
    console.log('updateUser called with:', { id, input, variables })
    console.log('updateUser variables (stringified):', JSON.stringify(variables, null, 2))

    // 明示的にauthModeを指定してIdentity Poolへのアクセスを回避
    const result = await client.graphql({
      query: mutation,
      variables,
      authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
    }) as any

    console.log('updateUser result (full):', JSON.stringify(result, null, 2))
    console.log('updateUser result.data:', result.data)
    console.log('updateUser result.errors:', result.errors)

    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      console.error('GraphQL errors (stringified):', JSON.stringify(result.errors, null, 2))
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    if (!result.data?.updateUser) {
      console.error('No updateUser in result.data:', result.data)
      throw new Error('Update user returned no data')
    }

    const updatedUser = result.data.updateUser
    console.log('Updated user data:', JSON.stringify(updatedUser, null, 2))

    return updatedUser
  } catch (error: any) {
    console.error('updateUser error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('Error errors:', error?.errors)
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    throw error
  }
}

// チーム検索（名前でフィルタリング）
export async function searchTeams(searchTerm: string): Promise<DbTeam[]> {
  const query = /* GraphQL */ `
    query ListTeams($filter: ModelTeamFilterInput) {
      listTeams(filter: $filter) {
        items {
          id name category region prefecture district description createdAt
        }
      }
    }
  `

  try {
    const { data } = await client.graphql({
      query,
      variables: {
        filter: {
          name: { contains: searchTerm }
        }
      },
      authMode: 'apiKey'
    }) as any

    return data?.listTeams?.items ?? []
  } catch (error) {
    console.error('Error searching teams:', error)
    return []
  }
}

const postFields = `
  id content imageUrl videoUrl videoName pdfUrl pdfName locationName locationAddress
  linkUrl linkTitle linkDescription linkImage likesCount commentsCount
  authorEmail createdAt
`

export async function listPosts(limit = 50, filter?: { authorEmail?: string; tournamentId?: string }): Promise<DbPost[]> {
  // 一時的にvideoUrl/videoNameを除外（amplify pushが完了するまで）
  // TODO: amplify push完了後、postFieldsを使用するように戻す
  const fallbackFields = `
    id content imageUrl pdfUrl pdfName locationName locationAddress
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
    // 設定を直接読み込む
    const config = await import('../src/amplifyconfiguration.json').catch(() => null)
    const endpoint = config?.default?.aws_appsync_graphqlEndpoint || config?.aws_appsync_graphqlEndpoint
    const apiKey = config?.default?.aws_appsync_apiKey || config?.aws_appsync_apiKey
    
    console.log('listPosts: Fetching posts from database...')
    console.log('listPosts: GraphQL endpoint configured:', {
      endpoint: endpoint || 'N/A',
      apiKey: apiKey ? apiKey.substring(0, 10) + '...' : 'N/A',
      authMode: 'apiKey'
    })
    
    // 明示的にauthModeを指定してIdentity Poolへのアクセスを回避
    const result = await client.graphql({
      query,
      variables: { filter: finalFilter, limit },
      authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
    }) as any
    
    console.log('listPosts: GraphQL result:', {
      hasData: !!result?.data,
      hasItems: !!result?.data?.listPosts?.items,
      itemsCount: result?.data?.listPosts?.items?.length || 0,
      nextToken: result?.data?.listPosts?.nextToken,
      fullResponse: result, // 完全なレスポンスをログ出力
      firstItem: result?.data?.listPosts?.items?.[0] ? {
        id: result.data.listPosts.items[0].id,
        content: result.data.listPosts.items[0].content?.substring(0, 50),
        authorEmail: result.data.listPosts.items[0].authorEmail,
        hasAuthorEmail: !!result.data.listPosts.items[0].authorEmail,
        fullItem: result.data.listPosts.items[0] // 完全なアイテムをログ出力
      } : null,
      hasErrors: !!result?.errors,
      errorsCount: result?.errors?.length || 0
    })
    
    // 完全なレスポンスをログ出力（デバッグ用）
    console.log('listPosts: Full GraphQL response:', JSON.stringify(result, null, 2))
    
    if (result.errors) {
      console.error('listPosts: GraphQL errors:', result.errors)
      console.error('listPosts: Error details:', result.errors.map((e: any) => ({
        message: e.message,
        errorType: e.errorType,
        errorInfo: e.errorInfo,
        path: e.path,
        locations: e.locations,
        extensions: e.extensions
      })))
      
      // エラーの詳細を出力
      const errorMessage = result.errors[0]?.message || 'GraphQL error'
      console.error('listPosts: Throwing error:', errorMessage)
      throw new Error(`GraphQL error: ${errorMessage}`)
    }
    
    const items = result?.data?.listPosts?.items ?? []
    console.log('listPosts: Returning items:', items.length)
    console.log('listPosts: Items with authorEmail:', items.filter((p: any) => p.authorEmail).length)
    console.log('listPosts: Items without authorEmail:', items.filter((p: any) => !p.authorEmail).length)
    
    if (items.length > 0) {
      console.log('listPosts: Sample item:', {
        id: items[0].id,
        content: items[0].content?.substring(0, 30),
        authorEmail: items[0].authorEmail,
        createdAt: items[0].createdAt
      })
      // すべての投稿IDをログ出力（DynamoDBテーブルと照合するため）
      console.log('listPosts: All post IDs:', items.map((p: any) => p.id))
      // すべての投稿の詳細をログ出力
      console.log('listPosts: All items details:', items.map((p: any) => ({
        id: p.id,
        content: p.content?.substring(0, 50),
        authorEmail: p.authorEmail,
        hasImage: !!p.imageUrl,
        hasPdf: !!p.pdfUrl
      })))
    } else {
      console.warn('listPosts: ⚠️ No items returned from GraphQL query!')
      console.warn('listPosts: Result structure:', {
        hasData: !!result?.data,
        hasListPosts: !!result?.data?.listPosts,
        listPostsType: typeof result?.data?.listPosts,
        listPostsValue: result?.data?.listPosts
      })
    }
    
    return items
  } catch (error: any) {
    // エラーの詳細をログ出力
    const errorDetails = {
      message: error?.message,
      name: error?.name,
      errors: error?.errors,
      code: error?.code,
      stack: error?.stack,
      // ネットワークエラーの場合、より詳細な情報を取得
      cause: error?.cause,
      response: error?.response,
      request: error?.request
    }
    console.error('listPosts: Error occurred:', errorDetails)
    
    // GraphQLエラーの場合
    if (error?.errors && Array.isArray(error.errors)) {
      const errorMessages = error.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ')
      console.error('listPosts: GraphQL errors:', errorMessages)
      console.error('listPosts: GraphQL error details:', error.errors)
      
      // ネットワークエラーの場合
      if (errorMessages.includes('network error') || errorMessages.includes('Network')) {
        console.error('listPosts: ⚠️ Network error detected!')
        console.error('listPosts: Possible causes:')
        console.error('  1. API key is invalid or expired')
        console.error('  2. GraphQL endpoint URL is incorrect')
        console.error('  3. CORS configuration issue')
        console.error('  4. DNS resolution issue (ERR_NAME_NOT_RESOLVED)')
        // 設定を再読み込み
        const config = await import('../src/amplifyconfiguration.json').catch(() => null)
        const endpoint = config?.default?.aws_appsync_graphqlEndpoint || config?.aws_appsync_graphqlEndpoint
        console.error('listPosts: Current endpoint:', endpoint || 'NOT FOUND')
        console.error('listPosts: Expected endpoint: https://helcik5ebvbyta6fjd4fhysy3u.appsync-api.ap-northeast-1.amazonaws.com/graphql')
        console.error('listPosts: Please check the API key in AWS AppSync Console for API ID: mcs2dydfpvf5lonf4yvahm4fk4')
      }
    }
    
    // エラーの種類に応じて詳細を出力
    if (error?.message?.includes('Network') || error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
      console.error('listPosts: Network error - GraphQL endpoint may be unreachable or API key is invalid')
      console.error('listPosts: Please verify:')
      console.error('  1. API endpoint is correct: https://helcik5ebvbyta6fjd4fhysy3u.appsync-api.ap-northeast-1.amazonaws.com/graphql')
      console.error('  2. API key is valid for this API')
    } else if (error?.message?.includes('Unauthorized') || error?.message?.includes('401') || error?.name === 'UnauthorizedException') {
      console.error('listPosts: Authentication error - API key may be invalid')
      console.error('listPosts: Please check the API key in amplifyconfiguration.json')
    } else if (error?.message?.includes('Forbidden') || error?.message?.includes('403') || error?.name === 'ForbiddenException') {
      console.error('listPosts: Authorization error - API key may not have permissions')
    }
    
    // エラーが発生した場合は空配列を返す（エラーは呼び出し元で処理）
    return []
  }
}

export async function getPostsByTeam(teamId: string): Promise<DbPost[]> {
  // GSIが作成されるまでの一時的な回避策: listPostsを使用してフィルタリング
  try {
    const allPosts = await listPosts(1000)
    const teamPosts = allPosts.filter(post => post.teamId === teamId)
    console.log(`getPostsByTeam: Found ${teamPosts.length} posts for team ${teamId}`)
    return teamPosts
  } catch (error: any) {
    console.error('getPostsByTeam error:', error)
    return []
  }
}

export async function getPostsByTournament(tournamentId: string): Promise<DbPost[]> {
  // GSIが作成されるまでの一時的な回避策: listPostsを使用してフィルタリング
  try {
    const allPosts = await listPosts(1000)
    const tournamentPosts = allPosts.filter(post => post.tournamentId === tournamentId)
    console.log(`getPostsByTournament: Found ${tournamentPosts.length} posts for tournament ${tournamentId}`)
    return tournamentPosts
  } catch (error: any) {
    console.error('getPostsByTournament error:', error)
    return []
  }
}

export async function createPost(input: Partial<DbPost>): Promise<DbPost> {
  // 一時的にvideoUrl/videoNameを除外（amplify pushが完了するまで）
  // TODO: amplify push完了後、この除外を削除
  const { videoUrl, videoName, ...inputWithoutVideo } = input

  const fallbackFields = `
    id content imageUrl pdfUrl pdfName locationName locationAddress
    linkUrl linkTitle linkDescription linkImage likesCount commentsCount
    authorEmail createdAt
  `
  
  const mutation = /* GraphQL */ `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) { ${fallbackFields} }
    }
  `
  
  try {
    // Base64データが大きすぎる場合は除外（S3 URLのみ許可）
    const sanitizedInput = { ...inputWithoutVideo }
    
    // 画像のBase64データサイズチェック（200MB制限、圧縮後）
    if (sanitizedInput.imageUrl && sanitizedInput.imageUrl.startsWith('data:')) {
      const imageSize = sanitizedInput.imageUrl.length
      const maxImageSize = 200 * 1024 * 1024 // 200MB（圧縮後）
      if (imageSize > maxImageSize) {
        console.error(`Image Base64 data is too large (${(imageSize / 1024 / 1024).toFixed(2)}MB > ${(maxImageSize / 1024 / 1024).toFixed(2)}MB), cannot send via GraphQL`)
        console.error('Please upload the image to S3 first. S3 upload may have failed.')
        throw new Error(`画像が大きすぎます（${(imageSize / 1024 / 1024).toFixed(2)}MB）。S3へのアップロードが必要です。S3の設定を確認してください。`)
      }
      console.log(`Image Base64 data size: ${(imageSize / 1024 / 1024).toFixed(2)}MB`)
    }
    
    // blob: URLが誤って保存されないようにチェック
    if (sanitizedInput.pdfUrl && sanitizedInput.pdfUrl.startsWith('blob:')) {
      console.error('⚠️ blob: URL detected in pdfUrl! This is a temporary URL and cannot be saved.')
      throw new Error('PDFのURLが無効です。blob: URLは一時的なもので、保存できません。S3へのアップロードが必要です。')
    }
    
    // PDFのBase64データサイズチェック（400KB制限 - DynamoDBの制限）
    if (sanitizedInput.pdfUrl && sanitizedInput.pdfUrl.startsWith('data:')) {
      const pdfSize = sanitizedInput.pdfUrl.length
      const maxPdfSize = 400 * 1024 // 400KB（DynamoDBの制限）
      if (pdfSize > maxPdfSize) {
        console.error(`PDF Base64 data is too large (${(pdfSize / 1024).toFixed(2)}KB > ${(maxPdfSize / 1024).toFixed(2)}KB), cannot send via GraphQL`)
        console.error('Please upload the PDF to S3 first. S3 upload may have failed.')
        throw new Error(`PDFが大きすぎます（${(pdfSize / 1024).toFixed(2)}KB）。DynamoDBの制限（400KB）を超えるため、S3へのアップロードが必要です。S3の設定を確認してください。`)
      }
      console.log(`PDF Base64 data size: ${(pdfSize / 1024).toFixed(2)}KB`)
    }
    
    console.log('createPost called with input (videoUrl/videoName excluded):', {
      ...sanitizedInput,
      pdfUrl: sanitizedInput.pdfUrl ? (sanitizedInput.pdfUrl.length > 100 ? sanitizedInput.pdfUrl.substring(0, 100) + '...' : sanitizedInput.pdfUrl) : null,
      authorEmail: sanitizedInput.authorEmail,
      hasAuthorEmail: !!sanitizedInput.authorEmail
    })
    
    // authorEmailが必須であることを確認
    if (!sanitizedInput.authorEmail) {
      console.error('createPost: ⚠️ authorEmail is missing! This post will not be associated with any user.')
      console.error('createPost: Input object:', JSON.stringify(sanitizedInput, null, 2))
    }
    
    // 明示的にauthModeを指定してIdentity Poolへのアクセスを回避
    const result = await client.graphql({ 
      query: mutation, 
      variables: { input: sanitizedInput },
      authMode: 'apiKey' // 明示的にAPI_KEY認証を指定
    }) as any
    
    console.log('createPost GraphQL result:', JSON.stringify(result, null, 2))
    
    if (result.errors) {
      console.error('GraphQL errors in createPost:', result.errors)
      console.error('Full error object:', JSON.stringify(result.errors, null, 2))
      console.error('Error details:', result.errors.map((e: any) => ({
        message: e.message,
        errorType: e.errorType,
        errorInfo: e.errorInfo,
        path: e.path,
        locations: e.locations,
        extensions: e.extensions,
        // すべてのプロパティを表示
        allProperties: Object.keys(e)
      })))
      
      // エラーメッセージをより詳細に表示
      const errorMessages = result.errors.map((e: any) => {
        if (e.message) return e.message
        if (e.errorInfo) return JSON.stringify(e.errorInfo)
        if (e.extensions) return JSON.stringify(e.extensions)
        return JSON.stringify(e)
      }).join(', ')
      
      // エラーの種類に応じた詳細メッセージ
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
      console.error('No createPost in result.data:', result.data)
      throw new Error('Post creation returned no data')
    }
    
    console.log('Post created successfully:', result.data.createPost)
    return result.data.createPost
  } catch (error: any) {
    console.error('createPost error:', error)
    console.error('Error details:', {
      message: error?.message,
      errors: error?.errors,
      stack: error?.stack
    })
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

export async function updatePost(id: string, input: Partial<DbPost>): Promise<DbPost> {
  const fallbackFields = `
    id content imageUrl pdfUrl pdfName locationName locationAddress
    linkUrl linkTitle linkDescription linkImage likesCount commentsCount
    authorEmail createdAt
  `
  
  const mutation = /* GraphQL */ `
    mutation UpdatePost($input: UpdatePostInput!) {
      updatePost(input: $input) { ${fallbackFields} }
    }
  `
  
  try {
    const { videoUrl, videoName, ...inputWithoutVideo } = input
    const sanitizedInput = { id, ...inputWithoutVideo }
    
    console.log('updatePost called with:', { id, input: sanitizedInput })
    
    const result = await client.graphql({ 
      query: mutation, 
      variables: { input: sanitizedInput },
      authMode: 'apiKey'
    }) as any
    
    if (result.errors) {
      console.error('GraphQL errors in updatePost:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }
    
    if (!result.data?.updatePost) {
      throw new Error('Update post returned no data')
    }
    
    console.log('Post updated successfully:', result.data.updatePost)
    return result.data.updatePost
  } catch (error: any) {
    console.error('updatePost error:', error)
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
    console.log('deletePost called with:', { id })

    const result = await client.graphql({
      query: mutation,
      variables: { input: { id } },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      console.error('GraphQL errors in deletePost:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    console.log('Post deleted successfully')
  } catch (error: any) {
    console.error('deletePost error:', error)
    throw error
  }
}

// ==================== Tournament Functions ====================

export async function createTournament(input: Partial<DbTournament>): Promise<DbTournament> {
  const mutation = /* GraphQL */ `
    mutation CreateTournament($input: CreateTournamentInput!) {
      createTournament(input: $input) {
        id name iconUrl coverImage category regionBlock prefecture district
        description ownerEmail coAdminEmails startDate endDate favoritesCount createdAt updatedAt
      }
    }
  `

  try {
    console.log('createTournament called with:', input)

    const result = await client.graphql({
      query: mutation,
      variables: { input },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      console.error('GraphQL errors in createTournament:', result.errors)
      console.error('Full error details:', JSON.stringify(result.errors, null, 2))
      const errorMessage = result.errors[0]?.message || 'GraphQL error occurred'
      console.error('Error message:', errorMessage)
      throw new Error(errorMessage)
    }

    console.log('Tournament created successfully:', result.data.createTournament)
    return result.data.createTournament
  } catch (error: any) {
    console.error('createTournament error:', error)
    throw error
  }
}

export async function listTournaments(limit = 50): Promise<DbTournament[]> {
  const query = /* GraphQL */ `
    query ListTournaments($limit: Int, $nextToken: String) {
      listTournaments(limit: $limit, nextToken: $nextToken) {
        items {
          id name iconUrl coverImage category regionBlock prefecture district
          description ownerEmail coAdminEmails startDate endDate favoritesCount createdAt updatedAt
        }
        nextToken
      }
    }
  `

  try {
    console.log('listTournaments: Fetching tournaments with limit:', limit)
    const result = await client.graphql({
      query,
      variables: { limit },
      authMode: 'apiKey'
    }) as any

    console.log('listTournaments: GraphQL result:', {
      hasData: !!result?.data,
      hasListTournaments: !!result?.data?.listTournaments,
      hasItems: !!result?.data?.listTournaments?.items,
      itemsCount: result?.data?.listTournaments?.items?.length || 0,
      nextToken: result?.data?.listTournaments?.nextToken || null
    })

    if (result.errors) {
      console.error('GraphQL errors in listTournaments:', result.errors)
      console.error('Full error details:', JSON.stringify(result.errors, null, 2))
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    const items = result?.data?.listTournaments?.items ?? []
    console.log('listTournaments: Returning', items.length, 'tournaments')
    return items
  } catch (error: any) {
    console.error('listTournaments error:', error)
    console.error('Error details:', {
      message: error?.message,
      errors: error?.errors,
      data: error?.data
    })
    return []
  }
}

export async function getTournament(id: string): Promise<DbTournament | null> {
  const query = /* GraphQL */ `
    query GetTournament($id: ID!) {
      getTournament(id: $id) {
        id name iconUrl coverImage category regionBlock prefecture district
        description ownerEmail coAdminEmails startDate endDate favoritesCount createdAt updatedAt
      }
    }
  `

  try {
    console.log('📡 getTournament called with ID:', id)
    const result = await client.graphql({
      query,
      variables: { id },
      authMode: 'apiKey'
    }) as any

    console.log('📡 getTournament GraphQL result:', result)
    console.log('📡 getTournament data:', result?.data?.getTournament)

    if (result.errors) {
      console.error('❌ GraphQL errors in getTournament:', result.errors)
      return null
    }

    const tournament = result?.data?.getTournament ?? null

    if (!tournament) {
      console.warn('⚠️ getTournament returned null for ID:', id)
      console.warn('⚠️ This might mean the tournament does not exist in DynamoDB')
    } else {
      console.log('✅ getTournament found tournament:', tournament.name)
    }

    return tournament
  } catch (error: any) {
    console.error('❌ getTournament error:', error)
    console.error('❌ Error details:', {
      message: error?.message,
      name: error?.name,
      errors: error?.errors
    })
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
      console.error('GraphQL errors in searchUsersByEmail:', result.errors)
      return []
    }

    return result?.data?.listUsers?.items ?? []
  } catch (error: any) {
    console.error('searchUsersByEmail error:', error)
    return []
  }
}

export async function updateTournament(id: string, input: Partial<DbTournament>): Promise<DbTournament> {
  const mutation = /* GraphQL */ `
    mutation UpdateTournament($input: UpdateTournamentInput!) {
      updateTournament(input: $input) {
        id name iconUrl coverImage category regionBlock prefecture district
        description ownerEmail coAdminEmails startDate endDate favoritesCount createdAt updatedAt
      }
    }
  `

  try {
    const variables = { input: { id, ...input } }
    console.log('updateTournament called with:', { id, input, variables })

    const result = await client.graphql({
      query: mutation,
      variables,
      authMode: 'apiKey'
    }) as any

    console.log('updateTournament result (full):', JSON.stringify(result, null, 2))
    console.log('updateTournament result.data:', result.data)
    console.log('updateTournament result.errors:', result.errors)

    if (result.errors) {
      console.error('GraphQL errors in updateTournament:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    if (!result.data?.updateTournament) {
      console.error('No updateTournament in result.data:', result.data)
      throw new Error('Update tournament returned no data')
    }

    const updatedTournament = result.data.updateTournament
    console.log('Updated tournament data:', JSON.stringify(updatedTournament, null, 2))

    return updatedTournament
  } catch (error: any) {
    console.error('updateTournament error:', error)
    console.error('Error stack:', error?.stack)
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
      console.error('GraphQL errors in createTournamentInvitation:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    return result.data.createTournamentInvitation
  } catch (error: any) {
    console.error('createTournamentInvitation error:', error)
    throw error
  }
}

// ==================== Team Functions ====================

export async function createTeam(input: Partial<DbTeam>): Promise<DbTeam> {
  // GraphQLスキーマに存在するフィールドを使用
  const mutation = /* GraphQL */ `
    mutation CreateTeam($input: CreateTeamInput!) {
      createTeam(input: $input) {
        id name shortName logoUrl coverImageUrl founded region prefecture headcount category description website ownerEmail editorEmails isApproved createdAt updatedAt
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

    console.log('Creating team with input:', sanitizedInput)

    const result = await client.graphql({
      query: mutation,
      variables: { input: sanitizedInput },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      console.error('GraphQL errors in createTeam:', result.errors)
      const errorMessage = result.errors[0]?.message || 'GraphQL error occurred'
      console.error('Error message:', errorMessage)
      throw new Error(errorMessage)
    }

    console.log('Team created successfully:', result.data.createTeam)
    return result.data.createTeam
  } catch (error: any) {
    console.error('createTeam error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    if (error?.errors) {
      console.error('GraphQL errors:', error.errors)
    }
    if (error?.stack) {
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}

export async function listTeams(limit = 50, filter?: { isApproved?: boolean }): Promise<DbTeam[]> {
  const query = /* GraphQL */ `
    query ListTeams($filter: ModelTeamFilterInput, $limit: Int) {
      listTeams(filter: $filter, limit: $limit) {
        items {
          id name shortName logoUrl coverImageUrl founded region prefecture headcount category description website ownerEmail editorEmails isApproved createdAt updatedAt
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

    console.log('listTeams called with filter:', filter)
    console.log('GraphQL filter:', graphqlFilter)

    const result = await client.graphql({
      query,
      variables: { 
        filter: Object.keys(graphqlFilter).length > 0 ? graphqlFilter : undefined, 
        limit 
      },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      console.error('GraphQL errors in listTeams:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    const teams = result.data.listTeams.items || []
    console.log(`listTeams returned ${teams.length} teams`)
    return teams
  } catch (error: any) {
    console.error('listTeams error:', error)
    throw error
  }
}

export async function getTeam(id: string): Promise<DbTeam | null> {
  console.log('[getTeam] Called with ID:', id)
  console.log('[getTeam] ID type:', typeof id)
  console.log('[getTeam] ID length:', id.length)

  const query = /* GraphQL */ `
    query GetTeam($id: ID!) {
      getTeam(id: $id) {
        id name shortName logoUrl coverImageUrl founded region prefecture headcount category description website ownerEmail editorEmails isApproved createdAt updatedAt
      }
    }
  `

  try {
    console.log('[getTeam] Executing GraphQL query with variables:', { id })
    const result = await client.graphql({
      query,
      variables: { id },
      authMode: 'apiKey'
    }) as any

    console.log('[getTeam] Raw GraphQL result:', JSON.stringify(result, null, 2))

    if (result.errors) {
      console.error('[getTeam] GraphQL errors:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    const team = result.data?.getTeam
    console.log('[getTeam] Team found:', team)
    console.log('[getTeam] result.data:', result.data)

    if (!team) {
      console.warn('[getTeam] Team is null - this means the item does not exist in DynamoDB')
      console.warn('[getTeam] Verify the ID exists in the Team table')
    }

    return team
  } catch (error: any) {
    console.error('[getTeam] Error occurred:', error)
    console.error('[getTeam] Error details:', {
      message: error?.message,
      name: error?.name,
      errors: error?.errors
    })
    throw error
  }
}

export async function updateTeam(id: string, input: Partial<DbTeam>): Promise<DbTeam> {
  // GraphQLスキーマに存在するフィールドのみを使用
  const mutation = /* GraphQL */ `
    mutation UpdateTeam($input: UpdateTeamInput!) {
      updateTeam(input: $input) {
        id name category region prefecture district description createdAt
      }
    }
  `

  try {
    // スキーマに存在するフィールドのみを送信
    const sanitizedInput: any = { id }
    if (input.name) sanitizedInput.name = input.name
    if (input.category) sanitizedInput.category = input.category
    if (input.region) sanitizedInput.region = input.region
    if (input.prefecture) sanitizedInput.prefecture = input.prefecture
    if ((input as any).district) sanitizedInput.district = (input as any).district
    if (input.description) sanitizedInput.description = input.description

    const result = await client.graphql({
      query: mutation,
      variables: { input: sanitizedInput },
      authMode: 'apiKey'
    }) as any

    if (result.errors) {
      console.error('GraphQL errors in updateTeam:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    console.log('Team updated successfully:', result.data.updateTeam)
    return result.data.updateTeam
  } catch (error: any) {
    console.error('updateTeam error:', error)
    console.error('Error stack:', error?.stack)
    throw error
  }
}

// お気に入り機能
export async function toggleFavoriteTournament(tournamentId: string, userEmail: string): Promise<{ isFavorite: boolean }> {
  try {
    // favoritesByUserが存在しない場合のフォールバック: 常にcreateFavoriteを試みる
    // エラーが発生した場合は既に存在すると判断
    try {
      const createResult = await client.graphql({
        query: `
          mutation CreateFavorite($input: CreateFavoriteInput!) {
            createFavorite(input: $input) {
              id
              userEmail
              tournamentId
            }
          }
        `,
        variables: {
          input: {
            userEmail,
            tournamentId
          }
        },
        authMode: 'apiKey'
      })

      if ((createResult as any).errors) {
        // エラーが発生した場合、既に存在する可能性がある
        console.log("createFavorite returned errors, favorite may already exist")
        // エラーメッセージから既存のIDを取得できないため、falseを返す
        return { isFavorite: false }
      }

      return { isFavorite: true }
    } catch (createError: any) {
      // createFavoriteが失敗した場合、既に存在する可能性がある
      console.log("createFavorite failed, favorite may already exist:", createError)
      return { isFavorite: false }
    }
  } catch (error: any) {
    console.error("Failed to toggle favorite tournament:", error)
    throw error
  }
}

export async function toggleFavoriteTeam(teamId: string, userEmail: string): Promise<{ isFavorite: boolean }> {
  try {
    // favoritesByUserが存在しない場合のフォールバック: 常にcreateFavoriteを試みる
    // エラーが発生した場合は既に存在すると判断
    let existingFavorite: any = null
    
    // まずcreateFavoriteを試みる（既に存在する場合はエラーが返される）
    try {
      const createResult = await client.graphql({
        query: `
          mutation CreateFavorite($input: CreateFavoriteInput!) {
            createFavorite(input: $input) {
              id
              userEmail
              teamId
            }
          }
        `,
        variables: {
          input: {
            userEmail,
            teamId
          }
        },
        authMode: 'apiKey'
      })

      if ((createResult as any).errors) {
        // エラーが発生した場合、既に存在する可能性がある
        console.log("createFavorite returned errors, favorite may already exist")
        // エラーメッセージから既存のIDを取得できないため、falseを返す
        return { isFavorite: false }
      }

      return { isFavorite: true }
    } catch (createError: any) {
      // createFavoriteが失敗した場合、既に存在する可能性がある
      // この場合、削除を試みる（ただし、IDがわからないため削除できない）
      console.log("createFavorite failed, favorite may already exist:", createError)
      // エラーメッセージから既存のIDを取得できないため、falseを返す
      // 実際には、お気に入りが存在する可能性が高いが、削除できない
      return { isFavorite: false }
    }
  } catch (error: any) {
    console.error("Failed to toggle favorite team:", error)
    
    // GraphQLエラーの詳細を表示
    if (error?.errors) {
      console.error("GraphQL errors:", error.errors)
      error.errors.forEach((err: any, index: number) => {
        console.error(`Error ${index + 1}:`, {
          message: err.message,
          errorType: err.errorType,
          errorInfo: err.errorInfo,
          path: err.path,
          locations: err.locations
        })
      })
    }
    
    console.error("Error details:", {
      message: error?.message,
      errors: error?.errors,
      data: error?.data
    })
    throw error
  }
}

export async function checkFavoriteTournament(tournamentId: string, userEmail: string): Promise<boolean> {
  try {
    // favoritesByUserが存在しない場合のフォールバック: 常にfalseを返す
    // お気に入り機能が完全にデプロイされるまでの一時的な対応
    console.log("checkFavoriteTournament: Checking favorite status (favoritesByUser may not be available yet)")
    return false
  } catch (error: any) {
    console.error("Failed to check favorite tournament:", error)
    
    // GraphQLエラーの詳細を表示
    if (error?.errors) {
      console.error("GraphQL errors in catch block:", error.errors)
      error.errors.forEach((err: any, index: number) => {
        console.error(`Catch Error ${index + 1}:`, {
          message: err.message,
          errorType: err.errorType,
          errorInfo: err.errorInfo,
          path: err.path,
          locations: err.locations
        })
      })
    }
    
    console.error("Error details:", {
      message: error?.message,
      errors: error?.errors,
      data: error?.data
    })
    // エラーが発生した場合はfalseを返す
    return false
  }
}

export async function checkFavoriteTeam(teamId: string, userEmail: string): Promise<boolean> {
  try {
    // favoritesByUserが存在しない場合のフォールバック: 常にfalseを返す
    // お気に入り機能が完全にデプロイされるまでの一時的な対応
    console.log("checkFavoriteTeam: Checking favorite status (favoritesByUser may not be available yet)")
    return false
  } catch (error: any) {
    console.error("Failed to check favorite team:", error)
    return false
  }
}

export async function getUserFavorites(userEmail: string): Promise<{ tournaments: DbTournament[], teams: DbTeam[] }> {
  try {
    // まずfavoritesByUserを試す（GSIがデプロイされている場合）
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
      variables: {
        userEmail
      },
      authMode: 'apiKey'
    }) as any

      if (result.data?.favoritesByUser?.items) {
        const favorites = result.data.favoritesByUser.items
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
      }
    } catch (gsiError) {
      console.log("favoritesByUser GSI not available, falling back to listFavorites")
    }

    // フォールバック: listFavoritesを使用してフィルタリング
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

    const favorites = result.data?.listFavorites?.items || []
    console.log(`getUserFavorites: Found ${favorites.length} favorites for user ${userEmail}`)
    
    const tournamentIds = favorites.filter((f: any) => f.tournamentId).map((f: any) => f.tournamentId)
    const teamIds = favorites.filter((f: any) => f.teamId).map((f: any) => f.teamId)

    console.log(`getUserFavorites: ${tournamentIds.length} tournament IDs, ${teamIds.length} team IDs`)

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
  } catch (error) {
    console.error("Failed to get user favorites:", error)
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
    console.error("Failed to follow user:", error)
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
    console.error("Failed to unfollow user:", error)
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
    console.error("Failed to check follow status:", error)
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
    console.error("Failed to get followers:", error)
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
    console.error("Failed to get following:", error)
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
    console.error("Failed to get follow counts:", error)
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
      console.error('GraphQL errors in listRegions:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    const regions = result?.data?.listRegions?.items ?? []
    return regions.sort((a: DbRegion, b: DbRegion) => a.sortOrder - b.sortOrder)
  } catch (error: any) {
    console.error('listRegions error:', error)
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
      console.error('GraphQL errors in getRegionBySlug:', result.errors)
      return null
    }

    return result?.data?.listRegions?.items?.[0] || null
  } catch (error: any) {
    console.error('getRegionBySlug error:', error)
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
      console.error('GraphQL errors in listPrefectures:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    const prefectures = result?.data?.listPrefectures?.items ?? []

    return prefectures.sort((a: DbPrefecture, b: DbPrefecture) => a.sortOrder - b.sortOrder)
  } catch (error: any) {
    console.error('listPrefectures error:', error)
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
      console.error('GraphQL errors in getPrefectureBySlug:', result.errors)
      return null
    }

    return result?.data?.listPrefectures?.items?.[0] || null
  } catch (error: any) {
    console.error('getPrefectureBySlug error:', error)
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
      console.error('GraphQL errors in listDistricts:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    const districts = result?.data?.listDistricts?.items ?? []
    return districts.sort((a: DbDistrict, b: DbDistrict) => a.sortOrder - b.sortOrder)
  } catch (error: any) {
    console.error('listDistricts error:', error)
    return []
  }
}

// ==================== Tournament Team Functions ====================

export async function getTournamentTeams(tournamentId: string): Promise<(DbTournamentTeam & { team?: DbTeam | null })[]> {
  const query = /* GraphQL */ `
    query TeamsByTournament($tournamentId: ID!) {
      teamsByTournament(tournamentId: $tournamentId) {
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
      console.error('GraphQL errors in getTournamentTeams:', result.errors)
      return []
    }

    const tournamentTeams = result?.data?.teamsByTournament?.items ?? []
    
    // チーム情報を取得
    const teamsWithData = await Promise.all(
      tournamentTeams.map(async (tt: DbTournamentTeam) => {
        try {
          const team = await getTeam(tt.teamId)
          return { ...tt, team }
        } catch (error) {
          console.error('Failed to load team:', tt.teamId, error)
          return { ...tt, team: null }
        }
      })
    )

    return teamsWithData
  } catch (error: any) {
    console.error('getTournamentTeams error:', error)
    return []
  }
}

export async function addTournamentTeam(tournamentId: string, teamId: string, teamName?: string, participationYear?: string): Promise<DbTournamentTeam> {
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
      console.error('GraphQL errors in addTournamentTeam:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    return result.data.createTournamentTeam
  } catch (error: any) {
    console.error('addTournamentTeam error:', error)
    throw error
  }
}

export async function removeTournamentTeam(id: string): Promise<void> {
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
      console.error('GraphQL errors in removeTournamentTeam:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }
  } catch (error: any) {
    console.error('removeTournamentTeam error:', error)
    throw error
  }
}

// ==================== Tournament Result Functions ====================

export async function getTournamentResults(tournamentId: string): Promise<DbTournamentResult[]> {
  const query = /* GraphQL */ `
    query ResultsByTournament($tournamentId: ID!) {
      resultsByTournament(tournamentId: $tournamentId) {
        items {
          id tournamentId year title content ranking createdBy createdAt updatedAt
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
      console.error('GraphQL errors in getTournamentResults:', result.errors)
      return []
    }

    return result?.data?.resultsByTournament?.items ?? []
  } catch (error: any) {
    console.error('getTournamentResults error:', error)
    return []
  }
}

export async function createTournamentResult(input: Partial<DbTournamentResult>): Promise<DbTournamentResult> {
  const mutation = /* GraphQL */ `
    mutation CreateTournamentResult($input: CreateTournamentResultInput!) {
      createTournamentResult(input: $input) {
        id tournamentId year title content ranking createdBy createdAt updatedAt
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
      console.error('GraphQL errors in createTournamentResult:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    return result.data.createTournamentResult
  } catch (error: any) {
    console.error('createTournamentResult error:', error)
    throw error
  }
}

export async function updateTournamentResult(id: string, input: Partial<DbTournamentResult>): Promise<DbTournamentResult> {
  const mutation = /* GraphQL */ `
    mutation UpdateTournamentResult($input: UpdateTournamentResultInput!) {
      updateTournamentResult(input: $input) {
        id tournamentId year title content ranking createdBy createdAt updatedAt
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
      console.error('GraphQL errors in updateTournamentResult:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }

    return result.data.updateTournamentResult
  } catch (error: any) {
    console.error('updateTournamentResult error:', error)
    throw error
  }
}

export async function deleteTournamentResult(id: string): Promise<void> {
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
      console.error('GraphQL errors in deleteTournamentResult:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
    }
  } catch (error: any) {
    console.error('deleteTournamentResult error:', error)
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
    console.log('getTimelinePosts: Starting for user:', userEmail)
    
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
      console.log('getTimelinePosts: Following', followingEmails.length, 'users')
    } catch (followError) {
      console.log('getTimelinePosts: Could not get following list, using fallback')
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
      console.log('getTimelinePosts: Favorite teams:', favoriteTeamIds.length, ', tournaments:', favoriteTournamentIds.length)
    } catch (favError) {
      console.log('getTimelinePosts: Could not get favorites, using fallback')
    }
    
    // 3. すべての投稿を取得
    const allPosts = await listPosts(1000)
    console.log('getTimelinePosts: Total posts in database:', allPosts.length)
    
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
    
    console.log('getTimelinePosts: Filtered posts:', filteredPosts.length)
    
    // 5. 新しい順にソートして返す
    const sortedPosts = filteredPosts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
    
    return sortedPosts.slice(0, limit)
  } catch (error) {
    console.error('getTimelinePosts error:', error)
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
  } catch (error) {
    console.error('toggleFollow error:', error)
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
      console.error('GraphQL errors in searchUsers:', nameResult.errors)
      return []
    }

    return nameResult?.data?.listUsers?.items ?? []
  } catch (error: any) {
    console.error('searchUsers error:', error)
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
          description ownerEmail coAdminEmails startDate endDate favoritesCount createdAt updatedAt
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
      console.error('GraphQL errors in searchTournaments:', result.errors)
      return []
    }

    return result?.data?.listTournaments?.items ?? []
  } catch (error: any) {
    console.error('searchTournaments error:', error)
    return []
  }
}
