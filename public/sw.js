// YeLL Basketball Service Worker
const CACHE_NAME = 'yell-v1'

// キャッシュするリソース（アプリシェル）
const PRECACHE_URLS = [
  '/',
  '/timeline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/logo.png',
  '/images/symbol.png'
]

// インストール時にアプリシェルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// ネットワーク優先、フォールバックでキャッシュ（Network First戦略）
self.addEventListener('fetch', (event) => {
  // API呼び出しやGraphQLはキャッシュしない
  if (
    event.request.url.includes('/graphql') ||
    event.request.url.includes('appsync-api') ||
    event.request.url.includes('cognito') ||
    event.request.method !== 'GET'
  ) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 正常なレスポンスはキャッシュに保存
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // オフライン時はキャッシュから返す
        return caches.match(event.request)
      })
  )
})

// ==================== プッシュ通知受信 ====================

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch (e) {
    data = {
      title: 'YeLL Basketball',
      body: event.data.text(),
      icon: '/icons/icon-192x192.png'
    }
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: data.tag || 'yell-notification',
    data: {
      url: data.url || '/timeline'
    },
    vibrate: [200, 100, 200],
    requireInteraction: false
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'YeLL Basketball', options)
  )
})

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/timeline'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 既に開いているウィンドウがあればフォーカス
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // なければ新しいウィンドウを開く
      return clients.openWindow(url)
    })
  )
})
