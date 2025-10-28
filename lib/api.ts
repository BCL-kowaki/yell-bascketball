"use client"

import { generateClient } from "aws-amplify/api"
import { getCurrentUser } from "aws-amplify/auth"

const client = generateClient()

export type DbPost = {
  id: string
  content: string
  imageUrl?: string | null
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
  createdAt?: string | null
}

export async function getCurrentUserEmail(): Promise<string | undefined> {
  try {
    const u = await getCurrentUser()
    // @ts-ignore
    return u?.signInDetails?.loginId as string | undefined
  } catch {
    return undefined
  }
}

const postFields = `
  id content imageUrl pdfUrl pdfName locationName locationAddress
  linkUrl linkTitle linkDescription linkImage likesCount commentsCount
  authorEmail createdAt
`

export async function listPosts(limit = 50): Promise<DbPost[]> {
  const query = /* GraphQL */ `
    query ListPosts($limit: Int, $nextToken: String) {
      listPosts(limit: $limit, nextToken: $nextToken) {
        items { ${postFields} }
        nextToken
      }
    }
  `

  const { data } = await client.graphql({ query, variables: { limit } }) as any
  return data?.listPosts?.items ?? []
}

export async function createPost(input: Partial<DbPost>): Promise<DbPost> {
  const mutation = /* GraphQL */ `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) { ${postFields} }
    }
  `
  const { data } = await client.graphql({ query: mutation, variables: { input } }) as any
  return data.createPost
}

export async function updatePostCounts(id: string, counts: { likesCount?: number; commentsCount?: number }) {
  const mutation = /* GraphQL */ `
    mutation UpdatePost($input: UpdatePostInput!) { updatePost(input: $input) { id likesCount commentsCount } }
  `
  const input: any = { id, ...counts }
  await client.graphql({ query: mutation, variables: { input } })
}

export async function addComment(postId: string, content: string, authorEmail?: string) {
  const mutation = /* GraphQL */ `
    mutation CreateComment($input: CreateCommentInput!) {
      createComment(input: $input) { id postId content authorEmail createdAt }
    }
  `
  await client.graphql({ query: mutation, variables: { input: { postId, content, authorEmail } } })
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

  const { data } = await client.graphql({ query, variables: { postId, userEmail } }) as any
  const existing = data?.likesByPostAndUser?.items?.[0]
  if (existing) {
    await client.graphql({ query: deleteLike, variables: { input: { id: existing.id } } })
    await updatePostCounts(postId, { likesCount: Math.max(0, currentLikes - 1) })
    return { liked: false, likes: Math.max(0, currentLikes - 1) }
  } else {
    await client.graphql({ query: createLike, variables: { input: { postId, userEmail } } })
    await updatePostCounts(postId, { likesCount: currentLikes + 1 })
    return { liked: true, likes: currentLikes + 1 }
  }
}



