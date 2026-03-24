"use client"

import { ensureAmplifyConfigured } from './amplifyClient'

// S3アップロード用の型定義（Storageが追加されるまで）
type StorageConfig = {
  bucket_name?: string
  region?: string
}

/**
 * 画像を圧縮する
 * @param file 元の画像ファイル
 * @param maxSizeKB 最大サイズ（KB）
 * @param maxWidth 最大幅（px）
 * @param maxHeight 最大高さ（px）
 * @param quality 圧縮品質（0.0-1.0）
 * @returns 圧縮されたBlob
 */
async function compressImage(
  file: File,
  maxSizeKB: number = 10 * 1024, // デフォルト: 10MB
  maxWidth: number = 4096,
  maxHeight: number = 4096,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // 画像サイズを計算
        let width = img.width
        let height = img.height
        
        // 最大サイズを超える場合はリサイズ
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }
        
        // Canvasでリサイズ・圧縮
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // 圧縮品質を調整しながら目標サイズに近づける
        const targetSizeBytes = maxSizeKB * 1024
        let currentQuality = quality
        let compressedBlob: Blob | null = null
        let attempts = 0
        const maxAttempts = 10 // 最大試行回数
        
        const tryCompress = (q: number, currentWidth: number, currentHeight: number): void => {
          attempts++
          
          // 最大試行回数を超えた場合は、現在のサイズで完了
          if (attempts > maxAttempts) {
            if (compressedBlob) {
              resolve(compressedBlob)
            } else {
              reject(new Error('画像の圧縮に失敗しました（試行回数超過）'))
            }
            return
          }
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }
              
              compressedBlob = blob
              
              // 目標サイズ以下になったら完了
              if (blob.size <= targetSizeBytes || q <= 0.05) {
                resolve(blob)
                return
              }
              
              // まだ大きい場合は、品質を下げるか、サイズをさらに縮小
              if (blob.size > targetSizeBytes) {
                if (q > 0.05) {
                  // 品質を下げて再試行（0.05刻みで下げる）
                  tryCompress(Math.max(0.05, q - 0.05), currentWidth, currentHeight)
                } else if (currentWidth > 400 && currentHeight > 400) {
                  // 品質が最低でもまだ大きい場合は、サイズをさらに縮小
                  const newWidth = Math.max(400, Math.floor(currentWidth * 0.9))
                  const newHeight = Math.max(400, Math.floor(currentHeight * 0.9))
                  canvas.width = newWidth
                  canvas.height = newHeight
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    ctx.drawImage(img, 0, 0, newWidth, newHeight)
                    tryCompress(0.5, newWidth, newHeight) // 品質を0.5にリセット
                  } else {
                    resolve(blob) // これ以上圧縮できない
                  }
                } else {
                  resolve(blob) // これ以上圧縮できない
                }
              } else {
                resolve(blob)
              }
            },
            file.type || 'image/jpeg',
            q
          )
        }
        
        tryCompress(currentQuality, width, height)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * 画像をS3にアップロードしてURLを取得（Storageが利用可能な場合）
 * Storageが利用できない場合は、Base64データURLを返す
 * @param file アップロードする画像ファイル
 * @param userId ユーザーID（オプション）
 * @returns アップロードされたファイルの公開URL、またはBase64データURL
 */
export async function uploadImageToS3(file: File, userId?: string): Promise<string> {
  ensureAmplifyConfigured()

  // アップロード前に画像を自動圧縮
  let fileToUpload = file
  const originalSizeMB = file.size / 1024 / 1024
  const targetSizeMB = 10 // 目標サイズ: 10MB
  const compressionThresholdMB = 1 // 1MB以上のファイルは自動圧縮

  if (originalSizeMB > compressionThresholdMB) {
    console.log(`Image is large (${originalSizeMB.toFixed(2)}MB), compressing to ~${targetSizeMB}MB...`)
    try {
      // ファイルサイズに応じて圧縮パラメータを調整
      let maxWidth = 4096
      let maxHeight = 4096
      let quality = 0.85
      let maxSizeKB = targetSizeMB * 1024

      // 非常に大きいファイル（100MB以上）はより積極的に圧縮
      if (originalSizeMB > 100) {
        maxWidth = 1920
        maxHeight = 1920
        quality = 0.7
        maxSizeKB = targetSizeMB * 1024
      } else if (originalSizeMB > 50) {
        maxWidth = 2560
        maxHeight = 2560
        quality = 0.75
        maxSizeKB = targetSizeMB * 1024
      } else if (originalSizeMB > 20) {
        maxWidth = 3840
        maxHeight = 3840
        quality = 0.8
        maxSizeKB = targetSizeMB * 1024
      }

      const compressedBlob = await compressImage(file, maxSizeKB, maxWidth, maxHeight, quality)
      const compressedSizeMB = compressedBlob.size / 1024 / 1024
      console.log(`Image compressed: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB (${((1 - compressedBlob.size / file.size) * 100).toFixed(1)}% reduction)`)

      // 圧縮されたBlobをFileオブジェクトに変換
      fileToUpload = new File([compressedBlob], file.name, {
        type: file.type || 'image/jpeg',
        lastModified: Date.now(),
      })
    } catch (compressError: any) {
      console.warn('Failed to compress image before upload, using original:', compressError?.message)
      // 圧縮に失敗した場合は元のファイルを使用
    }
  }

  // Cognito User IDを格納する変数（関数全体で使用）
  let cognitoUserId: string | null = null

  try {
    // Amplify Storageが利用可能かチェック
    const { uploadData, getUrl } = await import('aws-amplify/storage')

    // 認証情報を明示的に取得（Cognito User PoolからIdentity Poolへ）
    // S3アップロードにはIdentity Poolの認証情報が必要
    try {
      const { fetchAuthSession, getCurrentUser } = await import('aws-amplify/auth')
      const { Amplify } = await import('aws-amplify')

      // Amplify設定を確認
      const amplifyConfig = Amplify.getConfig()
      const identityPoolId = amplifyConfig.Auth?.Cognito?.identityPoolId
      console.log('Amplify config check:', {
        hasIdentityPoolConfig: !!identityPoolId,
        identityPoolId: identityPoolId || 'NOT SET',
      })

      if (!identityPoolId) {
        throw new Error('Identity Pool IDが設定されていません。Amplify設定を確認してください。')
      }

      // まず、現在のユーザーが認証されているか確認
      const currentUser = await getCurrentUser()
      console.log('Current user authenticated for image upload:', {
        username: currentUser.username,
        userId: currentUser.userId
      })

      // Cognito User IDを使用（メールアドレスではなくユニークなID）
      cognitoUserId = currentUser.userId  // 外側のスコープ変数に代入
      console.log('Using Cognito User ID for S3 path:', cognitoUserId)

      // Identity Poolの認証情報を取得
      // forceRefresh: false に変更（初回は true で、エラー時は false で再試行）
      let authSession
      try {
        authSession = await fetchAuthSession({
          forceRefresh: false,
        })
      } catch (refreshError: any) {
        console.warn('Initial fetchAuthSession failed, trying with forceRefresh:', refreshError?.message)
        // 再試行（forceRefresh: true）
        authSession = await fetchAuthSession({
          forceRefresh: true,
        })
      }

      console.log('Auth session fetched for image upload:', {
        hasCredentials: !!authSession.credentials,
        identityId: authSession.identityId || 'NOT SET',
        tokens: {
          idToken: !!authSession.tokens?.idToken,
          accessToken: !!authSession.tokens?.accessToken,
        },
      })

      if (!authSession.credentials && !authSession.identityId) {
        console.error('⚠️ No credentials or identityId in session for image upload')
        throw new Error('Cognito Identity Poolの認証情報が取得できませんでした。Identity Poolが正しく設定されているか確認してください。')
      }
    } catch (authError: any) {
      console.error('⚠️ Authentication failed for image upload:', {
        message: authError?.message,
        name: authError?.name,
        code: authError?.code,
        stack: authError?.stack,
      })
      throw authError
    }

    const timestamp = Date.now()
    // Cognito User ID（sub）を使用してパスを生成（URLエンコード不要）
    const fileName = `${cognitoUserId || 'anonymous'}/images/${timestamp}-${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    console.log('Attempting to upload image to S3:', {
      fileName,
      originalSize: `${originalSizeMB.toFixed(2)}MB`,
      uploadSize: `${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
      userId: userId || 'anonymous',
    })

    // Amplify設定を確認してStorageバケットが設定されているか確認
    const { Amplify } = await import('aws-amplify')
    const amplifyConfig = Amplify.getConfig()
    const storageBucket = amplifyConfig.Storage?.S3?.bucket

    if (!storageBucket) {
      throw new Error(
        'S3バケットが設定されていません。\n\n' +
        '解決方法:\n' +
        '1. Amplify CLIでStorageリソースを追加: `amplify add storage`\n' +
        '2. または、環境変数 NEXT_PUBLIC_STORAGE_BUCKET_NAME を設定してください'
      )
    }

    console.log('Uploading to S3 bucket:', storageBucket)

    // ファイルをS3にアップロード
    await uploadData({
      key: fileName,
      data: fileToUpload,
      options: {
        contentType: fileToUpload.type,
        onProgress: (progress) => {
          console.log(`Image upload progress: ${((progress.transferredBytes / progress.totalBytes) * 100).toFixed(1)}%`)
        }
      },
    }).result

    // 公開URLを取得
    const url = await getUrl({
      key: fileName,
      options: {
        expiresIn: 3600 * 24 * 365, // 1年間有効
      },
    })

    console.log('Image uploaded to S3 successfully:', url.url.toString())
    return url.url.toString()
  } catch (error: any) {
    console.error('Image S3 upload failed:', error)
    console.error('Image S3 upload error details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
    })

    // S3が利用できないため、DynamoDBに保存可能な小さい画像のみBase64フォールバックを許可
    console.warn('S3 upload failed, checking if image is small enough for Base64 fallback:', error?.message)

    // エラーがバケット名関連の場合、より明確なエラーメッセージを表示
    if (error?.name === 'NoBucket' || error?.message?.includes('bucket')) {
      throw new Error(
        'S3ストレージが設定されていません。\n\n' +
        '解決方法:\n' +
        '1. Amplify CLIでStorageリソースを追加:\n' +
        '   `amplify add storage`\n' +
        '   選択肢: Content (Images, audio, video, etc.)\n' +
        '   バケット名: 任意の名前（例: yellstorage）\n' +
        '   アクセス権限: 認証済みユーザーのみ\n' +
        '   その後: `amplify push`\n\n' +
        '2. または、環境変数 NEXT_PUBLIC_STORAGE_BUCKET_NAME に既存のS3バケット名を設定\n\n' +
        '注意: Storageリソースを追加すると、自動的にS3バケットが作成され、設定が更新されます。'
      )
    }

    // DynamoDBの安全な最大サイズ（100KB、Base64エンコード後）
    // Base64は元のサイズの約133%になるため、元の画像は約75KB以下である必要がある
    const maxSizeForBase64 = 100 * 1024 // 100KB

    try {
      // 画像をより積極的に圧縮（最大サイズ: 600x600、品質: 0.6）
      console.log('Compressing image for Base64 fallback...')
      const compressedBlob = await compressImage(file, maxSizeForBase64 / 1024, 600, 600, 0.6)
      console.log(`Compressed image size: ${(compressedBlob.size / 1024).toFixed(2)}KB`)

      // Base64に変換
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Size = (reader.result as string).length
          console.log('Base64 compressed size:', base64Size, 'bytes')

          if (base64Size > maxSizeForBase64) {
            reject(new Error(
              `画像が大きすぎます（${Math.round(base64Size / 1024)}KB）。\n\n` +
              `S3ストレージの設定が必要です。最大サイズ: ${Math.round(maxSizeForBase64 / 1024)}KB\n\n` +
              '解決方法:\n' +
              '1. Amplify CLIでStorageリソースを追加: `amplify add storage`\n' +
              '2. または、より小さい画像を使用してください'
            ))
            return
          }

          resolve(reader.result as string)
        }
        reader.onerror = () => reject(new Error('Base64変換中にエラーが発生しました'))
        reader.readAsDataURL(compressedBlob)
      })
    } catch (compressError: any) {
      console.error('Base64 compression failed:', compressError)
      throw new Error(
        '画像の圧縮に失敗しました。S3ストレージの設定が必要です。\n\n' +
        `エラー: ${compressError?.message || '不明なエラー'}\n\n` +
        '解決方法:\n' +
        '1. Amplify CLIでStorageリソースを追加: `amplify add storage`\n' +
        '2. または、より小さい画像を使用してください'
      )
    }
  }
}

/**
 * PDFをS3にアップロードしてURLを取得
 * 画像アップロードと同じシンプルな構造で認証→アップロード→URL取得
 * @param file アップロードするPDFファイル
 * @param userId ユーザーID（オプション）
 * @returns アップロードされたファイルの公開URL
 */
export async function uploadPdfToS3(file: File, userId?: string): Promise<string> {
  ensureAmplifyConfigured()

  // PDFファイルサイズチェック（500MB制限）
  const maxSize = 500 * 1024 * 1024
  const fileSizeMB = file.size / 1024 / 1024

  if (file.size > maxSize) {
    throw new Error(`PDFファイルが大きすぎます。最大サイズは500MBです。現在のサイズ: ${fileSizeMB.toFixed(2)}MB`)
  }

  // Cognito User IDを格納する変数
  let cognitoUserId: string | null = null

  try {
    // Amplify Storageが利用可能かチェック
    const { uploadData, getUrl } = await import('aws-amplify/storage')
    const { fetchAuthSession, getCurrentUser } = await import('aws-amplify/auth')
    const { Amplify } = await import('aws-amplify')

    // Amplify設定を確認
    const amplifyConfig = Amplify.getConfig()
    const identityPoolId = amplifyConfig.Auth?.Cognito?.identityPoolId
    if (!identityPoolId) {
      throw new Error('Identity Pool IDが設定されていません。Amplify設定を確認してください。')
    }

    // S3バケット確認
    const storageBucket = amplifyConfig.Storage?.S3?.bucket
    if (!storageBucket) {
      throw new Error('S3バケットが設定されていません。')
    }

    // 現在のユーザーが認証されているか確認
    const currentUser = await getCurrentUser()
    cognitoUserId = currentUser.userId
    console.log('PDF upload - authenticated user:', currentUser.userId)

    // Identity Poolの認証情報を取得
    let authSession
    try {
      authSession = await fetchAuthSession({ forceRefresh: false })
    } catch (refreshError: any) {
      console.warn('Initial fetchAuthSession failed, retrying:', refreshError?.message)
      authSession = await fetchAuthSession({ forceRefresh: true })
    }

    if (!authSession.credentials && !authSession.identityId) {
      throw new Error('Cognito Identity Poolの認証情報が取得できませんでした。')
    }

    const timestamp = Date.now()
    const fileName = `${cognitoUserId || 'anonymous'}/pdfs/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    console.log('Uploading PDF to S3:', { fileName, fileSize: `${fileSizeMB.toFixed(2)}MB`, bucket: storageBucket })

    // ファイルをS3にアップロード
    await uploadData({
      key: fileName,
      data: file,
      options: {
        contentType: 'application/pdf',
        onProgress: (progress) => {
          console.log(`PDF upload progress: ${((progress.transferredBytes / progress.totalBytes) * 100).toFixed(1)}%`)
        }
      },
    }).result

    // 公開URLを取得
    const url = await getUrl({
      key: fileName,
      options: {
        expiresIn: 3600 * 24 * 365,
      },
    })

    console.log('PDF uploaded to S3 successfully:', url.url.toString())
    return url.url.toString()
  } catch (error: any) {
    console.error('PDF S3 upload failed:', error?.message)

    // S3が失敗した場合、小さなPDFはBase64フォールバック
    const maxSizeForBase64 = 300 * 1024 // 300KB
    if (file.size <= maxSizeForBase64) {
      console.warn('S3 upload failed, using Base64 fallback for small PDF')
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Result = reader.result as string
          if (!base64Result || !base64Result.startsWith('data:')) {
            reject(new Error('PDFファイルのBase64変換に失敗しました'))
            return
          }
          const maxSafeBase64Size = 400 * 1024
          if (base64Result.length > maxSafeBase64Size) {
            reject(new Error('PDFのBase64データが大きすぎます。'))
            return
          }
          resolve(base64Result)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }

    throw new Error(`PDFのアップロードに失敗しました（${fileSizeMB.toFixed(2)}MB）。\n原因: ${error?.message || '不明なエラー'}`)
  }
}

/**
 * 動画をS3にアップロードしてURLを取得（Storageが利用可能な場合）
 * Storageが利用できない場合は、Base64データURLを返す
 * @param file アップロードする動画ファイル
 * @param userId ユーザーID（オプション）
 * @returns アップロードされたファイルの公開URL、またはBase64データURL
 */
export async function uploadVideoToS3(file: File, userId?: string): Promise<string> {
  ensureAmplifyConfigured()

  // 動画ファイルサイズチェック（500MB制限）
  const maxSize = 500 * 1024 * 1024 // 500MB
  const fileSizeMB = file.size / 1024 / 1024

  if (file.size > maxSize) {
    throw new Error(`動画ファイルが大きすぎます。最大サイズは500MBです。現在のサイズ: ${fileSizeMB.toFixed(2)}MB`)
  }

  // 大きなファイル（50MB以上）の場合は警告を表示
  if (fileSizeMB > 50) {
    console.warn(`Large video file detected: ${fileSizeMB.toFixed(2)}MB. Upload may take some time.`)
  }

  try {
    // Amplify Storageが利用可能かチェック
    const { uploadData, getUrl } = await import('aws-amplify/storage')

    // 認証情報を明示的に取得（Cognito User PoolからIdentity Poolへ）
    // S3アップロードにはIdentity Poolの認証情報が必要
    try {
      const { fetchAuthSession, getCurrentUser } = await import('aws-amplify/auth')

      // まず、現在のユーザーが認証されているか確認
      const currentUser = await getCurrentUser()
      console.log('Current user authenticated for video upload:', {
        username: currentUser.username,
        userId: currentUser.userId
      })

      // Identity Poolの認証情報を取得
      const authSession = await fetchAuthSession({
        forceRefresh: true,
      })
      console.log('Auth session fetched for video upload:', {
        hasCredentials: !!authSession.credentials,
        identityId: authSession.identityId || 'NOT SET',
      })

      if (!authSession.credentials && !authSession.identityId) {
        console.error('⚠️ No credentials or identityId in session for video upload')
        throw new Error('Cognito Identity Poolの認証情報が取得できませんでした')
      }
    } catch (authError: any) {
      console.error('⚠️ Authentication failed for video upload:', {
        message: authError?.message,
        name: authError?.name,
      })
      throw authError
    }

    const timestamp = Date.now()
    const fileName = `${userId || 'anonymous'}/videos/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    console.log('Attempting to upload video to S3:', {
      fileName,
      fileSize: `${fileSizeMB.toFixed(2)}MB`,
      userId: userId || 'anonymous',
    })

    // ファイルをS3にアップロード
    await uploadData({
      key: fileName,
      data: file,
      options: {
        contentType: file.type || 'video/mp4',
        onProgress: (progress) => {
          console.log(`Video upload progress: ${((progress.transferredBytes / progress.totalBytes) * 100).toFixed(1)}%`)
        }
      },
    }).result

    // 公開URLを取得
    const url = await getUrl({
      key: fileName,
      options: {
        expiresIn: 3600 * 24 * 365, // 1年間有効
      },
    })

    console.log('Video uploaded to S3 successfully:', url.url.toString())
    return url.url.toString()
  } catch (error: any) {
    console.error('Video S3 upload failed:', error)
    console.error('Video S3 upload error details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
    })

    // Storageが利用できない場合は、Base64データURLを返す（フォールバック）
    console.warn('S3 upload failed, using Base64 fallback:', error?.message)

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

/**
 * S3のURLからオブジェクトキーを抽出する
 * @param url S3のURL（署名付きURLまたは通常のURL）
 * @returns オブジェクトキー、またはnull（URLが無効な場合）
 */
export function extractS3KeyFromUrl(url: string): string | null {
  try {
    console.log('extractS3KeyFromUrl: Input URL:', url.substring(0, 200))
    
    // Base64データURLの場合はnullを返す
    if (url.startsWith('data:')) {
      console.log('extractS3KeyFromUrl: Base64 data URL detected')
      return null
    }
    
    // blob: URLの場合はnullを返す
    if (url.startsWith('blob:')) {
      console.log('extractS3KeyFromUrl: Blob URL detected')
      return null
    }
    
    // Google Docs ViewerのURLから元のURLを抽出
    // 例: https://docs.google.com/viewer?url=https%3A%2F%2Fbucket.s3.region.amazonaws.com%2Fpath%2Fto%2Ffile.pdf&embedded=true
    if (url.includes('docs.google.com/viewer')) {
      try {
        const urlObj = new URL(url)
        const encodedUrl = urlObj.searchParams.get('url')
        if (encodedUrl) {
          const decodedUrl = decodeURIComponent(encodedUrl)
          console.log('extractS3KeyFromUrl: Extracted from Google Docs Viewer:', decodedUrl.substring(0, 200))
          // 再帰的に処理（デコードされたURLからキーを抽出）
          return extractS3KeyFromUrl(decodedUrl)
        }
      } catch (e) {
        console.error('Failed to extract URL from Google Docs Viewer:', e)
      }
    }
    
    // S3のURLからキーを抽出
    // 例: https://bucket-name.s3.region.amazonaws.com/public/path/to/file.jpg?X-Amz-Algorithm=...
    // または: https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg
    // または: https://s3.region.amazonaws.com/bucket-name/public/path/to/file.jpg
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    console.log('extractS3KeyFromUrl: Hostname:', urlObj.hostname)
    console.log('extractS3KeyFromUrl: Pathname:', pathname)
    
    // S3のパス形式をチェック
    // 形式1: /bucket-name/path/to/file.jpg (s3.region.amazonaws.com)
    // 形式2: /path/to/file.jpg (bucket-name.s3.region.amazonaws.com)
    let key: string
    
    // 形式1の場合: 最初のパスセグメントがバケット名
    if (urlObj.hostname.includes('s3.') && !urlObj.hostname.includes('.s3.')) {
      // s3.region.amazonaws.com形式
      const pathSegments = pathname.split('/').filter(Boolean)
      console.log('extractS3KeyFromUrl: Path segments:', pathSegments)
      if (pathSegments.length > 1) {
        // 最初のセグメントをスキップ（バケット名）
        key = pathSegments.slice(1).join('/')
      } else {
        key = pathname.substring(1)
      }
    } else {
      // 形式2: bucket-name.s3.region.amazonaws.com形式
      key = pathname.startsWith('/') ? pathname.substring(1) : pathname
    }
    
    // public/プレフィックスを削除（Amplify StorageがURLに自動的に追加するが、実際のS3キーには含まれない）
    // URLにpublic/が含まれていても、実際のS3キーには含まれていない
    // 例: URLが /public/kowaki1111@gmail.com/images/... の場合、実際のキーは kowaki1111@gmail.com/images/...
    if (key.startsWith('public/')) {
      key = key.substring(7) // 'public/'の7文字を削除
      console.log('extractS3KeyFromUrl: Removed public/ prefix, key:', key)
    }
    
    console.log('extractS3KeyFromUrl: Extracted key:', key)
    
    // 空の場合はnullを返す
    if (!key) {
      console.warn('extractS3KeyFromUrl: Empty key extracted')
      return null
    }
    
    return key
  } catch (error) {
    console.error('Failed to extract S3 key from URL:', error)
    return null
  }
}

/**
 * S3のオブジェクトキーから新しい署名付きURLを生成する
 * または、ダウンロードしてBlob URLを生成する（フォールバック）
 * @param key S3のオブジェクトキー
 * @param expiresIn 有効期限（秒）、デフォルトは1年
 * @param useDownload trueの場合、downloadDataを使ってBlob URLを生成
 * @returns 新しい署名付きURLまたはBlob URL
 */
export async function getS3UrlFromKey(key: string, expiresIn: number = 3600 * 24 * 365, useDownload: boolean = false): Promise<string> {
  ensureAmplifyConfigured()

  try {
    console.log('🔍 getS3UrlFromKey: === START ===')
    console.log('🔍 getS3UrlFromKey: Input key:', key)
    console.log('🔍 getS3UrlFromKey: useDownload:', useDownload)
    console.log('🔍 getS3UrlFromKey: useDownload type:', typeof useDownload)
    console.log('🔍 getS3UrlFromKey: useDownload === true:', useDownload === true)
    console.log('🔍 getS3UrlFromKey: useDownload == true:', useDownload == true)

    // ダウンロードモードの場合、downloadDataを使ってBlob URLを生成
    if (useDownload === true) {
      console.log('✅ getS3UrlFromKey: ENTERING DOWNLOAD MODE')
      const { downloadData } = await import('aws-amplify/storage')

      // キーをURLデコード（二重エンコードに対応するため、完全にデコードされるまで繰り返す）
      let decodedKey = key
      let previousKey = ''
      while (decodedKey !== previousKey) {
        previousKey = decodedKey
        decodedKey = decodeURIComponent(decodedKey)
        console.log('🔍 getS3UrlFromKey: Decoding iteration:', decodedKey)
      }
      console.log('🔍 getS3UrlFromKey: Fully decoded key:', decodedKey)

      // public/プレフィックスが既に含まれている場合は削除
      if (decodedKey.startsWith('public/')) {
        decodedKey = decodedKey.substring(7)
        console.log('🔍 getS3UrlFromKey: Removed existing public/ prefix:', decodedKey)
      }

      console.log('📥 getS3UrlFromKey: Downloading data for key (without public/):', decodedKey)
      const downloadResult = await downloadData({
        key: decodedKey,
      }).result

      console.log('📥 getS3UrlFromKey: Download completed, creating blob...')
      const blob = await downloadResult.body.blob()
      const blobUrl = URL.createObjectURL(blob)
      console.log('✅ getS3UrlFromKey: Created Blob URL:', blobUrl)
      console.log('🔍 getS3UrlFromKey: === END (Blob URL) ===')
      return blobUrl
    } else {
      console.log('⚠️ getS3UrlFromKey: NOT entering download mode, useDownload =', useDownload)
    }

    // 通常モード：署名付きURLを生成
    const { getUrl } = await import('aws-amplify/storage')

    // キーに既にpublic/が含まれている場合はそのまま使用
    // 含まれていない場合は、まず元のキーで試行し、失敗した場合のみpublic/を追加
    let actualKey = key

    if (!key.startsWith('public/')) {
      // public/プレフィックスがない場合、まず元のキーで試行
      try {
        const url = await getUrl({
          key: actualKey,
          options: {
            expiresIn,
          },
        })
        const urlString = url.url.toString()
        console.log('getS3UrlFromKey: Generated URL (without public/):', urlString.substring(0, 200))
        return urlString
      } catch (firstError: any) {
        console.log('getS3UrlFromKey: First attempt failed, trying with public/ prefix')
        // 元のキーで失敗した場合、public/プレフィックスを追加して再試行
        actualKey = `public/${key}`
      }
    } else {
      // 既にpublic/が含まれている場合はそのまま使用（重複を防ぐ）
      console.log('getS3UrlFromKey: Key already contains public/ prefix, using as-is')
    }

    const url = await getUrl({
      key: actualKey,
      options: {
        expiresIn,
      },
    })
    const urlString = url.url.toString()
    console.log('getS3UrlFromKey: Generated URL:', urlString.substring(0, 200))
    return urlString
  } catch (error: any) {
    console.error('getS3UrlFromKey: Failed to get S3 URL from key:', error)
    console.error('getS3UrlFromKey: Error details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      key: key
    })
    throw error
  }
}

/**
 * S3のオブジェクトキーからパブリック直アクセスURLを構築
 * 署名付きURLが失敗した場合のフォールバック用
 */
function buildS3PublicUrl(key: string): string {
  const bucket = 'yellc34dfecaeb3545229f8a541d9a04a2aec8ef5-main'
  const region = 'ap-northeast-1'
  // public/プレフィックスを追加（Amplify Storageのデフォルト）
  const fullKey = key.startsWith('public/') ? key : `public/${key}`
  return `https://${bucket}.s3.${region}.amazonaws.com/${fullKey}`
}

/**
 * S3のURLを更新する（期限切れの場合に新しいURLを生成）
 * @param url 現在のS3のURL（署名付きURLまたは通常のURL）
 * @param useDownload trueの場合、downloadDataを使ってBlob URLを生成（非推奨：署名付きURLを優先）
 * @returns 新しい署名付きURL、パブリックURL、または元のURL
 */
export async function refreshS3Url(url: string | null | undefined, useDownload: boolean = false): Promise<string | null> {
  if (!url) return null

  // Base64データURLの場合はそのまま返す
  if (url.startsWith('data:')) return url

  // blob: URLの場合はキーを再抽出できないのでnullを返す
  if (url.startsWith('blob:')) return null

  // S3のオブジェクトキーを抽出
  const key = extractS3KeyFromUrl(url)
  if (!key) return url

  // 認証状態を確認し、認証済みなら署名付きURLを試行
  try {
    const { fetchAuthSession } = await import('aws-amplify/auth')
    const session = await fetchAuthSession()
    if (session.credentials) {
      // 認証済み: 署名付きURLを試行
      try {
        const signedUrl = await getS3UrlFromKey(key, 3600 * 24 * 365, false)
        return signedUrl
      } catch (signedError) {
        // 署名付きURL失敗時はパブリックURLにフォールバック
      }
    }
  } catch {
    // 認証情報取得失敗: パブリックURLにフォールバック
  }

  // パブリック直アクセスURL（認証不要）
  return buildS3PublicUrl(key)
}

/**
 * S3からファイルを削除
 * @param key 削除するファイルのキー
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  ensureAmplifyConfigured()
  
  try {
    const { remove } = await import('aws-amplify/storage')
    await remove({ key })
  } catch (error) {
    console.error('Failed to delete file from S3:', error)
    // エラーは無視（ファイルが存在しない場合など）
  }
}

