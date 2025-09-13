import { NextRequest, NextResponse } from 'next/server'

// Mock database for comments
let mockComments: any[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { tournamentId: string; postId: string } }
) {
  try {
    const { tournamentId, postId } = params
    
    // Filter comments by tournament ID and post ID
    const postComments = mockComments.filter(comment => 
      comment.tournamentId === tournamentId && comment.postId === postId
    )
    
    return NextResponse.json({
      comments: postComments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    })
  } catch (error) {
    console.error('コメント取得エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tournamentId: string; postId: string } }
) {
  try {
    const { tournamentId, postId } = params
    const body = await request.json()
    const { content, authorId, authorName, authorRole } = body

    // Validation
    if (!content || !authorId || !authorName || !authorRole) {
      return NextResponse.json({ 
        error: '必須フィールドが不足しています' 
      }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ 
        error: 'コメントは500文字以内で入力してください' 
      }, { status: 400 })
    }

    // Create new comment
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tournamentId,
      postId,
      authorId,
      authorName,
      authorRole,
      authorAvatar: `/placeholder.svg?height=32&width=32&text=${authorName.charAt(0)}`,
      timestamp: new Date().toISOString(),
      content: content.trim(),
      likes: 0,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to mock database
    mockComments.push(newComment)

    console.log('新しいコメントが作成されました:', {
      tournamentId,
      postId,
      commentId: newComment.id,
      author: authorName
    })

    return NextResponse.json({
      message: 'コメントが正常に作成されました',
      comment: newComment
    }, { status: 201 })

  } catch (error) {
    console.error('コメント作成エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { tournamentId: string; postId: string } }
) {
  try {
    const { tournamentId, postId } = params
    const body = await request.json()
    const { commentId, action, userId, content } = body

    // Find the comment
    const commentIndex = mockComments.findIndex(comment => 
      comment.id === commentId && 
      comment.tournamentId === tournamentId && 
      comment.postId === postId
    )

    if (commentIndex === -1) {
      return NextResponse.json({ error: 'コメントが見つかりません' }, { status: 404 })
    }

    const comment = mockComments[commentIndex]

    // Handle different actions
    switch (action) {
      case 'like':
        comment.likes += 1
        break
      case 'unlike':
        comment.likes = Math.max(0, comment.likes - 1)
        break
      case 'edit':
        // Only author can edit
        if (comment.authorId !== userId) {
          return NextResponse.json({ error: '編集権限がありません' }, { status: 403 })
        }
        if (!content || content.length > 500) {
          return NextResponse.json({ error: '無効なコメント内容です' }, { status: 400 })
        }
        comment.content = content.trim()
        comment.isEdited = true
        break
      default:
        return NextResponse.json({ error: '無効なアクションです' }, { status: 400 })
    }

    comment.updatedAt = new Date().toISOString()
    mockComments[commentIndex] = comment

    return NextResponse.json({
      message: 'アクションが正常に実行されました',
      comment
    })

  } catch (error) {
    console.error('コメント更新エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tournamentId: string; postId: string } }
) {
  try {
    const { tournamentId, postId } = params
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')
    const userId = searchParams.get('userId')

    if (!commentId || !userId) {
      return NextResponse.json({ 
        error: 'コメントIDとユーザーIDが必要です' 
      }, { status: 400 })
    }

    // Find the comment
    const commentIndex = mockComments.findIndex(comment => 
      comment.id === commentId && 
      comment.tournamentId === tournamentId && 
      comment.postId === postId
    )

    if (commentIndex === -1) {
      return NextResponse.json({ error: 'コメントが見つかりません' }, { status: 404 })
    }

    const comment = mockComments[commentIndex]

    // Check if user can delete this comment (only author)
    if (comment.authorId !== userId) {
      return NextResponse.json({ error: '削除権限がありません' }, { status: 403 })
    }

    // Remove the comment
    mockComments.splice(commentIndex, 1)

    console.log('コメントが削除されました:', {
      tournamentId,
      postId,
      commentId,
      deletedBy: userId
    })

    return NextResponse.json({
      message: 'コメントが正常に削除されました'
    })

  } catch (error) {
    console.error('コメント削除エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}