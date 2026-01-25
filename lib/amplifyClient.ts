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
      console.log('ストレージ設定を追加しました:', {
        bucket: storageBucketName,
        region: storageRegion,
      })
    } else {
      console.warn('⚠️ ストレージバケット名が設定されていません。S3アップロードは失敗します。')
      console.warn('修正方法:')
      console.warn('1. Storageリソースを追加: amplify add storage')
      console.warn('2. または、環境変数 NEXT_PUBLIC_STORAGE_BUCKET_NAME を設定')
    }

    // 設定を確認してログ出力
    console.log('Amplify設定:', {
      endpoint: fullConfig.API.GraphQL.endpoint,
      apiKey: fullConfig.API.GraphQL.apiKey ? fullConfig.API.GraphQL.apiKey.substring(0, 10) + '...' : '未設定',
      region: fullConfig.API.GraphQL.region,
      authType: fullConfig.API.GraphQL.defaultAuthMode,
      hasIdentityPool: !!fullConfig.Auth.Cognito.identityPoolId,
      hasUserPool: !!fullConfig.Auth.Cognito.userPoolId,
      identityPoolId: fullConfig.Auth.Cognito.identityPoolId,
    })
    
    // 設定の検証
    if (!fullConfig.Auth.Cognito.userPoolId) {
      console.error('❌ エラー: User Pool IDが設定されていません。')
      console.error('バックエンドリソースが作成されていない可能性があります。')
    }
    if (!fullConfig.Auth.Cognito.userPoolClientId) {
      console.error('❌ エラー: User Pool Client IDが設定されていません。')
      console.error('User Pool Client IDが存在しないか、削除された可能性があります。')
      console.error('バックエンドリソースを再作成してください。')
    }
    if (!fullConfig.Auth.Cognito.identityPoolId) {
      console.warn('⚠️ 警告: Identity Pool IDが設定されていません。')
      console.warn('S3アップロードが失敗する可能性があります。')
    }

    // クライアント側で認証トークンをlocalStorageに保存するため、ssr: trueは使わない
    Amplify.configure(fullConfig)
    isConfigured = true

    // 設定後の確認
    try {
      const amplifyConfig = Amplify.getConfig()
      console.log('Amplify設定が完了しました:', {
        api: amplifyConfig.API?.GraphQL?.endpoint || '見つかりません',
        region: amplifyConfig.API?.GraphQL?.region || '見つかりません',
        auth: amplifyConfig.Auth?.Cognito?.userPoolId || '見つかりません',
        identityPool: amplifyConfig.Auth?.Cognito?.identityPoolId || '未設定',
      })
    } catch (e) {
      console.warn('Amplify設定の確認に失敗しました:', e)
    }
  }
}


