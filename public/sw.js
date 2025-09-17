const CACHE_NAME = 'gutierrez-hnos-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Archivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/logo.png'
];

// Rutas que requieren cache dinámico
const DYNAMIC_ROUTES = [
  '/dashboard',
  '/animales',
  '/ventas',
  '/compras',
  '/facturacion',
  '/lotes',
  '/sanidad',
  '/pesadas',
  '/proveedores',
  '/compradores',
  '/transportadores',
  '/usuarios',
  '/configuracion'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Instalación completada');
        return self.skipWaiting();
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activación completada');
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar esquemas no soportados (p.ej., chrome-extension://)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Estrategia de cache para diferentes tipos de recursos
  if (request.method === 'GET') {
    // Archivos estáticos - Cache First
    if (STATIC_FILES.some(file => url.pathname.endsWith(file))) {
      event.respondWith(cacheFirst(request));
    }
    // API calls - Network First con fallback
    else if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
      event.respondWith(networkFirst(request));
    }
    // Páginas de la app - Stale While Revalidate
    else if (DYNAMIC_ROUTES.some(route => url.pathname.startsWith(route))) {
      event.respondWith(staleWhileRevalidate(request));
    }
    // Otros recursos - Network First
    else {
      event.respondWith(networkFirst(request));
    }
  }
});

// Estrategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      if (request.url.startsWith('http')) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache First fallback:', error);
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      if (request.url.startsWith('http')) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    console.log('Network First fallback a cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      if (request.url.startsWith('http')) {
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificación push recibida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de Gutierrez Hnos',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalles',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/pwa-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Gutierrez Hnos', options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Click en notificación');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Solo cerrar la notificación
  } else {
    // Click en el cuerpo de la notificación
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronización en segundo plano');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Función de sincronización en segundo plano
async function doBackgroundSync() {
  try {
    // Aquí puedes implementar la lógica de sincronización
    // Por ejemplo, enviar datos pendientes cuando se recupere la conexión
    console.log('Sincronizando datos pendientes...');
    
    // Ejemplo: sincronizar facturas pendientes
    const pendingInvoices = await getPendingInvoices();
    for (const invoice of pendingInvoices) {
      await syncInvoice(invoice);
    }
  } catch (error) {
    console.error('Error en sincronización:', error);
  }
}

// Funciones auxiliares para sincronización
async function getPendingInvoices() {
  // Implementar lógica para obtener facturas pendientes
  return [];
}

async function syncInvoice(invoice) {
  // Implementar lógica para sincronizar factura
  console.log('Sincronizando factura:', invoice.id);
}
