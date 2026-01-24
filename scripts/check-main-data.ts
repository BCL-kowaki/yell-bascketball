/**
 * main環境のデータ確認スクリプト
 */

import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/api'
import config from '../src/amplifyconfiguration.json'
import { listUsers, listPosts, listComments, listLikes } from '../src/graphql/queries'

Amplify.configure(config)
const client = generateClient()

async function checkData() {
  console.log('🔍 main環境のデータを確認中...\n')
  console.log('📡 Endpoint:', config.aws_appsync_graphqlEndpoint)
  console.log('👤 User Pool:', config.aws_user_pools_id)
  console.log('')

  try {
    // Usersを確認
    const usersResult = await client.graphql({
      query: listUsers,
      variables: { limit: 1000 }
    })
    // @ts-ignore
    const users = usersResult.data.listUsers?.items || []
    console.log(`👥 Users: ${users.length}件`)
    if (users.length > 0) {
      console.log(`   例: ${users[0].email}`)
    }

    // Postsを確認
    const postsResult = await client.graphql({
      query: listPosts,
      variables: { limit: 1000 }
    })
    // @ts-ignore
    const posts = postsResult.data.listPosts?.items || []
    console.log(`📝 Posts: ${posts.length}件`)
    if (posts.length > 0) {
      console.log(`   最新: ${posts[0].content?.substring(0, 50)}...`)
    }

    // Commentsを確認
    const commentsResult = await client.graphql({
      query: listComments,
      variables: { limit: 1000 }
    })
    // @ts-ignore
    const comments = commentsResult.data.listComments?.items || []
    console.log(`💬 Comments: ${comments.length}件`)

    // Likesを確認
    const likesResult = await client.graphql({
      query: listLikes,
      variables: { limit: 1000 }
    })
    // @ts-ignore
    const likes = likesResult.data.listLikes?.items || []
    console.log(`❤️  Likes: ${likes.length}件`)

    console.log('\n📊 合計データ数:', users.length + posts.length + comments.length + likes.length)

    if (users.length === 0 && posts.length === 0 && comments.length === 0 && likes.length === 0) {
      console.log('\n✅ main環境にはデータがありません。削除しても問題ありません。')
    } else {
      console.log('\n⚠️  main環境にデータがあります。削除前にdev環境への移行を検討してください。')
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  }
}

checkData()
