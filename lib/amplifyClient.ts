"use client"

import { Amplify } from "aws-amplify"
import config from "../src/amplifyconfiguration.json"

let isConfigured = false

export function ensureAmplifyConfigured(): void {
  if (!isConfigured) {
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
            email: {
              required: true,
            },
            givenName: {
              required: true,
            },
            familyName: {
              required: true,
            },
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

    // Storage設定を追加（S3バケット名が設定されている場合）
    // 注意: StorageリソースがAmplifyに追加されていない場合、バケット名を手動で設定する必要があります
    // 環境変数からバケット名を取得、またはAmplify CLIでStorageリソースを追加してください
    const storageBucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || (config as any).aws_user_files_s3_bucket
    const storageRegion = config.aws_project_region || config.aws_appsync_region

    if (storageBucketName) {
      fullConfig.Storage = {
        S3: {
          bucket: storageBucketName,
          region: storageRegion,
        },
      }
      console.log('Storage configuration added:', {
        bucket: storageBucketName,
        region: storageRegion,
      })
    } else {
      console.warn('⚠️ Storage bucket name not configured. S3 uploads will fail.')
      console.warn('To fix this, either:')
      console.warn('1. Add Storage resource using: amplify add storage')
      console.warn('2. Or set NEXT_PUBLIC_STORAGE_BUCKET_NAME environment variable')
    }

    // 設定を確認してログ出力
    console.log('Amplify Configuration:', {
      endpoint: fullConfig.API.GraphQL.endpoint,
      apiKey: fullConfig.API.GraphQL.apiKey ? fullConfig.API.GraphQL.apiKey.substring(0, 10) + '...' : 'NOT SET',
      region: fullConfig.API.GraphQL.region,
      authType: fullConfig.API.GraphQL.defaultAuthMode,
      hasIdentityPool: !!fullConfig.Auth.Cognito.identityPoolId,
      hasUserPool: !!fullConfig.Auth.Cognito.userPoolId,
      identityPoolId: fullConfig.Auth.Cognito.identityPoolId,
    })

    // クライアント側で認証トークンをlocalStorageに保存するため、ssr: trueは使わない
    Amplify.configure(fullConfig)
    isConfigured = true

    // 設定後の確認
    try {
      const amplifyConfig = Amplify.getConfig()
      console.log('Amplify configured successfully:', {
        api: amplifyConfig.API?.GraphQL?.endpoint || 'NOT FOUND',
        region: amplifyConfig.API?.GraphQL?.region || 'NOT FOUND',
        auth: amplifyConfig.Auth?.Cognito?.userPoolId || 'NOT FOUND',
        identityPool: amplifyConfig.Auth?.Cognito?.identityPoolId || 'NOT CONFIGURED',
      })
    } catch (e) {
      console.warn('Could not verify Amplify config:', e)
    }
  }
}


