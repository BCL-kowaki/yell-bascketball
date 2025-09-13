import { NextRequest, NextResponse } from 'next/server'

// Mock database - in a real app, this would be a proper database
let mockPosts: any[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const tournamentId = params.tournamentId
    
    // Filter posts by tournament ID
    const tournamentPosts = mockPosts.filter(post => post.tournamentId === tournamentId)
    
    return NextResponse.json({
      posts: tournamentPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    })
  } catch (error) {
    console.error('投稿取得エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const tournamentId = params.tournamentId
    const body = await request.json()
    const { content, authorId, authorName, authorRole, type, images = [] } = body

    // Validation
    if (!content || !authorId || !authorName || !authorRole || !type) {
      return NextResponse.json({ 
        error: '必須フィールドが不足しています' 
      }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ 
        error: '投稿内容は1000文字以内で入力してください' 
      }, { status: 400 })
    }

    // Validate post type
    const validTypes = ['official', 'team', 'user']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: '無効な投稿タイプです' 
      }, { status: 400 })
    }

    // Create new post
    const newPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tournamentId,
      type,
      authorId,
      authorName,
      authorRole,
      authorAvatar: `/placeholder.svg?height=40&width=40&text=${authorName.charAt(0)}`,
      timestamp: new Date().toISOString(),
      content: content.trim(),
      images: images.slice(0, 4), // Limit to 4 images
      likes: 0,
      comments: 0,
      shares: 0,
      isPinned: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to mock database
    mockPosts.push(newPost)

    console.log('新しい投稿が作成されました:', {
      tournamentId,
      postId: newPost.id,
      author: authorName,
      type,
      contentLength: content.length
    })

    return NextResponse.json({
      message: '投稿が正常に作成されました',
      post: newPost
    }, { status: 201 })

  } catch (error) {
    console.error('投稿作成エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const tournamentId = params.tournamentId
    const body = await request.json()
    const { postId, action, userId } = body

    // Find the post
    const postIndex = mockPosts.findIndex(post => 
      post.id === postId && post.tournamentId === tournamentId
    )

    if (postIndex === -1) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    const post = mockPosts[postIndex]

    // Handle different actions
    switch (action) {
      case 'like':
        post.likes += 1
        break
      case 'unlike':
        post.likes = Math.max(0, post.likes - 1)
        break
      case 'pin':
        // Only organizers can pin posts
        if (post.type === 'official') {
          post.isPinned = true
        } else {
          return NextResponse.json({ error: '権限がありません' }, { status: 403 })
        }
        break
      case 'unpin':
        if (post.type === 'official') {
          post.isPinned = false
        } else {
          return NextResponse.json({ error: '権限がありません' }, { status: 403 })
        }
        break
      default:
        return NextResponse.json({ error: '無効なアクションです' }, { status: 400 })
    }

    post.updatedAt = new Date().toISOString()
    mockPosts[postIndex] = post

    return NextResponse.json({
      message: 'アクションが正常に実行されました',
      post
    })

  } catch (error) {
    console.error('投稿更新エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tournamentId: string } }
) {
  try {
    const tournamentId = params.tournamentId
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const userId = searchParams.get('userId')

    if (!postId || !userId) {
      return NextResponse.json({ 
        error: '投稿IDとユーザーIDが必要です' 
      }, { status: 400 })
    }

    // Find the post
    const postIndex = mockPosts.findIndex(post => 
      post.id === postId && post.tournamentId === tournamentId
    )

    if (postIndex === -1) {
      return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
    }

    const post = mockPosts[postIndex]

    // Check if user can delete this post (only author or organizer)
    if (post.authorId !== userId && post.type !== 'official') {
      return NextResponse.json({ error: '削除権限がありません' }, { status: 403 })
    }

    // Remove the post
    mockPosts.splice(postIndex, 1)

    console.log('投稿が削除されました:', {
      tournamentId,
      postId,
      deletedBy: userId
    })

    return NextResponse.json({
      message: '投稿が正常に削除されました'
    })

  } catch (error) {
    console.error('投稿削除エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}