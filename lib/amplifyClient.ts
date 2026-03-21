"use client"

import { Amplify } from "aws-amplify"
import config from "../src/amplifyconfiguration.json"

let isConfigured = false

// 開発環境のみログ出力
const isDev = process.env.NODE_ENV === 'development'

export function ensureAmplifyConfigured(): void {
  if (isConfigured) return

  // SSR環境チェック（window未定義の場合はスキップ）
  if (typeof window === 'undefined') {
    return
  }

  // Amplify v6の新しい設定形式に変換
  const fullConfig: any = {
    Auth: {
      Cognito: {
        userPoolId: config.aws_user_pools_id,
        userPoolClientId: config.aws_user_pools_web_client_id,
        identityPoolId: config.aws_cognito_identity_pool_id,
        loginWith: {
          email: true,
          username: false,
          phone: false,
        },
        signUpVerificationMethod: 'code',
        userAttributes: {
          email: { required: true },
          givenName: { required: true },
          familyName: { required: true },
        },
        allowGuestAccess: false,
      },
    },
    API: {
      GraphQL: {
        endpoint: config.aws_appsync_graphqlEndpoint,
        region: config.aws_appsync_region,
        apiKey: config.aws_appsync_apiKey,
        defaultAuthMode: config.aws_appsync_authenticationType.toLowerCase() === 'api_key' ? 'apiKey' : 'iam',
      },
    },
  }

  // Storage設定を追加
  const storageBucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || (config as any).aws_user_files_s3_bucket
  const storageRegion = config.aws_project_region || config.aws_appsync_region

  if (storageBucketName) {
    fullConfig.Storage = {
      S3: {
        bucket: storageBucketName,
        region: storageRegion,
      },
    }
    if (isDev) console.log('ストレージ設定:', { bucket: storageBucketName, region: storageRegion })
  } else if (isDev) {
    console.warn('⚠️ ストレージバケット名が未設定。NEXT_PUBLIC_STORAGE_BUCKET_NAME を設定してください。')
  }

  // 設定の検証（開発環境のみ）
  if (isDev) {
    if (!fullConfig.Auth.Cognito.userPoolId) console.error('❌ User Pool IDが未設定')
    if (!fullConfig.Auth.Cognito.userPoolClientId) console.error('❌ User Pool Client IDが未設定')
    if (!fullConfig.Auth.Cognito.identityPoolId) console.warn('⚠️ Identity Pool IDが未設定')
  }

  Amplify.configure(fullConfig)
  isConfigured = true

  if (isDev) console.log('Amplify設定完了')
}


