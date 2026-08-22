// SAKHI Safety Service Worker
const CACHE_NAME = 'sakhi-safety-v1'
const OFFLINE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
]

// Install event - precache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - cleanup older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - Stale-while-revalidate with network fallback
self.addEventListener('fetch', (event) => {
  // Ignore chrome extension & non-GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return
  }

  // Handle API routes with network-only
  if (event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return networkResponse
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse
          return caches.match('/')
        })
      })
  )
})

// Push notifications event
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body || 'SAKHI Safety Alert',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200, 100, 400],
      data: {
        url: data.url || '/',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title || 'SAKHI Alert', options))
  }
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
